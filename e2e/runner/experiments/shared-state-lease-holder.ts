import { defineExperiment } from "niceeval";
import { sharedStateAgent, sharedStateHooks } from "../agents/shared-state.ts";

export default defineExperiment({
  adapter: sharedStateAgent,
  flags: { role: "lease-holder" },
  evals: ["shared-state/"],
  sharedState: { key: "runner/shared-state-exclusive-provider-lane" },
  ...sharedStateHooks("lease-holder"),
});
