import { defineExperiment } from "niceeval";
import { deterministicAgent } from "../agents/deterministic.ts";

export default defineExperiment({
  description: "Public turn, session, and attempt assertion scopes",
  adapter: deterministicAgent,
  evals: ["assertion-scopes"],
});
