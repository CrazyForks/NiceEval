// 一个 node:http 服务器,演示"用 vm0 搭 agent 后端"本来该长什么样——但调研下来
// (见 README.md「调研结论」)vm0(github.com/vm0-ai/vm0)目前没有可在自己代码里
// import 的 npm SDK,也没有公开文档化的 HTTP API,所以这里只有 AGENT_MODE=mock
// 是真的能跑;AGENT_MODE=ai 会直接抛一个说明原因的错误,不是伪造的集成。
// 纯 demo,不依赖 niceeval。
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 5588);
const AGENT_MODE = process.env.AGENT_MODE === "ai" ? "ai" : "mock";

type ToolCall = { name: string; input: unknown; output: unknown };
type ChatResponse = { reply: string; toolCalls: ToolCall[] };

// ---------------------------------------------------------------------------
// 两个工具的纯函数实现,和其它 examples(langgraph/、ai-sdk/…)保持同样的形状,
// 方便跨示例对比。这里只有 mock 模式会调用它们——没有真的 vm0 agent 循环来调。
// ---------------------------------------------------------------------------

const KNOWN_CITIES: Record<string, { condition: string; tempC: number }> = {
  北京: { condition: "晴", tempC: 26 },
  上海: { condition: "多云", tempC: 29 },
  广州: { condition: "雷阵雨", tempC: 32 },
  深圳: { condition: "阴", tempC: 31 },
  杭州: { condition: "小雨", tempC: 28 },
};
const CONDITIONS = ["晴", "多云", "阴", "小雨", "雷阵雨"];

function getWeather(city: string): { city: string; condition: string; tempC: number; summary: string } {
  const key = city.trim();
  const known = KNOWN_CITIES[key];
  const weather =
    known ??
    (() => {
      const seed = [...key].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
      return { condition: CONDITIONS[seed % CONDITIONS.length], tempC: 15 + (seed % 18) };
    })();
  return { city: key, ...weather, summary: `${key}当前${weather.condition},气温 ${weather.tempC}°C。` };
}

// 只支持数字、+ - * / ( ) 的递归下降解析器——不用 eval()/Function()。
function calculate(expression: string): number {
  if (!/^[\d\s+\-*/().]+$/.test(expression)) {
    throw new Error(`表达式只能包含数字和 + - * / ( ):收到 "${expression}"`);
  }
  let pos = 0;
  const peek = (): string | undefined => expression[pos];
  const skipSpaces = (): void => {
    while (peek() === " ") pos++;
  };
  function parseNumber(): number {
    skipSpaces();
    const start = pos;
    while (peek() !== undefined && /[\d.]/.test(peek()!)) pos++;
    if (pos === start) throw new Error(`表达式在位置 ${pos} 处缺少数字:"${expression}"`);
    return Number(expression.slice(start, pos));
  }
  function parseFactor(): number {
    skipSpaces();
    if (peek() === "(") {
      pos++;
      const value = parseExpr();
      skipSpaces();
      if (peek() !== ")") throw new Error(`表达式缺少右括号:"${expression}"`);
      pos++;
      return value;
    }
    if (peek() === "-") {
      pos++;
      return -parseFactor();
    }
    return parseNumber();
  }
  function parseTerm(): number {
    let value = parseFactor();
    for (;;) {
      skipSpaces();
      const op = peek();
      if (op === "*" || op === "/") {
        pos++;
        const rhs = parseFactor();
        value = op === "*" ? value * rhs : value / rhs;
      } else {
        return value;
      }
    }
  }
  function parseExpr(): number {
    let value = parseTerm();
    for (;;) {
      skipSpaces();
      const op = peek();
      if (op === "+" || op === "-") {
        pos++;
        const rhs = parseTerm();
        value = op === "+" ? value + rhs : value - rhs;
      } else {
        return value;
      }
    }
  }
  const result = parseExpr();
  skipSpaces();
  if (pos !== expression.length) throw new Error(`表达式在位置 ${pos} 处有多余字符:"${expression}"`);
  return result;
}

// ---------------------------------------------------------------------------
// AGENT_MODE=mock(默认)—— 关键词直接命中上面两个工具,离线零配置可跑。
// ---------------------------------------------------------------------------

const WEATHER_RE = /([一-龥]{2,4})(?:市)?(?:的)?天气/;
const EXPR_RE = /[\d][\d+\-*/().\s]*[\d)]/;

