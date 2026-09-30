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

Locator: locator('summary.niceeval-table-hierarchy-summary').filter({ hasText: '/^score-completeness \\(\\d+\\/4\\)/u' }).locator('..').locator('summary.niceeval-table-hierarchy-summary').filter({ hasText: '/^score-completeness \\(4 evals\\)/u' }).locator('.niceeval-table-hierarchy-cell').last().locator('.niceeval-value')
Expected: "61 points"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toHaveText" locator('summary.niceeval-table-hierarchy-summary').filter({ hasText: '/^score-completeness \\(\\d+\\/4\\)/u' }).locator('..').locator('summary.niceeval-table-hierarchy-summary').filter({ hasText: '/^score-completeness \\(4 evals\\)/u' }).locator('.niceeval-table-hierarchy-cell').last().locator('.niceeval-value') with timeout 5000ms
  - waiting for locator('summary.niceeval-table-hierarchy-summary').filter({ hasText: '/^score-completeness \\(\\d+\\/4\\)/u' }).locator('..').locator('summary.niceeval-table-hierarchy-summary').filter({ hasText: '/^score-completeness \\(4 evals\\)/u' }).locator('.niceeval-table-hierarchy-cell').last().locator('.niceeval-value')

```

```yaml
- banner:
  - link "NiceEval":
    - /url: https://niceeval.com/?utm_source=insight&utm_medium=brand
  - navigation "Report pages":
    - link "Insight":
      - /url: "#/group/named/classic"
  - text: Experiments
  - combobox "Experiments":
    - option "named/classic"
    - option "singleton/alternate"
    - option "singleton/execution-trace"
    - option "singleton/main"
    - option "singleton/partial-usage"
    - option "singleton/score-completeness" [selected]
  - combobox "Language":
    - option "EN" [selected]
    - option "中文"
  - button "Refresh"
- main:
  - heading "NiceEval Insight" [level=1]
  - heading "singleton/score-completeness" [level=2]
  - figure:
    - heading "Cost × Score" [level=3]
    - paragraph: No chartable data
  - searchbox "Filter experiments…"
  - table:
    - rowgroup:
      - row "Experiment Model Adapter Avg. time Tokens Cost Result↑":
        - columnheader "Experiment"
        - columnheader "Model"
        - columnheader "Adapter"
        - columnheader "Avg. time"
        - columnheader "Tokens"
        - columnheader "Cost"
        - columnheader "Result↑"
    - rowgroup:
      - row:
        - cell:
          - group:
            - text: score-completeness (4/4) inspection-fixture-v1 inspection-fixture niceeval.agent/v1 · — 116ms unavailable unavailable 61 points Result coverage 2/4 · 2 failed 2 errored
            - group: score-completeness/failed — — 194ms unavailable unavailable 61 points · 1 failed
            - group: score-completeness/partial — — 96ms unavailable unavailable unavailable · 1 errored
            - group: score-completeness/unavailable — — 88ms unavailable unavailable unavailable · 1 errored
            - group: score-completeness/zero — — 85ms unavailable unavailable 0 points · 1 failed
