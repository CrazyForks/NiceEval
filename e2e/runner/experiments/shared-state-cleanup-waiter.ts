import { defineExperiment } from "niceeval";
import { sharedStateAgent, sharedStateHooks } from "../agents/shared-state.ts";

export default defineExperiment({
  adapter: sharedStateAgent,
  flags: { role: "cleanup-waiter" },
  evals: ["shared-state/"],
  sharedState: { key: "runner/shared-state-cleanup-failure" },
  ...sharedStateHooks("cleanup-waiter"),
});
