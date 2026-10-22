import { defineExperiment } from "niceeval";
import { setupAndTeardownFailureAgent } from "../agents/timing.ts";

export default defineExperiment({
  description: "Agent teardown failure after setup failure",
  adapter: setupAndTeardownFailureAgent,
  flags: { lifecycleReceipt: "timing-setup-teardown-failure.ndjson" },
  evals: ["timing/setup-teardown-failure"],
});
