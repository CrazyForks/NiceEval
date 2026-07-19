import { defineExperiment } from "niceeval";
import { aiSdkAgent } from "niceeval/adapter";
import { aiSdkOtel } from "niceeval/adapter/otel";
import { generateText, stepCountIs, type ModelMessage } from "ai";
import { buildTools, SYSTEM_PROMPT } from "../src/backend/tool-defs.ts";
import { DEFAULT_MODEL, resolveModel } from "../src/backend/models.ts";

const agent = aiSdkAgent<ModelMessage>({
  name: "ai-sdk-in-process",
  tracing: aiSdkOtel(),
  generate: ({ messages, model, signal, telemetry }) =>
    generateText({
      model: resolveModel(model ?? DEFAULT_MODEL),
      system: SYSTEM_PROMPT,
      messages,
      tools: buildTools(),
      stopWhen: stepCountIs(5),
      abortSignal: signal,
      telemetry,
    }),
  data: (result) => ({ reply: result.text }),
});

export default defineExperiment({
  description: "in-process:aiSdkAgent generate() 循环,tracing:接入 aiSdkOtel()(本仓库的 OTel 验证点)",
  agent,
  model: DEFAULT_MODEL,
  runs: 3,
  earlyExit: true,
  evals: (id) => id.startsWith("in-process/"),
  budget: 1,
});
