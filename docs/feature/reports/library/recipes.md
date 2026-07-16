# 报告配方

每个配方都是一份可直接落盘的完整报告文件，`niceeval show --report reports/<名字>.tsx` 与 `niceeval view --report ...` 都能渲染。按想回答的问题选配方；字段与行为的穷尽契约在各组件分篇，配方只示范组合方式。外壳与多页的三档递进见[外壳与多页](shell.md)，从内建报告出发的改造见[内建报告](built-in.md)。

## 修失败：待处理失败清单

回答「现在有哪些失败要处理、先看哪条」。实体数组用普通 JavaScript 过滤，不存在第二套过滤 DSL：

```tsx
// reports/todo.tsx
import { AttemptList, Col, Section, Text, defineReport } from "niceeval/report";

export default defineReport(async ({ selection }) => {
  const all = await AttemptList.data(selection);
  const failed = all.filter((x) => x.verdict === "failed" || x.verdict === "errored");

  return (
    <Col>
      <Section title="待处理失败">
        <AttemptList items={failed.slice(0, 20)} total={failed.length} />
      </Section>
      <Text>每行的 locator 可直接交给 niceeval show 下钻。</Text>
    </Col>
  );
});
```

## 考试：固定题集成绩单

回答「固定题集的总分与分科得分」。没跑到的题按 0 分留在分母里——这是考试语义，不是探索分析：

```tsx
// reports/exam.tsx
import { Scoreboard, defineReport, examScore } from "niceeval/report";

export default defineReport(async ({ selection }) => (
  <Scoreboard data={await Scoreboard.data(selection, {
    rows: "agent",
    subjects: "evalGroup",
    weights: { "security/": 3, "correctness/": 2 },
    fullMarks: 100,
    score: examScore,
  })} />
));
```

## 口径拆解：损失来自答题还是执行

