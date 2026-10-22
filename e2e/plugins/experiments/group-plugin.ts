import { defineExperiment } from "niceeval";
import { pluginAgent, pluginSandbox } from "../agents/deterministic.ts";

export default defineExperiment({
  adapter: pluginAgent,
  sandbox: pluginSandbox,
  evals: ["group-plugin"],
  maxConcurrency: 1,
});
