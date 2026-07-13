import { defineExperiment } from "niceeval";
import agent from "../agents/claude-code-local-skill.ts";

// 独立实验(plan/docs-code-alignment-closeout.md 3.2):只选一个专用 eval
// (local-skill-used),runs: 1,避免复用 features 实验挂的 MCP server 与 judge 成本——
// local-skill-used 本身不调用 judge。eval id 不带 "feature-" 前缀,不会被
// experiments/features.ts 的 "feature-" 选择器捡走(那边跑的是挂了 repo Skill + MCP
// 的 claude-code-features.ts,没装这个本地 fixture);ci.ts 显式把 "local-skill-"
// 前缀加进 excludeIdPrefixes,同理避免被基线 agent(没装这个 fixture)捡走。
export default defineExperiment({
  description: `local-skill:本地 Skill fixture 安装验收(${agent.name})`,
  agent,
  runs: 1,
  evals: (id) => id === "local-skill-used",
  budget: 1,
  model: "deepseek-v4-flash",
});
