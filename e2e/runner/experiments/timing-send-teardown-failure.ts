import { defineExperiment } from "niceeval";
import { sendAndTeardownFailureAgent } from "../agents/timing.ts";

export default defineExperiment({
  description: "Agent teardown failure after send failure",
  adapter: sendAndTeardownFailureAgent,
  flags: { lifecycleReceipt: "timing-send-teardown-failure.ndjson" },
  evals: ["timing/send-teardown-failure"],
});
