import { defineEval } from "niceeval";

// 天气问题要走 get_weather,不许模型自己编数字 —— agents/openinference.ts 把
// server.py 返回的 toolCalls 拆成 action.called/action.result 对,负断言
// (notCalledTool)因此可信。
export default defineEval({
  description: "北京天气走 get_weather,参数、顺序、负断言全部可断言",

  async test(t) {
    const turn = await t.send("北京今天天气怎么样?");
    turn.expectOk();

    await t.group("调用 get_weather 且城市正确", () => {
      t.calledTool("get_weather", { input: { city: "北京" } });
      t.toolOrder(["get_weather"]);
      t.noFailedActions();
      t.messageIncludes(/°C|气温|天气|晴|多云|雨/);
    });

    await t.group("负断言可信:没有误触发别的工具", () => {
      t.notCalledTool("calculate");
      t.notCalledTool("send_email");
      t.maxToolCalls(2);
    });

    await t.group("事件序", () => {
      t.eventOrder(["action.called", "action.result", "message"]);
    });

    t.judge.autoevals
      .closedQA("助手是否给出了具体的天气数据(温度或天气状况),而不是拒绝回答或含糊其辞?")
      .atLeast(0.7);
  },
});
