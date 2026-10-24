import { only } from "@niceeval/testkit";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { expect, test } from "vitest";
import { inspectionCaseArtifacts, inspectionE2E } from "./support.ts";

// @feature docs/feature/adapters/README.md
// @regression memory/adapter-seal-reason-diagnostic.md
test.concurrent("非法封存原因在调用处解释格式，捕获后仍保留采集错误与已登记用量", async () => {
  await inspectionE2E.case("usage-seal-invalid-reason", { artifacts: inspectionCaseArtifacts() }, async ({ paths: { projectRoot }, commands: { niceeval } }) => {
    const run = await niceeval.run(["exp", "usage-seal-invalid-reason", "--rerun", "all", "--json"]);
    expect(run.exitCode, run.diagnostic()).toBe(1);
    const event = only(run.expEvalEvents(), (item) => item.evalId === "usage-seal-invalid-reason", run.diagnostic());
    expect(event.verdict).toBe("errored");
    const request = join(projectRoot, "reason.request.json");
    await writeFile(request, JSON.stringify({ protocol: "niceeval.query/v3", operation: { kind: "attempt.get", locator: event.locator } }));
    const attempt = await niceeval.run(["query", "run", "--request", request]);
    expect(attempt.exitCode, attempt.diagnostic()).toBe(0);
    const entry = only(attempt.querySuccess("attempt.get").attempt.assertions.entries, () => true, attempt.diagnostic());
    await writeFile(request, JSON.stringify({ protocol: "niceeval.query/v3", operation: { kind: "attempt.assertion.detail", locator: event.locator, entryId: entry.entryId } }));
    const detail = await niceeval.run(["query", "run", "--request", request]);
    expect(detail.exitCode, detail.diagnostic()).toBe(0);
    expect(detail.querySuccess("attempt.assertion.detail").assertion.check).toMatchObject({ state: "matched" });
    await writeFile(request, JSON.stringify({ protocol: "niceeval.query/v3", operation: { kind: "attempt.usage", locator: event.locator } }));
    const read = await niceeval.run(["query", "run", "--request", request]);
    expect(read.exitCode, read.diagnostic()).toBe(0);
    expect(read.querySuccess("attempt.usage").usage).toMatchObject({ state: "partial", calls: [{ callId: "accepted" }] });
  });
});