function runMockTurn(message: string): ChatResponse {
  const weatherMatch = message.match(WEATHER_RE);
  if (weatherMatch) {
    const city = weatherMatch[1];
    const output = getWeather(city);
    return { reply: output.summary, toolCalls: [{ name: "get_weather", input: { city }, output }] };
  }

  const exprMatch = message.match(EXPR_RE);
  if (exprMatch && /[+\-*/]/.test(exprMatch[0])) {
    const expression = exprMatch[0].trim();
    try {
      const result = calculate(expression);
      return {
        reply: `${expression} = ${result}`,
        toolCalls: [{ name: "calculate", input: { expression }, output: { expression, result } }],
      };
    } catch {
      // 解析失败就落到下面的兜底回复,而不是把 500 甩给前端。
    }
  }

  return {
    reply:
      `(mock 模式)收到:"${message}"。试着问"北京天气怎么样"或"12*(3+4)等于多少"看工具调用效果。` +
      `注意:这个 mock 模式和真正的 vm0 无关,只是演示"如果这里能接 vm0 会长什么样"——` +
      `AGENT_MODE=ai 会解释为什么现在接不了,见 README.md。`,
    toolCalls: [],
  };
}

// ---------------------------------------------------------------------------
// AGENT_MODE=ai —— 没有真集成。见 README.md「调研结论」的完整调研过程和引用。
//
// 摘要:vm0(github.com/vm0-ai/vm0)是一个托管的"AI 队友"SaaS(Zero),不是一个
// 库或运行时。npm 上唯一公开发布的制品是 `@vm0/cli`(bin: vm0/zero),但它是
// 托管平台的客户端——要 `vm0 auth login` 到 vm0.ai 账号(Clerk org)、把
// `vm0.yaml`(agent compose)`vm0 compose` 部署上去,再用 `vm0 run <agent> "<prompt>"`
// 触发一次异步 run,结果回 Slack 或者用 `vm0 run-id` 去 `vm0 logs` 轮询——不是
// "发一条消息、同步拿到结构化回复"这种能嵌进 HTTP handler 的调用形状。
// vm0 自己的 web 前端用的 chat API 是仓库内 `turbo/packages/api-contracts/` 下的
// 内部 ts-rest contract(需要 Clerk 会话 cookie/header),没有作为公开、稳定、
// 文档化的第三方集成面发布过。
async function runAiTurn(_message: string, _sessionId: string): Promise<ChatResponse> {
  throw new Error(
    "vm0 没有可在这里接的公开 API:唯一公开发布的制品是托管平台的 CLI(`@vm0/cli`)," +
      "它要登录 vm0.ai 账号、部署 vm0.yaml agent compose,并且 `vm0 run` 触发的是" +
      "异步 run(结果回 Slack 或轮询 `vm0 logs`),不是同步的请求/响应调用,没法" +
      "简单包成这个 /api/chat 端点。完整调研过程和引用见本目录 README.md,以及仓库" +
      "docs/adapters/targets.md 里 vm0 那一节的既有结论。",
  );
}

// ---------------------------------------------------------------------------
// HTTP 服务器:GET /healthz、GET /、POST /api/chat。
// ---------------------------------------------------------------------------

const server = createServer(async (req, res) => {
  try {
    await route(req, res);
  } catch (error) {
    json(res, 500, { error: error instanceof Error ? error.message : String(error) });
  }
});

server.listen(PORT, () => {
  process.stdout.write(`vm0 example listening on http://localhost:${PORT} (AGENT_MODE=${AGENT_MODE})\n`);
});

function shutdown() {
  server.close(() => process.exit(0));
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

async function route(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = req.url ?? "/";

  if (req.method === "GET" && url === "/healthz") {
    json(res, 200, { ok: true });
    return;
  }

  if (req.method === "GET" && url === "/") {
    const html = await readFile(path.join(__dirname, "public/index.html"), "utf8");
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(html);
    return;
  }

  if (req.method === "POST" && url === "/api/chat") {
    const body = await readJson(req);
    const { message, sessionId } = parseChatRequest(body);
    const resolvedSessionId = sessionId ?? randomUUID();
    const response = await (AGENT_MODE === "ai"
      ? runAiTurn(message, resolvedSessionId)
      : Promise.resolve(runMockTurn(message)));
    json(res, 200, { sessionId: resolvedSessionId, ...response });
    return;
  }

  json(res, 404, { error: `not found: ${req.method} ${url}` });
}

function parseChatRequest(value: unknown): { message: string; sessionId?: string } {
  if (typeof value !== "object" || value === null) throw new Error("JSON body is required.");
  const record = value as Record<string, unknown>;
  if (typeof record.message !== "string" || record.message.trim().length === 0) {
    throw new Error("message must be a non-empty string.");
  }
  return {
    message: record.message,
    sessionId: typeof record.sessionId === "string" ? record.sessionId : undefined,
  };
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
