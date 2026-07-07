// 两级聚合引擎:去重 → 按维度分组 → 组内按 (eval × 快照) 折叠(perEval)→ 跨题折叠(across)→ MetricCell。
//
// 为什么是两级:earlyExit 默认开,失败的题天然比通过的题样本多;平铺求均值会把分数
// 和重试策略纠缠在一起(eval A=[1]、eval B=[0,0,0] 平铺 = 0.25,两级宏平均 = 0.5)。
// 自定义维度把同一道题的 attempt 分进不同组时,第一级折叠发生在各组内部。

import type { EvalResult } from "../types.ts";
import type { AttemptHandle, SnapshotHandle } from "../results/types.ts";
import type {
  Aggregator,
  AttemptRef,
  Dimension,
  Metric,
  MetricCell,
  MetricColumn,
} from "./types.ts";
import { formatMetricValue } from "./format.ts";

// 复合键分隔符:NUL 不会出现在 eval id / experimentId / ISO 时间里,拼接键不会串味
const KEY_SEP = "\u0000";

/** 展平后的一条样本:attempt + 它所属的快照(维度解析与题级折叠都需要快照身份)。 */
export interface Item {
  snapshot: SnapshotHandle;
  attempt: AttemptHandle;
}

export function experimentIdOf(item: Item): string {
  return item.attempt.result.experimentId ?? item.snapshot.experimentId;
}

/** 快照身份:与 view Compare 同口径的 (experimentId, startedAt)。 */
function snapshotIdentity(snapshot: SnapshotHandle): string {
  return `${snapshot.experimentId}${KEY_SEP}${snapshot.startedAt}`;
}

/** 身份键 (experimentId, evalId, attempt, startedAt);startedAt 缺失 → null(宁可不去重也不误删)。 */
function identityKey(snapshot: SnapshotHandle, result: EvalResult): string | null {
  if (!result.startedAt) return null;
  return [
    result.experimentId ?? snapshot.experimentId,
    result.id,
    result.attempt,
    result.startedAt,
  ].join(KEY_SEP);
}

/**
 * 跨快照聚合前按身份键去重:--resume 会把上一轮已通过的结果原样合入新 run 的 summary,
 * 同一 attempt 因此存在于多份落盘。重复时保留最新 run(按 run.summary.startedAt)里的那份。
 *
 * TODO(results-lib):这是「去重是消费方义务」的本地实现(docs/results-lib.md「身份键与去重」);
 * writer 给合入结果打标之后,按 niceeval/results 的规则收编,本函数随 handles.ts 一起换掉。
 */
export function dedupeAttempts(snapshots: SnapshotHandle[]): Item[] {
  // 第一遍:按身份键选赢家(run.startedAt 是 ISO 字符串,字典序即时间序;并列保留后出现的)。
  const winner = new Map<string, { attempt: AttemptHandle; runStartedAt: string }>();
  for (const snapshot of snapshots) {
    for (const attempt of snapshot.attempts) {
      const key = identityKey(snapshot, attempt.result);
      if (key === null) continue;
      const runStartedAt = snapshot.run.summary.startedAt ?? "";
      const prev = winner.get(key);
      if (!prev || runStartedAt >= prev.runStartedAt) winner.set(key, { attempt, runStartedAt });
    }
  }
  // 第二遍:按原始遍历顺序输出,只放行赢家;无 startedAt 的一律放行(不去重)。
  const items: Item[] = [];
  for (const snapshot of snapshots) {
    for (const attempt of snapshot.attempts) {
      const key = identityKey(snapshot, attempt.result);
      if (key === null || winner.get(key)?.attempt === attempt) items.push({ snapshot, attempt });
    }
  }
  return items;
}

/**
 * eval id 前缀过滤,同 CLI 位置参数的分段语义(src/runner/discover.ts):
 * "algebra" 匹配自身与 "algebra/..." 子级,不误配 "algebra2";允许 "algebra/" 尾斜杠写法,等价。
 */
export function evalPrefixPredicate(evals?: string | string[]): (id: string) => boolean {
  if (evals === undefined) return () => true;
  const prefixes = (Array.isArray(evals) ? evals : [evals]).map((p) => p.replace(/\/+$/, ""));
  return (id) => prefixes.some((prefix) => id === prefix || id.startsWith(prefix + "/"));
}

export function filterItems(items: Item[], evals?: string | string[]): Item[] {
  if (evals === undefined) return items;
  const match = evalPrefixPredicate(evals);
  return items.filter((item) => match(item.attempt.result.id));
}

