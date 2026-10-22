// Replay captured upstream bytes through the public factory. Only the external
// Sandbox command/file boundary is substituted; parsing and diagnostics are real.
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { defineAgent, openCodeAgent } from "niceeval/adapter";

export function replayAgent(mode, faults) {
  const native = openCodeAgent({ apiKey: "fixture-key", baseUrl: "https://fixture.invalid" });
  const states = new Map();
  const key = (ctx) => `${ctx.experimentId}:${ctx.evalId}:${ctx.attempt.index}`;
  return defineAgent({
    name: "opencode-protocol-replay",
    evidenceCoverage: native.evidenceCoverage,
    async before(ctx) {
      const raw = await readFile(new URL(mode === "export" ? "./opencode-1.18.5.export.json" : "./opencode-1.18.5.jsonl", import.meta.url), "utf8");
      // Keep the captured step_start envelope, withholding later stdout events
      // to exercise the real export recovery path without inventing a sample.
      const start = (await readFile(new URL("./opencode-1.18.5.jsonl", import.meta.url), "utf8")).split("\n")[0];
      const unknown = faults ? '\n{"type":"message","content":"legacy-poison"}\n{"type":"future-event","content":"unknown-poison"}\n{"type":"future-event"}\n' : "";
      const sandbox = {
        sandboxId: randomUUID(), workdir: "/fixture", provider: "protocol-fixture",
        async pathExists() { return true; },
        async writeText() {},
        async readText() { return raw + unknown; },
        async runShell(command) {
          return { exitCode: 0, stderr: "", stdout: command === "printf '%s' $HOME" ? "/fixture-home" : "/fixture/opencode" };
        },
        async runCommand(_bin, args) {
          const stdout = mode === "export"
            ? (args[0] === "run" ? start + unknown : raw)
            : raw + unknown;
          return { exitCode: 0, stderr: "", stdout };
        },
      };
      states.set(key(ctx), sandbox);
      await native.before?.(sandbox, { ...ctx, sandbox, reportInstallation() {} });
    },
    async send(input, ctx) {
      return native.send(input, { ...ctx, sandbox: states.get(key(ctx)) });
    },
    async after(ctx) {
      const sandbox = states.get(key(ctx));
      try { if (sandbox) await native.after?.(sandbox, { ...ctx, sandbox }); }
      finally { states.delete(key(ctx)); }
    },
  });
}
