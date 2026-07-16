# 指标与维度

指标定义值与聚合口径，维度定义分组；[指标组件](metric-views.md)只是它们的投影。

## 内置指标

| 指标 | 含义 | 越高/低越好 | 数据来源 |
|---|---|---|---|
| `endToEndPassRate` | 默认成功率：passed = 1，failed / errored = 0，回答实际交付成功结果的概率 | 高 | `result.json` |
| `taskPassRate` | 条件答题通过率：passed = 1，failed = 0，errored 记 `null`；即只在已形成可信判定的样本上回答 Agent 答题质量 | 高 | `result.json` |
| `executionReliability` | 执行可靠性：跑到可判定（passed / failed）= 1，errored = 0；回答一次运行能否形成可信判定 | 高 | `result.json` |
| `examScore` | gate 决定能否得分，soft 断言给质量分 | 高 | `result.json` |
| `durationMs` | attempt 判定链耗时（不含收尾段，口径见 [Results](../../results/architecture.md#resultjson)） | 低 | `result.json` |
| `tokens` | input + output tokens | 低 | `result.json` |
| `costUSD` | 网关实测成本优先，否则估算成本 | 低 | `result.json` |
| `turns` | assistant turn 数 | 低 | `o11y.json` |

`skipped` 对这些指标返回 `null`。`errored` 只在 `taskPassRate` 中返回 `null`，在默认 `endToEndPassRate` 与 `executionReliability` 中都返回 0。三个指标都遵守“先在同一 eval 的 attempts 内聚合，再跨 eval 聚合”的两级规则；每个 eval 只有一个 attempt 时，`endToEndPassRate` 才简化为 `passed / (passed + failed + errored)`。三个指标必须按名字展示：任何默认总览和任何只写“Pass rate / 成功率”的位置都使用 `endToEndPassRate`；`taskPassRate` 必须标成“Task pass rate / 可判定任务通过率”等条件口径，不能把 `2 passed / 5 errored` 显示成无条件的 `100%`。要定位损失来自答题还是执行，可把三列并排：

```tsx
<MetricTable data={await MetricTable.data(selection, {
  rows: "experiment",
  columns: [endToEndPassRate, taskPassRate, executionReliability],
  sort: endToEndPassRate,
})} />
```

`turns` 需要 `o11y.json`；发布时没复制该 artifact 就显示缺失，不会冒充 0。

## 自定义指标

```ts
import { defineMetric } from "niceeval/report";

export const changedLines = defineMetric({
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
  aggregate: { perEval: "min", across: "mean" },
});
```

- `null` 表示测不了，不进入聚合；`0` 表示测得结果为零，会正常进入聚合。
- `where` 是进入计算前的显式条件，适合“只比较通过方案的代码量”。
- 聚合先在同一 eval 的多个 attempt 之间折叠，再跨 eval 折叠；两级默认都是 `mean`。
- `unit` 驱动内置格式化；需要特殊显示时提供 `display(value)`。

## 维度与 flags

可直接使用的维度有 `agent`、`model`、`experiment`、`eval`、`evalGroup` 和 `snapshot`。

自定义维度：

```ts
const verdictFamily = {
  name: "verdict-family",
  of: (attempt) => attempt.result.verdict === "passed" ? "pass" : "needs-work",
};
```

experiment 中声明的变量用 `flag()` 读取，不从 experiment id 字符串猜。`flag()` 只读 `ExperimentDef.flags` 里显式声明的 KV：

```ts
const memory = flag("memory", { label: "Memory mode" });
```

`model`、`reasoningEffort`、`budget`、`runs` 这类**顶层运行配置不在 `flags` 里**，用 `config()` 读快照的 [`ExperimentRunInfo`](../../results/architecture.md#snapshotjson) 投影——可用键是那张接口的字段全集，外加桥接到快照顶层权威字段的 `model` / `agent` 两个键：

```ts
const reasoning = config("reasoningEffort", { label: "Reasoning effort" });
const budget = config("budget", { label: "Budget", unit: "USD" });
```

两者都可当分组维度或数值轴；未声明 / 未投影的值归到 `(unset)`，作为数值轴时则不绘点并报告缺失。

## 相关阅读

- [指标组件](metric-views.md) —— 指标的六种投影。
- [Results Format](../../results/architecture.md) —— 指标读取的落盘字段。
