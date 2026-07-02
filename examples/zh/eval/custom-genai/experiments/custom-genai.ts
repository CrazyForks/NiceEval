import { defineExperiment } from "niceeval";
import customGenaiAgent from "../agents/custom-genai.ts";

export default defineExperiment({
  description: "custom-genai:手写 tool-calling 循环,真实 DeepSeek 调用",
  agent: customGenaiAgent,
  runs: 1,
});
