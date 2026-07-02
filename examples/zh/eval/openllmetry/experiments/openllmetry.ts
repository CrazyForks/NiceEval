import { defineExperiment } from "niceeval";
import agent from "../agents/openllmetry.ts";

// 唯一实验:agent 起本机 server(5488),真调用 .env 里配的 DeepSeek 网关
// (AGENT_MODEL=deepseek-v4-flash)。模型由应用自己的 .env 决定,这里不钉 ctx.model。
export default defineExperiment({
  description: "openllmetry:手写 tool-calling 循环 + OpenLLMetry 埋点",
  agent,
});
