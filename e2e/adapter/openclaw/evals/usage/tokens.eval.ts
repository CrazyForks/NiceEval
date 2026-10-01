import { defineEval } from "niceeval";
import { satisfies } from "niceeval/expect";

export default defineEval({
  description: "usage 每轮都读到正的含缓存输入总量与输出量",
  async test(t) {
    const first = await t.send("只回答数字:1+1等于几?不要调用任何工具。");
    await first.succeeded().orStop();
    const second = await t.send("只回答数字:9-4等于几?不要调用任何工具。");
    await second.succeeded().orStop();

    for (const [label, turn] of [
      ["首轮", first],
      ["续轮", second],
    ] as const) {
      await t.group(`${label} usage 可读且为正`, () => {
        t.check(
          (turn.usage?.inputTokens ?? 0) + (turn.usage?.cacheReadTokens ?? 0) + (turn.usage?.cacheCreationTokens ?? 0),
          satisfies(
            "total input usage, including cache reads and writes, > 0",
            (value) => typeof value === "number" && value > 0,
          ),
        );
        t.check(
          turn.usage?.outputTokens,
          satisfies(
            "usage.outputTokens > 0",
            (value) => typeof value === "number" && value > 0,
          ),
        );
      });
    }
  },
});
