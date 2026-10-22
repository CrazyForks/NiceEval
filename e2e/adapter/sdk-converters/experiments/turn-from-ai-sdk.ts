import { defineExperiment } from "niceeval";
import { turnFromAiSdkFixtureAgent } from "../fixtures/turn-from-ai-sdk.ts";

export default defineExperiment({
  description: "Offline AI SDK v7 MockLanguageModel seam through the public turnFromAiSdk converter",
  adapter: turnFromAiSdkFixtureAgent,
  evals: ["turn-from-ai-sdk"],
  attempts: 1,
});
