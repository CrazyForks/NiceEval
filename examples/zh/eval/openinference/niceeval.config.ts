import { defineConfig } from "niceeval";

export default defineConfig({
  name: { "zh-CN": "OpenInference + Phoenix 埋点示例", en: "OpenInference + Phoenix instrumentation example" },
  // judge 不能复用 app 的 OPENAI_BASE_URL(那个指向 DeepSeek 直连,autoevals 的
  // closedQA/factuality/summarizes 强制 tool_choice,DeepSeek 直连对 deepseek-v4-pro /
  // deepseek-v4-flash 都报「Thinking mode does not support this tool_choice」,手动验证过)。
  // .env 里 NICEEVAL_JUDGE_BASE/KEY 指到另一个支持 gpt-5.4 的网关,见 src/scoring/judge.ts
  // resolveJudge 的优先级。
  judge: { model: "gpt-5.4" },
  // Python/uvicorn 冷启动 + import LangChain 比 Node 慢,再加一次真实 DeepSeek 调用,
  // 给足超时。
  timeoutMs: 120_000,
  // 子进程只是个单实例 FastAPI 服务,各请求互不干扰,但 LangChain 的 create_agent
  // 调用本身较重,并发别开太高。
  maxConcurrency: 3,
});
