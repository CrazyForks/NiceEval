// 计算函数:快照 → 一份组件数据。跑在 Node 侧,产物是算好的、可序列化的普通 JSON
// (终值 + 渲染提示,不含公式);前端只做渲染。
//
// 共同约定(docs/reports.md「边界与不变量」):
// - 聚合前按身份键去重(dedupeAttempts);
// - null ≠ 0:缺数据不编数,覆盖率经 samples/total 如实暴露;
// - core 中立:只认 Metric / Dimension 接口,不出现具体 agent 名的分支。

import type { SnapshotHandle } from "../results/types.ts";
import type {
  CaseListData,
  DeltaData,
  Dimension,
  MatrixData,
  Metric,
  MetricCell,
  OverviewData,
  ScatterData,
  ScoreboardData,
  TableData,
} from "./types.ts";
import {
  applyAggregator,
  assertUniqueMetricNames,
  computeCell,
  dedupeAttempts,
  dimensionKey,
  dimensionName,
  displayValue,
  evalGroupOf,
  evalPrefixPredicate,
  evaluateMetric,
  experimentIdOf,
  filterItems,
  groupItems,
  toColumn,
  type Item,
} from "./aggregate.ts";
import { attemptCostUSD, examScore } from "./metrics.ts";
import { formatPlainNumber } from "./format.ts";

// ───────────────────────── table ─────────────────────────

export interface TableOptions {
  /** 行维度。 */
  rows: Dimension;
  /** 每列一个指标。 */
  columns: Metric[];
  /** 构建时排序,方向随 better(higher 降序,「好」的一头在上);缺数据行沉底。 */
  sort?: Metric;
  /** eval id 前缀过滤,同 CLI 位置参数语义。 */
  evals?: string | string[];
}

export async function table(snapshots: SnapshotHandle[], opts: TableOptions): Promise<TableData> {
  assertUniqueMetricNames(opts.columns, "table columns");
  const items = filterItems(dedupeAttempts(snapshots), opts.evals);
  const groups = groupItems(items, opts.rows);
  const rows: TableData["rows"] = [];
  const sortCells = new Map<string, MetricCell>();
  for (const [key, group] of groups) {
    const cells: Record<string, MetricCell> = {};
    for (const metric of opts.columns) cells[metric.name] = await computeCell(metric, group);
    if (opts.sort) {
      // sort 指标不在 columns 里时单独算一遍,只用于排序、不进输出
      sortCells.set(key, cells[opts.sort.name] ?? (await computeCell(opts.sort, group)));
    }
    rows.push({ key, cells });
  }
  if (opts.sort) {
    const better = opts.sort.better ?? "higher";
    rows.sort((a, b) => {
      const va = sortCells.get(a.key)?.value ?? null;
      const vb = sortCells.get(b.key)?.value ?? null;
      if (va === null && vb === null) return 0;
      if (va === null) return 1; // 缺数据沉底
      if (vb === null) return -1;
      return better === "lower" ? va - vb : vb - va;
    });
  }
  return { dimension: dimensionName(opts.rows), columns: opts.columns.map(toColumn), rows };
}

// ───────────────────────── matrix ─────────────────────────

export interface MatrixOptions {
  rows: Dimension;
  columns: Dimension;
  cell: Metric;
}

export async function matrix(snapshots: SnapshotHandle[], opts: MatrixOptions): Promise<MatrixData> {
  const items = dedupeAttempts(snapshots);
  // 稀疏分组:只有真有 attempt 的 (row, column) 组合成格;没有样本的格子不出现
  const groups = new Map<string, { row: string; column: string; items: Item[] }>();
  for (const item of items) {
    const row = dimensionKey(opts.rows, item);
    const column = dimensionKey(opts.columns, item);
    const key = JSON.stringify([row, column]);
    const group = groups.get(key);
    if (group) group.items.push(item);
    else groups.set(key, { row, column, items: [item] });
  }
  const cells: MatrixData["cells"] = [];
  for (const group of groups.values()) {
    cells.push({ row: group.row, column: group.column, cell: await computeCell(opts.cell, group.items) });
  }
  return {
    rows: dimensionName(opts.rows),
    columns: dimensionName(opts.columns),
    metric: toColumn(opts.cell),
    cells,
  };
}

