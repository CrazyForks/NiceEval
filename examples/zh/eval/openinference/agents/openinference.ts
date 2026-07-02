// niceeval 侧的适配器 —— 应用代码(server.py / agent.py / tools.py / observability.py)
// 完全不知道 niceeval 的存在,这里是唯一接线的地方。
//
// 被测应用是 examples/zh/origin/openinference 的原样拷贝:FastAPI + LangChain
// create_agent,单轮(server.py 里 POST /api/chat 只把 body.message 传给
// agent.get_reply(message),body.sessionId 读出来但 agent.py 从未使用它 —— 每次调用
// 都是全新的 messages 列表,agent 侧没有任何跨请求的会话状态。所以这里不声明
// capabilities.conversation,免得 t.reply / t.newSession 这类断言看起来能用、实际上
// 每次都是独立会话,负断言会不可信。
//
// 与 custom-genai(Node 手写 tool-calling 循环)的关键区别:这次子进程是 **Python**
// (`.venv/bin/python server.py`),不是 node/tsx。send() 里把服务当子进程懒启动、只起
// 一次、跨 eval 复用同一个实例,再对 POST /api/chat 发 fetch,把 { reply, toolCalls }
// 映射成标准 StreamEvent[]。
import { spawn, type ChildProcess } from "node:child_process";
import { defineAgent } from "niceeval/adapter";
import type { JsonValue, StreamEvent } from "niceeval";

const PORT = 8787;
const BASE_URL = `http://127.0.0.1:${PORT}`;

// 应用目录(agents/ 的上一级,server.py / .venv 所在处)—— 子进程的 cwd 必须落在这里。
// observability.py 里 `load_dotenv()` 不认 cwd,而是从调用它的那一帧(observability.py
// 自己的文件路径)向上找 .env——只要 cwd 落在应用目录,这条路径天然一致,已经用真实
// stripped-env 的 spawn 验证过(.env 里的 OPENAI_API_KEY/OPENAI_BASE_URL/AGENT_MODEL
// 在完全没有从 Node 侧注入的情况下也能被 Python 子进程读到)。
const APP_DIR = new URL("..", import.meta.url).pathname;

interface ToolCallRecord {
  name: string;
  input: unknown;
  output: unknown;
}

interface ChatResponse {
  reply: string;
  toolCalls: ToolCallRecord[];
}

let child: ChildProcess | undefined;
let readyPromise: Promise<void> | undefined;

async function isUp(): Promise<boolean> {
  try {
    return (await fetch(`${BASE_URL}/healthz`)).ok;
  } catch {
    return false;
  }
}

async function ensureServer(): Promise<void> {
  if (await isUp()) return;
  readyPromise ??= (async () => {
    child = spawn(`${APP_DIR}.venv/bin/python`, ["server.py"], {
      cwd: APP_DIR,
      stdio: "inherit",
      // .env 是 python-dotenv 的 load_dotenv() 在 observability.py 里加载的,不是这里的
      // spawn 调用注入的;传 process.env 只是为了让用户 shell 里设的 OTEL_*/PHOENIX_*
      // 覆盖项也能透传下去。
      env: process.env,
    });
    process.on("exit", () => child?.kill());

    // Python/uvicorn 冷启动 + import LangChain 比 Node 慢,给足时间。
    const deadline = Date.now() + 20_000;
    while (Date.now() < deadline) {
      if (await isUp()) return;
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    throw new Error(`openinference server did not become healthy within 20s at ${BASE_URL}/healthz`);
  })();
  return readyPromise;
}

/** { reply, toolCalls } → niceeval 的标准事件流:每个 toolCall 拆成 action.called + action.result 对。 */
function toStreamEvents(body: ChatResponse): StreamEvent[] {
  const events: StreamEvent[] = [];
  body.toolCalls.forEach((call, i) => {
    const callId = `call-${i}`;
    events.push({ type: "action.called", callId, name: call.name, input: call.input as JsonValue });
    events.push({ type: "action.result", callId, output: call.output as JsonValue, status: "completed" });
  });
  events.push({ type: "message", role: "assistant", text: body.reply });
  return events;
}

function failedTurn(message: string) {
  return {
    status: "failed" as const,
    events: [{ type: "error" as const, message }],
  };
}

export default defineAgent({
  name: "openinference",
  // LangChain 的 create_agent 单轮调用,agent.get_reply() 里把 tool_calls 拆出来给
  // server.py 返回;没有跨请求的会话状态(见文件顶部说明),所以只声明
  // toolObservability,不声明 conversation。
  capabilities: { toolObservability: true },

  async send(input, ctx) {
    try {
      await ensureServer();

      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: input.text }),
        signal: ctx.signal,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        return failedTurn(`openinference server 返回 HTTP ${response.status}${errorText ? `: ${errorText}` : ""}`);
      }

      const body = (await response.json()) as ChatResponse;

      return {
        events: toStreamEvents(body),
        data: body,
        status: "completed" as const,
      };
    } catch (error) {
      return failedTurn(error instanceof Error ? error.message : String(error));
    }
  },
});
