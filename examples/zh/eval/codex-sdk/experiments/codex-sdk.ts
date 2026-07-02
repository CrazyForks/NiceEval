import { defineExperiment } from "niceeval";
import codexSdk from "../agents/codex-sdk.ts";

export default defineExperiment({
  description: "codex-sdk:真调用 Codex SDK,workspace/ 里真实创建、修改文件",
  agent: codexSdk,
  runs: 1,
});
