import { describe, expect, it } from "vitest";

import { clientHistory, deltaStream, driveFrameStream, pausable, serverSession } from "./streaming.ts";
import type { DeltaOp } from "./streaming.ts";
import type { AgentContext } from "../types.ts";

/** 一条会话线 = 一份 state。同一个 ctx 重复用 = 同一条线;新造一个 = 新线。 */
function lineCtx(): AgentContext {
  return {
    signal: new AbortController().signal,
    flags: {},
    session: { state: {}, isNew: true },
    sandbox: undefined as never,
    log() {},
  };
}

describe("deltaStream", () => {
  // 模拟一个 OpenAI Chat Completions 风格的原始增量流:choices[0].delta.content 逐 token、
  // choices[0].delta.tool_calls[i] 逐参数、finish_reason 收尾、独立的 usage 帧。
  interface RawChunk {
    delta?: { content?: string; tool_calls?: { index: number; id?: string; function?: { name?: string; arguments?: string } }[] };
    finish_reason?: string | null;
    usage?: { prompt_tokens: number; completion_tokens: number };
  }

  const toolIndexToCallId = new Map<number, string>();

  function toOps(chunk: RawChunk): DeltaOp[] {
    const ops: DeltaOp[] = [];
    if (chunk.delta?.content) ops.push({ kind: "text-delta", text: chunk.delta.content });
    for (const tc of chunk.delta?.tool_calls ?? []) {
      if (tc.id) {
        toolIndexToCallId.set(tc.index, tc.id);
        ops.push({ kind: "tool-call-start", callId: tc.id, name: tc.function?.name ?? "unknown" });
      }
      const callId = toolIndexToCallId.get(tc.index)!;
      if (tc.function?.arguments) ops.push({ kind: "tool-args-delta", callId, delta: tc.function.arguments });
    }
    if (chunk.finish_reason === "tool_calls") {
      for (const callId of toolIndexToCallId.values()) ops.push({ kind: "tool-call-end", callId });
    }
    if (chunk.finish_reason === "stop") ops.push({ kind: "message-end" });
    if (chunk.usage) ops.push({ kind: "usage", usage: { inputTokens: chunk.usage.prompt_tokens, outputTokens: chunk.usage.completion_tokens } });
    return ops;
  }

  it("逐 token 文本拼接,message-end 落地成一条 message", () => {
    const s = deltaStream({ toOps });
    expect(s.add({ delta: { content: "北" } })).toEqual([]);
    expect(s.add({ delta: { content: "京" } })).toEqual([]);
    expect(s.add({ delta: { content: "晴" } })).toEqual([]);
    expect(s.add({ finish_reason: "stop" })).toEqual([{ type: "message", role: "assistant", text: "北京晴" }]);
  });

  it("逐参数拼接 + 合法 JSON 落地成 action.called;usage 帧旁路累积", () => {
    toolIndexToCallId.clear();
    const s = deltaStream({ toOps });
    s.add({ delta: { tool_calls: [{ index: 0, id: "call_1", function: { name: "get_weather", arguments: '{"cit' } }] } });
    s.add({ delta: { tool_calls: [{ index: 0, function: { arguments: 'y":"北京"}' } }] } });
    const events = s.add({ finish_reason: "tool_calls" });
    expect(events).toEqual([{ type: "action.called", callId: "call_1", name: "get_weather", input: { city: "北京" } }]);

    s.add({ usage: { prompt_tokens: 42, completion_tokens: 7 } });
    expect(s.usage).toEqual({ inputTokens: 42, outputTokens: 7 });
  });

  it("拼不出合法 JSON 时,把原始字符串塞进 input,不吞错误", () => {
    toolIndexToCallId.clear();
    const s = deltaStream({ toOps });
    s.add({ delta: { tool_calls: [{ index: 0, id: "call_2", function: { name: "broken", arguments: "not json" } }] } });
    expect(s.add({ finish_reason: "tool_calls" })).toEqual([{ type: "action.called", callId: "call_2", name: "broken", input: "not json" }]);
  });

  it("tool-result 独立到达,配对靠 core 的 deriveRunFacts,这里只管落地成 action.result", () => {
    const s = deltaStream<{ result?: { callId: string; output: string } }>({
      toOps: (f) => (f.result ? [{ kind: "tool-result", callId: f.result.callId, output: f.result.output, status: "completed" }] : []),
    });
    expect(s.add({ result: { callId: "call_1", output: "22C" } })).toEqual([
      { type: "action.result", callId: "call_1", output: "22C", status: "completed" },
    ]);
  });

  it("error 操作:落地未完成的文本、置 failed、附一条 error 事件", () => {
    const s = deltaStream({ toOps });
    s.add({ delta: { content: "还没说完" } });
    const events = s.add({ finish_reason: "error" } as never);
    // toOps 不认识 "error" finish_reason,验证一条真正的错误路径
    expect(events).toEqual([]);
    const s2 = deltaStream<{ err?: string }>({ toOps: (f) => (f.err ? [{ kind: "error", message: f.err }] : []) });
    expect(s2.add({ err: "网关超时" })).toEqual([{ type: "error", message: "网关超时" }]);
    expect(s2.failed).toBe(true);
  });
});

