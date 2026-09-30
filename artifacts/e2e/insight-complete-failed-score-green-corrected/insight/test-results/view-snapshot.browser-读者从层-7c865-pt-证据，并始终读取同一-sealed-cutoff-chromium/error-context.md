# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: view-snapshot.browser.spec.ts >> 读者从层级 Overview 在可恢复 overlay 中审阅完整 Attempt 证据，并始终读取同一 sealed cutoff
- Location: test/view-snapshot.browser.spec.ts:22:1

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator:  locator('summary.niceeval-table-hierarchy-summary').filter({ hasText: '/^classic\\/incompatible /u' }).locator('.niceeval-table-hierarchy-cell').first()
Expected: "classic/incompatible (1/10)"
Received: "classic/incompatible (5/14)"
Timeout:  5000ms

Call log:
  - Expect "toHaveText" locator('summary.niceeval-table-hierarchy-summary').filter({ hasText: '/^classic\\/incompatible /u' }).locator('.niceeval-table-hierarchy-cell').first() with timeout 5000ms
  - waiting for locator('summary.niceeval-table-hierarchy-summary').filter({ hasText: '/^classic\\/incompatible /u' }).locator('.niceeval-table-hierarchy-cell').first()
    14 × locator resolved to <span class="niceeval-table-hierarchy-cell" data-sort-value="classic/incompatible (5/14)">…</span>
       - unexpected value "classic/incompatible (5/14)"

