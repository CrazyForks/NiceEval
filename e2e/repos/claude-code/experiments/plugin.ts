import { defineExperiment } from "niceeval";
import agent from "../agents/claude-code-plugin.ts";

// 独立实验:只连了本仓库自带 Marketplace fixture 的 agent 才装得上这个 Plugin。
export default defineExperiment({
  description: "plugin:装了 marketplace plugin(自带 MCP server)的 claude-code agent",
  agent,
  model: "deepseek-v4-flash",
  runs: 1,
  evals: (id) => id === "plugin-mcp",
});
