import { defineConfig } from "niceeval";

export default defineConfig({
  name: { "zh-CN": "Codex SDK 示例", en: "Codex SDK example" },
  judge: { model: "gpt-5.4" },
  // Codex turns do real filesystem/shell work through the codex CLI subprocess
  // (not a plain chat completion), so give it more room than a chat-only agent.
  timeoutMs: 180_000,
  // agent.ts's WORKSPACE_DIR is one shared scratch directory for the whole
  // process (a single fixed path, not per-session) — concurrent turns would
  // race on the same files on disk, so runs must be serialized.
  maxConcurrency: 1,
});