// ───────────────────────── scoreboard ─────────────────────────

export interface ScoreboardOptions {
  /** 给谁打分(被打分的维度)。 */
  of: Dimension;
  /** 按什么分科;默认 "evalGroup"(考试里的「科目」)。 */
  subjects?: Dimension;
  /** eval id 前缀 → 每题分值;未列默认 1;前缀重叠时最长的生效。 */
  weights?: Record<string, number>;
  /** 折算满分;默认 100。 */
  fullMarks?: number;
  /** 每题得分指标;缺省即 examScore,可换自定义(如「答对但超预算扣分」)。 */
  score?: Metric;
  /** 选中范围:eval id 前缀过滤;题集(分母)只遍历这个范围。 */
  evals?: string | string[];
}

/**
 * 逐题分值制,分母对所有被打分者恒定:
 *   题分值 = 命中的权重(默认 1)   题得分 = score 指标的题级值(perEval 折叠后)
 *   总分   = fullMarks × Σ(题得分 × 题分值) / Σ(题分值)   Σ 遍历选中范围内全部题
 * 没跑到的题挣 0 分但留在分母里,missing 如实报 —— 这是显式的考试契约,不是「null ≠ 0」的例外。
 */
export async function scoreboard(
  snapshots: SnapshotHandle[],
  opts: ScoreboardOptions,
): Promise<ScoreboardData> {
  const fullMarks = opts.fullMarks ?? 100;
  const scoreMetric = opts.score ?? examScore;
  const subjectsDim: Dimension = opts.subjects ?? "evalGroup";
  const match = evalPrefixPredicate(opts.evals);
  const items = filterItems(dedupeAttempts(snapshots), opts.evals);

  // 题集(固定分母):选中范围内、任一快照声明覆盖或实际出现过的全部题
  const universe = new Set<string>();
  for (const snapshot of snapshots) {
    for (const id of snapshot.evalIds) if (match(id)) universe.add(id);
  }
  for (const item of items) universe.add(item.attempt.result.id);
  const sortedUniverse = [...universe].sort();

  // 每题的科目:先从任一 attempt 解析(自定义 subjects 维度也能算);
  // 全程无 attempt 的题按内置规则兜底,自定义维度无从计算时如实标 "(unknown)"
  const subjectByEval = new Map<string, string>();
  for (const item of items) {
    const id = item.attempt.result.id;
    if (!subjectByEval.has(id)) subjectByEval.set(id, dimensionKey(subjectsDim, item));
  }
  const subjectOf = (id: string): string => {
    const known = subjectByEval.get(id);
    if (known !== undefined) return known;
    if (subjectsDim === "eval") return id;
    if (subjectsDim === "evalGroup") return evalGroupOf(id);
    return "(unknown)";
  };

  // 权重:最长前缀生效(排序后线性找第一个命中即最长)
  const weights = Object.entries(opts.weights ?? {})
    .map(([prefix, weight]) => ({ prefix, weight }))
    .sort((a, b) => b.prefix.length - a.prefix.length);
  const weightOf = (id: string): number =>
    weights.find((w) => id.startsWith(w.prefix))?.weight ?? 1;

  const groups = groupItems(items, opts.of);
  const rows: ScoreboardData["rows"] = [];
  for (const [key, group] of groups) {
    // 题得分:perEval 折叠(同 eval × 快照 内);同题出现在多个快照时取快照级值的均值。
    // TODO(results-lib):多快照同题的口径待与选择器对齐;常规姿势(latestPerExperiment)每题只有一个快照。
    const perSnapshot = new Map<string, Map<string, number[]>>(); // evalId → snapshot 身份 → 原始值
    for (const item of group) {
      const value = await evaluateMetric(scoreMetric, item.attempt);
      if (value === null) continue; // 测不了的 attempt 不进题得分;整题无样本 → missing
      const id = item.attempt.result.id;
      const snapKey = `${item.snapshot.experimentId} @ ${item.snapshot.startedAt}`;
      let bySnap = perSnapshot.get(id);
      if (!bySnap) perSnapshot.set(id, (bySnap = new Map()));
      const bucket = bySnap.get(snapKey);
      if (bucket) bucket.push(value);
      else bySnap.set(snapKey, [value]);
    }
    const perEvalAgg = scoreMetric.aggregate?.perEval ?? "mean";
    const scoreByEval = new Map<string, number>();
    for (const [id, bySnap] of perSnapshot) {
      const snapValues = [...bySnap.values()].map((values) => applyAggregator(perEvalAgg, values));
      scoreByEval.set(id, snapValues.reduce((a, b) => a + b, 0) / snapValues.length);
    }

    // 科目累计:固定分母 —— 没跑的题 0 分挣、留在分母、计入 missing
    const subjects = new Map<
      string,
      { key: string; earned: number; possible: number; evals: number; missing: number }
    >();
    for (const id of sortedUniverse) {
      const subjectKey = subjectOf(id);
      let subject = subjects.get(subjectKey);
      if (!subject) subjects.set(subjectKey, (subject = { key: subjectKey, earned: 0, possible: 0, evals: 0, missing: 0 }));
      const weight = weightOf(id);
      const got = scoreByEval.get(id);
      subject.earned += (got ?? 0) * weight;
      subject.possible += weight;
      subject.evals += 1;
      if (got === undefined) subject.missing += 1;
    }
    let earned = 0;
    let possible = 0;
    for (const subject of subjects.values()) {
      earned += subject.earned;
      possible += subject.possible;
    }
    const value = possible === 0 ? 0 : (fullMarks * earned) / possible;
    rows.push({ key, total: { value, display: formatPlainNumber(value) }, subjects: [...subjects.values()] });
  }

  return { of: dimensionName(opts.of), fullMarks, weights, rows };
}

