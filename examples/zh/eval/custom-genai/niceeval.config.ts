import { defineConfig } from "niceeval";

export default defineConfig({
  name: { "zh-CN": "自定义 GenAI 服务示例", en: "Custom GenAI service example" },
  // 评判模型走 judge.baseUrl/apiKeyEnv → NICEEVAL_JUDGE_* → OPENAI_BASE_URL/OPENAI_API_KEY
  // 的解析顺序(见 src/scoring/judge.ts)。这个 app 的 .env 里 OPENAI_BASE_URL 直连
  // api.deepseek.com —— autoevals 的 closedQA/factuality/summarizes 都强制 tool_choice
  // 指定函数,而这个直连端点对 deepseek-v4-flash / deepseek-v4-pro 都报「Thinking mode
  // does not support this tool_choice」(curl 复现过,不是 adapter 的 bug)。所以 judge 走
  // .env 里单独配的 NICEEVAL_JUDGE_BASE/KEY(与 ai-sdk-v7 example 同一个网关),模型钉
  // gpt-5.4 —— 与被测 agent 的模型/网关完全分离,这本来就是 judge 的设计意图。
  judge: { model: "gpt-5.4" },
  timeoutMs: 120_000,
  // 这个 app 没有像 codex-sdk 那样的共享可变工作区;子进程只是个单实例 HTTP 服务,
  // 各请求互不干扰,并发可以给得比沙箱型 agent 高一些。
  maxConcurrency: 3,
});
