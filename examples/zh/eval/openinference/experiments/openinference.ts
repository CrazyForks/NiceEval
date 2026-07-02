import { defineExperiment } from "niceeval";
import openinferenceAgent from "../agents/openinference.ts";

export default defineExperiment({
  description: "openinference:FastAPI + LangChain create_agent,真实 DeepSeek 调用",
  agent: openinferenceAgent,
  runs: 1,
});
