import { defineExperiment } from "niceeval";
import { pluginDirectAgent } from "../agents/deterministic.ts";

export default defineExperiment({
  adapter: pluginDirectAgent,
  evals: ["attempt-interruption/direct-agent-timeout"],
  attempts: 1,
  timeoutMs: 500,
});
