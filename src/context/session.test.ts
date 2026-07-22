// cases: docs/engineering/testing/unit/eval.md
import { describe, expect, it } from "vitest";

import { createAgentSession, SessionManager } from "./session.ts";
import type { Agent, Sandbox, StreamEvent, Turn, TurnInput } from "../types.ts";

// createAgentSession() 是 ctx.session 的实现——一条会话线的存取器(见
// docs-site/zh/explanation/adapter.mdx 的 AgentSession 契约)。这里直接测存取器本身;
// 端到端的「同一条线同一个 ctx.session」由 SessionManager / RunSession 保证。

function fakeSandbox(): Sandbox {
  return {
    workdir: "/sandbox/work",
    runCommand: async () => { throw new Error("not implemented"); },
    runShell: async () => { throw new Error("not implemented"); },
    readFile: async () => "",
    fileExists: async () => false,
    readSourceFiles: async () => Object.assign([], {
      text: () => "",
      code: () => "",
      fileMatching: () => undefined,
      fileMatchingAll: () => undefined,
      hasPath: () => false,
    }),
    writeFiles: async () => {},
    uploadFiles: async () => {},
    uploadDirectory: async () => {},
    stop: async () => {},
    sandboxId: "fake",
    otlpHost: null,
    downloadFile: async () => Buffer.from(""),
    uploadFile: async () => {},
  };
}

function agentReturning(turn: Turn): Agent {
  return {
    name: "fake-agent",
    kind: "remote",
    async send(_input: TurnInput): Promise<Turn> {
      return turn;
    },
  };
}

function makeManager(turn: Turn) {
  const lines: string[] = [];
  const manager = new SessionManager({
    agent: agentReturning(turn),
    sandbox: fakeSandbox(),
    flags: {},
    signal: new AbortController().signal,
    log: (msg) => lines.push(msg),
  });
  return { manager, lines };
}

// turn 级重试(见 docs/feature/error-classification):agent 按调用次数依次吐出预设的 Turn
// 序列,可选挂一个 classifyTurnError 分类器——用来证明重试真的经由 SessionManager 生效,
// 而不只是 send-retry.ts 单元层的行为。
function scriptedRetryAgent(turns: Turn[], classifyTurnError?: Agent["classifyTurnError"]): Agent & { calls: TurnInput[] } {
  const calls: TurnInput[] = [];
  let i = 0;
  const agent: Agent = {
    name: "scripted-retry",
    kind: "remote",
    async send(input: TurnInput): Promise<Turn> {
      calls.push(input);
      const turn = turns[Math.min(i, turns.length - 1)] as Turn;
      i++;
      return turn;
    },
    classifyTurnError,
  };
  return Object.assign(agent, { calls });
}

/** 退避睡眠瞬间返回 + 固定抖动为 0:单测不用真的等 5~20s 的退避窗口。 */
function makeRetryManager(agent: Agent, overrides: Partial<ConstructorParameters<typeof SessionManager>[0]> = {}) {
  const lines: string[] = [];
  const manager = new SessionManager({
    agent,
    sandbox: fakeSandbox(),
    flags: {},
    signal: new AbortController().signal,
    log: (msg) => lines.push(msg),
    retryRandom: () => 0,
    retrySleep: async () => {},
    ...overrides,
  });
  return { manager, lines };
}