// ───────────────────────── 维度 ─────────────────────────

export function dimensionName(dimension: Dimension): string {
  return typeof dimension === "string" ? dimension : dimension.name;
}

/** eval id 的第一段:"algebra/quadratic" → "algebra";没有 "/" 时就是 id 本身。 */
export function evalGroupOf(id: string): string {
  const slash = id.indexOf("/");
  return slash === -1 ? id : id.slice(0, slash);
}

export function dimensionKey(dimension: Dimension, item: Item): string {
  if (typeof dimension !== "string") return dimension.of(item.attempt);
  const result = item.attempt.result;
  switch (dimension) {
    case "agent":
      return result.agent;
    case "model":
      return result.model ?? item.snapshot.model ?? "(none)";
    case "experiment":
      return experimentIdOf(item);
    case "eval":
      return result.id;
    case "evalGroup":
      return evalGroupOf(result.id);
    case "snapshot":
      return `${item.snapshot.experimentId} @ ${item.snapshot.startedAt}`;
    default: {
      // 穷尽检查:新增内置维度而漏改这里时编译期报错
      const exhausted: never = dimension;
      throw new Error(`Unknown dimension: ${String(exhausted)}`);
    }
  }
}

/** 按维度分组,保持首次出现顺序(无 sort 时表格行序即此序)。 */
export function groupItems(items: Item[], dimension: Dimension): Map<string, Item[]> {
  const groups = new Map<string, Item[]>();
  for (const item of items) {
    const key = dimensionKey(dimension, item);
    const list = groups.get(key);
    if (list) list.push(item);
    else groups.set(key, [item]);
  }
  return groups;
}

// ───────────────────────── 聚合 ─────────────────────────

export function applyAggregator(aggregator: Aggregator, values: number[]): number {
  if (typeof aggregator === "function") return aggregator(values);
  switch (aggregator) {
    case "mean":
      return values.reduce((a, b) => a + b, 0) / values.length;
    case "sum":
      return values.reduce((a, b) => a + b, 0);
    case "min":
      return Math.min(...values);
    case "max":
      return Math.max(...values);
  }
}

/** where 不满足 → null,语义等价于 value 开头 return null。 */
export async function evaluateMetric(metric: Metric, attempt: AttemptHandle): Promise<number | null> {
  if (metric.where && !metric.where(attempt)) return null;
  return metric.value(attempt);
}

export function displayValue(metric: Metric, value: number | null): string {
  // null 的纯文本兜底;组件把 null 渲染成「缺数据」,绝不画 0
  if (value === null) return "—";
  return metric.display ? metric.display(value) : formatMetricValue(value, metric.unit);
}

/**
 * 一个格子:组内 attempt → 两级聚合 → 终值。
 * null 值不进聚合但计入 total(覆盖率经 samples/total 如实暴露);全 null → value null。
 */
export async function computeCell(metric: Metric, items: Item[]): Promise<MetricCell> {
  // 第一级桶:同一 (eval × 快照) 的 attempt 折成一个题级值
  const buckets = new Map<string, number[]>();
  const refs: AttemptRef[] = [];
  let samples = 0;
  for (const item of items) {
    const value = await evaluateMetric(metric, item.attempt);
    if (value === null) continue;
    samples += 1;
    refs.push(item.attempt.ref); // 证据引用由 niceeval/results 的句柄直供,不反查下标
    const bucketKey = `${item.attempt.result.id}${KEY_SEP}${snapshotIdentity(item.snapshot)}`;
    const bucket = buckets.get(bucketKey);
    if (bucket) bucket.push(value);
    else buckets.set(bucketKey, [value]);
  }
  const perEval = metric.aggregate?.perEval ?? "mean";
  const across = metric.aggregate?.across ?? "mean";
  const evalValues = [...buckets.values()].map((values) => applyAggregator(perEval, values));
  const value = evalValues.length === 0 ? null : applyAggregator(across, evalValues);
  return { value, display: displayValue(metric, value), samples, total: items.length, refs };
}

export function toColumn(metric: Metric): MetricColumn {
  return {
    key: metric.name,
    label: metric.label ?? metric.name,
    unit: metric.unit,
    better: metric.better,
  };
}

export function assertUniqueMetricNames(metrics: Metric[], where: string): void {
  const seen = new Set<string>();
  for (const metric of metrics) {
    if (seen.has(metric.name)) {
      throw new Error(
        `Duplicate metric name "${metric.name}" in ${where}. Metric names must be unique within one computation; rename one via defineMetric.`,
      );
    }
    seen.add(metric.name);
  }
}
