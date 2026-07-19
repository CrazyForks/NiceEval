import { defineExperiment } from "niceeval";
import agent from "../agents/openai-compat.ts";

// The only Experiment in this repo that calls the real gateway. `runs: 2` with
// `earlyExit: false` guarantees two real attempts of tool-call even though it's expected
// to pass every time — the point is exercising sources.json dedup across attempts that
// share the same eval file (docs/engineering/e2e-ci/results.md point 1), which a single
// attempt (the earlyExit default) would never produce.
export default defineExperiment({
  description: "main:真实 Chat Completions 网关工具调用往返,跑两次验证 sources.json 跨 attempt 去重",
  agent,
  model: "deepseek-chat",
  evals: ["tool-call"],
  runs: 2,
  earlyExit: false,
});
