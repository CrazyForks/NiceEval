// eval 文件本身不引用 agent——绑定全在实验文件里(CLI 只扫 experiments/**/*.ts,
// 取 default export 的 .agent 字段;见 src/runner/discover.ts)。这个示例只有一个
// agent,所以只需要一个实验文件:`niceeval exp langgraph` 会把 evals/ 下所有 eval
// 都跑一遍。
import { defineExperiment } from "niceeval";
import langgraphAgent from "../agents/langgraph.ts";

export default defineExperiment({
  description: "LangGraph ReAct agent(真实 DeepSeek 调用,经 createReactAgent)",
  agent: langgraphAgent,
  runs: 1,
});
