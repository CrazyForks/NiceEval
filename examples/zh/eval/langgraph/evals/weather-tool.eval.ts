import { defineEval } from "niceeval";

// T1:天气问题要走 get_weather,不许模型自己编。这个 app 没有暴露 token 用量
// (agent/agent.ts 的 ChatTurnResult 只有 reply + toolCalls),所以这里不断言
// maxTokens/maxCost。
export default defineEval({
  description: "T1:天气问题走 get_weather,参数、顺序、负断言都可断言",

  async test(t) {
    const turn = await t.send("北京今天天气怎么样?");
    turn.expectOk();

    await t.group("调用 get_weather 且城市正确", () => {
      t.calledTool("get_weather", { input: { city: "北京" } });
      t.toolOrder(["get_weather"]);
      t.noFailedActions();
      t.messageIncludes(/°C|气温|天气|晴|多云|雨|阴/);
    });

    await t.group("负断言:没有误触发 calculate", () => {
      t.notCalledTool("calculate");
      t.maxToolCalls(2);
    });

    await t.group("事件序:先发起调用、后拿到结果、最后才回复用户", () => {
      t.eventOrder(["action.called", "action.result", "message"]);
    });

    // 「是否走了工具」由上面的 calledTool 确定性把关;judge 只评回复本身的质量。
    t.judge.autoevals
      .closedQA("助手是否给出了具体的天气数据(温度或天气状况),而不是拒绝回答或含糊其辞?")
      .atLeast(0.7);
  },
});