```

# Test source

```ts
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
  190 |           hasText: /^classic\/baseline /u,
  191 |         })).toHaveCount(0);
  192 |         await expect(page.locator("summary.niceeval-table-hierarchy-summary").filter({
  193 |           hasText: /^classic\/incompatible /u,
  194 |         })).toHaveCount(0);
  195 |       } finally {
  196 |         await page.goto("about:blank");
  197 |         await stopView(selectedView);
  198 |       }
  199 | 
  200 |       const view = niceeval.start([
  201 |         "view",
  202 |         "--no-open",
  203 |         "--port",
  204 |         "0",
  205 |       ], { timeoutMs: 90_000 });
  206 | 
  207 |       try {
  208 |         const ready = await waitForViewReady(view);
  209 |         const response = await page.goto(expectLoopbackReadyUrl(ready.url).href);
  210 |         expect(response?.status()).toBe(200);
  211 |         await expect(page.getByRole("heading", { name: "NiceEval Insight", exact: true })).toBeVisible();
  212 | 
  213 |         const header = page.getByRole("banner");
  214 |         const experimentSelector = header.getByRole("combobox", { name: "Experiments" });
  215 |         const languageSelector = header.getByRole("combobox", { name: "Language" });
  216 |         await expect(experimentSelector).toBeVisible();
  217 |         await expect(languageSelector).toBeVisible();
  218 |         const headerComboboxes = header.getByRole("combobox");
  219 |         await expect(headerComboboxes).toHaveCount(2);
  220 |         await expect(headerComboboxes.nth(0)).toHaveAccessibleName("Experiments");
  221 |         await expect(headerComboboxes.nth(1)).toHaveAccessibleName("Language");
  222 |         await expect(experimentSelector.getByRole("option")).toContainText([
  223 |           "named/classic",
  224 |           "singleton/alternate",
  225 |           "singleton/main",
  226 |           "singleton/partial-usage",
  227 |         ]);
  228 |         await experimentSelector.selectOption("/group/singleton/partial-usage");
  229 |         const partialUsageSummary = page.locator("summary.niceeval-table-hierarchy-summary").filter({
  230 |           hasText: /^partial-usage /u,
  231 |         });
  232 |         const partialUsageTokens = partialUsageSummary.locator(".niceeval-table-hierarchy-cell").nth(4);
  233 |         await expect(partialUsageTokens.locator(".niceeval-value")).toHaveText("12 tokens");
  234 |         await expect(partialUsageTokens.locator(".niceeval-coverage")).toHaveText("partial");
  235 |         await expect(partialUsageTokens.locator(".niceeval-coverage")).toHaveAttribute(
  236 |           "title",
  237 |           "This value is a known subtotal because some underlying observations are unavailable",
  238 |         );
  239 |         const partialUsageCost = partialUsageSummary.locator(".niceeval-table-hierarchy-cell").nth(5);
  240 |         await expect(partialUsageCost.locator(".niceeval-value")).toHaveText("$0.000001");
  241 |         await expect(partialUsageCost.locator(".niceeval-coverage")).toHaveText("partial");
  242 |         await expect(partialUsageCost.locator(".niceeval-cost-source")).toHaveText("reported + estimated");
  243 |         await partialUsageSummary.click();
  244 |         const partialUsageDetails = partialUsageSummary.locator("xpath=..");
  245 |         const partialUsageEval = partialUsageDetails.locator("summary.niceeval-table-hierarchy-summary").filter({
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
  273 |         const scoreGroup = scoreDetails.locator("summary.niceeval-table-hierarchy-summary").filter({
  274 |           hasText: /^score-completeness \(4 evals\)/u,
  275 |         });
  276 |         await expect(scoreGroup.locator(".niceeval-table-hierarchy-cell").last().locator(".niceeval-value"))
> 277 |           .toHaveText("61 points");
      |            ^ Error: expect(locator).toHaveText(expected) failed
  278 |         await expect(scoreGroup.locator(".niceeval-table-hierarchy-cell").last().locator(".niceeval-cell-detail"))
  279 |           .toHaveText("Result coverage 2/4");
  280 |         await scoreGroup.click();
  281 |         for (const [name, expectedScore, expectedDetailScore] of [
  282 |           ["failed", "61 points", "61 pts"],
  283 |           ["zero", "0 points", "0 pts"],
  284 |         ] as const) {
  285 |           const evalSummary = scoreDetails.locator("summary.niceeval-table-hierarchy-summary").filter({
  286 |             hasText: new RegExp(`^${name}\\b`, "u"),
  287 |           });
  288 |           await expect(evalSummary.locator(".niceeval-table-hierarchy-cell").last().locator(".niceeval-value"))
  289 |             .toHaveText(expectedScore);
  290 |           await expect(evalSummary).toContainText("failed");
  291 |           await evalSummary.click();
  292 |           const attemptRow = evalSummary.locator("xpath=..").locator(".niceeval-table-hierarchy-row");
  293 |           await attemptRow.getByRole("link", { name: scoreLocators.get(`score-completeness/${name}`)!, exact: true }).click();
  294 |           const scoreDialog = page.getByRole("dialog");
  295 |           await expect(scoreDialog.locator(".niceeval-verdict-pill").first()).toHaveText("failed");
  296 |           const scoreKpi = scoreDialog.locator(".niceeval-kpi").filter({
  297 |             has: page.getByText("Score", { exact: true }),
  298 |           });
  299 |           await expect(scoreKpi.locator(".niceeval-kpi-value")).toHaveText(expectedDetailScore);
  300 |           await scoreDialog.getByRole("button", { name: "Close", exact: true }).click();
  301 |         }
  302 |         for (const name of ["partial", "unavailable"] as const) {
  303 |           const evalSummary = scoreDetails.locator("summary.niceeval-table-hierarchy-summary").filter({
  304 |             hasText: new RegExp(`^${name}\\b`, "u"),
  305 |           });
  306 |           await expect(evalSummary.locator(".niceeval-table-hierarchy-cell").last()).toContainText("unavailable");
  307 |           await evalSummary.click();
  308 |           await evalSummary.locator("xpath=..").getByRole("link", {
  309 |             name: scoreLocators.get(`score-completeness/${name}`)!, exact: true,
  310 |           }).click();
  311 |           const scoreDialog = page.getByRole("dialog");
  312 |           await expect(scoreDialog.locator(".niceeval-verdict-pill").first()).toHaveText("errored");
  313 |           await expect(scoreDialog.locator(".niceeval-kpi").filter({
  314 |             has: page.getByText("Score", { exact: true }),
  315 |           })).toHaveCount(0);
  316 |           await scoreDialog.getByRole("button", { name: "Close", exact: true }).click();
  317 |         }
  318 |         await experimentSelector.selectOption("/group/named/classic");
  319 |         await expect(page).toHaveURL(/#\/group\/named\/classic$/u);
  320 | 
  321 |         await languageSelector.selectOption("zh-CN");
  322 |         expect(new URL(page.url()).hash).toBe("#/group/named/classic");
  323 |         await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  324 |         await page.getByRole("combobox", { name: "实验" }).selectOption("/group/named/classic");
  325 |         await page.getByRole("combobox", { name: "语言" }).selectOption("en");
  326 | 
  327 |         const experimentSummary = page.locator("summary.niceeval-table-hierarchy-summary").filter({
  328 |           hasText: /^classic\/memory-a /u,
  329 |         });
  330 |         await expect(experimentSummary).toHaveCount(1);
  331 |         await experimentSummary.click();
  332 |         const experimentDetails = experimentSummary.locator("xpath=..");
  333 |         await expect(experimentDetails).toHaveAttribute("open", "");
  334 | 
  335 |         const evalGroupSummary = experimentDetails.locator("summary.niceeval-table-hierarchy-summary").filter({
  336 |           hasText: /^classic \(8 evals\)/u,
  337 |         });
  338 |         await expect(evalGroupSummary).toHaveCount(1);
  339 |         await evalGroupSummary.click();
  340 |         await expect(evalGroupSummary.locator("xpath=..")).toHaveAttribute("open", "");
  341 | 
  342 |         const recallSummary = experimentDetails.locator("summary.niceeval-table-hierarchy-summary").filter({
  343 |           hasText: /^recall-name/u,
  344 |         });
  345 |         await expect(recallSummary).toHaveCount(1);
  346 |         await recallSummary.click();
  347 |         await expect(recallSummary.locator("xpath=..")).toHaveAttribute("open", "");
  348 |         const recallAttempt = experimentDetails.getByRole("link", { name: recallLocator, exact: true });
  349 |         await expect(recallAttempt).toBeVisible();
  350 | 
  351 |         const scoreSummary = page.locator("summary.niceeval-table-hierarchy-summary").filter({
  352 |           hasText: /^classic\/incompatible /u,
  353 |         });
  354 |         await expect(scoreSummary.locator(".niceeval-table-hierarchy-cell").first()).toHaveText(
  355 |           "classic/incompatible (1/10)",
  356 |         );
  357 |         const scoreValue = scoreSummary.locator(".niceeval-table-hierarchy-cell").last().locator(".niceeval-value");
  358 |         await expect(scoreValue).toHaveCount(1);
  359 |         await expect(scoreValue).toHaveText("7 points");
  360 |         await expect(scoreSummary).not.toContainText("missed check");
  361 |         await expect(scoreSummary).not.toContainText("passed");
  362 |         await expect(scoreSummary.locator(".niceeval-coverage")).toHaveCount(0);
  363 |         const missingScore = experimentDetails.locator(".niceeval-row-placeholder").filter({
  364 |           hasText: /^score/u,
  365 |         });
  366 |         await expect(missingScore.locator(".niceeval-missing-reason")).toHaveText(
  367 |           "no result for current config",
  368 |         );
  369 |         await expect(missingScore.locator(".niceeval-cell-detail")).toHaveText(
  370 |           "niceeval exp classic/memory-a",
  371 |         );
  372 |         await expect(page.locator(".niceeval-value").filter({ hasText: /^0$/u })).toHaveCount(0);
  373 | 
  374 |         await testInfo.attach("snapshot-overview", {
  375 |           body: await page.screenshot({ fullPage: true }),
  376 |           contentType: "image/png",
  377 |         });
```