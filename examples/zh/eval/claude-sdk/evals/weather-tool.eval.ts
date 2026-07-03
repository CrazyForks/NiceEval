import { defineEval } from "niceeval";

// 天气问题必须走 get_weather,不许模型凭空编数字 —— server.ts/agent.ts 的
// system prompt 里也这么要求,这条 eval 把它钉成可断言的事实。
export default defineEval({
  description: "天气问题走 get_weather,参数/顺序/负断言/事件序全部可断言",

  async test(t) {
    const turn = await t.send("北京今天天气怎么样?");
    turn.expectOk();

    await t.group("调用 get_weather 且城市正确", () => {
      t.calledTool("get_weather", { input: { city: "北京" } });
      t.toolOrder(["get_weather"]);
      t.noFailedActions();
      t.messageIncludes(/°C|气温|天气|晴|多云|雷阵雨|阵雨/);
    });

    await t.group("负断言可信:没有误触发别的工具", () => {
      t.notCalledTool("calculate");
      t.maxToolCalls(2);
    });

    await t.group("事件序与用量", () => {
      t.eventOrder(["action.called", "action.result", "message"]);
    });

    // 「是否走了工具」由上面的 calledTool 确定性把关;judge 只评回复本身的质量。
    t.judge.autoevals
      .closedQA("助手是否给出了具体的天气数据(温度或天气状况),而不是拒绝回答或含糊其辞?")
      .atLeast(0.7);
  },
});