回答「分数低是模型不会做，还是基础设施在报错」。三个成功率指标并排，各自的口径见[指标与维度](metrics.md#内置指标)：

```tsx
// reports/reliability.tsx
import {
  MetricTable, defineReport,
  endToEndPassRate, executionReliability, taskPassRate,
} from "niceeval/report";

export default defineReport(async ({ selection }) => (
  <MetricTable data={await MetricTable.data(selection, {
    rows: "experiment",
    columns: [endToEndPassRate, taskPassRate, executionReliability],
    sort: endToEndPassRate,
  })} filter />
));
```

## 对比：基线与候选相差多少

回答「加了 memory / 换了配置，指标是改善还是退化」。任一侧缺数据时 delta 保持缺失，不当 0：

```tsx
// reports/ab.tsx
import {
  DeltaTable, defineReport,
  costUSD, durationMs, endToEndPassRate,
} from "niceeval/report";

export default defineReport(async ({ selection }) => (
  <DeltaTable data={await DeltaTable.data(selection, {
    pairs: [{ label: "memory", a: "baseline", b: "with-memory" }],
    metrics: [endToEndPassRate, costUSD, durationMs],
  })} />
));
```

## 扫描：参数档位的趋势

回答「token budget（或并发、延迟档位）变化时指标怎样变化」。x 轴来自 experiment `flags` 里声明的数值，不解析 experiment id 字符串：

```tsx
// reports/scaling.tsx
import { MetricLine, defineReport, endToEndPassRate, flag } from "niceeval/report";

export default defineReport(async ({ selection }) => (
  <MetricLine data={await MetricLine.data(selection, {
    x: flag("budget", { label: "Token budget", unit: "tokens" }),
    series: "agent",
    y: endToEndPassRate,
  })} />
));
```

## 定位：哪道题在哪个配置上失败

回答「失败集中在哪些题 × 哪些配置」。Matrix 与 Bars 消费同一份矩阵数据，摆在一起互为放大镜：

```tsx
// reports/matrix.tsx
import {
  Col, MetricBars, MetricMatrix,
  defineReport, endToEndPassRate,
} from "niceeval/report";

export default defineReport(async ({ selection }) => {
  const data = await MetricMatrix.data(selection, {
    rows: "eval",
    columns: "agent",
    cell: endToEndPassRate,
  });

  return (
    <Col>
      <MetricMatrix data={data} />
      <MetricBars data={data} />
    </Col>
  );
});
```

## 自定义指标：只比通过方案的改动行数

回答「谁用更少的代码交付了能用的结果」。`where` 把失败方案挡在计算外，`null` 表示测不了、不进聚合：

```tsx
// reports/golf.tsx
import {
  MetricTable, costUSD, defineMetric, defineReport, endToEndPassRate,
} from "niceeval/report";

const changedLines = defineMetric({
  name: "changed-lines",
  label: { en: "Changed lines", "zh-CN": "改动行数" },
  unit: "lines",
  better: "lower",
  where: (attempt) => attempt.result.verdict === "passed",
  async value(attempt) {
    const diff = await attempt.diff();
    if (!diff) return null;
    return Object.keys(diff.files)
      .reduce((sum, path) => sum + (diff.get(path) ?? "").split("\n").length, 0);
  },
});

export default defineReport(async ({ selection }) => (
  <MetricTable data={await MetricTable.data(selection, {
    rows: "agent",
    columns: [endToEndPassRate, changedLines, costUSD],
    sort: endToEndPassRate,
  })} />
));
```

## 自定义维度：按厂商折叠

回答「按厂商（而不是逐个模型）看通过率」。分组从结果已有字段派生，不要求 experiment 为一种摆法改配置：

```tsx
// reports/vendor.tsx
import { MetricTable, costUSD, defineReport, endToEndPassRate } from "niceeval/report";
import type { Dimension } from "niceeval/report";

const vendor: Dimension = {
  name: "vendor",
  of: (a) => (a.result.model?.startsWith("gpt-") ? "OpenAI" : "Anthropic"),
};

export default defineReport(async ({ selection }) => (
  <MetricTable data={await MetricTable.data(selection, {
    rows: vendor,
    columns: [endToEndPassRate, costUSD],
  })} />
));
```

## 历史：一个实验的逐次快照走势

回答「这个配置最近几次跑下来是变好还是变坏」。宿主注入的 `selection` 是现刻水位、不是完整历史；要历史就从 `results` 自己取 `exp.snapshots`，喂给组件的 `Snapshot[]` 入参：

```tsx
// reports/history.tsx
import {
  MetricTable, Section, Text, defineReport,
  costUSD, endToEndPassRate,
} from "niceeval/report";

export default defineReport(async ({ results }) => {
  const exp = results.experiments.find((e) => e.id === "compare/bub-gpt-5.4");
  if (!exp) return <Text>experiment compare/bub-gpt-5.4 has no results yet.</Text>;

  return (
    <Section title="compare/bub-gpt-5.4 · 历次快照">
      <MetricTable data={await MetricTable.data(exp.snapshots, {
        rows: "snapshot",
        columns: [endToEndPassRate, costUSD],
      })} />
    </Section>
  );
});
```

## 并列视图：一页里的两种看法

回答「同一批数据，frontier 和成绩单都想要，但不想拆页」。tab 是页内浏览状态；内容多到终端读不动时升级成[页](shell.md)：

```tsx
// reports/dual.tsx
import {
  MetricScatter, Scoreboard, Tab, Tabs,
  costUSD, defineReport, endToEndPassRate, examScore,
} from "niceeval/report";

export default defineReport(async ({ selection }) => {
  const board = await Scoreboard.data(selection, {
    rows: "agent",
    subjects: "evalGroup",
    score: examScore,
  });

  return (
    <Tabs>
      <Tab title="质量 × 成本">
        <MetricScatter selection={selection} points="experiment" series="agent" x={costUSD} y={endToEndPassRate} />
      </Tab>
      <Tab title="分科得分">
        <Scoreboard data={board} />
      </Tab>
    </Tabs>
  );
});
```

## 分组循环：每个可比组一块摘要

回答「多组配置各自的水位」。组划分是普通代码：用 `selection.filter` 收窄出每组的 Selection，同一套折叠口径逐组复用：

```tsx
// reports/groups.tsx
import { Col, GroupSummary, Section, defineReport } from "niceeval/report";
import type { Snapshot } from "niceeval/report";

function groupOf(snapshot: Snapshot): string {
  const parts = snapshot.experimentId.split("/");
  return parts.length > 1 ? parts.slice(0, -1).join("/") : snapshot.experimentId;
}

export default defineReport(async ({ selection }) => {
  const groups = [...new Set(selection.snapshots.map(groupOf))];

  return (
    <Col>
      {await Promise.all(
        groups.map(async (key) => (
          <Section key={key} title={key}>
            <GroupSummary data={await GroupSummary.data(selection.filter((s) => groupOf(s) === key))} />
          </Section>
        )),
      )}
    </Col>
  );
});
```

## 相关阅读

- [外壳与多页](shell.md) —— 给任何配方加标题、GitHub 链接或拆页。
- [内建报告](built-in.md) —— 不写树、只加品牌的最小形态。
- [指标与维度](metrics.md) —— 配方里指标与 `flag()` / 维度的口径契约。
- [Results Library](../../results/library.md) —— `results.experiments`、`exp.snapshots` 与 Selection 的读取契约。
