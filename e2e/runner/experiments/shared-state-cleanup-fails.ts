import { defineExperiment } from "niceeval";
import { sharedStateAgent, sharedStateHooks } from "../agents/shared-state.ts";

export default defineExperiment({
  adapter: sharedStateAgent,
  flags: { role: "cleanup-failure" },
  evals: ["shared-state/"],
  sharedState: { key: "runner/shared-state-cleanup-failure" },
  ...sharedStateHooks("cleanup-failure"),
});
