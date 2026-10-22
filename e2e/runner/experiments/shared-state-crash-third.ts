import { defineExperiment } from "niceeval";
import { sharedStateAgent, sharedStateHooks } from "../agents/shared-state.ts";

export default defineExperiment({
  adapter: sharedStateAgent,
  flags: { role: "crash-third" },
  evals: ["shared-state/"],
  sharedState: { key: "runner/shared-state-crash" },
  ...sharedStateHooks("crash-third"),
});
