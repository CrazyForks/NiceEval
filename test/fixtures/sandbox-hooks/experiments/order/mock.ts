import { defineExperiment } from "niceeval";
import { defineSandbox } from "niceeval/sandbox";
import { completeCoverage, defineSandboxAgent } from "niceeval/adapter";
import { createFakeSandbox } from "../../lib/fake-sandbox.ts";
import { logEvent } from "../../lib/log.ts";

// 全序回归:sandbox.setup(a,b) → eval 主体驱动的 agent.setup → send → agent.teardown →
// sandbox.teardown(x,y 按注册序追加、执行时逆序 = y 先 x 后,LIFO)。
// 每个钩子把 ctx.experimentId 一并记下,顺带验证它在同一 attempt 内处处一致、非空。
const sandbox = defineSandbox({
  name: "fake-order",
  create: async () => createFakeSandbox(),
})
  .setup(async (_sb, ctx) => {
    await logEvent("sandbox:setup:a", ctx.experimentId);
  })
  .setup(async (_sb, ctx) => {
    await logEvent("sandbox:setup:b", ctx.experimentId);
  })
  .teardown(async (_sb, ctx) => {
    await logEvent("sandbox:teardown:x", ctx.experimentId);
  })
  .teardown(async (_sb, ctx) => {
    await logEvent("sandbox:teardown:y", ctx.experimentId);
  });

const agent = defineSandboxAgent({
  name: "order-agent",
  // 这份确定性 fixture 的 status/events/usage 都由测试完整构造。
  coverage: completeCoverage,
  async setup(_sb, ctx) {
    await logEvent("agent:setup", ctx.experimentId);
  },
  async send(_input, ctx) {
    await logEvent("agent:send", ctx.experimentId);
    return {
      status: "completed" as const,
      events: [{ type: "message" as const, role: "assistant" as const, text: "ok" }],
      usage: { inputTokens: 1, outputTokens: 1, requests: 1 },
    };
  },
  async teardown(_sb, ctx) {
    await logEvent("agent:teardown", ctx.experimentId);
  },
});

export default defineExperiment({
  description: "回归夹具:实验级钩子 + sandbox 钩子全序 + ctx.experimentId",
  agent,
  sandbox,
  // 实验级钩子(宿主机侧、整场一次)包在最外层:setup 早于本实验任何沙箱钩子,
  // teardown 在全部 attempt 收尾后。这对钩子由 cli 装配 AgentRun 时搬运,
  // 断言它出现在日志里 = 覆盖 ExperimentDef → AgentRun 这段搬运本身。
  async setup(ctx) {
    await logEvent("exp:setup", ctx.experimentId);
  },
  async teardown(ctx) {
    await logEvent("exp:teardown", ctx.experimentId);
  },
  model: "mock-order",
  runs: 1,
  earlyExit: false,
  evals: ["order"],
});
