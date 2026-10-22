import { defineExperiment } from "niceeval";
import { deterministicAgent } from "../agents/deterministic.ts";

export default defineExperiment({
  description: "history identity deduplication",
  adapter: deterministicAgent,
  evals: ["suite/"],
});
