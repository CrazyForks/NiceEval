import { defineExperiment } from "niceeval";
import { deterministicAgent } from "../agents/deterministic.ts";

export default defineExperiment({
  description: "Public Match factories publish matched and mismatched score evidence",
  adapter: deterministicAgent,
  evals: ["assertion-match-outcomes"],
});
