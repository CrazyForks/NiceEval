# 先证明数据范围值得相信

## 解决什么问题

一张图可以计算正确,却因为快照未收尾、覆盖缺题、携带历史结果或落盘不可读而被误解。

## 全流程

1. 报告页首放 `ScopeWarnings`,先呈现快照选择与读取问题。
2. 放置 `SnapshotDiagnostics`,把每条 `snapshot.diagnostics` 与该快照的 experimentId、startedAt 和时效一起呈现;不合并成 Scope 事实。
3. 用 `ScopeSummary` 交代 Experiment / Eval / Attempt 数、时间范围与成本覆盖。
4. 用 `ExperimentList` 的占位行展示选中配置下没有结果的 Eval;不把它们冒充失败。
5. 携带或跨快照拼接的 Attempt 用行上时效标记交代,不升格成页面警告。
6. 只有这些事实都可见时,才让读者解读排名和趋势。

## 边界

- `ScopeWarnings` 不代替 Snapshot diagnostics、覆盖占位行或 Attempt 时效标记;四者归属不同。
- Snapshot diagnostics 不复制进 `ScopeWarnings` 或 Attempt;来源身份随呈现一起保留。
- 手工传 `Snapshot[]` 会放弃 Scope 的选择过程与 warnings;只在明确需要自定义历史口径时这样做。
