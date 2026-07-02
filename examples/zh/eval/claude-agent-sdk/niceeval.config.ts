import { defineConfig } from "niceeval";

export default defineConfig({
  name: { "zh-CN": "Claude Agent SDK 示例", en: "Claude Agent SDK example" },
  judge: { model: "gpt-5.4" },
  timeoutMs: 120_000,
  // 比 ai-sdk-v7(进程内直调,maxConcurrency 4)低:这里每个 attempt 都要经一个真实
  // 子进程(server.ts)+ DeepSeek 代理的 Claude Code CLI 调用,更重。
  maxConcurrency: 2,
});
