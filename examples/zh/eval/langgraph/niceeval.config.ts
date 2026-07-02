import { defineConfig } from "niceeval";

// 注:这个 app 的 .env 把标准的 OPENAI_API_KEY / OPENAI_BASE_URL 挪用给了 DeepSeek
// (agent/agent.ts 里 ChatOpenAI 直接读这两个 env 名)。niceeval 的 judge(t.judge.autoevals.*)
// 兜底链路最后也会读这两个名字,和应用自己的凭证会撞车、把 judge 请求发去 DeepSeek 要一个
// 它没有的模型——所以 .env 里另配了 NICEEVAL_JUDGE_KEY / NICEEVAL_JUDGE_BASE(judge.ts 里
// 优先级最高),judge 走这条独立凭证,和应用的模型配置互不干扰。
export default defineConfig({
  name: { "zh-CN": "LangGraph ReAct agent 示例", en: "LangGraph ReAct agent example" },
  judge: { model: "gpt-5.4" },
  timeoutMs: 60_000,
  maxConcurrency: 2,
});
