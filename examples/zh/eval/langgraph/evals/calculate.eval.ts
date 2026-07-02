import { defineEval } from "niceeval";

// T1':精确计算要走 calculate(递归下降解析器,见 agent/tools.ts),不许模型心算。
export default defineEval({
  description: "T1':精确计算走 calculate,不心算,结果体现在回复里",

  async test(t) {
    const turn = await t.send("帮我用计算器算一下 (12 + 8) * 3 等于多少?");
    turn.expectOk();

    await t.group("调用 calculate", () => {
      t.calledTool("calculate");
      t.toolOrder(["calculate"]);
      t.noFailedActions();
      // (12 + 8) * 3 = 60,回复里要能看到这个数字,证明用的是工具结果而不是随口一说。
      t.messageIncludes("60");
    });

    await t.group("负断言:没有误触发 get_weather", () => {
      t.notCalledTool("get_weather");
      t.maxToolCalls(2);
    });
  },
});
