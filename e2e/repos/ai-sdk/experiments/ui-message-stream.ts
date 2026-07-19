import { defineExperiment } from "niceeval";
import { uiMessageStreamAgent } from "niceeval/adapter";
import { DEFAULT_MODEL } from "../src/backend/models.ts";

const BASE_URL = process.env.AI_SDK_URL ?? "http://127.0.0.1:34101";
const agent = uiMessageStreamAgent({
  name: "ai-sdk-ui-message-stream",
  url: `${BASE_URL}/api/chat`,
});

// runs: 3 + earlyExit absorbs a single real-model blip; three consecutive misses is a
// genuine regression and the matrix should stay red for it.
export default defineExperiment({
  description: "ui-message-stream:HTTP useChat 后端(SSE、全量历史重放、审批改写重发)",
  agent,
  model: DEFAULT_MODEL,
  runs: 3,
  earlyExit: true,
  evals: (id) => id.startsWith("ui-message-stream/"),
  budget: 1,
});
