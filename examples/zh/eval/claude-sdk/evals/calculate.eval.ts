import { defineEval } from "niceeval";

// 算术问题必须走 calculate,不许模型自己心算凑答案 —— 同样是 system prompt 的约束,
// 这里钉成断言。不锁 expression 的精确格式(模型转写算式的方式不固定),只锁工具、
// 顺序和最终答案。
export default defineEval({
  description: "算术问题走 calculate,结果正确且没有误触发天气工具",

  async test(t) {
    const turn = await t.send("帮我算一下 (3 + 4) * 2 等于多少?");
    turn.expectOk();

    await t.group("调用 calculate 且没有失败", () => {
      t.calledTool("calculate");
      t.toolOrder(["calculate"]);
      t.noFailedActions();
      t.messageIncludes(/14/);
    });

    await t.group("负断言:没有误触发天气工具", () => {
      t.notCalledTool("get_weather");
      t.maxToolCalls(2);
    });

    t.judge.autoevals
      .closedQA("助手是否清楚地给出了 (3 + 4) * 2 = 14 这个结果,而不是给出错误答案或拒绝计算?")
      .atLeast(0.7);
  },
});
