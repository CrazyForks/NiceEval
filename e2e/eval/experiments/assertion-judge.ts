import { defineExperiment } from "niceeval";
import { deterministicAgent } from "../agents/deterministic.ts";

export default defineExperiment({
  description: "Judge optional/unavailable without a configured model",
  adapter: deterministicAgent,
  evals: ["assertion-judge-unavailable"],
});
