import { defineConfig } from "niceeval";

export default defineConfig({
  name: { "zh-CN": "OpenLLMetry 示例", en: "OpenLLMetry example" },
  // 应用的 .env 把 OPENAI_API_KEY / OPENAI_BASE_URL 直接指到 DeepSeek 网关(见 agent.ts),
  // judge 复用同一对环境变量,所以 judge.model 也要是该网关认得的名字。
  judge: { model: "deepseek-v4-flash" },
  timeoutMs: 120_000,
  maxConcurrency: 4,
});