describe("SessionManager · turn 级重试", () => {
  const rateLimited: Turn = { status: "failed", events: [{ type: "error", message: "rate limited, please retry later" }] };
  const succeeded: Turn = { status: "completed", events: [{ type: "message", role: "assistant", text: "done" }] };

  it("重试成功后结果零痕迹:只发生一次会话记账,失败尝试的事件不进 allEvents", async () => {
    const agent = scriptedRetryAgent([rateLimited, succeeded]);
    const { manager } = makeRetryManager(agent);

    const turn = await manager.send(manager.primary, "hi");

    expect(agent.calls).toHaveLength(2); // 确实重试了一次(第 1 次失败 + 第 2 次成功)
    expect(turn.status).toBe("completed");
    expect(manager.primary.turnCount).toBe(1); // 会话记账不因重试翻倍
    expect(manager.allEvents.filter((e) => e.type === "error")).toHaveLength(0); // 失败尝试的事件不落账
    expect(manager.allEvents.filter((e) => e.type === "message" && e.role === "user")).toHaveLength(1); // userEvent 不重放
  });

  it("adapter classifyTurnError 覆盖兜底:兜底本会判不可重试的文案,被 adapter 分类器判为可重试并触发重试", async () => {
    const queueFull: Turn = { status: "failed", events: [{ type: "error", message: "ACME_QUEUE_FULL: too many concurrent runs" }] };
    const agent = scriptedRetryAgent([queueFull, succeeded], (failure) =>
      failure.type === "turn-failed" && failure.turn.events.some((e) => e.type === "error" && e.message.includes("ACME_QUEUE_FULL"))
        ? { retryable: true, reason: "acme_queue_full" }
        : undefined,
    );
    const { manager } = makeRetryManager(agent);

    const turn = await manager.send(manager.primary, "hi");

    expect(agent.calls).toHaveLength(2);
    expect(turn.status).toBe("completed");
  });

  it("退避期间释放/收回并发槽位", async () => {
    const agent = scriptedRetryAgent([rateLimited, succeeded]);
    const slotCalls: string[] = [];
    const concurrencySlot = {
      release: async () => {
        slotCalls.push("release");
      },
      reacquire: async () => {
        slotCalls.push("reacquire");
      },
    };
    const { manager } = makeRetryManager(agent, { concurrencySlot });

    await manager.send(manager.primary, "hi");

    expect(slotCalls).toEqual(["release", "reacquire"]);
  });

  it("受理证据门:失败 Turn 带 agent 产出事件时不重试,原样浮出", async () => {
    const partialProgress: Turn = {
      status: "failed",
      events: [
        { type: "action.called", callId: "c1", name: "bash", input: {} },
        { type: "error", message: "rate limited, please retry later" },
      ],
    };
    const agent = scriptedRetryAgent([partialProgress, succeeded]);
    const { manager } = makeRetryManager(agent);

    const turn = await manager.send(manager.primary, "hi");

    expect(agent.calls).toHaveLength(1); // 没有发生重试
    expect(turn.status).toBe("failed");
  });
});

describe("SessionManager.send() 进度行", () => {
  it("failed 轮:进度行末尾追加最后一条 error 事件的 message", async () => {
    const events: StreamEvent[] = [
      { type: "message", role: "assistant", text: "" },
      { type: "error", message: "402 Insufficient Balance" },
    ];
    const { manager, lines } = makeManager({ events, status: "failed" });
    await manager.send(manager.primary, "hi");

    const progressLine = lines.find((l) => l.includes("← failed"));
    expect(progressLine).toContain("402 Insufficient Balance");
  });

  it("failed 轮但没有 error 事件:不追加空后缀,行尾保持原格式", async () => {
    const { manager, lines } = makeManager({ events: [], status: "failed" });
    await manager.send(manager.primary, "hi");

    const progressLine = lines.find((l) => l.includes("← failed"));
    expect(progressLine).toMatch(/\ds$/); // 以 "Ns" 收尾,没有多余的 " · " 后缀
  });

  it("completed 轮:即使事件里混了 error 事件也不提取原因(只在 failed 时生效)", async () => {
    const events: StreamEvent[] = [{ type: "error", message: "不该出现在这里" }];
    const { manager, lines } = makeManager({ events, status: "completed" });
    await manager.send(manager.primary, "hi");

    const progressLine = lines.find((l) => l.includes("← completed"));
    expect(progressLine).not.toContain("不该出现在这里");
  });

  it("原因文本压成单行并截断到 120 字符", async () => {
    const long = "x".repeat(200);
    const events: StreamEvent[] = [{ type: "error", message: long }];
    const { manager, lines } = makeManager({ events, status: "failed" });
    await manager.send(manager.primary, "hi");

    const progressLine = lines.find((l) => l.includes("← failed"))!;
    const suffix = progressLine.split(" · ").at(-1)!;
    expect(suffix.length).toBeLessThanOrEqual(120);
    expect(suffix.endsWith("…")).toBe(true);
  });
});

