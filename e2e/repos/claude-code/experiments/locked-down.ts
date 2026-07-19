import { defineExperiment } from "niceeval";
import agent from "../agents/claude-code-locked-down.ts";

// 独立实验:只挂了 settingsFile(permissions.deny)的 agent 才会真的没有 WebSearch/WebFetch。
export default defineExperiment({
  description: "locked-down:挂了 settingsFile 拒绝 WebSearch/WebFetch 的 claude-code agent",
  agent,
  model: "deepseek-v4-flash",
  runs: 1,
  evals: (id) => id === "websearch-denied",
});
