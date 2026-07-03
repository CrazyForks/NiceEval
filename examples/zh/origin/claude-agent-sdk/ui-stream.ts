// 把 Claude Agent SDK 的 SDKMessage 流(query() 的输出)翻译成 AI SDK 的
// UIMessageChunk 流,喂给 pipeUIMessageStreamToResponse。
//
// UIMessageChunk 是协议层类型(node_modules/ai/dist/index.d.ts 里的
// `type UIMessageChunk`)——任何后端只要产出这个形状的 chunk 序列,
// @ai-sdk/react 的 useChat 就能原样渲染,不需要真的经过 ai 包自己的
// streamText/LanguageModel 抽象。这个文件就是那层翻译:不调用 ai 的模型
// 接口,只是把 Claude Agent SDK 原生事件形状换成 UI 协议形状。
//
// 消费的是 includePartialMessages:true 时的原始 Anthropic 流事件
// (BetaRawMessageStreamEvent:message_start/content_block_start/
// content_block_delta/content_block_stop/message_delta/message_stop),
// 而不是等 assistant 消息整条攒完再转发——这样前端才能逐 token 渲染。
//
// HITL 的暂停/恢复完全由 agent.ts 的 canUseTool 负责(它挂在
// pending-approvals.ts 的 Map 上等 resolve)。这个文件不重复实现等待:
// 当 canUseTool 的 Promise 还没 resolve 时,query() 的 async generator
// 本身就不会产出新消息,下面的 `for await` 自然阻塞在那——不需要在这里
// 再对同一个 toolUseId 发起第二次等待(那样反而会跟 canUseTool 抢
// pendingApprovals 里的同一个 key)。
// 拒绝的信号也不用自己猜:canUseTool 返回 deny 时,SDK 会额外发一条
// `system/permission_denied` 消息(tool_use_id 就是被拒的那次调用),
// 直接翻成 tool-output-denied 即可,不用去匹配拒绝文案字符串。

import { createUIMessageStream, type UIMessageChunk } from "ai";
import type {
  SDKMessage,
  SDKPartialAssistantMessage,
  SDKUserMessage,
  SDKResultMessage,
} from "@anthropic-ai/claude-agent-sdk";
import { runTurn } from "./agent.ts";

// 必须跟 agent.ts 里 canUseTool 判断用的字符串完全一致——两处独立写死是
// 故意的:一个决定"要不要真的拦下来问",一个决定"要不要在 UI 上画审批气泡",
// 分开定义能让人在 grep 时清楚看到审批门在两层各出现一次。
const GATED_TOOL_NAME = "mcp__demo-tools__calculate";

type BlockState =
  | { kind: "text"; id: string }
  | { kind: "tool_use"; toolCallId: string; toolName: string; jsonBuffer: string }
  | { kind: "other" };

export function buildUiStream(
  message: string,
  sessionId: string | undefined,
  signal?: AbortSignal,
): ReadableStream<UIMessageChunk> {
  return createUIMessageStream({
    execute: async ({ writer }) => {
      const turn = runTurn(message, sessionId);

      let started = false;
      // content_block index -> 这个 block 的状态。BetaRawMessageStreamEvent 的
      // index 只在"当前这条 assistant 消息"里唯一,一轮 agent turn 可能有多条
      // 子 assistant 消息(工具调用 -> 结果 -> 继续回答算两条),所以要在每次
      // message_start 时清空,避免跨消息的 index 撞车。
      let blocks = new Map<number, BlockState>();

      const emitStart = (sid: string | undefined) => {
        if (started) return;
        started = true;
        writer.write({ type: "start", messageMetadata: { sessionId: sid } });
      };

      try {
        for await (const sdkMessage of turn) {
          if (signal?.aborted) {
            await turn.interrupt().catch(() => {});
            break;
          }

          if (!started) {
            const sid = (sdkMessage as { session_id?: string }).session_id;
            if (sid) emitStart(sid);
          }

          switch (sdkMessage.type) {
            case "stream_event":
              handleStreamEvent(sdkMessage, writer, blocks);
              break;
            case "user":
              handleUserMessage(sdkMessage, writer);
              break;
            case "system":
              // SDKSystemMessage 只是这个大联合类型里 subtype 为 'init' 的一支;
              // 'system' 这个 type 下还盖着 status/hook_started/permission_denied
              // 等一堆不同 subtype 的消息,这里只关心拒绝这一种。
              if (sdkMessage.subtype === "permission_denied") {
                writer.write({ type: "tool-output-denied", toolCallId: sdkMessage.tool_use_id });
              }
              break;
            case "assistant":
              if (sdkMessage.error) {
                writer.write({ type: "error", errorText: sdkMessage.error });
              }
              break;
            case "result":
              handleResult(sdkMessage, writer);
              break;
            default:
              break;
          }

          if (sdkMessage.type === "stream_event" && sdkMessage.event.type === "message_start") {
            blocks = new Map();
          }
        }
      } finally {
        // 前端断开时(浏览器关标签、useChat 调 stop())别让子进程白跑。
        if (signal?.aborted) {
          await turn.interrupt().catch(() => {});
        }
      }
    },
  });
}

