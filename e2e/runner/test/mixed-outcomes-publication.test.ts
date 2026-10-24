import { only } from "@niceeval/testkit";
import { expect, test } from "vitest";
import { runnerE2E, writeInspectionRequest } from "./context.ts";

// @feature docs/feature/run/README.md
test.concurrent("并发多次 Attempt 全部结束后，四种结果均可从 Run 与 locator 审计", async () => {
  await runnerE2E.case("mixed-outcomes-publication", {
    artifacts: [{ source: ".niceeval", target: ".niceeval", optional: true }],
  }, async ({ commands: { niceeval }, paths }) => {
    const result = await niceeval.run(["exp", "mixed-outcomes", "--rerun", "all", "--json"]);
    expect(result.exitCode, result.diagnostic()).toBe(1);
    expect(result.expReceipt(), result.diagnostic()).toMatchObject({ completion: "completed" });
    expect(`${result.stdout}\n${result.stderr}`).not.toContain("runner-record-attempt-unsealed");
    const runId = only(result.expReceipt().createdRunIds, () => true, result.diagnostic());
    const request = await writeInspectionRequest(paths.projectRoot, "mixed-outcomes-run", { kind: "run.get", runId });
    const readback = await niceeval.run(["query", "run", "--request", request]);
    expect(readback.exitCode, readback.diagnostic()).toBe(0);
    const run = readback.run().run;
    expect(run.denominator).toEqual({ expected: 8, published: 8, missing: 0 });
    expect(run.plannedAttempts).toHaveLength(8);
    for (const verdict of ["passed", "failed", "errored", "skipped"] as const) {
      for (const attemptOrdinal of [0, 1]) {
        const slot = only(run.plannedAttempts, (slot) =>
          slot.evalId === `mixed-outcomes/${verdict}` && slot.attemptOrdinal === attemptOrdinal,
        readback.diagnostic());
        expect(slot).toMatchObject({ state: "executed", verdict, publication: { state: "published", attemptLocator: expect.stringMatching(/^@1/) } });
        if (slot.publication.state !== "published") throw new Error("Expected a published Attempt");
        const attemptRequest = await writeInspectionRequest(paths.projectRoot, `mixed-${verdict}-${attemptOrdinal}`, {
          kind: "attempt.get", locator: slot.publication.attemptLocator,
        });
        const attempt = await niceeval.run(["query", "run", "--request", attemptRequest]);
        expect(attempt.exitCode, attempt.diagnostic()).toBe(0);
        expect(attempt.attempt().attempt).toMatchObject({ locator: slot.publication.attemptLocator });
        if (verdict === "errored") {
          const traceRequest = await writeInspectionRequest(paths.projectRoot, `mixed-error-trace-${attemptOrdinal}`, {
            kind: "attempt.trace", locator: slot.publication.attemptLocator,
          });
          const trace = await niceeval.run(["query", "run", "--request", traceRequest]);
          expect(trace.exitCode, trace.diagnostic()).toBe(0);
          expect(trace.attemptTrace().trace.diagnostics.items).toEqual(expect.arrayContaining([
            expect.objectContaining({ kind: "execution-error", summary: expect.stringContaining("mixed-outcomes error body remains auditable") }),
          ]));
        }
      }
    }
  });
});
