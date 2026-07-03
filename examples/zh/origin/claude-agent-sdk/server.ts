// 一个用 Claude Agent SDK(@anthropic-ai/claude-agent-sdk)搭的最小 agent 后端。
// 独立示例项目,不 import niceeval,不是 niceeval adapter —— 详见 README.md。
//
// 前端复用 examples/zh/origin/ai-sdk-v7 那套 React + @ai-sdk/react useChat 界面
// (DefaultChatTransport 发 {messages, sessionId},收 AI SDK 的 UI Message Stream
// 协议)。真正干活的翻译在 ui-stream.ts:把 Claude Agent SDK 原生的 SDKMessage
// 流转成 UIMessageChunk 流——这层协议是"谁都能手写"的,不需要真的经过 ai 包
// 自己的模型抽象。
//
// 这个后端是"每轮一次 query() + resume 找回历史"的会话形态:请求体里只取
// 最后一条用户消息的文本喂给 query(),不会把 messages[] 整个数组重放进去
// (那是 stateless-replay 模型才需要的模式,这里不需要)。

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { pipeUIMessageStreamToResponse } from "ai";
import { buildUiStream } from "./ui-stream.ts";
import { pendingApprovals } from "./pending-approvals.ts";

const PORT = Number(process.env.PORT ?? 5189);

const server = createServer(async (req, res) => {
  try {
    await route(req, res);
  } catch (error) {
    json(res, 500, { error: error instanceof Error ? error.message : String(error) });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  process.stdout.write(`claude-agent-sdk 示例服务已启动: http://127.0.0.1:${PORT}\n`);
});

function shutdown() {
  server.close(() => process.exit(0));
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

async function route(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method === "OPTIONS") {
    res.writeHead(204, corsHeaders());
    res.end();
    return;
  }

  if (req.method === "GET" && req.url === "/healthz") {
    json(res, 200, { ok: true });
    return;
  }

  // 流式聊天端点 —— 复用共享前端的 useChat + DefaultChatTransport,收
  // {messages: UIMessage[], sessionId?}、回 AI SDK 的 UI Message Stream 协议
  // (data: {"type":"start",...} ... data: {"type":"finish",...})。
  if (req.method === "POST" && req.url === "/api/chat") {
    const body = (await readJson(req)) as { messages?: unknown[]; sessionId?: string };
    const message = lastUserText(body.messages ?? []);
    const signal = abortSignalFor(req);
    pipeUIMessageStreamToResponse({
      response: res,
      stream: buildUiStream(message, body.sessionId, signal),
      headers: corsHeaders(),
    });
    return;
  }

  // HITL 审批端点。SSE 连接在等审批期间全程不关(agent.ts 的 canUseTool 挂在
  // pendingApprovals 的 Promise 上),这里只是把浏览器点按钮的结果转成
  // resolve() 调用去唤醒它——不是另开一轮请求重放历史。
  if (req.method === "POST" && req.url === "/api/chat/approve") {
    const body = (await readJson(req)) as { toolUseId?: string; approved?: boolean };
    if (typeof body.toolUseId !== "string" || typeof body.approved !== "boolean") {
      json(res, 400, { error: "toolUseId (string) and approved (boolean) are required" });
      return;
    }
    const resolve = pendingApprovals.get(body.toolUseId);
    if (!resolve) {
      json(res, 404, { error: `no pending approval for toolUseId ${body.toolUseId}` });
      return;
    }
    pendingApprovals.delete(body.toolUseId);
    resolve(body.approved);
    json(res, 200, { ok: true });
    return;
  }

  json(res, 404, { error: `not found: ${req.method} ${req.url}` });
}

function lastUserText(messages: unknown[]): string {
  const last = messages[messages.length - 1] as { parts?: Array<{ type?: string; text?: string }> } | undefined;
  const parts = last?.parts;
  if (!Array.isArray(parts)) {
    throw new Error("messages[] must contain at least one message with a parts array.");
  }
  const text = parts
    .filter((p) => p?.type === "text" && typeof p.text === "string")
    .map((p) => p.text)
    .join("");
  if (!text.trim()) {
    throw new Error("The last message has no text content.");
  }
  return text;
}

function abortSignalFor(req: IncomingMessage): AbortSignal {
  const controller = new AbortController();
  req.on("close", () => controller.abort());
  return controller.signal;
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function json(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { ...corsHeaders(), "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function corsHeaders(): Record<string, string> {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type",
  };
}