// ───────────────────────── scatter ─────────────────────────

export interface ScatterOptions {
  /** 点维度:每个点 = 该组 attempt 的聚合。 */
  points: Dimension;
  /** 可选:同系列的点连成线;省略 = 纯散点。 */
  series?: Dimension;
  x: Metric;
  y: Metric;
}

export async function scatter(snapshots: SnapshotHandle[], opts: ScatterOptions): Promise<ScatterData> {
  const items = dedupeAttempts(snapshots);
  const groups = groupItems(items, opts.points);
  const rows: ScatterData["rows"] = [];
  for (const [key, group] of groups) {
    rows.push({
      key,
      // 组内取第一条解析系列:点维度细于系列维度时(experiment ⊂ agent)天然一致
      series: opts.series ? dimensionKey(opts.series, group[0]) : undefined,
      x: await computeCell(opts.x, group),
      y: await computeCell(opts.y, group), // 任一轴 null 的点留在 rows 里:组件不画,但注脚要报的数就从这里数
    });
  }
  return {
    points: dimensionName(opts.points),
    series: opts.series ? dimensionName(opts.series) : undefined,
    x: toColumn(opts.x),
    y: toColumn(opts.y),
    rows,
  };
}

// ───────────────────────── overview ─────────────────────────

export interface OverviewOptions {
  /** 选择器(latestPerExperiment 等)的警告,原样透传给 RunOverview 渲染。 */
  warnings?: string[];
}

export async function overview(
  snapshots: SnapshotHandle[],
  opts?: OverviewOptions,
): Promise<OverviewData> {
  const items = dedupeAttempts(snapshots);
  const evalIds = new Set<string>();
  let passed = 0;
  let failed = 0;
  let errored = 0;
  let skipped = 0;
  let durationMs = 0;
  let costUSD: number | null = null; // 任一 attempt 报了成本才有;全缺 = null,不编 0
  for (const { attempt } of items) {
    const result = attempt.result;
    evalIds.add(result.id);
    switch (result.outcome) {
      case "passed":
        passed += 1;
        break;
      case "failed":
        failed += 1;
        break;
      case "errored":
        errored += 1;
        break;
      case "skipped":
        skipped += 1;
        break;
    }
    durationMs += result.durationMs;
    const cost = attemptCostUSD(result);
    if (cost !== null) costUSD = (costUSD ?? 0) + cost;
  }
  return {
    snapshots: snapshots.map((s) => ({
      experimentId: s.experimentId,
      agent: s.agent,
      model: s.model,
      startedAt: s.startedAt,
    })),
    totals: { evals: evalIds.size, attempts: items.length, passed, failed, errored, skipped, costUSD, durationMs },
    warnings: [...(opts?.warnings ?? [])],
  };
}

