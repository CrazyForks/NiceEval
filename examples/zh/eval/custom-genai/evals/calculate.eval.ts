import { defineEval } from "niceeval";

// 算术要走 calculate 工具而不是模型心算 —— 表达式和结果都可以在事件流里确定性核对。
export default defineEval({
  description: "算术表达式走 calculate,参数与结果可核对",

  async test(t) {
    const turn = await t.send("帮我算一下 (12+8)*3 等于多少?");
    turn.expectOk();

    await t.group("调用 calculate 且表达式正确", () => {
      // 表达式格式(空格、有无外层括号)由模型决定,用正则容忍格式差异,只锁定数字和运算符。
      t.calledTool("calculate", { input: { expression: /12\s*\+\s*8.*\*\s*3/ } });
      t.toolOrder(["calculate"]);
      t.noFailedActions();
      t.messageIncludes(/60/);
    });

    await t.group("负断言可信:没有误触发天气工具", () => {
      t.notCalledTool("get_weather");
      t.maxToolCalls(2);
    });

    t.judge.autoevals
      .closedQA("助手的回复里是否包含正确答案 60,并且清楚地告诉了用户?")
      .atLeast(0.7);
  },
});
