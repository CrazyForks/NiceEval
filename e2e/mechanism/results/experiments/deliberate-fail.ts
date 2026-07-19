import { defineExperiment } from "niceeval";
import agent from "../agents/openai-compat.ts";

// Never calls the real gateway (deliberate-fail.eval.ts doesn't send). Exists to produce
// a deterministic `failed` verdict for the JUnit `<failure>` folding assertion.
export default defineExperiment({
  description: "deliberate-fail:确定性 failed 判定,验证 JUnit <failure> 折叠",
  agent,
  evals: ["deliberate-fail"],
});
