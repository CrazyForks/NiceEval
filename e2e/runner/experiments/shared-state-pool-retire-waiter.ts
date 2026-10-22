import { defineExperiment } from "niceeval";
import { sharedStateAgent, sharedStateHooks } from "../agents/shared-state.ts";

export default defineExperiment({
  adapter: sharedStateAgent,
  flags: { role: "pool-retire-waiter" },
  evals: ["shared-state/"],
  sharedState: { key: "runner/shared-state-pool-retire" },
  ...sharedStateHooks("pool-retire-waiter"),
});
