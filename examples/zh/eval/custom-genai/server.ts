// 手写工具循环 + 手写 OTel GenAI 埋点的最小聊天服务：不用 AI SDK / LangChain，直接用
// `openai` npm SDK 打模型、用 tracing.ts 里的两个 helper 包 span。
//
// 这里只负责 HTTP 层；真实的工具调用循环在 agent.ts，两个工具的实现在 tools.ts。
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { shutdownTracing } from "./tracing.ts";
import { runAgent } from "./agent.ts";

const port = Number(process.env.PORT ?? 5299);
const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "public");

const server = createServer(async (req, res) => {
  try {
    await route(req, res);
  } catch (error) {
    json(res, 500, { error: error instanceof Error ? error.message : String(error) });
  }
});

server.listen(port, "127.0.0.1", () => {
  process.stdout.write(`custom-genai example listening on http://127.0.0.1:${port}\n`);
});

async function shutdown(): Promise<void> {
  await shutdownTracing();
  server.close(() => process.exit(0));
}
process.on("SIGTERM", () => void shutdown());
process.on("SIGINT", () => void shutdown());

async function route(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = req.url ?? "/";

  if (req.method === "GET" && url === "/healthz") {
    json(res, 200, { ok: true });
    return;
  }

  if (req.method === "POST" && url === "/api/chat") {
    const body = (await readJson(req)) as { message?: unknown; sessionId?: unknown };
    if (typeof body.message !== "string" || body.message.trim().length === 0) {
      throw new Error("body.message must be a non-empty string.");
    }
    const result = await runAgent(body.message);
    json(res, 200, result);
    return;
  }

  if (req.method === "GET" && (url === "/" || url === "/index.html")) {
    const html = await readFile(path.join(publicDir, "index.html"), "utf8");
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(html);
    return;
  }

  json(res, 404, { error: "not found" });
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function json(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}