describe("createAgentSession", () => {
  describe("history()", () => {
    it("新线 get() 是空数组;commit 之后同一条线的 get() 能看见", () => {
      const session = createAgentSession();
      const history = session.history<{ role: string; text: string }>();
      expect(history.get()).toEqual([]);

      history.commit([{ role: "user", text: "hi" }, { role: "assistant", text: "hello" }]);
      expect(history.get()).toEqual([{ role: "user", text: "hi" }, { role: "assistant", text: "hello" }]);
    });

    it("不同会话线的历史互相隔离", () => {
      const a = createAgentSession();
      a.history<{ n: number }>().commit([{ n: 1 }]);

      const b = createAgentSession();
      expect(b.history<{ n: number }>().get()).toEqual([]); // 全新会话线,看不到 a 的历史
    });
  });

  describe("capture() / id", () => {
    it("新线 id 是 undefined;capture 之后同一条线的下一轮带上", () => {
      const session = createAgentSession();
      expect(session.id).toBeUndefined(); // 第一轮:新会话线的自然结果
      session.capture("sess-1");
      expect(session.id).toBe("sess-1");
    });

    it("first-writer-wins:后续 capture 不覆盖已记录的 id", () => {
      const session = createAgentSession();
      session.capture("sess-new");
      session.capture("sess-forked"); // 后端可能因 fork 换了新 id,不覆盖正在续接的线
      expect(session.id).toBe("sess-new");
    });

    it("空值 / undefined 被忽略,不落地", () => {
      const session = createAgentSession();
      session.capture(undefined);
      session.capture("");
      expect(session.id).toBeUndefined();
      session.capture("sess-1");
      expect(session.id).toBe("sess-1");
    });

    it("不同会话线互相隔离", () => {
      const a = createAgentSession();
      const b = createAgentSession();
      a.capture("sess-a");
      expect(a.id).toBe("sess-a");
      expect(b.id).toBeUndefined(); // b 是新线,看不到 a 的 id
    });
  });

  describe("hold() / take()", () => {
    it("take() 只消费一次;没有 hold 过就是 undefined", () => {
      const session = createAgentSession();
      expect(session.take<{ toolCallId: string }>()).toBeUndefined();
      session.hold({ toolCallId: "c1" });
      expect(session.take<{ toolCallId: string }>()).toEqual({ toolCallId: "c1" });
      expect(session.take<{ toolCallId: string }>()).toBeUndefined();
    });

    it("不要求会话有 id:第一轮就能 hold(服务端无状态的接口也能停轮)", () => {
      const session = createAgentSession();
      session.hold({ x: 1 });
      expect(session.id).toBeUndefined();
      expect(session.take<{ x: number }>()).toEqual({ x: 1 });
    });

    it("按会话线隔离,不同线互不干扰", () => {
      const a = createAgentSession();
      const b = createAgentSession();
      a.hold({ v: "A" });
      b.hold({ v: "B" });
      expect(b.take<{ v: string }>()).toEqual({ v: "B" });
      expect(a.take<{ v: string }>()).toEqual({ v: "A" });
    });
  });

  describe("state", () => {
    it("起始是 {},框架从不写入——可以被 adapter 当逃生舱自由读写", () => {
      const session = createAgentSession();
      expect(session.state).toEqual({});
      (session.state as Record<string, unknown>).foo = "bar";
      expect(session.state.foo).toBe("bar");
    });
  });
});
