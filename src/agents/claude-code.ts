// Claude Code 内置 sandbox adapter。
//
// 5 个 agent-specific 差异点(其余 fasteval runner 统一处理):
//   装 CLI   : npm i -g @anthropic-ai/claude-code
//   鉴权     : ANTHROPIC_API_KEY env
//   拼调用   : claude --print --dangerously-skip-permissions [--model m] [--resume sid] <prompt>
//   模型     : --model <ctx.model>(省略 → CLI 原生默认)
//   读 transcript: ~/.claude/projects/**/*.jsonl 最新文件

import { defineSandboxAgent } from "../define.ts";
import { requireEnv } from "../util.ts";
import { shared } from "./shared.ts";

export default defineSandboxAgent({
  name: "claude-code",
  capabilities: {
    conversation: true,
    toolObservability: true,
    workspace: true,
    compactionObservability: true,
  },

  async setup(sandbox) {
    await shared.ensureInstalled(sandbox, "npm", ["install", "-g", "@anthropic-ai/claude-code"]);
  },

  async send(input, ctx) {
    const sb = ctx.sandbox;
    const args = ["--print", "--dangerously-skip-permissions"];
    if (ctx.model) args.push("--model", ctx.model);
    if (!ctx.session.isNew && ctx.session.id) args.push("--resume", ctx.session.id);
    args.push(input.text);

    const res = await sb.runCommand("claude", args, {
      env: { ANTHROPIC_API_KEY: requireEnv("ANTHROPIC_API_KEY") },
      stream: true,
    });

    const raw = await shared.captureLatestJsonl(sb, "~/.claude/projects");
    ctx.session.id = shared.sessionIdFromClaudeTranscript(raw);

    const parsed = shared.parseClaudeCode(raw);
    return {
      events: parsed.events,
      usage: parsed.usage,
      status: res.exitCode === 0 ? "completed" : "failed",
    };
  },
});
