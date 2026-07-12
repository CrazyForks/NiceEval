// MetricTable:行维度 × 指标列。没有实体下钻——要展开到 experiment 的 Eval 或 Eval 的
// Attempt,用 ExperimentList / EvalList,这个组件只表达任意维度 × 任意指标。
// 行按传入顺序渲染——排序发生在计算侧(tableData 的 sort 参数),组件不重排;
// 静态 HTML 以数据侧预排的顺序呈现即完整。web 面额外输出渐进增强的 data 属性:
// 所有表头带 data-nre-sort、格子带 data-sort-value,enhance.js 在场时点表头
// 可就地重排(纯展示态交互,不改口径);filter 开时在表格前渲染过滤输入框。
// meta 在场(rows: "experiment")时补 Model / Agent / Verdicts 列,列序对齐 view
// 原生榜单:experiment、model、agent、指标列…、verdicts。
// 列头以箭头标注 better 方向;samples < total 的格子带覆盖率角标;
// 一组全 null 渲染成「缺数据」,绝不画 0(逻辑在 MetricCellView)。

import type { ReactElement } from "react";
import type { TableData, TableRowMeta } from "../types.ts";
import type { AttemptLocator } from "../../results/locator.ts";
import { DEFAULT_REPORT_LOCALE, localeText, resolveMetricLabel, type ReportLocale } from "../locale.ts";
import { MetricCellView } from "./cell.tsx";
import { colorClassForKey } from "./colors.ts";
import { cx } from "./format.ts";

/** verdict 计票 pill(「3 passed / 1 failed」):非零判定各一枚,全零如实空。 */
function VerdictTally({
  verdicts,
  locale,
}: {
  verdicts: NonNullable<TableRowMeta["verdicts"]>;
  locale: ReportLocale;
}): ReactElement {
  const kinds = (["passed", "failed", "errored", "skipped"] as const).filter((k) => verdicts[k] > 0);
  return (
    <span className="nre-verdict-tally">
      {kinds.map((kind) => (
        <span key={kind} className={cx("nre-verdict-pill", `nre-verdict-${kind}`)}>
          {verdicts[kind]} {localeText(locale, `verdict.${kind}`)}
        </span>
      ))}
      {kinds.length === 0 && <span className="nre-missing">—</span>}
    </span>
  );
}

export function MetricTable({
  data,
  attemptHref,
  filter,
  className,
  locale = DEFAULT_REPORT_LOCALE,
}: {
  data: TableData;
  attemptHref?: (locator: AttemptLocator) => string;
  filter?: boolean;
  className?: string;
  locale?: ReportLocale;
}): ReactElement {
  const hasMeta = data.rows.some((row) => row.meta !== undefined);
  const hasModel = data.rows.some((row) => row.meta?.model !== undefined);
  const hasVerdicts = data.rows.some((row) => row.meta?.verdicts !== undefined);

  const table = (
    <table className={cx("nre", "nre-metric-table", !filter && className)}>
      <thead>
        <tr>
          <th scope="col" className="nre-dimension" data-nre-sort="">
            {data.dimension}
          </th>
          {hasMeta && hasModel && (
            <th scope="col" className="nre-meta-col" data-nre-sort="">
              {localeText(locale, "table.model")}
            </th>
          )}
          {hasMeta && (
            <th scope="col" className="nre-meta-col" data-nre-sort="">
              {localeText(locale, "table.agent")}
            </th>
          )}
          {data.columns.map((col) => (
            <th scope="col" key={col.key} className="nre-metric-col" data-nre-sort="">
              {resolveMetricLabel(col.label, locale, col.key)}
              {col.unit && <span className="nre-unit">({col.unit})</span>}
              {/* better 方向提示:↑ 越高越好 / ↓ 越低越好 */}
              {col.better && (
                <span
                  className="nre-better"
                  title={localeText(locale, col.better === "higher" ? "table.higherBetter" : "table.lowerBetter")}
                >
                  {col.better === "higher" ? "↑" : "↓"}
                </span>
              )}
            </th>
          ))}
          {hasVerdicts && (
            <th scope="col" className="nre-verdicts-col" data-nre-sort="">
              {localeText(locale, "table.verdicts")}
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {data.rows.map((row) => (
          <tr key={row.key}>
            {/* 行键 = 维度键(如 agent):稳定散列上色,跨块同键同色 */}
            <th
              scope="row"
              className={cx("nre-row-key", "nre-key", colorClassForKey(row.key))}
              data-sort-value={row.key}
            >
              {row.key}
              {/* rows: "experiment" 专属:eval/attempt 数 + 最后运行时间,行键下的一行紧凑摘要
                  (旧 ExperimentRow 的 "N eval results · N runs · 最后运行时间") */}
              {row.meta?.evals !== undefined && (
                <div className="nre-row-meta-sub">
                  {localeText(locale, "overview.evalsCount", { n: row.meta.evals })}
                  {row.meta.attempts !== undefined && row.meta.attempts > row.meta.evals
                    ? ` · ${localeText(locale, "overview.attemptsCount", { n: row.meta.attempts })}`
                    : ""}
                  {row.meta.lastRunAt ? ` · ${localeText(locale, "latestRun", { run: row.meta.lastRunAt })}` : ""}
                </div>
              )}
            </th>
            {hasMeta && hasModel && (
              <td className="nre-td nre-meta-cell" data-sort-value={row.meta?.model ?? ""}>
                {row.meta?.model ?? <span className="nre-missing">—</span>}
              </td>
            )}
            {hasMeta && (
              <td className="nre-td nre-meta-cell" data-sort-value={row.meta?.agent ?? ""}>
                {row.meta?.agent ?? <span className="nre-missing">—</span>}
              </td>
            )}
            {data.columns.map((col) => {
              const cell = row.cells[col.key];
              return (
                <td key={col.key} className="nre-td" data-sort-value={cell?.value ?? ""}>
                  {cell ? (
                    <MetricCellView cell={cell} attemptHref={attemptHref} locale={locale} />
                  ) : (
                    // 数据侧没给这个格子(理论上 tableData 不会缺列)——按空处理,不编数
                    <span className="nre-empty" />
                  )}
                </td>
              );
            })}
            {hasVerdicts && (
              <td className="nre-td nre-verdicts-cell" data-sort-value={row.meta?.verdicts?.passed ?? ""}>
                {row.meta?.verdicts ? (
                  <VerdictTally verdicts={row.meta.verdicts} locale={locale} />
                ) : (
                  <span className="nre-missing">—</span>
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );

  if (!filter) return table;
  // 过滤输入框渲染在表格前(同一个 wrap 里),enhance.js 经 data-nre-filter 接管;
  // 无 JS 时静默无功能,表格内容依旧完整。
  return (
    <div className={cx("nre", "nre-metric-table-wrap", className)}>
      <input
        className="nre-filter"
        data-nre-filter=""
        type="search"
        placeholder={localeText(locale, "table.filterPlaceholder")}
      />
      {table}
    </div>
  );
}
