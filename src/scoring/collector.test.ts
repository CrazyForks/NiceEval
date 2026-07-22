// cases: docs/engineering/testing/unit/scoring.md
// computePassed 的 gate 默认通过线单测(契约见
// docs/feature/scoring/architecture/severity-and-verdict.md「Severity」与
// docs/feature/scoring/library/value-assertions.md「改严重度与阈值」):
// 省略阈值时 gate 的判定线是满分(score >= 1),不是「任意正分即过」。

import { describe, expect, it } from "vitest";
import { AssertionCollector } from "./collector.ts";
import { completeCoverage, resolveAgentCoverage } from "./coverage.ts";
import { emptyDiffData } from "./diff.ts";
import { equals, includes, makeAssertion } from "../expect/index.ts";
import type { AssertionResult, ScoringContext, ValueAssertion } from "../types.ts";

function ctxWith(over: Partial<ScoringContext> = {}): ScoringContext {
  return {
    events: [],
    facts: {
      toolCalls: [],
      subagentCalls: [],
      inputRequests: [],
      parked: false,
      messageCount: 0,
      compactions: 0,
      contextInjections: 0,
    },
    diff: emptyDiffData(),
    scripts: {},
    usage: { inputTokens: 0, outputTokens: 0 },
    status: "completed",
    coverage: resolveAgentCoverage(completeCoverage),
    readFile: async () => undefined,
    ...over,
  };
}

// 镜像 context.ts 里 t.check 的包装口径:evaluate 只返回原始 score,
// outcome 完全交给 collector.finalize 里的 computePassed 判定。
function specForAssertion(assertion: ValueAssertion, value: unknown) {
  return {
    name: assertion.name,
    severity: assertion.severity,
    threshold: assertion.threshold,
    evaluate: async () => await assertion.score(value),
  };
}

async function evaluate(assertion: ValueAssertion, value: unknown): Promise<AssertionResult> {
  const collector = new AssertionCollector();
  collector.record(specForAssertion(assertion, value));
  const [result] = await collector.finalize(ctxWith());
  return result!;
}

// unavailable 没有 score 字段;测试只关心 passed/failed 分支,评不了直接报错暴露问题。
function scoreOf(result: AssertionResult): number {
  if (result.outcome === "unavailable") throw new Error(`unexpected unavailable: ${result.reason}`);
  return result.score;
}

describe("gate 省略阈值:0/1 matcher 不受满分线改动影响(回归)", () => {
  it("equals 命中记满分通过,未命中记 0 分失败", async () => {
    const hit = await evaluate(equals(4), 4);
    expect(hit.outcome).toBe("passed");
    expect(scoreOf(hit)).toBe(1);

    const miss = await evaluate(equals(4), 5);
    expect(miss.outcome).toBe("failed");
    expect(scoreOf(miss)).toBe(0);
  });

  it("includes 命中通过,未命中失败", async () => {
    const hit = await evaluate(includes("Brooklyn"), "天气见 Brooklyn 播报");
    expect(hit.outcome).toBe("passed");

    const miss = await evaluate(includes("Brooklyn"), "天气见 Chicago 播报");
    expect(miss.outcome).toBe("failed");
  });
});

describe("gate 省略阈值:连续打分断言(judge 类)按满分线判定", () => {
  it("0.7 分未达满分,记为 failed", async () => {
    const partial = makeAssertion({ name: "continuousScore", score: () => 0.7 });
    const result = await evaluate(partial, "irrelevant");
    expect(result.outcome).toBe("failed");
    expect(scoreOf(result)).toBe(0.7);
  });

  it("1.0 分满分,记为 passed", async () => {
    const perfect = makeAssertion({ name: "continuousScore", score: () => 1.0 });
    const result = await evaluate(perfect, "irrelevant");
    expect(result.outcome).toBe("passed");
    expect(scoreOf(result)).toBe(1);
  });
});
