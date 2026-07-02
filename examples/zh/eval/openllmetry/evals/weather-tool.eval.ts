import { defineEval } from "niceeval";

// 天气问题要走 get_weather,不许模型编造 —— server 的 { reply, toolCalls } 经适配器
// 直构成事件流,调用参数、顺序、负断言(notCalledTool)、用量都可断言。
export default defineEval({
  description: "天气问题走 get_weather,参数、顺序、负断言全部可断言",

  async test(t) {
    const turn = await t.send("北京今天天气怎么样?");
    turn.expectOk();

    await t.group("调用 get_weather 且城市正确", () => {
      t.calledTool("get_weather", { input: { city: "北京" } });
      t.toolOrder(["get_weather"]);
      t.noFailedActions();
      // 回复里要有天气证据,避免「调了工具但没答用户」也算过。
      t.messageIncludes(/°C|气温|天气|晴|多云|雨|阴/);
    });

    await t.group("负断言可信:没有误触发别的工具", () => {
      t.notCalledTool("calculate");
      t.maxToolCalls(2);
    });

    t.judge.autoevals
      .closedQA("助手是否给出了具体的天气数据(温度或天气状况),而不是拒绝回答或含糊其辞?")
      .atLeast(0.7);
  },
});
