# Handoff：exp 全 reused 反馈 + display-cell 截断 的代码落地

契约已定稿并提交(`389e2ea`):`docs/feature/experiments/cli.md`(全部命中缓存/成本口径/Reuse 不展开)、`docs/feature/scoring/library/display.md`(两步压缩)、`docs/feature/reports/show.md`(截断 worked example)。过程记 `memory/exp-show-unbounded-output-cases.md`。

来源:真机 `pnpm exec niceeval exp dev-e2b`(50 attempts 全命中缓存)与 `pnpm exec niceeval show`。四个偏离,两个已在工作树落地(未提交),两个待做。

## ✅ 已落地(工作树未提交,勿重复做)

- **display-cell 截断** —— `src/scoring/display.ts` 新增 `summaryText()`(`replace(/\s+/g," ").trim()` 折单行 + 240 字符上限),套到 title / matcher / expected / received / reason。这直接治了 `commandSucceeded` received dump 整段 stdout。核对 `src/scoring/display.test.ts` 已加用例。
- **carry/reused 失败进 FAILURES** —— `src/runner/run.ts` 新增 `reportResultFailure()`,对 `carriedResults` 逐条发 `failure` 反馈事件。fresh 与 carry 走同一入口 → reducer 折进 `state.failures` → human 完成页、agent/ci handoff 三面同源。这治了「全 reused 时 17 failed 却无 FAILURES」。

> 落地后**必须真机重跑** `niceeval exp dev-e2b` 确认全 reused 时 FAILURES 出现、locator 齐。

## ⬜ 待做

### 1. Reuse 头不再 per-config 铺开(bug:5 个 config 各列 10 个 eval id)
落点 `src/runner/feedback/human.ts` `buildPlanLines()`(约 134–139)+ i18n `feedback.human.reuse`。

- 删掉 `for (const group of plan.reusedByExperiment) lines.push('  [id] evalIds.join')` 这段展开。
- `feedback.human.reuse` 改成带分母与「待跑数」的单行,契约文案见 cli.md:`Reuse: {{reused}} of {{total}} carried in from cache · {{toRun}} to run`。`toRun = plan.shape.totalRuns - plan.reused`(= running+queued+completed)。中文 `src/i18n/zh-CN.ts` 同步:`复用:{{total}} 中 {{reused}} 条来自缓存 · {{toRun}} 待跑`。
- `plan.reusedByExperiment` 若仅剩 `--dry`/resume 明细在用则保留;human live/结束反馈不再消费它。核对没有别的 human 消费点。

### 2. 结论行成本口径 = 本次新派发,不含 reused(bug:`0s` 却 `10.0M tok · $7.04`)
落点 `src/runner/report.ts` `summarize()`(98–129)。当前对全部 `results`(含 carried)累加 `usage`/`estimatedCostUSD`,而 `durationMs` 是本次 wall-clock —— 时长记本次、成本记累计,自相矛盾。

- headline 的 tok/$ 只统计**本次新派发**的 attempt,排除 carried。两条路可选:
  - (a) `summarize()` 入参区分 fresh 与 carried,`usage`/`estimatedCostUSD` 只折 fresh;或
  - (b) `RunSummary` 同时带 `carriedUsage`/`carriedCost`,human `formatSummaryDetail` 只用 fresh 部分。
- 目标输出:`6 reused + 39 run` → `… · 1.2M tok · $1.37`(那 39 次);全 reused → `0s · 0 new tok · $0.00`。
- `RunSummary.results` 仍保留全量(报告/快照要),只改 headline 聚合口径。
- 核对 agent(`NICEEVAL RESULT` summary 行)与 ci(`result=…`)是否也从 `summary.usage`/`cost` 取数;若是,同口径修正,别让 handoff 又混回累计。
- 整套结果集(含 reused)的累计成本由 `niceeval view` / `show` 承担,不进 exp 结论行。

### 3. 空选择 total=0(核对项,可能已覆盖)
契约:`dev-e2b` 命中 0 个 eval 时不打空 `PASSED`,而是 `No evals selected: … matched 0 evals. Available experiments: …`,退出码非零。`src/runner/discover.ts` 本轮有改动,先核对是否已给这条消息;没有则补,并加一条 discover/run 测试。

## 验证

- `pnpm run typecheck` + `pnpm test`(含 `src/runner/feedback/*.test.ts`、`report.test.ts`、`scoring/display.test.ts`)。
- CLI 冒烟:`pnpm run niceeval -- exp <全 reused 组>`,逐条对 cli.md「全部命中缓存」两个示例:FAILURES 在、`0s · 0 new tok · $0.00`、Reuse 单行不铺开。
- 公开面无新增/改名 flag,`pnpm docs:reference` 不必跑;改了 i18n 文案顺手核对 `src/i18n/` 两份 `--help` 未受影响。
- 收尾:`memory/exp-show-unbounded-output-cases.md` 行首「代码待修」按落地情况改「已修」,补 commit / 文件落点。
