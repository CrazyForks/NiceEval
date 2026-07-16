# 概览组件

回答「这批结果有多大、整体是否健康、当前水位在哪」的三个组件。`.data` 计算契约见 [Library 总览](../library.md#数据计算与缓存边界)。

## `ExperimentComparison`

裸 `niceeval show` 与 `niceeval view` 首页经由[内建报告](built-in.md) `comparisonReport` 渲染的默认组合件。它先把 Selection 按**可比组**分区，再为每组分别计算 `GroupSummary`、成本 × 端到端成功率散点（`MetricScatter` 的口径）和 `ExperimentList`。可比组键是 experiment id 的完整父路径：`compare/bub` 与 `compare/codex` 的键都是 `compare`，`bench/long/codex` 的键是 `bench/long`；没有父路径的 experiment 使用自己的完整 id 作为单例组键。不同组的数据不会进入同一个 scatter、series、排序或汇总。

端到端成功率把每个 `failed` 与 `errored` attempt 都记为 0，只有 `skipped` 不进聚合；默认首页因此回答“这套配置实际交付成功结果的概率”，不会因排除执行错误而抬高排名。它是官方维护的组合件而非新的数据源——每个组的三个子块消费与单独使用时完全相同的 `.data()` 计算结果；某组只有一个可画 experiment 时散点照常显示单点。web 面持有完整组索引并一次聚焦一组，无 JS 时退化为各组独立的 `<details>`；text 面命中多个组时只显示组索引与可执行的单组查看命令，命中单组时才输出完整散点与列表，绝不生成跨组总榜。

在自定义报告里可以整体引用它：

```tsx
<ExperimentComparison data={await ExperimentComparison.data(selection)} />
```

数据形状穷尽如下：

```ts
interface ExperimentComparisonData {
  groups: ExperimentComparisonGroupData[];
}

interface ExperimentComparisonGroupData {
  /** experiment id 的完整父路径；根目录 experiment 使用自己的完整 id。 */
  key: string;
  summary: GroupSummaryData;
  scatter: ScatterData;
  experiments: ExperimentListItem[];
}
```

组按 `key` 字典序排列；组内 experiment 按端到端成功率从高到低预排。自定义报告若直接组合 [`MetricScatter`](metric-views.md#metricscatter) / [`ExperimentList`](entity-lists.md#experimentlist)，就是在显式接管分区责任：通用组件忠实消费传入范围，不会自动把跨组 Selection 拆开。

## `RunOverview`

显示快照时间、experiment / eval / attempt 数、端到端成功率、总成本和 Selection 警告。适合作为报告页头。成功率使用官方 `endToEndPassRate` 两级聚合；`errored` 记 0，`skipped` 不进分母。

```tsx
<RunOverview data={await RunOverview.data(selection)} />
```

## `GroupSummary`

显示一个范围内的 experiment / eval / attempt 数、eval 级判定构成、端到端成功率、成本和最后运行时间。先过滤 Selection，再计算摘要。这里先把同一 eval 的多轮 attempt 折成一个 verdict，再计算 `passed / (passed + failed + errored)`；`skipped` 不进分母：

```tsx
const group = selection.filter((snapshot) => snapshot.experimentId.startsWith("compare/"));
<GroupSummary data={await GroupSummary.data(group)} />
```

## 相关阅读

- [实体列表](entity-lists.md) —— 从汇总下钻到 experiment / eval / attempt。
- [指标组件](metric-views.md) —— 榜单、矩阵、散点与趋势。
- [内建报告](built-in.md) —— 裸宿主装载的默认定义。
