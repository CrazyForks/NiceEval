// 一个 node:http 服务器,演示怎么用 OpenAI 的 Codex TypeScript SDK
// (`@openai/codex-sdk`)搭一个 agent 后端,并接到共享的 React 聊天前端
// (`@ai-sdk/react` 的 `useChat` + `DefaultChatTransport`)。纯 demo,不依赖
// niceeval。见 README.md。
//
// HTTP 层只负责路由、解析 `DefaultChatTransport` 的请求体;真正的 Codex 调用
// 在 agent.ts,ThreadEvent → UIMessageChunk 的协议翻译在 src/ui-stream.ts。
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { pipeUIMessageStreamToResponse, type UIMessage } from "ai";
import { buildUiStream } from "./src/ui-stream.ts";

// 5189 被 examples/zh/origin/claude-agent-sdk 占了(两个示例默认端口曾撞车),这里改用 5199。
const PORT = Number(process.env.PORT ?? 5199);

const server = createServer(async (req, res) => {
  try {
    await route(req, res);
  } catch (error) {
    json(res, 500, { error: error instanceof Error ? error.message : String(error) });
  }
});

server.listen(PORT, () => {
  process.stdout.write(`codex-sdk example listening on http://localhost:${PORT}\n`);
});

function shutdown() {
  server.close(() => process.exit(0));
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

async function route(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = req.url ?? "/";

  if (req.method === "OPTIONS") {
    res.writeHead(204, corsHeaders());
    res.end();
    return;
  }

  if (req.method === "GET" && url === "/healthz") {
    json(res, 200, { ok: true });
    return;
  }

  if (req.method === "POST" && url === "/api/chat") {
    const body = await readJson(req);
    const { message, threadId } = parseChatRequest(body);

    // 浏览器断开(关页面/中断)就取消这一轮 turn,别让 Codex 子进程白跑。
    const abort = new AbortController();
    req.on("close", () => abort.abort());

    pipeUIMessageStreamToResponse({
      response: res,
      stream: buildUiStream(message, threadId, abort.signal),
      headers: corsHeaders(),
    });
    return;
  }

  json(res, 404, { error: `not found: ${req.method} ${url}` });
}

// `DefaultChatTransport` 默认把完整的 UIMessage[] 历史随每次请求发过来,但
// Codex 这个后端是"续接线程"模型(`codex.resumeThread(threadId)`,线程历史
// 落在 ~/.codex/sessions),不是"每轮把全部历史重新喂给模型"——所以这里只取
// 最后一条消息的文本当新一轮的 prompt,threadId 走前端在 `prepareSendMessagesRequest`
// 里额外带的字段(见 src/client/App.tsx)。
function parseChatRequest(value: unknown): { message: string; threadId?: string } {
  if (typeof value !== "object" || value === null) throw new Error("JSON body is required.");
  const record = value as Record<string, unknown>;

  const messages = record.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("messages must be a non-empty array.");
  }
  const last = messages[messages.length - 1] as UIMessage;
  const message = (last.parts ?? [])
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();
  if (!message) throw new Error("last message must contain non-empty text.");

  return {
    message,
    threadId: typeof record.threadId === "string" && record.threadId.length > 0 ? record.threadId : undefined,
  };
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
