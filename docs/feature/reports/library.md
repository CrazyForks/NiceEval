# Reports —— 库用法

`niceeval/report` 用来计算报告数据和定义可同时交给 `show`、`view` 渲染的报告；`niceeval/report/react` 提供可直接嵌入你自己 React 页面中的纯渲染组件。`defineReport` 除报告树外还能声明导航外壳（标题、GitHub 等外链、页脚）与多页，见[外壳与多页](library/shell.md)。

最快的选择方式：先确定想回答的问题，再选组件。

| 想回答的问题 | 组件 |
|---|---|
| 这批结果有多大、整体是否健康 | [`RunOverview`](library/summaries.md#runoverview) |
| 按可比组看当前水位，并只在组内比较 | [`ExperimentComparison`](library/summaries.md#experimentcomparison) |
| 某一组 experiment 的整体情况 | [`GroupSummary`](library/summaries.md#groupsummary) |
| 每个 experiment / eval / attempt 发生了什么 | [`ExperimentList` / `EvalList` / `AttemptList`](library/entity-lists.md) |
| 谁整体更好，多个指标并排比较 | [`MetricTable`](library/metric-views.md#metrictable) |
| 哪道题在哪个配置上失败 | [`MetricMatrix` 或 `MetricBars`](library/metric-views.md#metricmatrix-与-metricbars) |
| 固定题集的总分与分科得分 | [`Scoreboard`](library/metric-views.md#scoreboard) |
| 两个指标之间的取舍 | [`MetricScatter`](library/metric-views.md#metricscatter) |
| 参数变化时指标怎样变化 | [`MetricLine`](library/metric-views.md#metricline) |
| A 与 B 相差多少 | [`DeltaTable`](library/metric-views.md#deltatable) |

组件之外按任务读分篇：

| 任务 | 页面 |
|---|---|
| 按场景抄一份完整报告文件改起 | [配方](library/recipes.md) |
| 选内置指标、定义自己的指标或分组维度 | [指标与维度](library/metrics.md) |
| 组织报告树、写自定义表格或双面组件 | [排版原语与自定义组件](library/layout.md) |
| 加标题、GitHub 链接、页脚，或拆成多页 | [外壳与多页](library/shell.md) |
| 看裸 `show` / `view` 装载的默认定义怎么写 | [内建报告](library/built-in.md) |

## 两种使用方式

### 交给 `show` / `view` 渲染

报告文件默认导出 `defineReport(...)`。报告中的官方组件同时实现 text 和 web 两个面，一份定义可用于两个宿主：

```tsx
// reports/quality-cost.tsx
import {
  Col,
  ExperimentList,
  MetricScatter,
  Section,
  costUSD,
  defineReport,
  endToEndPassRate,
} from "niceeval/report";

export default defineReport(async ({ selection }) => {
  const experiments = await ExperimentList.data(selection);

  return (
    <Col>
      <Section title="质量与成本">
        <MetricScatter
          selection={selection}
          points="experiment"
          series="agent"
          x={costUSD}
          y={endToEndPassRate}
        />
      </Section>
      <ExperimentList items={experiments} filter />
    </Col>
  );
});
```

```sh
niceeval show --report reports/quality-cost.tsx
niceeval view --report reports/quality-cost.tsx
```

宿主先按位置参数、`--run` 和 `--experiment` 选择数据，再把 `selection` 注入报告。覆盖不完整、快照过旧或未完成等警告由宿主统一显示，报告不必自己补警告组件。显示时下一步随行：text 面原样打印 `message`（[三段式](../../error-feedback.md#消息三段式)，已含下一步），web 面额外把警告的 `command` 渲染为可复制的命令。

### 嵌入自己的 React 页面

自己的页面没有 niceeval 的异步解析阶段，因此先在服务端计算普通 JSON，再把 `data` 交给纯组件：

```tsx
import { openResults } from "niceeval/results";
import { MetricTable, RunOverview } from "niceeval/report/react";
import { costUSD, durationMs, endToEndPassRate } from "niceeval/report";

export default async function EvalsPage() {
  const results = await openResults(".niceeval");
  const selection = results.latest({ experiments: "compare/" });

  const [overview, table] = await Promise.all([
    RunOverview.data(selection),
    MetricTable.data(selection, {
      rows: "experiment",
      columns: [endToEndPassRate, costUSD, durationMs],
      sort: endToEndPassRate,
    }),
  ]);

  return (
    <main>
      <RunOverview data={overview} />
      <MetricTable
        data={table}
        filter
        attemptHref={(locator) => `/attempts/${locator}`}
      />
    </main>
  );
}
```

组件输出完整静态 HTML。网页排序、过滤和图表 tooltip 是渐进增强；需要官方样式与增强脚本时引入 `niceeval/report/react/styles.css` 和 `niceeval/report/react/enhance.js`。

## 数据计算与缓存边界

每个组件都把配套计算函数挂在 `.data` 上。计算函数接受 `Selection` 或 `Snapshot[]`，返回可序列化数据；组件本身不读文件。

`.data(...)` 可能懒加载 artifact，因此应在服务端、构建脚本或 `defineReport` 的异步函数中调用。返回值是普通可序列化数据，可写成 JSON 供 SPA 使用：

```ts
const table = await MetricTable.data(selection, {
  rows: "experiment",
  columns: [endToEndPassRate, costUSD],
});
await writeFile("public/evals.json", JSON.stringify(table));
```

计算产物只代表当时的 Selection。结果根变化后要重新调用 `.data(...)`；纯 React 组件渲染同一份 data 时不再读取磁盘。对于同一页面需要的多个组件，可用 `Promise.all` 并行计算。

所有指标格子都携带 `samples`、`total` 和 attempt `refs`。缺数据不会被填成 0，覆盖率与证据引用也不会因序列化而丢失。

## 相关阅读

- [配方](library/recipes.md) —— 按场景可整份复制的完整报告文件。
- [概览组件](library/summaries.md) / [实体列表](library/entity-lists.md) / [指标组件](library/metric-views.md) —— 组件契约分篇。
- [指标与维度](library/metrics.md) —— 内置指标口径与自定义指标。
- [排版原语与自定义组件](library/layout.md) —— 报告树的组织件与 text 排版工具。
- [外壳与多页](library/shell.md) —— 标题、外链、页脚、脚本与 `pages`。
- [内建报告](library/built-in.md) —— 裸宿主装载的定义与升级路径。
- [Show](show.md) —— 终端宿主与证据切面。
- [View](view.md) —— web 宿主与静态导出。
- [Architecture](architecture.md) —— 报告树、异步解析和宿主边界。
- [Results Library](../results/library.md) —— `openResults`、Selection 与 artifact 句柄。
