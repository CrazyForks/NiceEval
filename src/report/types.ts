// niceeval/report 的公开类型:指标(Metric)、维度(Dimension)与计算函数产物
// (即 niceeval/report/react 组件的 props)。数据契约照抄 docs/reports.md
// 「计算函数与数据契约」——这些不是持久化格式,没有 format / schemaVersion 信封;
// 兼容性跟随 npm 版本。

import type { AttemptHandle } from "../results/types.ts";

// ───────────────────────── 指标与聚合 ─────────────────────────

/** 两级聚合里单级的折叠方式。 */
export type Aggregator = "mean" | "sum" | "min" | "max" | ((values: number[]) => number);

/**
 * 两级聚合:「每格 attempt 数相等」是幻觉(earlyExit 让失败的题天然比通过的题样本多),
 * 平铺求均值会让分数和重试策略纠缠;所以先题内折叠、再跨题折叠,默认宏平均。
 */
export interface MetricAggregate {
  /** 第一级:同一 (eval × 快照) 的多 attempt → 一个题级值;默认 "mean"。 */
  perEval?: Aggregator;
  /** 第二级:分组内的题级值 → 格子终值;默认 "mean"。 */
  across?: Aggregator;
}

/**
 * 指标:纯函数,吃一个 AttemptHandle 吐一个值(null = 此 attempt 测不了这个指标,
 * 不进聚合;0 = 测了结果是零,照常进),外加名字、两级聚合方式和渲染提示。
 * 内置指标与自定义指标是同一个类型,没有特权。
 */
export interface Metric {
  /** MetricColumn.key 与列头的来源;同一次计算里重名是错误。 */
  name: string;
  /** 列头;省略时用 name。 */
  label?: string;
  description?: string;
  /** 渲染提示:越高越好还是越低越好(排序方向、轴向、涨跌配色用)。 */
  better?: "higher" | "lower";
  /** 驱动内置格式化:"%" → 87%、"ms" → 1.2s、"$" → $0.31、其余 → 1.2k 缩写。 */
  unit?: string;
  /**
   * 声明式前置:不满足 → null,语义等价于在 value 开头 return null。
   * 单独设字段是因为这一步最容易忘(忘了它,code-golf 会奖励「写得短的坏代码」)。
   */
  where?: (attempt: AttemptHandle) => boolean;
  value(attempt: AttemptHandle): number | null | Promise<number | null>;
  aggregate?: MetricAggregate;
  /** 覆盖 unit 驱动的内置格式化。 */
  display?: (value: number) => string;
}

/**
 * 维度:attempt 分到哪一组。内置维度就是 EvalResult 已有的身份字段;自定义维度是一个函数。
 * - "evalGroup" = eval id 的第一段:"algebra/quadratic" → "algebra"(考试里的「科目」)
 * - "snapshot"  = "<experimentId> @ <startedAt>",把两次快照并排成行,与 view 的 Compare 同口径
 */
export type Dimension =
  | "agent"
  | "model"
  | "experiment"
  | "eval"
  | "evalGroup"
  | "snapshot"
  | { name: string; of: (attempt: AttemptHandle) => string };

// ───────────────────────── 计算产物(组件 props)─────────────────────────

export interface MetricColumn {
  /** = metric.name,与 cells 的键对应。 */
  key: string;
  label: string;
  unit?: string;
  /** 渲染提示:排序方向、轴向、涨跌配色。 */
  better?: "higher" | "lower";
}

export interface MetricCell {
  /** 聚合后的值;null = 该组没有任何有效样本。 */
  value: number | null;
  /** 已格式化("87%" / "1.2k lines" / "$0.31"),前端可直接渲染。 */
  display: string;
  /** 有效 attempt 数(值为 null 的不计入)。 */
  samples: number;
  /** 组内 attempt 总数;samples < total = 有 attempt 测不了这个指标。 */
  total: number;
  /** 这个格子由哪些 attempt 算出 —— 回到证据的引用。 */
  refs?: AttemptRef[];
}