// ───────────────────────── delta ─────────────────────────

export interface DeltaPair {
  /** 基线侧 experimentId。 */
  a: string;
  /** 对比侧 experimentId。 */
  b: string;
  label?: string;
}

export interface DeltaOptions {
  /** 每行一对:B 相对 A。 */
  pairs: DeltaPair[];
  metrics: Metric[];
}

export async function delta(snapshots: SnapshotHandle[], opts: DeltaOptions): Promise<DeltaData> {
  assertUniqueMetricNames(opts.metrics, "delta metrics");
  const items = dedupeAttempts(snapshots);
  const rows: DeltaData["rows"] = [];
  for (const pair of opts.pairs) {
    const aItems = items.filter((item) => experimentIdOf(item) === pair.a);
    const bItems = items.filter((item) => experimentIdOf(item) === pair.b);
    const cells: DeltaData["rows"][number]["cells"] = {};
    for (const metric of opts.metrics) {
      const a = await computeCell(metric, aItems);
      const b = await computeCell(metric, bItems);
      const d = a.value === null || b.value === null ? null : b.value - a.value;
      cells[metric.name] = { a, b, delta: d, display: deltaDisplay(metric, d) };
    }
    rows.push({
      key: pair.label ?? `${pair.a} vs ${pair.b}`,
      a: { experimentId: pair.a },
      b: { experimentId: pair.b },
      cells,
    });
  }
  return { columns: opts.metrics.map(toColumn), rows };
}

function deltaDisplay(metric: Metric, delta: number | null): string {
  if (delta === null) return "—"; // 任一侧缺数据:Δ 显示为缺,不硬算
  const text = displayValue(metric, delta); // 负号由格式化自带
  return delta > 0 ? `+${text}` : text;
}

// ───────────────────────── cases ─────────────────────────

export interface CasesOptions {
  /** 要列出的判决;默认 failed + errored。 */
  outcomes?: ("failed" | "errored")[];
  /** 超出如实报 truncated,不静默截断。 */
  limit?: number;
  /** 自由文本(error / 断言 detail / judge evidence)的发布消毒钩子;身份字段不经它。 */
  redact?: (text: string) => string;
}

export async function cases(snapshots: SnapshotHandle[], opts?: CasesOptions): Promise<CaseListData> {
  const wanted = new Set<"failed" | "errored">(opts?.outcomes ?? ["failed", "errored"]);
  const redact = opts?.redact ?? ((text: string) => text);
  const selected = dedupeAttempts(snapshots).filter((item) => {
    const outcome = item.attempt.result.outcome;
    return (outcome === "failed" || outcome === "errored") && wanted.has(outcome);
  });
  const shown = opts?.limit === undefined ? selected : selected.slice(0, opts.limit);
  const rows: CaseListData["rows"] = shown.map((item) => {
    const result = item.attempt.result;
    const cost = attemptCostUSD(result);
    return {
      eval: result.id,
      experimentId: experimentIdOf(item),
      agent: result.agent,
      outcome: result.outcome as "failed" | "errored",
      error: result.error === undefined ? undefined : redact(result.error),
      failedAssertions: result.assertions
        .filter((assertion) => !assertion.passed)
        .map((assertion) => ({
          name: assertion.name,
          score: assertion.score,
          detail: assertion.detail === undefined ? undefined : redact(assertion.detail),
          evidence: assertion.evidence === undefined ? undefined : redact(assertion.evidence),
        })),
      durationMs: result.durationMs,
      costUSD: cost ?? undefined,
      ref: item.attempt.ref,
    };
  });
  return { rows, truncated: selected.length - shown.length };
}
