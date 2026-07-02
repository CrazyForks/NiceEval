// 必须最先 import:注册 LangSmith 的 OTel exporter 要赶在任何 LangGraph/LangChain
// 调用之前完成(见 observability.ts 顶部注释)。
import "./observability.ts";

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { runTurn } from "./agent/agent.ts";

const port = Number(process.env.PORT ?? 5388);
const indexHtmlPath = fileURLToPath(new URL("./public/index.html", import.meta.url));

const server = createServer(async (req, res) => {
  try {
    await route(req, res);
  } catch (error) {
    json(res, 500, { error: error instanceof Error ? error.message : String(error) });
  }
});

server.listen(port, "127.0.0.1", () => {
  process.stdout.write(`LangGraph 示例服务监听 http://127.0.0.1:${port}\n`);
});

function shutdown() {
  server.close(() => process.exit(0));
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

async function route(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method === "GET" && req.url === "/healthz") {
    json(res, 200, { ok: true });
    return;
  }

  if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
    const html = await readFile(indexHtmlPath, "utf8");
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(html);
    return;
  }

  if (req.method === "POST" && req.url === "/api/chat") {
    const body = (await readJson(req)) as { message?: unknown; sessionId?: unknown };
    if (typeof body.message !== "string" || body.message.trim().length === 0) {
      json(res, 400, { error: "message must be a non-empty string." });
      return;
    }
    const sessionId = typeof body.sessionId === "string" && body.sessionId.length > 0 ? body.sessionId : "default";
    const result = await runTurn(body.message, sessionId);
    json(res, 200, result);
    return;
  }

  json(res, 404, { error: `not found: ${req.method} ${req.url}` });
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