// AttemptRef 的家在 niceeval/results:Reports 的 refs、view 深链、copyRun 用同一个证据身份。
// 这里 import + re-export,公共 API 入口不变。
import type { AttemptRef } from "../results/types.ts";
export type { AttemptRef };

export interface TableData {
  /** 行维度名,如 "agent"。 */
  dimension: string;
  columns: MetricColumn[];
  rows: { key: string; cells: Record<string, MetricCell> }[];
}

export interface MatrixData {
  /** 行维度名,如 "eval"。 */
  rows: string;
  /** 列维度名,如 "agent"。 */
  columns: string;
  metric: MetricColumn;
  /** 稀疏:没有样本的格子不出现。 */
  cells: { row: string; column: string; cell: MetricCell }[];
}

export interface ScoreboardData {
  /** 被打分的维度名,如 "agent"。 */
  of: string;
  fullMarks: number;
  /** 实际生效的权重表(按匹配顺序:最长前缀在前)—— 成绩单可审计。 */
  weights: { prefix: string; weight: number }[];
  rows: {
    key: string;
    /** 已折算到 fullMarks。 */
    total: { value: number; display: string };
    subjects: {
      /** 科目(subjects 维度的值)。 */
      key: string;
      /** 加权得分。 */
      earned: number;
      /** 科目分值合计。 */
      possible: number;
      /** 题数。 */
      evals: number;
      /** 无任何样本、按 0 计的题数 —— 固定分母的如实注脚。 */
      missing: number;
    }[];
  }[];
}

export interface ScatterData {
  /** 点维度名,如 "experiment"。 */
  points: string;
  /** 系列维度名,如 "agent"。 */
  series?: string;
  /** better: "lower" → 组件反向画轴,「好」的角落恒在右上。 */
  x: MetricColumn;
  y: MetricColumn;
  rows: {
    /** 点的键,如 "compare/bub-high"。 */
    key: string;
    /** 所属系列,如 "bub"。 */
    series?: string;
    x: MetricCell;
    /** 任一为 null 的点组件不画,注脚如实报数(点仍留在 rows 里,可数)。 */
    y: MetricCell;
  }[];
}

export interface OverviewData {
  snapshots: { experimentId: string; agent: string; model?: string; startedAt: string }[];
  totals: {
    evals: number;
    attempts: number;
    passed: number;
    failed: number;
    errored: number;
    skipped: number;
    /** 任一 attempt 报了成本才有;全缺 = null,不编 0。 */
    costUSD: number | null;
    durationMs: number;
  };
  /** 选择器的警告透传进来,RunOverview 直接渲染 —— 诚实不靠使用者记得渲染。 */
  warnings: string[];
}

export interface DeltaData {
  columns: MetricColumn[];
  rows: {
    /** pair 的 label,如 "bub"。 */
    key: string;
    /** 基线侧。 */
    a: { experimentId: string };
    /** 对比侧。 */
    b: { experimentId: string };
    cells: Record<
      string,
      {
        a: MetricCell;
        b: MetricCell;
        /** b.value - a.value;任一侧 null → null,不硬算。 */
        delta: number | null;
        /** 已带符号("+12%" / "-$0.80"),涨跌好坏由 better 判定。 */
        display: string;
      }
    >;
  }[];
}

export interface CaseListData {
  rows: {
    eval: string;
    experimentId: string;
    agent: string;
    outcome: "failed" | "errored";
    /** errored 的错误摘要(已过 redact)。 */
    error?: string;
    failedAssertions: { name: string; score: number; detail?: string; evidence?: string }[];
    durationMs: number;
    costUSD?: number;
    /** 每条案例都能回到证据。 */
    ref: AttemptRef;
  }[];
  /** limit 之外还有几条,如实报,不静默截断。 */
  truncated: number;
}
