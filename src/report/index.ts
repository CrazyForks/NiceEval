// niceeval/report —— 报告积木的第二档:指标 × 计算函数,纯数据、零渲染。
// 契约见 docs/reports.md「指标与聚合」「计算函数与数据契约」。
//
// import 边界即运行时边界:本层的计算函数会经句柄触碰文件系统(懒加载工件),
// 只能进服务端 / 脚本;React 组件(第一档)在 niceeval/report/react,纯渲染。
// 句柄与证据身份(SnapshotHandle / AttemptHandle / AttemptRef)来自 niceeval/results。

export { defineMetric, passRate, examScore, durationMs, tokens, costUSD } from "./metrics.ts";

export { table, matrix, scoreboard, scatter, overview, delta, cases } from "./compute.ts";

export type {
  TableOptions,
  MatrixOptions,
  ScoreboardOptions,
  ScatterOptions,
  OverviewOptions,
  DeltaOptions,
  DeltaPair,
  CasesOptions,
} from "./compute.ts";

export type {
  Aggregator,
  MetricAggregate,
  Metric,
  Dimension,
  MetricColumn,
  MetricCell,
  AttemptRef,
  TableData,
  MatrixData,
  ScoreboardData,
  ScatterData,
  OverviewData,
  DeltaData,
  CaseListData,
} from "./types.ts";

export type { SnapshotHandle, AttemptHandle, RunHandle } from "../results/types.ts";
