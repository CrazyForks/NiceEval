import { createE2EContext, only, withInspectionRequest } from "@niceeval/testkit";
import { writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { expect, test } from "vitest";

const replay = createE2EContext({
  repoId: "adapter/opencode",
  project: {
    from: process.cwd(), prefix: "opencode-protocol-",
    omitTopLevel: [".e2e-artifacts", ".niceeval", "node_modules", "test"],
    links: [{ from: resolve("node_modules"), to: "node_modules", type: "dir" }],
  },
  commands: { niceeval: [join(process.cwd(), "node_modules", ".bin", "niceeval") ] },
});

// @feature docs/feature/adapters/README.md
test.concurrent("OpenCode 固定版本样本保留文本和用量并汇总未知事件", async () => {
  await Promise.all(([ ["jsonl", false], ["jsonl", true], ["export", false], ["export", true] ] as const).map(async ([mode, faults]) => {
  await replay.case(`protocol-${mode}-${faults}`, async ({ commands: { niceeval }, paths }) => {
    await writeFile(join(paths.projectRoot, "experiments/protocol.ts"), `
      import { defineExperiment } from "niceeval";
      import { replayAgent } from "../fixtures/replay.mjs";
      export default defineExperiment({ adapter: replayAgent("${mode}", ${faults}), evals: ["protocol"], attempts: 2 });
    `);
    await writeFile(join(paths.projectRoot, "evals/protocol.eval.ts"), `
      import { defineEval } from "niceeval";
      import { equals } from "niceeval/expect";
      export default defineEval({ async test(t) {
        for (let i = 0; i < 2; i++) {
          const turn = await t.send("Replay the captured response.");
          await turn.succeeded().orStop();
          t.check(turn.reply, equals("Protocol fixture complete."));
          t.check(turn.usage.inputTotalTokens, equals(11));
          t.check(turn.usage.outputTokens, equals(5));
          t.check(turn.usage.requests, equals(1));
        }
      }});
    `);
    const run = await niceeval.run(["exp", "protocol", "--rerun", "all", "--json"]);
    expect(run.exitCode, run.diagnostic()).toBe(0);
    const outcome = only(run.expEvalEvents(), (event) => event.evalId === "protocol");
    expect(outcome).toMatchObject({ verdict: "passed", attempts: 2, passed: 2 });
    const queried = await withInspectionRequest({ kind: "attempt.trace", locator: outcome.locator },
      (request) => niceeval.run(["query", "run", "--request", request]));
    expect(queried.exitCode, queried.diagnostic()).toBe(0);
    const trace = queried.attemptTrace().trace;
    const warnings = trace.diagnostics.items.filter((item) => item.code === "agent-event-unrecognized");
    expect(warnings).toHaveLength(faults ? 1 : 0);
    expect(JSON.stringify(trace.conversation)).not.toContain("poison");
    if (faults) {
      expect(warnings[0]?.kind).toBe("advisory");
      expect(warnings[0]?.summary).toContain("future-event (4)");
      expect(warnings[0]?.summary).toContain("message (2)");
      const locator = outcome.locator.startsWith("@") ? outcome.locator : `@${outcome.locator}`;
      const shown = await niceeval.run(["show", locator]);
      expect(shown.exitCode, shown.diagnostic()).toBe(0);
      expect(shown.stdout).toContain("agent-event-unrecognized");
      expect(shown.stdout).toContain("future-event (4)");
    }
  });
  }));
});
