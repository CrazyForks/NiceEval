// Bub(Republic AI)内置 sandbox adapter。
//
// 5 个 agent-specific 差异点:
//   装 CLI   : npm i -g @republic-ai/bub   (包名待确认,按 republic tape 命名规律推断)
//   鉴权     : BUB_API_KEY env(或 ANTHROPIC_API_KEY / OPENAI_API_KEY,按 bub 文档)
//   拼调用   : bub run [--model m] [--session sid] <prompt>
//   模型     : --model <ctx.model>(省略 → CLI 原生默认)
//   读 transcript: ~/.bub/tapes/*.jsonl 最新文件(tape 格式,kind=message/tool_call/…)
//
// OTLP tracing(bub 经 bub-tapestore-otel 插件发 http/protobuf):
//   env-based:OTEL_EXPORTER_OTLP_TRACES_ENDPOINT / OTEL_EXPORTER_OTLP_PROTOCOL
//   tracing.env() 返回这两个 key,runner 在每次 send 前 spread 进 env。
//
// ⚠️  bub CLI API(包名 / --session / auth 变量名)以 Republic AI 实际发布为准,
//     本文件结构正确但具体 flag 可能需随 CLI 版本微调。

import { defineSandboxAgent } from "../define.ts";
import { getEnv } from "../util.ts";
import { shared } from "./shared.ts";

/** bub 会话 ID:从最新 tape 的第一条 anchor/session 事件里取,供下轮 --session 续接。 */
function bubSessionId(raw: string | undefined): string | undefined {
  return shared.firstJsonField(raw, "session_id") ?? shared.firstJsonField(raw, "session");
}

export default defineSandboxAgent({
  name: "bub",
  capabilities: {
    conversation: true,
    toolObservability: true,
    workspace: true,
    compactionObservability: true,
    tracing: true,
  },

  tracing: {
    protocol: "http/protobuf",
    env(endpoint: string) {
      return {
        OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: endpoint,
        OTEL_EXPORTER_OTLP_PROTOCOL: "http/protobuf",
        OTEL_TRACES_EXPORTER: "otlp",
      };
    },
  },

  async setup(sandbox) {
    await shared.ensureInstalled(sandbox, "npm", ["install", "-g", "@republic-ai/bub"]);
  },

  async send(input, ctx) {
    const sb = ctx.sandbox;
    const args = ["run"];
    if (ctx.model) args.push("--model", ctx.model);
    if (!ctx.session.isNew && ctx.session.id) args.push("--session", ctx.session.id);
    args.push(input.text);

    // 鉴权:优先 BUB_API_KEY;回落常见的 provider key(bub 可能透传给底层 LLM)。
    const apiKey = getEnv("BUB_API_KEY") ?? getEnv("ANTHROPIC_API_KEY") ?? getEnv("OPENAI_API_KEY");
    const env: Record<string, string> = {};
    if (apiKey) env["BUB_API_KEY"] = apiKey;

    // 若 runner 注入了 OTLP env(tracing.env),spread 进来。
    if (ctx.telemetry?.env) Object.assign(env, ctx.telemetry.env);

    const res = await sb.runCommand("bub", args, { env, stream: true });

    const raw = await shared.captureLatestJsonl(sb, "~/.bub/tapes");
    ctx.session.id = bubSessionId(raw);

    const parsed = shared.parseBub(raw);
    return {
      events: parsed.events,
      usage: parsed.usage,
      status: res.exitCode === 0 ? "completed" : "failed",
    };
  },
});
