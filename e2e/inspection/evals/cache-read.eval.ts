import { atLeast, includes } from "niceeval/expect";
import { cacheRead } from "../adapters/cache-read.ts";
export default cacheRead.defineEval({
  description: "Cache read rate uses complete token-weighted physical calls",
  test(t) {
    const scenario = String(t.flags.scenario);
    const before = t.usage;
    if (scenario === "exact") {
      t.record({ callId: "first", modelSlot: "planner", provider: "offline", model: "primary", status: "failed", inputTokens: 0, cacheReadTokens: 900, cacheWriteTokens: 100 });
      t.record({ callId: "retry", retryOf: "first", modelSlot: "planner", provider: null, model: "fallback", status: "succeeded", inputTotalTokens: 100, cacheReadTokens: 10 });
    } else if (scenario === "missing") {
      t.record({ callId: "missing-cache", modelSlot: "planner", status: "succeeded", inputTotalTokens: 100 });
      t.record({ callId: "missing-total", modelSlot: "planner", status: "succeeded", cacheReadTokens: 10, inputTokens: 20 });
      t.record({ callId: "unknown", modelSlot: "reviewer", status: "unknown", cacheReadTokens: 10, inputTotalTokens: 20 });
    } else if (scenario === "zero") {
      t.record({ callId: "zero", modelSlot: "planner", status: "succeeded", cacheReadTokens: 0, inputTotalTokens: 0 });
    } else if (scenario === "uncached") {
      t.record({ callId: "uncached", modelSlot: "planner", status: "succeeded", cacheReadTokens: 0, inputTotalTokens: 100 });
    } else if (scenario === "unsafe") {
      for (let i = 0; i < 2; i++) t.record({ callId: `unsafe-${i}`, modelSlot: "planner", status: "succeeded", cacheReadTokens: 1, inputTotalTokens: Number.MAX_SAFE_INTEGER });
    } else if (scenario === "empty") {
      // A complete empty ledger proves no samples, not a zero cache rate.
    } else if (scenario === "capacity") {
      for (let i = 0; i < 2000; i++) t.record({ callId: `call-${i}`, modelSlot: "planner", provider: i === 0 ? '"'.repeat(256) : "offline", model: i === 0 ? '"'.repeat(250) + String(i).padStart(6, "0") : `model-${i}`, status: "succeeded", cacheReadTokens: 1, inputTotalTokens: 1 });
    } else {
      t.record({ callId: "partial", modelSlot: "planner", status: "succeeded", cacheReadTokens: 60, inputTotalTokens: 100 });
    }
    if (scenario !== "unsealed") t.finish(scenario === "partial");
    if (scenario === "exact" || scenario === "capacity") t.check(t.usage.cacheRead.total.rate, atLeast(0.8)).gate();
    t.check(JSON.stringify(before.cacheRead.total.rate), includes("collection-incomplete"));
    t.check(Object.isFrozen(t.usage.cacheRead.modelSlots) ? "frozen" : "mutable", includes("frozen"));
  },
});
