# Compare —— 跨运行对比(设计,尚未实现)

> 状态:这是目标设计,`src/view/` 还没有对应实现。写这篇是为了在动代码前把方案定下来,别边写边改形状。

`fasteval view` 现在只有两种时间视角:**当下**(这次 `.fasteval/<timestamp>/` 里的结果)和**累计历史**(见下节)。缺的是第三种——**挑两个具体时间点,看差异**。这篇文档定下要补的就是这一块。这里的 "compare" 指 view 里一个新 tab,跟 `experiments/compare/`(文档里"一组可对比实验"的示例文件夹名,见 [Experiments](experiments.md#实验怎么组织文件夹--一组可对比的实验))是两回事,别混。

## 现状:累计历史,不是跨运行对比

`src/view/index.ts` 的 `aggregateRows` 按 `experimentId` 把 `.fasteval/` 下**所有**历史 `summary.json` 的 result 揉进同一行——通过率、平均耗时、成本都是跨全部历史 run 的累计值,不是"最新一次"或"某一次"的快照。原因是 `loadSummaries` 递归找到的每个 `summary.json` 都被拆进同一个 `groups.get(key)` 数组,`key` 只含 `experimentId`,不含 `startedAt`。

[Observability](observability.md#结果可视化fasteval-view) 里已经写了"跨运行趋势——每次运行是带时间戳的目录,于是成本 / 通过率能画成随提交变化的折线,抓性能或成本回归",但现在的实现拿不出这张图:没有保留单次 run 的独立身份,画不出"随时间变化",也选不出"这次 vs 上次"。这篇文档就是要把这句话落到设计上。

## 参考对象

Vercel `agent-eval` 的 `packages/playground` 有一个独立的 `/compare` 页:两个下拉各选一个 `results/<experiment>/<timestamp>/`,对比整体通过率、平均耗时、per-eval 通过率 delta。它能做到是因为目录结构天然按时间戳分层,从不合并。调研细节见 [References](references.md#vercel-agent-eval--packagesplayground)。

## 设计

### 数据模型:快照身份不能提前合并

`ViewData` 现有的 `rows`(累计视图)继续服务 Experiments / Runs / Traces 三个 tab——"这个 agent 整体现在什么水平"仍然是合并全部历史更有用的默认视图,不动它的语义。

新增一份**不合并**的快照列表,按 `(experimentId, startedAt)` 索引,每个快照携带该次 run 里这个 experiment 的 eval 级统计(复用 `evalLevelStats` 的输出形状:`evals`/`passed`/`failed`/`errored`/`skipped`/`passRate`/`avgDurationMs`/`usage`/`estimatedCostUSD`,以及每个 eval 的判决明细供 per-eval 对比表用)。这份数据随 `viewData` 一起烘焙进静态 HTML(不像 playground 能按需查 fs)。

### UI:新增 Compare tab

在 `src/view/app/App.tsx` 的 `navItems` 加一个 `compare`。页面形状抄 playground 的 `/compare`:

- 两个下拉,候选项是"快照"(`experimentId @ startedAt`),不限制两边必须是同一个 `experimentId`——同一 experiment 的两个时间点是主场景,但选两个不同 experiment 的快照做临时对比也不该被挡。
- 选完两边后:整体通过率 delta、平均耗时 delta、总成本 delta 三个 KPI;下面一张 per-eval 并排表,每行一个 eval id,列出左 / 右通过率和 delta 高亮(复用现成的 `outcomeOf` / `formatPercent` / `formatDuration` / `formatCost`,不重新发明格式化逻辑)。
- 没有历史快照(只跑过一次)时,下拉只有一项,直接提示"再跑一次才能对比",不报错。

### 明确不做的

- **不做时间序列折线图。** 历史快照一多,塞进单个静态 HTML 不合适,而且这次要补的是"挑两点"这个最小能力,不是完整的趋势可视化。
- **不改 Experiments tab 现有的"累计历史"默认语义。** 这是另一个值得讨论的问题(要不要默认只看最新一次 run,累计历史算不算合理默认),但跟"能不能挑两次对比"是两件事,不在这篇文档里一起改。

## 相关阅读

- [Observability](observability.md#结果可视化fasteval-view) —— `fasteval view` 现有能力全貌。
- [References](references.md#vercel-agent-eval--packagesplayground) —— 这次调研 agent-eval playground 的完整记录。
- [Experiments](experiments.md) —— `experimentId`、可对比组、`fasteval exp` 怎么产生这些历史快照。
