import { defineEval } from "niceeval";

export default defineEval({
  timeoutMs: 5_000,
  async test(t) {
    await t.sandbox.writeText("/tmp/group-checkpoint-state", "second");
    await t.sandbox.runShellOrThrow("sleep 10");
  },
});