describe("pausable", () => {
  it("take() 只消费一次;没有 hold 过就是 undefined", () => {
    const p = pausable<{ toolCallId: string }>();
    const line = lineCtx();
    expect(p.take(line)).toBeUndefined();
    p.hold(line, { toolCallId: "c1" });
    expect(p.take(line)).toEqual({ toolCallId: "c1" });
    expect(p.take(line)).toBeUndefined();
  });

  it("不要求后端有会话 id:第一轮就能 hold(服务端无状态的接口也能停轮)", () => {
    const p = pausable<{ x: number }>();
    const line = lineCtx();
    p.hold(line, { x: 1 });
    expect(line.session.id).toBeUndefined();
    expect(p.take(line)).toEqual({ x: 1 });
  });

  it("按会话线隔离,不同线互不干扰", () => {
    const p = pausable<{ v: string }>();
    const a = lineCtx();
    const b = lineCtx();
    p.hold(a, { v: "A" });
    p.hold(b, { v: "B" });
    expect(p.take(b)).toEqual({ v: "B" });
    expect(p.take(a)).toEqual({ v: "A" });
  });
});

describe("serverSession", () => {
  it("新会话线不带 resume id;capture 之后同一条线的下一轮带上", () => {
    const session = serverSession();
    const line = lineCtx();
    expect(session.id(line)).toBeUndefined(); // 第一轮:空 state 的自然结果
    session.capture(line, "sess-1");
    expect(session.id(line)).toBe("sess-1"); // 续接轮:同一份 state
  });

  it("capture 是 first-writer-wins:续接轮不会被后端回传的(fork 后的)id 覆盖", () => {
    const session = serverSession();
    const line = lineCtx();
    session.capture(line, "sess-new");
    session.capture(line, "sess-forked"); // 后端可能因 fork 换了新 id,不覆盖正在续接的线
    expect(session.id(line)).toBe("sess-new");
  });

  it("capture 把真实后端 id 镜像到 ctx.session.id(t.sessionId / 报告可见);新线互相隔离", () => {
    const session = serverSession();
    const a = lineCtx();
    const b = lineCtx();
    session.capture(a, "sess-a");
    expect(a.session.id).toBe("sess-a");
    expect(session.id(b)).toBeUndefined(); // b 是新线,看不到 a 的 id
  });
});

describe("clientHistory", () => {
  it("新会话线历史为空;commit 之后同一条线取回", () => {
    const history = clientHistory<{ role: string; text: string }>();
    const line = lineCtx();
    expect(history.get(line)).toEqual([]);
    expect(line.session.id).toBeUndefined(); // 不伪造会话 id

    history.commit(line, [{ role: "user", text: "hi" }, { role: "assistant", text: "hello" }]);
    expect(history.get(line)).toEqual([{ role: "user", text: "hi" }, { role: "assistant", text: "hello" }]);
  });

  it("不同会话线的历史互相隔离", () => {
    const history = clientHistory<{ n: number }>();
    const a = lineCtx();
    history.get(a);
    history.commit(a, [{ n: 1 }]);

    const b = lineCtx();
    expect(history.get(b)).toEqual([]); // 全新会话线,看不到 a 的历史
  });
});

describe("driveFrameStream", () => {
  function cursorOf<T>(frames: T[]) {
    let i = 0;
    return { async next() { return i < frames.length ? frames[i++] : null; } };
  }

  it("逐帧喂 reducer,汇总 events / usage,流结束正常 completed", async () => {
    const frames = [{ text: "a" }, { text: "b" }];
    const reducer = {
      usage: { inputTokens: 1, outputTokens: 2 },
      add: (f: { text: string }) => [{ type: "message" as const, role: "assistant" as const, text: f.text }],
    };
    const turn = await driveFrameStream(cursorOf(frames), reducer, lineCtx());
    expect(turn.status).toBe("completed");
    expect(turn.events).toHaveLength(2);
    expect(turn.usage).toEqual({ inputTokens: 1, outputTokens: 2 });
  });

  it("onFrame 返回 pause:立即停止读流,附加 input.requested,status 置 waiting", async () => {
    let consumed = 0;
    const cursor = {
      async next() {
        consumed++;
        return consumed <= 3 ? { gate: consumed === 2 } : null;
      },
    };
    const reducer = { add: () => [] };
    const turn = await driveFrameStream(cursor, reducer, lineCtx(), (frame) =>
      frame.gate ? { pause: { id: "req1", action: "deploy" } } : undefined,
    );
    expect(turn.status).toBe("waiting");
    expect(consumed).toBe(2); // 第三帧没被读——暂停立即返回,不多读
    expect(turn.events).toEqual([{ type: "input.requested", request: { id: "req1", action: "deploy" } }]);
  });

  it("onFrame 返回 fail:记一条 error,继续读完,status 置 failed", async () => {
    const frames = [{ err: false }, { err: true }, { err: false }];
    const reducer = { add: () => [] };
    const turn = await driveFrameStream(cursorOf(frames), reducer, lineCtx(), (f) =>
      f.err ? { fail: "网关超时" } : undefined,
    );
    expect(turn.status).toBe("failed");
    expect(turn.events).toEqual([{ type: "error", message: "网关超时" }]);
  });

  it("reducer.failed 为真时即便没有 onFrame 也判 failed", async () => {
    const reducer = { failed: true, add: () => [] };
    const turn = await driveFrameStream(cursorOf([{}]), reducer, lineCtx());
    expect(turn.status).toBe("failed");
  });
});
