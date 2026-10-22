import { defineExperiment } from "niceeval";
import { deterministicAgent } from "../agents/deterministic.ts";

export default defineExperiment({
  adapter: deterministicAgent("interrupt-feedback"),
  evals: ["interrupt-feedback/wait"],
});
