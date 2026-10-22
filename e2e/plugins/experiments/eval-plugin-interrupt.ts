import { defineExperiment } from "niceeval";
import { pluginDirectAgent } from "../agents/deterministic.ts";

export default defineExperiment({
  adapter: pluginDirectAgent,
  evals: ["attempt-interruption/interrupt"],
  attempts: 1,
  flags: { slowTeardown: true },
});
