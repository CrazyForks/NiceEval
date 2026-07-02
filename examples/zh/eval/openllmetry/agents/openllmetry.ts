// eval 侧的全部接线:起 server.ts、按标准协议 fetch /api/chat、把响应映射成 StreamEvent[]。
// niceeval 的东西只出现在这个目录 —— 应用代码(server.ts / agent.ts / tools.ts /
// instrumentation.ts)不 import 任何 eval 框架的类型,逐字节保持原样。
//
// 这是「部署态 agent」适配器(见 docs-site/guides/remote-agent.mdx):send 里就是一次
// fetch,服务进程的起停由适配器自己管,不需要 niceeval 的 sandbox 能力。

import { spawn, type ChildProcess } from "node:child_process";
import { defineAgent } from "niceeval/adapter";
import type { JsonValue, StreamEvent } from "niceeval";

const PORT = 5488;
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

async function ensureServer(): Promise<void> {
  if (await isUp()) return;
  readyPromise ??= (async () => {
    child = spawn("node", ["--env-file", ".env", "--import", "tsx/esm", "server.ts"], {
      cwd: new URL("..", import.meta.url).pathname,
      stdio: "inherit",
    });
    // SIGTERM,不 SIGKILL:server.ts 自己的 shutdown() 是 server.close(() => process.exit(0)),
    // 而 Node 的 keep-alive 连接会让 close() 的回调永远等不到(我们的 fetch() 会留一条空闲的
    // keep-alive socket)——用 SIGTERM 会让子进程收到信号但挂在优雅关闭上不退出,
    // niceeval 跑完也不会清走。server.ts 是逐字节复制的应用代码,不能改;这里直接
    // SIGKILL,反正是本地演示进程,不需要优雅关闭。
    process.on("exit", () => child?.kill("SIGKILL"));
    const deadline = Date.now() + 15_000;
    while (Date.now() < deadline) {
      if (await isUp()) return;
      await new Promise((r) => setTimeout(r, 300));
    }
    throw new Error(`openllmetry server did not become healthy within 15s at ${BASE_URL}/healthz`);
  })();
  return readyPromise;
}

interface ToolCallRecord {
  name: string;
  input: unknown;
  output: unknown;
}

interface ChatResponse {
  reply: string;
  toolCalls: ToolCallRecord[];
}

function toStreamEvents(body: ChatResponse): StreamEvent[] {
  const events: StreamEvent[] = [];

  body.toolCalls.forEach((call, i) => {
    const callId = `call-${i}`;
    events.push({
      type: "action.called",
      callId,
      name: call.name,
      input: (call.input ?? null) as JsonValue,
    });
    events.push({
      type: "action.result",
      callId,
      output: (call.output ?? null) as JsonValue,
      status: "completed",
    });
  });

  events.push({ type: "message", role: "assistant", text: body.reply });
  return events;
}

export default defineAgent({
  name: "openllmetry",
  capabilities: { conversation: true, toolObservability: true },
  async send(input, ctx) {
    await ensureServer();

    // agent.ts 的 chat(message, sessionId?) 在没传 sessionId 时,内部历史 Map 会落到
    // 共享的 "default" 键上——多个 eval 并发跑会互相污染对方的会话历史。这里给每个
    // niceeval 会话生成一个真正独立的 id,首次 send 时钉住、后续轮次(t.reply)复用。
    ctx.session.id ??= crypto.randomUUID();

    const r = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: input.text, sessionId: ctx.session.id }),
      signal: ctx.signal,
    });

    if (!r.ok) {
      const text = await r.text().catch(() => "");
      return {
        events: [{ type: "error", message: `openllmetry server responded ${r.status}: ${text}` }],
        status: "failed",
      };
    }

    const body = (await r.json()) as ChatResponse;

    return {
      events: toStreamEvents(body),
      data: { reply: body.reply },
      status: "completed",
    };
  },
});
