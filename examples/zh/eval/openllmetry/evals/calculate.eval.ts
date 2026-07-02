import { defineEval } from "niceeval";

// 算术题要走 calculate 工具算出精确值,不许模型心算(手写循环里模型很容易凑一个
// 看起来对但算错的数)。
export default defineEval({
  description: "算术题走 calculate,结果精确、没有误触发天气工具",

  async test(t) {
    const turn = await t.send("帮我算一下 (12 + 8) * 3 等于多少?");
    turn.expectOk();

    await t.group("调用 calculate 且表达式正确", () => {
      // 模型转述表达式时空格 / 括号写法可能有细微差异,用正则容忍格式、锁定数字与运算符。
      t.calledTool("calculate", { input: { expression: /12\s*\+\s*8\)?\s*\*\s*3/ } });
      t.noFailedActions();
      // (12+8)*3 = 60,回复里必须出现精确结果。
      t.messageIncludes("60");
    });

    await t.group("负断言可信:没有误触发天气工具", () => {
      t.notCalledTool("get_weather");
      t.maxToolCalls(2);
    });

    t.judge.autoevals
      .closedQA("助手是否给出了正确的计算结果(60),而不是含糊其辞或算错?")
      .atLeast(0.7);
  },
});
