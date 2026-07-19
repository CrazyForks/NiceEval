import { defineEval } from "niceeval";
import { isDefined } from "niceeval/expect";

// The one Eval in this repo that drives a real model call — everything else this repo
// asserts (disk format, openResults() parity, --json parity, --junit folding) is read off
// this Eval's real attempts, run twice (see experiments/main.ts) so sources.json dedup
// across attempts sharing this eval file has something to exercise.
export default defineEval({
  description: "tool-call:真实 Chat Completions 兼容网关一次工具调用(get_stock_price),验证 calledTool 走通",

  async test(t) {
    const turn = await t.send(
      "ACME 现在的股价是多少?请使用 get_stock_price 工具查询,然后用一句简短的话告诉我价格。",
    );
    turn.expectOk();

    turn.calledTool("get_stock_price", {
      count: 1,
      input: { symbol: (v: unknown) => typeof v === "string" && v.toUpperCase().includes("ACME") },
    });
    turn.noFailedActions();

    t.check(turn.usage?.inputTokens, isDefined("usage.inputTokens"));
    t.check(turn.usage?.outputTokens, isDefined("usage.outputTokens"));
  },
});
