import { defineExperiment } from "niceeval";
import agent from "../agents/claude-code-native-plugin.ts";

// 独立实验(plan/docs-code-alignment-closeout.md 3 节「测试矩阵要求」native plugin 矩阵格):
// 只选一个专用 eval(native-plugin-installed),runs: 1,避免复用 features 实验挂的 Skill/MCP/
// judge 成本。eval id 用 "native-plugin-" 前缀,不会被 features.ts 的 "feature-" 选择器或
// local-skill.ts 的 "local-skill-" 选择器捡走;ci.ts 显式把该前缀加进 excludeIdPrefixes。
export default defineExperiment({
  description: `native-plugin:Claude Code Native Plugin 安装验收(${agent.name})`,
  agent,
  runs: 1,
  evals: (id) => id === "native-plugin-installed",
  budget: 1,
  model: "deepseek-v4-flash",
});
