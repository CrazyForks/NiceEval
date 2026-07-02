import { defineEval } from "niceeval";

// T2:会话隔离与累积。
//
// agent/agent.ts 用 LangGraph 的 MemorySaver 做 checkpointer,thread_id = sessionId。
// 关键行为(见 agents/langgraph.ts 顶部注释):同一个 sessionId 的第 N 轮请求,
// server 返回的 toolCalls 是【整段 thread 历史】——不是本轮新增的增量。所以:
//
//   · 同一 session 内的第二轮,事件流里理应同时看到第一轮和第二轮的工具调用——
//     这是 MemorySaver 的正常行为,不是重复计数的 bug,不能在这断言排他/精确数量。
//   · 只有 t.newSession() 开出的全新 sessionId(-> 全新 thread_id)才应该是干净的、
//     看不到主 session 任何历史的。
export default defineEval({
  description: "T2:同 session 内工具调用历史累积;newSession 开的新 thread 彼此隔离",

  async test(t) {
    const first = await t.send("北京今天天气怎么样?");
    first.expectOk();

    await t.group("第一轮:天气工具被调用", () => {
      first.calledTool("get_weather", { input: { city: "北京" } });
    });

    const second = await t.send("再帮我算一下 6 * 7 等于多少");
    second.expectOk();

    await t.group(
      "同一 session:MemorySaver 累积整段 thread 历史,第二轮的事件里两个工具调用都在场" +
        "(不断言排他/精确计数——这是预期的累积行为,不是重复触发)",
      () => {
        second.calledTool("calculate");
        second.calledTool("get_weather");
      },
    );

    const fresh = t.newSession();
    const freshTurn = await fresh.send("上海天气怎么样?");
    freshTurn.expectOk();

    await t.group(
      "newSession 开出全新 LangGraph thread_id:看不到主 session 的 calculate 调用," +
        "且 get_weather 只出现这一次——证明历史没有跨会话泄漏",
      () => {
        freshTurn.calledTool("get_weather", { input: { city: "上海" } });
        freshTurn.notCalledTool("calculate");
        freshTurn.maxToolCalls(1);
      },
    );
  },
});