```

```yaml
- text: classic/incompatible (5/14)
```

# Test source

```ts
  246 |           hasText: /^usage-cost/u,
  247 |         });
  248 |         await expect(partialUsageEval.locator(".niceeval-table-hierarchy-cell").nth(4).locator(".niceeval-value")).toHaveText("12 tokens");
  249 |         await expect(partialUsageEval.locator(".niceeval-table-hierarchy-cell").nth(5).locator(".niceeval-value")).toHaveText("$0.000001");
  250 |         await expect(partialUsageEval.locator(".niceeval-table-hierarchy-cell").nth(5).locator(".niceeval-coverage")).toHaveText("partial");
  251 |         await partialUsageEval.click();
  252 |         const partialUsageAttempt = partialUsageEval.locator("xpath=..").locator(".niceeval-table-hierarchy-row").first();
  253 |         await expect(partialUsageAttempt.locator(".niceeval-table-hierarchy-cell").nth(4).locator(".niceeval-value")).toHaveText("12 tokens");
  254 |         await expect(partialUsageAttempt.locator(".niceeval-table-hierarchy-cell").nth(5).locator(".niceeval-value")).toHaveText("$0.000001");
  255 |         await expect(partialUsageAttempt.locator(".niceeval-table-hierarchy-cell").nth(5).locator(".niceeval-coverage")).toHaveText("partial");
  256 |         await partialUsageAttempt.getByRole("link", { name: /^@/u }).click();
  257 |         const externalUsage = page.getByRole("region", { name: "External call usage", exact: true });
  258 |         await expect(externalUsage).toContainText("1/2 calls fully costed");
  259 |         await externalUsage.getByText(/^Recorded calls/u).click();
  260 |         await expect(externalUsage).toContainText("vercel-ai-gateway.response");
  261 |         await externalUsage.getByText("Sealed pricing evidence", { exact: true }).click();
  262 |         await expect(externalUsage).toContainText("tokens-unknown");
  263 |         await page.getByRole("dialog").getByRole("button", { name: "Close", exact: true }).click();
  264 |         await experimentSelector.selectOption("/group/singleton/score-completeness");
  265 |         const scoreExperiment = page.locator("summary.niceeval-table-hierarchy-summary").filter({
  266 |           hasText: /^score-completeness \(\d+\/4\)/u,
  267 |         });
  268 |         const scoreTotal = scoreExperiment.locator(".niceeval-table-hierarchy-cell").last();
  269 |         await expect(scoreTotal.locator(".niceeval-value")).toHaveText("61 points");
  270 |         await expect(scoreTotal.locator(".niceeval-cell-detail")).toHaveText("Result coverage 2/4");
  271 |         await scoreExperiment.click();
  272 |         const scoreDetails = scoreExperiment.locator("xpath=..");
  273 |         for (const [name, expectedScore, expectedDetailScore] of [
  274 |           ["failed", "61 points", "61 pts"],
  275 |           ["zero", "0 points", "0 pts"],
  276 |         ] as const) {
  277 |           const evalSummary = scoreDetails.locator("summary.niceeval-table-hierarchy-summary").filter({
  278 |             hasText: new RegExp(`^score-completeness/${name}\\b`, "u"),
  279 |           });
  280 |           await expect(evalSummary.locator(".niceeval-table-hierarchy-cell").last().locator(".niceeval-value"))
  281 |             .toHaveText(expectedScore);
  282 |           await expect(evalSummary).toContainText("failed");
  283 |           await evalSummary.click();
  284 |           const attemptRow = evalSummary.locator("xpath=..").locator(".niceeval-table-hierarchy-row");
  285 |           await attemptRow.getByRole("link", { name: scoreLocators.get(`score-completeness/${name}`)!, exact: true }).click();
  286 |           const scoreDialog = page.getByRole("dialog");
  287 |           await expect(scoreDialog.locator(".niceeval-verdict-pill").first()).toHaveText("failed");
  288 |           const scoreKpi = scoreDialog.locator(".niceeval-kpi").filter({
  289 |             has: page.getByText("Score", { exact: true }),
  290 |           });
  291 |           await expect(scoreKpi.locator(".niceeval-kpi-value")).toHaveText(expectedDetailScore);
  292 |           await scoreDialog.getByRole("button", { name: "Close", exact: true }).click();
  293 |         }
  294 |         for (const name of ["partial", "unavailable"] as const) {
  295 |           const evalSummary = scoreDetails.locator("summary.niceeval-table-hierarchy-summary").filter({
  296 |             hasText: new RegExp(`^score-completeness/${name}\\b`, "u"),
  297 |           });
  298 |           await expect(evalSummary.locator(".niceeval-table-hierarchy-cell").last()).toContainText("unavailable");
  299 |           await evalSummary.click();
  300 |           await evalSummary.locator("xpath=..").getByRole("link", {
  301 |             name: scoreLocators.get(`score-completeness/${name}`)!, exact: true,
  302 |           }).click();
  303 |           const scoreDialog = page.getByRole("dialog");
  304 |           await expect(scoreDialog.locator(".niceeval-verdict-pill").first()).toHaveText("errored");
  305 |           await expect(scoreDialog.locator(".niceeval-kpi").filter({
  306 |             has: page.getByText("Score", { exact: true }),
  307 |           })).toHaveCount(0);
  308 |           await scoreDialog.getByRole("button", { name: "Close", exact: true }).click();
  309 |         }
  310 |         await experimentSelector.selectOption("/group/named/classic");
  311 |         await expect(page).toHaveURL(/#\/group\/named\/classic$/u);
  312 | 
  313 |         await languageSelector.selectOption("zh-CN");
  314 |         expect(new URL(page.url()).hash).toBe("#/group/named/classic");
  315 |         await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  316 |         await page.getByRole("combobox", { name: "实验" }).selectOption("/group/named/classic");
  317 |         await page.getByRole("combobox", { name: "语言" }).selectOption("en");
  318 | 
  319 |         const experimentSummary = page.locator("summary.niceeval-table-hierarchy-summary").filter({
  320 |           hasText: /^classic\/memory-a /u,
  321 |         });
  322 |         await expect(experimentSummary).toHaveCount(1);
  323 |         await experimentSummary.click();
  324 |         const experimentDetails = experimentSummary.locator("xpath=..");
  325 |         await expect(experimentDetails).toHaveAttribute("open", "");
  326 | 
  327 |         const evalGroupSummary = experimentDetails.locator("summary.niceeval-table-hierarchy-summary").filter({
  328 |           hasText: /^classic \(8 evals\)/u,
  329 |         });
  330 |         await expect(evalGroupSummary).toHaveCount(1);
  331 |         await evalGroupSummary.click();
  332 |         await expect(evalGroupSummary.locator("xpath=..")).toHaveAttribute("open", "");
  333 | 
  334 |         const recallSummary = experimentDetails.locator("summary.niceeval-table-hierarchy-summary").filter({
  335 |           hasText: /^recall-name/u,
  336 |         });
  337 |         await expect(recallSummary).toHaveCount(1);
  338 |         await recallSummary.click();
  339 |         await expect(recallSummary.locator("xpath=..")).toHaveAttribute("open", "");
  340 |         const recallAttempt = experimentDetails.getByRole("link", { name: recallLocator, exact: true });
  341 |         await expect(recallAttempt).toBeVisible();
  342 | 
  343 |         const scoreSummary = page.locator("summary.niceeval-table-hierarchy-summary").filter({
  344 |           hasText: /^classic\/incompatible /u,
  345 |         });
> 346 |         await expect(scoreSummary.locator(".niceeval-table-hierarchy-cell").first()).toHaveText(
      |                                                                                      ^ Error: expect(locator).toHaveText(expected) failed
  347 |           "classic/incompatible (1/10)",
  348 |         );
  349 |         const scoreValue = scoreSummary.locator(".niceeval-table-hierarchy-cell").last().locator(".niceeval-value");
  350 |         await expect(scoreValue).toHaveCount(1);
  351 |         await expect(scoreValue).toHaveText("7 points");
  352 |         await expect(scoreSummary).not.toContainText("missed check");
  353 |         await expect(scoreSummary).not.toContainText("passed");
  354 |         await expect(scoreSummary.locator(".niceeval-coverage")).toHaveCount(0);
  355 |         const missingScore = experimentDetails.locator(".niceeval-row-placeholder").filter({
  356 |           hasText: /^score/u,
  357 |         });
  358 |         await expect(missingScore.locator(".niceeval-missing-reason")).toHaveText(
  359 |           "no result for current config",
  360 |         );
  361 |         await expect(missingScore.locator(".niceeval-cell-detail")).toHaveText(
  362 |           "niceeval exp classic/memory-a",
  363 |         );
  364 |         await expect(page.locator(".niceeval-value").filter({ hasText: /^0$/u })).toHaveCount(0);
  365 | 
  366 |         await testInfo.attach("snapshot-overview", {
  367 |           body: await page.screenshot({ fullPage: true }),
  368 |           contentType: "image/png",
  369 |         });
  370 | 
  371 |         const overviewHash = new URL(page.url()).hash;
  372 |         await recallAttempt.click({ noWaitAfter: true });
  373 |         const dialog = page.getByRole("dialog");
  374 |         await expect(dialog).toBeVisible();
  375 |         const overviewHeading = page.locator("main h1");
  376 |         await expect(overviewHeading).toHaveCount(1);
  377 |         await expect(overviewHeading).toHaveText("NiceEval Insight");
  378 |         await expect(overviewHeading).toBeVisible();
  379 |         const attemptSummaryLocator = dialog.locator(".niceeval-attempt-summary-locator");
  380 |         await expect(attemptSummaryLocator).toHaveCount(1);
  381 |         await expect(attemptSummaryLocator).toBeVisible();
  382 |         await expect(attemptSummaryLocator).toHaveText(recallLocator);
  383 |         await expect(experimentDetails).toHaveAttribute("open", "");
  384 |         await expect(evalGroupSummary.locator("xpath=..")).toHaveAttribute("open", "");
  385 |         await expect(recallSummary.locator("xpath=..")).toHaveAttribute("open", "");
  386 | 
  387 |         const assertionLine = dialog.locator("summary").filter({ hasText: "t.check(t.reply" }).first();
  388 |         await assertionLine.click();
  389 |         const rootMatch = dialog.getByLabel(/^and\(includes.+: matched$/u).first();
  390 |         await expect(rootMatch).toBeVisible();
  391 |         await rootMatch.click();
  392 |         const orMatch = dialog.getByLabel(/^or\(includes.+: matched$/u).first();
  393 |         await expect(orMatch).toBeVisible();
  394 |         await orMatch.click();
  395 |         const orNode = orMatch.locator("xpath=..");
  396 |         await expect(orNode.getByLabel('includes("RECALL_OK"): matched')).toBeVisible();
  397 |         await expect(orNode.getByLabel('includes("NEVER_PRESENT"): mismatched')).toBeVisible();
  398 |         const assertionDetail = assertionLine.locator("xpath=..").locator(":scope > .niceeval-source-line-detail");
  399 |         await expect(assertionDetail.getByText("Expected", { exact: true }).first()).toBeVisible();
  400 |         await expect(assertionDetail.getByText("Observed", { exact: true }).first()).toBeVisible();
  401 |         await expect(assertionDetail.getByText("Reason", { exact: true }).first()).toBeVisible();
  402 | 
  403 |         const copiedAttemptUrl = page.url();
  404 |         await dialog.getByRole("button", { name: "Close" }).click();
  405 |         await expect(dialog).not.toBeVisible();
  406 |         expect(new URL(page.url()).hash).toBe(overviewHash);
  407 |         await expect(experimentDetails).toHaveAttribute("open", "");
  408 | 
  409 |         await page.goForward();
  410 |         await expect(dialog).toBeVisible();
  411 |         await page.goBack();
  412 |         await expect(dialog).not.toBeVisible();
  413 |         await page.goForward();
  414 |         await expect(dialog).toBeVisible();
  415 |         await page.reload();
  416 |         expect(page.url()).toBe(copiedAttemptUrl);
  417 |         await expect(dialog).toBeVisible();
  418 | 
  419 |         const shared = await page.context().newPage();
  420 |         try {
  421 |           await shared.goto(copiedAttemptUrl);
  422 |           await expect(shared.getByRole("dialog")).toBeVisible();
  423 |           const sharedOverviewHeading = shared.locator("main h1");
  424 |           await expect(sharedOverviewHeading).toHaveCount(1);
  425 |           await expect(sharedOverviewHeading).toHaveText("NiceEval Insight");
  426 |           await expect(sharedOverviewHeading).toBeVisible();
  427 |           await shared.getByRole("button", { name: "Close" }).click();
  428 |           await expect(shared.getByRole("dialog")).not.toBeVisible();
  429 |           await expect(shared).toHaveURL(/#\/group\/named\/classic$/u);
  430 |         } finally {
  431 |           await shared.close();
  432 |         }
  433 | 
  434 |         await page.mouse.click(5, 5);
  435 |         await expect(dialog).not.toBeVisible();
  436 |         await expect(page).toHaveURL(/#\/group\/named\/classic$/u);
  437 | 
  438 |         const inspectionRunRoute = `/run/${encodeURIComponent(inspectionRunId)}`;
  439 |         const runPage = await page.context().newPage();
  440 |         try {
  441 |           await runPage.goto(new URL(`#${inspectionRunRoute}`, page.url()).href);
  442 |           const inspectionRunHeading = runPage.locator("main h2.niceeval-section-title").filter({
  443 |             hasText: `Run membership · ${inspectionRunId}`,
  444 |           });
  445 |           await expect(inspectionRunHeading).toHaveCount(1);
  446 |           await expect(inspectionRunHeading).toHaveText(`Run membership · ${inspectionRunId}`);
```