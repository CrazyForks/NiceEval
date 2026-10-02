import { defineEval } from "niceeval";

export default defineEval({
  timeoutMs: 60_000,
  async test(t) {
    await t.sandbox.writeText("/tmp/group-checkpoint-state", "first");
  },
});
