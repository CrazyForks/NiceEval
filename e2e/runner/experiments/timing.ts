import { defineExperiment } from "niceeval";
import { timingAgent } from "../agents/timing.ts";

export default defineExperiment({
  description: "generic runner timing",
  adapter: timingAgent,
  evals: ["timing/basic"],
});
