import { defineExperiment } from "niceeval";
import { claudeSdkStreamFixtureAgent } from "../fixtures/claude-sdk-stream.ts";

export default defineExperiment({
  description: "Offline locked Claude Agent SDK protocol frames through createClaudeSdkEventStream",
  adapter: claudeSdkStreamFixtureAgent,
  evals: ["claude-sdk-stream"],
  attempts: 1,
});
