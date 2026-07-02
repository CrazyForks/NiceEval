// 把 ../server.ts(普通 LangGraph app,逐字节未改)接进 niceeval 的 adapter。
// 这是「deployed agent」模式(见 docs-site/guides/remote-agent.mdx):send 里就是一次
// fetch,niceeval 从不知道 URL / 协议细节。这里额外做的唯一一件事是「按需拉起服务端
// 进程」——这个示例没有另开一个 `pnpm dev` 终端的假设,`niceeval exp` 一条命令就能跑。
import { spawn, type ChildProcess } from "node:child_process";
import { defineAgent } from "niceeval/adapter";
import type { JsonValue, StreamEvent } from "niceeval";

const PORT = 5388;
const BASE_URL = `http://127.0.0.1:${PORT}`;

let child: ChildProcess | undefined;
let readyPromise: Promise<void> | undefined;

async function isUp(): Promise<boolean> {
  try {
    return (await fetch(`${BASE_URL}/healthz`)).ok;
  } catch {
    return false;
  }
}

/** 懒启动 server.ts;已经在跑(比如手动 `pnpm dev` 过)就直接复用,不重复拉起。 */
async function ensureServer(): Promise<void> {
  if (await isUp()) return;
  readyPromise ??= (async () => {
    child = spawn("node", ["--env-file", ".env", "--import", "tsx/esm", "server.ts"], {
      // agents/ 的上一级就是这个 app 的根(server.ts 所在目录)。
      cwd: new URL("..", import.meta.url).pathname,
      stdio: "inherit",
    });
    process.on("exit", () => child?.kill());
    const deadline = Date.now() + 15_000;
    while (Date.now() < deadline) {
      if (await isUp()) return;
      await new Promise((r) => setTimeout(r, 300));
    }
    throw new Error(`langgraph server did not become healthy within 15s at ${BASE_URL}/healthz`);
  })();
  return readyPromise;
}

// 与 agent/types.ts 的 ChatTurnResult / ToolCallRecord 同构(应用自己的响应契约)。
interface ToolCallRecord {
  name: string;
  input: unknown;
  output: unknown;
}

interface ChatTurnResult {
  reply: string;
  toolCalls: ToolCallRecord[];
}

/** 应用侧的 input/output 已经是普通 JSON 对象;深拷贝一遍确保收窄进 JsonValue。 */
function toJson(value: unknown): JsonValue {
  if (value === undefined) return null;
  return JSON.parse(JSON.stringify(value)) as JsonValue;
}

export default defineAgent({
  name: "langgraph",
  capabilities: { conversation: true, toolObservability: true },

  async send(input, ctx) {
    await ensureServer();

    // server.ts 对没传 / 空字符串的 sessionId 一律回退成字面量 "default"(见 server.ts
    // route 里的 `sessionId ?? "default"`)——它不会替一个全新会话生成新 id。niceeval
    // 的每个 eval / t.newSession() 在首次 send 前 ctx.session.id 都是 undefined,如果
    // 原样透传,所有会话会全部落到同一个 LangGraph thread_id "default" 上,互相看得见
    // 对方的工具调用历史。所以这里必须在发请求前自己钉一个 id,让每个 niceeval 会话
    // 对应一个独立的 thread_id。
    ctx.session.id ??= crypto.randomUUID();

    let response: Response;
    try {
      response = await fetch(`${BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: input.text, sessionId: ctx.session.id }),
        signal: ctx.signal,
      });
    } catch (error) {
      return failedTurn(error instanceof Error ? error.message : String(error));
    }

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return failedTurn(`langgraph server 返回 HTTP ${response.status}${text ? `: ${text}` : ""}`);
    }

    const body = (await response.json()) as ChatTurnResult;
    return {
      events: toStreamEvents(body),
      data: body,
      status: "completed" as const,
    };
  },
});

/**
 * body.toolCalls 是 agent/agent.ts 里 extractToolCalls() 从整个 checkpointer 历史算出来的
 * ——同一个 sessionId 的第 N 轮请求,这个数组包含第 1..N 轮的全部工具调用,不只是本轮新增
 * 的(MemorySaver 的行为,见 memory/ 或本任务说明)。这里如实把它们全部映射成
 * action.called/action.result 事件对:adapter 的职责只是忠实转换,不做「只留本轮」这种
 * 二次加工——eval 断言那边知道这一点,不写排他/精确计数的断言。
 */
function toStreamEvents(body: ChatTurnResult): StreamEvent[] {
  const events: StreamEvent[] = [];
  for (const call of body.toolCalls) {
    const callId = crypto.randomUUID();
    events.push({ type: "action.called", callId, name: call.name, input: toJson(call.input) });
    events.push({ type: "action.result", callId, output: toJson(call.output), status: "completed" });
  }
  events.push({ type: "message", role: "assistant", text: body.reply });
  return events;
}

function failedTurn(message: string) {
  return {
    status: "failed" as const,
    events: [{ type: "error" as const, message }],
  };
}
