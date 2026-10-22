// Replay captured upstream bytes through the public factory. Only the external
// Sandbox command/file boundary is substituted; parsing and diagnostics are real.
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { defineAgent, bubAgent } from "niceeval/adapter";

export function replayAgent(mode, faults) {
  const native = bubAgent({ apiKey: "fixture-key", baseUrl: "https://fixture.invalid" });
  const states = new Map();
  const key = (ctx) => `${ctx.experimentId}:${ctx.evalId}:${ctx.attempt.index}`;
  return defineAgent({
    name: "bub-protocol-replay",
    evidenceCoverage: native.evidenceCoverage,
    async before(ctx) {
      const raw = await readFile(new URL("./bub-0.5.1.tape.jsonl", import.meta.url), "utf8");
      const unknown = faults ? '\n{"type":"message","content":"legacy-poison"}\n{"kind":"future-event","payload":{"content":"unknown-poison"}}\n{"kind":"future-event","payload":{}}\n' : "";
      const sandbox = {
        sandboxId: randomUUID(), workdir: "/fixture", provider: "protocol-fixture",
        async pathExists() { return true; },
        async writeText() {},
        async readText() { return raw + unknown; },
        async runShell(command) {
          return { exitCode: 0, stderr: "", stdout: command === "printf '%s' $HOME" ? "/fixture-home" : "/fixture/opencode" };
        },
        async runCommand() {
          return { exitCode: 0, stderr: "", stdout: raw + unknown };
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
