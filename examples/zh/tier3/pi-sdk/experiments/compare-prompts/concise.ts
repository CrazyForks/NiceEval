import { defineExperiment } from "niceeval";
import agent from "../../agents/pi-sdk.ts";

// compare-prompts 组的一格:极简风格变体。systemPrompt 是整份替换(不是追加),所以
// "需要时调用工具"的规则要保留——丢了它,天气/HITL 这些 eval 会因为模型不再调工具而红,
// 那测的就不是"风格差异"而是"变体把功能改坏了"。
const CONCISE_PROMPT =
  "你是一个能查天气、能做算术的助理。需要时调用工具,不要自己瞎编数字。回复必须极简:能一句话说清就一句话,不要寒暄。";

export default defineExperiment({
  description: "concise: 极简风格 system prompt",
  agent,
  flags: { systemPrompt: CONCISE_PROMPT },
  runs: 1,
});
