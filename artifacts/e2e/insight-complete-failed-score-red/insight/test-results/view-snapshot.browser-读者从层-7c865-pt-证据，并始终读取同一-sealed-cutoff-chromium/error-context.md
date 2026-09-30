# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: view-snapshot.browser.spec.ts >> 读者从层级 Overview 在可恢复 overlay 中审阅完整 Attempt 证据，并始终读取同一 sealed cutoff
- Location: test/view-snapshot.browser.spec.ts:22:1

# Error details

```
Error: expect(received).toMatchObject(expected)

- Expected  - 4
+ Received  + 4

  Object {
    "basis": "slot",
    "bounds": Object {
-     "max": 100,
+     "max": 0,
      "min": 0,
    },
-   "samples": 1,
-   "state": "available",
+   "samples": 0,
+   "state": "unavailable",
    "total": 1,
-   "value": 61,
+   "value": null,
  }
```

# Test source

```ts
  1   | // rerun: pnpm e2e test --repo insight -- --run test/view-snapshot.browser.spec.ts
  2   | 
  3   | import { only, type ProcessHandle } from "@niceeval/testkit";
  4   | import { expect, test } from "@playwright/test";
  5   | import { writeFile } from "node:fs/promises";
  6   | import { join } from "node:path";
  7   | import {
  8   |   expectLoopbackReadyUrl,
  9   |   insightCaseArtifacts,
  10  |   insightE2E,
  11  |   waitForViewReady,
  12  | } from "./support.ts";
  13  | // @use-case docs/feature/insight/use-case/insight-review-run-adoption.md
  14  | // @regression memory/insight-aggregate-hides-partial-state.md
  15  | // @regression memory/report-header-experiment-selector-regression.md
  16  | // @regression memory/report-match-details-obscure-score-and-collection.md
  17  | // @regression memory/report-result-cell-exposes-float-noise-and-unlabeled-coverage.md
  18  | // @regression memory/view-hard-refresh-duplicates-attempt-overlay.md
  19  | // @regression memory/view-renderer-flattens-debug-evidence.md
  20  | // @regression memory/view-run-selection-is-ignored.md
  21  | 
  22  | test("读者从层级 Overview 在可恢复 overlay 中审阅完整 Attempt 证据，并始终读取同一 sealed cutoff", async ({ page }, testInfo) => {
  23  |   test.setTimeout(240_000);
  24  |   const pageErrors: string[] = [];
  25  |   const consoleErrors: string[] = [];
  26  |   const failedResponses: Array<{ readonly path: string; readonly status: number }> = [];
  27  |   page.on("pageerror", (error) => pageErrors.push(error.message));
  28  |   page.on("console", (message) => {
  29  |     if (message.type() === "error") consoleErrors.push(message.text());
  30  |   });
  31  |   page.on("response", (response) => {
  32  |     const url = new URL(response.url());
  33  |     if (url.hostname === "127.0.0.1" && response.status() >= 400) {
  34  |       failedResponses.push({ path: url.pathname, status: response.status() });
  35  |     }
  36  |   });
  37  | 
  38  |   await insightE2E.case(
  39  |     "view-snapshot-browser",
  40  |     { artifacts: insightCaseArtifacts() },
  41  |     async ({ paths: { projectRoot }, commands: { niceeval } }) => {
  42  |       const scoreRun = await niceeval.run(["exp", "score-completeness", "--rerun", "all", "--json"]);
  43  |       expect(scoreRun.exitCode, scoreRun.diagnostic()).toBe(1);
  44  |       expect(scoreRun.expReceipt(), scoreRun.diagnostic()).toMatchObject({ completion: "completed" });
  45  |       const scoreRunId = only(scoreRun.expReceipt().createdRunIds, () => true, scoreRun.diagnostic());
  46  |       const scoreEvents = scoreRun.expEvalEvents();
  47  |       const scoreLocators = new Map<string, string>();
  48  |       for (const [evalId, verdict] of [
  49  |         ["score-completeness/failed", "failed"],
  50  |         ["score-completeness/zero", "failed"],
  51  |         ["score-completeness/partial", "errored"],
  52  |         ["score-completeness/unavailable", "errored"],
  53  |       ] as const) {
  54  |         const event = only(scoreEvents, (item) => item.evalId === evalId, scoreRun.diagnostic());
  55  |         expect(event).toMatchObject({ verdict, attempts: 1 });
  56  |         scoreLocators.set(evalId, withAt(event.locator));
  57  |       }
  58  | 
  59  |       const scoreRequestPath = join(projectRoot, "score-completeness.request.json");
  60  |       await writeFile(scoreRequestPath, JSON.stringify({
  61  |         protocol: "niceeval.query/v1",
  62  |         operation: { kind: "run.summary", runId: scoreRunId },
  63  |       }));
  64  |       const scoreSummary = await niceeval.run(["query", "run", "--request", scoreRequestPath]);
  65  |       expect(scoreSummary.exitCode, scoreSummary.diagnostic()).toBe(0);
  66  |       const scoreMembers = scoreSummary.querySuccess("run.summary").summary.members;
  67  |       // These same public facts must survive the Overview aggregation and View.
  68  |       for (const [evalId, earned, possible] of [
  69  |         ["score-completeness/failed", 61, 100],
  70  |         ["score-completeness/zero", 0, 200],
  71  |       ] as const) {
  72  |         expect(only(scoreMembers, (member) => member.evalId === evalId, scoreSummary.diagnostic()))
  73  |           .toMatchObject({ verdict: "failed", score: { state: "complete", earned, possible } });
  74  |       }
  75  | 
  76  |       await writeFile(scoreRequestPath, JSON.stringify({
  77  |         protocol: "niceeval.query/v1",
  78  |         operation: { kind: "overview.get", runIds: [scoreRunId] },
  79  |       }));
  80  |       const scoreOverview = await niceeval.run(["query", "run", "--request", scoreRequestPath]);
  81  |       expect(scoreOverview.exitCode, scoreOverview.diagnostic()).toBe(0);
  82  |       const scoreOverviewDocument = scoreOverview.querySuccess("overview.get");
  83  |       for (const [evalId, earned, possible] of [
  84  |         ["score-completeness/failed", 61, 100],
  85  |         ["score-completeness/zero", 0, 200],
  86  |       ] as const) {
  87  |         const cell = only(scoreOverviewDocument.overview.cells, (item) => item.evalId === evalId, scoreOverview.diagnostic());
  88  |         expect(cell.verdict.tally).toEqual({ passed: 0, failed: 1, errored: 0, skipped: 0 });
> 89  |         expect(cell.score).toMatchObject({
      |                            ^ Error: expect(received).toMatchObject(expected)
  90  |           state: "available", value: earned, samples: 1, total: 1, basis: "slot",
  91  |           bounds: { min: 0, max: possible },
  92  |         });
  93  |         expect(only(cell.members, () => true, scoreOverview.diagnostic()).publication).toMatchObject({
  94  |           state: "published",
  95  |           attemptLocator: scoreLocators.get(evalId),
  96  |           score: { state: "available", value: earned, samples: 1, total: 1, bounds: { min: 0, max: possible } },
  97  |         });
  98  |       }
  99  |       for (const [evalId, memberState, memberValue] of [
  100 |         ["score-completeness/partial", "partial", 9],
  101 |         ["score-completeness/unavailable", "unavailable", null],
  102 |       ] as const) {
  103 |         const cell = only(scoreOverviewDocument.overview.cells, (item) => item.evalId === evalId, scoreOverview.diagnostic());
  104 |         expect(cell.score).toMatchObject({ state: "unavailable", value: null, samples: 0, total: 1 });
  105 |         expect(only(cell.members, () => true, scoreOverview.diagnostic()).publication).toMatchObject({
  106 |           state: "published", score: { state: memberState, value: memberValue, samples: 0, total: 1 },
  107 |         });
  108 |       }
  109 |       const completeSubtotal = {
  110 |         state: "partial", value: 61, samples: 2, total: 4, basis: "eval",
  111 |         bounds: { min: 0, max: 300 },
  112 |       };
  113 |       expect(only(scoreOverviewDocument.overview.experiments, (item) => item.experimentId === "score-completeness", scoreOverview.diagnostic()).score)
  114 |         .toMatchObject(completeSubtotal);
  115 |       expect(scoreOverviewDocument.overview.totals.score).toMatchObject(completeSubtotal);
  116 | 
  117 |       const inspection = await niceeval.run(["exp", "main", "--rerun", "all", "--json"]);
  118 |       expect(inspection.exitCode, inspection.diagnostic()).toBe(0);
  119 |       expect(inspection.expReceipt(), inspection.diagnostic()).toMatchObject({ completion: "completed" });
  120 |       const inspectionRunId = only(inspection.expReceipt().createdRunIds, () => true, inspection.diagnostic());
  121 |       const inspectionAttempt = only(
  122 |         inspection.expEvalEvents(),
  123 |         (event) => event.evalId === "inspection",
  124 |         inspection.diagnostic(),
  125 |       );
  126 |       const inspectionLocator = withAt(inspectionAttempt.locator);
  127 | 
  128 |       const comparison = await niceeval.run(["exp", "main", "--rerun", "all", "--json"]);
  129 |       expect(comparison.exitCode, comparison.diagnostic()).toBe(0);
  130 |       const comparisonRunId = only(comparison.expReceipt().createdRunIds, () => true, comparison.diagnostic());
  131 |       const comparisonAttempt = only(
  132 |         comparison.expEvalEvents(),
  133 |         (event) => event.evalId === "inspection",
  134 |         comparison.diagnostic(),
  135 |       );
  136 |       const comparisonLocator = withAt(comparisonAttempt.locator);
  137 | 
  138 |       const alternate = await niceeval.run(["exp", "alternate", "--rerun", "all", "--json"]);
  139 |       expect(alternate.exitCode, alternate.diagnostic()).toBe(0);
  140 | 
  141 |       const executionTrace = await niceeval.run(["exp", "execution-trace", "--rerun", "all", "--json"]);
  142 |       expect(executionTrace.exitCode, executionTrace.diagnostic()).toBe(0);
  143 |       const executionLocator = withAt(only(executionTrace.expEvalEvents(), (event) => event.evalId === "execution-trace", executionTrace.diagnostic()).locator);
  144 | 
  145 |       const partialUsage = await niceeval.run(["exp", "partial-usage", "--rerun", "all", "--json"]);
  146 |       expect(partialUsage.expReceipt(), partialUsage.diagnostic()).toMatchObject({ completion: "completed" });
  147 | 
  148 |       let recallLocator = "";
  149 |       let toolLocator = "";
  150 |       let selectedRunId = "";
  151 |       for (const experimentId of ["classic/baseline", "classic/memory-a", "classic/incompatible"] as const) {
  152 |         const result = await niceeval.run(["exp", experimentId, "--rerun", "all", "--json"]);
  153 |         expect(result.expReceipt(), result.diagnostic()).toMatchObject({ completion: "completed" });
  154 |         if (experimentId === "classic/memory-a") {
  155 |           selectedRunId = only(result.expReceipt().createdRunIds, () => true, result.diagnostic());
  156 |           recallLocator = withAt(only(
  157 |             result.expEvalEvents(),
  158 |             (event) => event.evalId === "classic/recall-name",
  159 |             result.diagnostic(),
  160 |           ).locator);
  161 |           toolLocator = withAt(only(
  162 |             result.expEvalEvents(),
  163 |             (event) => event.evalId === "classic/tool-note",
  164 |             result.diagnostic(),
  165 |           ).locator);
  166 |         }
  167 |       }
  168 |       expect(recallLocator).toMatch(/^@[0-9A-Z]+$/u);
  169 |       expect(toolLocator).toMatch(/^@[0-9A-Z]+$/u);
  170 |       expect(selectedRunId).not.toBe("");
  171 | 
  172 |       const selectedView = niceeval.start([
  173 |         "view",
  174 |         "--run",
  175 |         selectedRunId,
  176 |         "--no-open",
  177 |         "--port",
  178 |         "0",
  179 |       ], { timeoutMs: 90_000 });
  180 |       try {
  181 |         const ready = await waitForViewReady(selectedView);
  182 |         await page.goto(expectLoopbackReadyUrl(ready.url).href);
  183 |         await expect(page.getByRole("heading", { name: "NiceEval Insight", exact: true })).toBeVisible();
  184 |         const selectedSummary = page.locator("summary.niceeval-table-hierarchy-summary").filter({
  185 |           hasText: /^classic\/memory-a /u,
  186 |         });
  187 |         await expect(selectedSummary).toHaveCount(1);
  188 |         await expect(selectedSummary).toBeVisible();
  189 |         await expect(page.locator("summary.niceeval-table-hierarchy-summary").filter({
```