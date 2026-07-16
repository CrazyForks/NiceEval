# 指标组件

把 [指标](metrics.md) 投影成榜单、矩阵、条形、散点、趋势与差异表的六个组件。`.data` 计算契约见 [Library 总览](../library.md#数据计算与缓存边界)。

## `MetricTable`

一行一个维度值，一列一个指标。适合 benchmark 榜和配置比较。`sort` 决定初始顺序，方向由指标的 `better` 决定；`filter` 给 web 面增加行过滤框。

```tsx
<MetricTable data={await MetricTable.data(selection, {
  rows: "agent",
  columns: [endToEndPassRate, examScore, costUSD, durationMs],
  sort: endToEndPassRate,
  evals: "coding/",
})} filter />
```

## `MetricMatrix` 与 `MetricBars`

二者使用同一份矩阵数据：Matrix 适合看“题 × 配置”的格子，Bars 适合比较每行的相对大小。

```tsx
const data = await MetricMatrix.data(selection, {
  rows: "eval",
  columns: "agent",
  cell: endToEndPassRate,
});

<MetricMatrix data={data} />
<MetricBars data={data} />
```

矩阵是稀疏的：没有 attempt 的组合不生成格子。格子中的 `refs` 保留证据引用；在自有页面中传 `attemptHref` 可令格子跳到你的 attempt 页。

## `Scoreboard`

把 eval 当题目，按固定题集算总分和分科得分。没跑到的题保留在分母中并按 0 分计，适合考试或合规检查，不适合“只统计有数据样本”的探索分析。

```tsx
<Scoreboard data={await Scoreboard.data(selection, {
  rows: "agent",
  subjects: "evalGroup",
  weights: { "security/": 3, "correctness/": 2 },
  fullMarks: 100,
  score: examScore,
})} />
```

权重按 eval id 前缀匹配；多个前缀都命中时，最长前缀生效。

## `MetricScatter`

每个点是一个维度值，x / y 各一个指标，series 决定连线分组。适合质量 × 成本 frontier。

在 `defineReport` 中可以直接给 Selection：

```tsx
<MetricScatter
  selection={selection}
  points="experiment"
  series="agent"
  x={costUSD}
  y={endToEndPassRate}
/>
```

在自己的 React 页面中先计算：

```tsx
const data = await MetricScatter.data(selection, {
  points: "experiment",
  series: "agent",
  x: costUSD,
  y: endToEndPassRate,
});
<MetricScatter data={data} pointHref={(row) => `/experiments/${row.key}`} />
```

x 或 y 缺失的点不绘制，并显示缺失数量。零个可画点时组件显示明确空态；只有一个可画点时照常画出该点，不把“比较”错误地当成至少两个实验的门槛。

web 面每个点带直接标签，内容是 experiment id 的末段（完整 id 与两轴取值在悬停提示里）——frontier 图靠“哪个点是谁”回答问题，标签必须逐一可读，不能只靠图例配色。标签位置从该点四周由近及远的一圈候选位（左右紧邻、四个斜角、正上正下，逐环外扩）中择优：代价累加「与已放置标签的重叠、与任何数据点的重叠、越出画布的面积、离点距离」，取最小者。只要存在无冲突候选，标签就不遮盖任何数据点、不与其它标签重叠、不越出画布；全部候选都冲突时取重叠最小的一个，绝不静默丢标签。无冲突时首选点右侧紧邻位；标签落在左右紧邻位之外时补一条 leader line 连回原点。多个点重合或近乎重合时，各自的标签向不同方向散开、各自带 leader line，每个仍能独立读出对应的点。

`MetricScatter` 是通用分析组件，不根据 experiment id 隐式分区。默认 `ExperimentComparison` 会先按可比组过滤后逐组调用它；自定义报告直接传入跨组 Selection 时，跨组同图是作者的显式选择。

## `MetricLine`

用一个数值 flag 作为 x 轴，按 series 画指标趋势。适合 token budget、并发数、reasoning effort 等参数扫描。

```tsx
import { flag } from "niceeval/report";

<MetricLine data={await MetricLine.data(selection, {
  x: flag("budget", { label: "Token budget", unit: "tokens" }),
  series: "agent",
  y: endToEndPassRate,
})} />
```

没有声明该 flag 或 flag 不是数值的 experiment 不会伪造 x 值，组件会报告未绘制数量。

## `DeltaTable`

成对比较 A 与 B，并按指标的 `better` 判断 delta 是改善还是退化。适合基线 / 候选、无缓存 / 有缓存或两个快照的对比。

```tsx
<DeltaTable data={await DeltaTable.data(selection, {
  pairs: [
    { label: "memory", a: "baseline", b: "with-memory" },
  ],
  metrics: [endToEndPassRate, costUSD, durationMs],
})} />
```

任一侧缺数据时 delta 保持缺失，不把缺失当 0。

## 相关阅读

- [指标与维度](metrics.md) —— 这些组件消费的指标、flag 与 config 维度。
- [概览组件](summaries.md) —— 默认报告怎样逐组组合散点与列表。
- [排版原语与自定义组件](layout.md) —— 把多个指标视图组织成报告树。