function handleStreamEvent(
  msg: SDKPartialAssistantMessage,
  writer: { write: (chunk: UIMessageChunk) => void },
  blocks: Map<number, BlockState>,
): void {
  const event = msg.event;

  switch (event.type) {
    case "content_block_start": {
      const block = event.content_block;
      if (block.type === "text") {
        const id = `${msg.uuid}-${event.index}`;
        blocks.set(event.index, { kind: "text", id });
        writer.write({ type: "text-start", id });
      } else if (block.type === "tool_use") {
        blocks.set(event.index, {
          kind: "tool_use",
          toolCallId: block.id,
          toolName: block.name,
          jsonBuffer: "",
        });
      } else {
        blocks.set(event.index, { kind: "other" });
      }
      break;
    }
    case "content_block_delta": {
      const state = blocks.get(event.index);
      if (!state) break;
      const delta = event.delta;
      if (state.kind === "text" && delta.type === "text_delta") {
        writer.write({ type: "text-delta", id: state.id, delta: delta.text });
      } else if (state.kind === "tool_use" && delta.type === "input_json_delta") {
        // Anthropic 流式协议里 tool_use 的 input 不是一次性给的:
        // content_block_start 时是空对象 `{}`,真正的参数通过一串
        // input_json_delta(partial_json 片段)逐步补全,要在 content_block_stop
        // 时把攒的字符串拼起来再 JSON.parse。
        state.jsonBuffer += delta.partial_json;
      }
      break;
    }
    case "content_block_stop": {
      const state = blocks.get(event.index);
      if (!state) break;
      if (state.kind === "text") {
        writer.write({ type: "text-end", id: state.id });
      } else if (state.kind === "tool_use") {
        let input: unknown = {};
        try {
          input = state.jsonBuffer.trim() ? JSON.parse(state.jsonBuffer) : {};
        } catch {
          input = { _raw: state.jsonBuffer };
        }
        writer.write({
          type: "tool-input-available",
          toolCallId: state.toolCallId,
          toolName: state.toolName,
          input,
        });
        if (state.toolName === GATED_TOOL_NAME) {
          writer.write({
            type: "tool-approval-request",
            approvalId: state.toolCallId,
            toolCallId: state.toolCallId,
          });
        }
      }
      break;
    }
    default:
      break;
  }
}

function handleUserMessage(
  msg: SDKUserMessage,
  writer: { write: (chunk: UIMessageChunk) => void },
): void {
  const content = msg.message.content;
  if (!Array.isArray(content)) return;
  for (const block of content) {
    if (typeof block !== "object" || block === null || (block as { type?: string }).type !== "tool_result") {
      continue;
    }
    const toolResult = block as {
      tool_use_id: string;
      is_error?: boolean;
      content?: string | Array<{ type?: string; text?: string }>;
    };
    const output = toolResultText(toolResult.content);
    if (toolResult.is_error) {
      writer.write({ type: "tool-output-error", toolCallId: toolResult.tool_use_id, errorText: output });
    } else {
      writer.write({ type: "tool-output-available", toolCallId: toolResult.tool_use_id, output });
    }
  }
}

function toolResultText(content: string | Array<{ type?: string; text?: string }> | undefined): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .filter((part) => part.type === "text" && typeof part.text === "string")
    .map((part) => part.text)
    .join("");
}

function handleResult(
  msg: SDKResultMessage,
  writer: { write: (chunk: UIMessageChunk) => void },
): void {
  if (msg.is_error) {
    const errors = "errors" in msg && Array.isArray(msg.errors) && msg.errors.length > 0
      ? msg.errors.join("; ")
      : `agent turn failed: ${msg.subtype}`;
    writer.write({ type: "error", errorText: errors });
  }
  writer.write({
    type: "finish",
    messageMetadata: {
      sessionId: msg.session_id,
      usage: msg.usage,
      totalCostUsd: msg.total_cost_usd,
    },
  });
}
