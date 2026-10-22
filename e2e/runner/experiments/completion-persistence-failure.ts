import { defineExperiment } from "niceeval";
import { completionPersistenceFailureAgent } from "../agents/timing.ts";

export default defineExperiment({
  description: "completion persistence failure",
  adapter: completionPersistenceFailureAgent,
  evals: ["timing/basic"],
});
