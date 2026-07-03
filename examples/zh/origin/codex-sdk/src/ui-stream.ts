// 适配层:把 Codex SDK 的 `ThreadEvent` 事件流翻译成 AI SDK 的
// `UIMessageChunk` 协议流。`UIMessageChunk` 是协议层类型——任何后端手写这些
// chunk 都行,不需要经过 `streamText`,`useChat` 照样能渲染。见
// node_modules/ai/dist/index.d.ts 里的 `type UIMessageChunk`。
import { createUIMessageStream, type UIMessageChunk, type UIMessageStreamWriter } from "ai";
import type { ThreadItem } from "@openai/codex-sdk";
import { runTurnStreamed } from "../agent.ts";

// 除了 agent_message,其余 item 类型都渲染成一个"工具调用气泡"(tool-input-available
// → tool-output-available/error),用 item.id 当 toolCallId、item.type 当 toolName。
type ToolLikeItem = Exclude<ThreadItem, { type: "agent_message" }>;

export function buildUiStream(
  message: string,
  threadId: string | undefined,
  signal: AbortSignal,
): ReadableStream<UIMessageChunk> {
  return createUIMessageStream({
    execute: async ({ writer }) => {
      const startedTextIds = new Set<string>();

      const events = await runTurnStreamed(message, threadId, signal);

      for await (const event of events) {
        switch (event.type) {
          case "thread.started": {
            writer.write({ type: "start", messageMetadata: { threadId: event.thread_id } });
            break;
          }

          case "turn.started": {
            break;
          }

          case "turn.completed": {
            writer.write({
              type: "finish",
              messageMetadata: { usage: event.usage },
            });
            break;
          }

          case "turn.failed": {
            writer.write({ type: "error", errorText: event.error.message });
            break;
          }

          case "error": {
            writer.write({ type: "error", errorText: event.message });
            break;
          }

          case "item.started": {
            if (event.item.type === "agent_message") {
              startedTextIds.add(event.item.id);
              writer.write({ type: "text-start", id: event.item.id });
            } else {
              writeToolInput(writer, event.item);
            }
            break;
          }

          case "item.updated": {
            // agent_message 没有 token 级别的增量(SDK 只在 item.completed 给整段
            // 文本),item.updated 目前只用来刷新还在跑的工具类 item(比如
            // command_execution 的 aggregated_output 在命令跑完前会持续增长)。
            if (event.item.type !== "agent_message") {
              writeToolInput(writer, event.item);
            }
            break;
          }

          case "item.completed": {
            if (event.item.type === "agent_message") {
              const id = event.item.id;
              if (!startedTextIds.has(id)) {
                // 保险:理论上 item.started 总会先到,但以防万一没收到就补一个 text-start。
                writer.write({ type: "text-start", id });
              }
              // SDK 不提供 token 级别的增量,只在 item 完成时给出整段文本——
              // 所以这里只写一个 text-delta,携带完整 item.text,不是逐 token 流式。
              writer.write({ type: "text-delta", id, delta: event.item.text });
              writer.write({ type: "text-end", id });
            } else {
              writeToolOutput(writer, event.item);
            }
            break;
          }

          default: {
            event satisfies never;
          }
        }
      }
    },
  });
}

function writeToolInput(writer: UIMessageStreamWriter, item: ToolLikeItem): void {
  writer.write({
    type: "tool-input-available",
    toolCallId: item.id,
    toolName: item.type,
    input: toolInput(item),
    dynamic: true,
  });
}

function writeToolOutput(writer: UIMessageStreamWriter, item: ToolLikeItem): void {
  const failure = toolFailure(item);
  if (failure) {
    writer.write({
      type: "tool-output-error",
      toolCallId: item.id,
      errorText: failure,
    });
    return;
  }
  writer.write({
    type: "tool-output-available",
    toolCallId: item.id,
    output: toolOutput(item),
  });
}

// 每种 item 类型挑几个能直接读懂的字段当"输入",不追求字节级还原。
function toolInput(item: ToolLikeItem): unknown {
  switch (item.type) {
    case "command_execution":
      return { command: item.command };
    case "file_change":
      return { changes: item.changes };
    case "mcp_tool_call":
      return { server: item.server, tool: item.tool, arguments: item.arguments };
    case "web_search":
      return { query: item.query };
    case "todo_list":
      return { items: item.items };
    case "reasoning":
      return item.text ? { text: item.text } : {};
    case "error":
      return { message: item.message };
  }
}

function toolOutput(item: ToolLikeItem): unknown {
  switch (item.type) {
    case "command_execution":
      return { exitCode: item.exit_code, output: item.aggregated_output };
    case "file_change":
      return { status: item.status, changes: item.changes };
    case "mcp_tool_call":
      return item.result ?? { status: item.status };
    case "web_search":
      return { query: item.query };
    case "todo_list":
      return { items: item.items };
    case "reasoning":
      return { text: item.text };
    case "error":
      return { message: item.message };
  }
}

// 命令/文件补丁/MCP 调用失败时,返回 errorText 让前端渲染成 tool-output-error;
// 其它情况返回 undefined 表示成功。
function toolFailure(item: ToolLikeItem): string | undefined {
  switch (item.type) {
    case "command_execution":
      return item.status === "failed"
        ? `退出码 ${item.exit_code ?? "?"}: ${item.aggregated_output}`
        : undefined;
    case "file_change":
      return item.status === "failed" ? "文件修改失败" : undefined;
    case "mcp_tool_call":
      return item.error ? item.error.message : undefined;
    case "error":
      return item.message;
    default:
      return undefined;
  }
}
