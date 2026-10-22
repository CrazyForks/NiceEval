import { defineExperiment } from "niceeval";
import { sharedStateAgent, sharedStateHooks } from "../agents/shared-state.ts";

export default defineExperiment({
  adapter: sharedStateAgent,
  flags: { role: "first" },
  evals: ["shared-state/"],
  sharedState: { key: "runner/shared-state-cohort" },
  ...sharedStateHooks("first"),
});
