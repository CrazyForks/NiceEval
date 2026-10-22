import { defineEval } from "niceeval";

export default defineEval({
  timeoutMs: 5_000,
  async test(t) {
    await t.sandbox.writeText("/tmp/group-checkpoint-state", "second");
    // Exhaust the Attempt deadline without a provider command retiring the
    // container before its physical cleanup can persist the checkpoint.
    await new Promise<void>((resolve) => {
      if (t.signal.aborted) resolve();
      else t.signal.addEventListener("abort", () => resolve(), { once: true });
    });
  },
});
