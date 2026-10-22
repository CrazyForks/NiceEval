import { defineExperiment } from "niceeval";
import { classicMemoryAgent } from "../agents/classic.ts";

export default defineExperiment({
  description: "Project sealed conversation facts into generic execution pages",
  adapter: classicMemoryAgent(),
  model: "inspection-fixture-v1",
  evals: ["conversation-trace"],
});
