import { defineExperiment } from "niceeval";
import { sharedStateAgent, sharedStateHooks } from "../agents/shared-state.ts";

export default defineExperiment({
  adapter: sharedStateAgent,
  flags: { role: "pause-holder" },
  evals: ["shared-state/"],
  sharedState: { key: "runner/shared-state-pause" },
  ...sharedStateHooks("pause-holder"),
});
