import { defineExperiment } from "niceeval";
import { sharedStateAgent, sharedStateHooks } from "../agents/shared-state.ts";

export default defineExperiment({
  adapter: sharedStateAgent,
  flags: { role: "fresh-cleanup-waiter" },
  evals: ["shared-state/"],
  sharedState: { key: "runner/shared-state-fresh-cleanup" },
  ...sharedStateHooks("fresh-cleanup-waiter"),
});
