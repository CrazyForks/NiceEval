// OpenAI Codex CLI 内置 sandbox adapter。
//
// 5 个 agent-specific 差异点:
//   装 CLI   : npm i -g @openai/codex
//   鉴权     : OPENAI_API_KEY env
//   拼调用   : codex exec --profile default --json [--resume tid] <prompt>
//   模型     : setup 阶段写 ~/.codex/default.config.toml(含 model = "..."
//              省略 ctx.model 时不写 model,让 CLI 用它自己的默认值)
//   读 transcript: codex exec --json 的 stdout 即 JSONL 事件流
//
// OTLP tracing(codex 发 http/json):
//   configure 追加 [otel.trace_exporter.otlp-http] 块到 ~/.codex/config.toml
//   —— 子表放在所有上层表之后,天然合法(TOML 规范)。

import { defineSandboxAgent } from "../define.ts";
import { requireEnv } from "../util.ts";
import { shared } from "./shared.ts";
import type { Sandbox, AgentContext } from "../types.ts";

async function writeCodexProfile(sandbox: Sandbox, model: string | undefined): Promise<void> {
  const lines: string[] = [];
  if (model) lines.push(`model = "${model}"`);
  // 空文件合法 —— codex 读不到 model 时用它自己的默认值。
  await shared.writeFile(sandbox, "~/.codex/default.config.toml", lines.join("\n") + "\n");
}

async function writeOtlpConfig(sandbox: Sandbox, endpoint: string): Promise<void> {
  // 独立文件:只含 OTLP 块,不与 profile 合并,避免 TOML 子表顺序问题。
  const toml =
    `[otel.trace_exporter.otlp-http]\n` +
    `endpoint = "${endpoint}"\n`;
  await shared.writeFile(sandbox, "~/.codex/config.toml", toml);
}

export default defineSandboxAgent({
  name: "codex",
  capabilities: {
    conversation: true,
    toolObservability: true,
    workspace: true,
    compactionObservability: true,
    tracing: true,
  },

  tracing: {
    protocol: "http/json",
    async configure(sandbox: Sandbox, ctx: AgentContext): Promise<void> {
      if (ctx.telemetry?.endpoint) {
        await writeOtlpConfig(sandbox, ctx.telemetry.endpoint);
      }
    },
  },

  async setup(sandbox, ctx) {
    await shared.ensureInstalled(sandbox, "npm", ["install", "-g", "@openai/codex"]);
    await writeCodexProfile(sandbox, ctx.model);
  },

  async send(input, ctx) {
    const sb = ctx.sandbox;
    const args = ["exec", "--profile", "default", "--json"];
    if (!ctx.session.isNew && ctx.session.id) args.push("--resume", ctx.session.id);
    args.push(input.text);

    const res = await sb.runCommand("codex", args, {
      env: { OPENAI_API_KEY: requireEnv("OPENAI_API_KEY") },
      stream: true,
    });

    const raw = shared.extractJsonlFromStdout(res.stdout);
    ctx.session.id = shared.codexThreadId(res.stdout);

    const parsed = shared.parseCodex(raw);
    return {
      events: parsed.events,
      usage: parsed.usage,
      status: res.exitCode === 0 ? "completed" : "failed",
    };
  },
});
