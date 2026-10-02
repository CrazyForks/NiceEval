import { writeFile } from "node:fs/promises";
import { defineEvalGroup } from "niceeval";
import { sandboxLayer } from "niceeval/sandbox";
import first from "./first.eval.ts";
import timedOut from "./timeout.eval.ts";

export default defineEvalGroup({
  evals: [first, timedOut],
  onUnavailable: "stop-group",
  sandbox: sandboxLayer().after(async (sandbox, context) => {
    const saved = await sandbox.runShellOrThrow("sleep 0.1; cat /tmp/group-checkpoint-state", { signal: context.signal });
    await writeFile("group-checkpoint-saved.txt", saved.stdout);
  }),
});
