// ExperimentList:实体列表的第一级——每项固定代表一个 experiment,主行是身份(experiment id /
// agent / model / flags)、Eval 判定构成与官方两级聚合汇总指标(passRate/cost/duration/tokens,
// 复用 MetricCellView 与其它指标图形同一份渲染)。零 JS 用原生 <details> 展开到这个 experiment
// 的 Eval:每道题一行,判定符 + 该题全部 Attempt 的 locator 徽标(内联,不用再点开一层)+
// 通过时的平均耗时/成本、失败/出错时的原因摘要。

import type { ReactElement } from "react";
import type { ExperimentListEvalRow, ExperimentListItem } from "../types.ts";
import type { AttemptLocator } from "../../results/locator.ts";
import { DEFAULT_REPORT_LOCALE, localeText, type ReportLocale } from "../locale.ts";
import { MetricCellView } from "./cell.tsx";
import { AttemptLocatorBadge } from "./AttemptList.tsx";
import { colorClassForKey } from "./colors.ts";
import { cx, formatDurationMs, formatUSD, verdictMark } from "./format.ts";

function EvalRow({
  row,
  attemptHref,
}: {
  row: ExperimentListEvalRow;
  attemptHref: (locator: AttemptLocator) => string;
}): ReactElement {
  return (
    <li className={cx("nre-experiment-eval-row", `nre-eval-${row.verdict}`)}>
      <span className={cx("nre-eval-verdict", `nre-verdict-${row.verdict}`)}>{verdictMark(row.verdict)}</span>
      <span className="nre-eval-id">{row.evalId}</span>
      <span className="nre-eval-attempt-badges">
        {row.attempts.map((attempt) => (
          <AttemptLocatorBadge key={attempt.locator} item={attempt} attemptHref={attemptHref} />
        ))}
      </span>
      {row.verdict === "passed" ? (
        <span className="nre-eval-avg">
          {formatDurationMs(row.duration.value ?? 0)}
          {row.cost.value !== null && <> · {formatUSD(row.cost.value)}</>}
        </span>
      ) : (
        <span className="nre-eval-reason">{row.reason}</span>
      )}
    </li>
  );
}

function ExperimentCard({
  item,
  attemptHref,
  locale,
}: {
  item: ExperimentListItem;
  attemptHref: (locator: AttemptLocator) => string;
  locale: ReportLocale;
}): ReactElement {
  return (
    <li className="nre-experiment-entry">
      <details className="nre-experiment-details">
        <summary className="nre-experiment-summary">
          <span className={cx("nre-experiment-id", "nre-key", colorClassForKey(item.experimentId))}>
            {item.experimentId}
          </span>
          <span className="nre-experiment-agent">{item.agent}</span>
          {item.model && <span className="nre-experiment-model">{item.model}</span>}
          <span className="nre-experiment-cell">
            <MetricCellView cell={item.passRate} attemptHref={attemptHref} locale={locale} />
          </span>
          <span className="nre-experiment-cell">
            <MetricCellView cell={item.cost} attemptHref={attemptHref} locale={locale} />
          </span>
          <span className="nre-experiment-cell">
            <MetricCellView cell={item.duration} attemptHref={attemptHref} locale={locale} />
          </span>
          <span className="nre-experiment-meta-sub">
            {localeText(locale, "overview.evalsCount", { n: item.evals })}
            {item.attempts > item.evals ? ` · ${localeText(locale, "overview.attemptsCount", { n: item.attempts })}` : ""}
            {` · ${localeText(locale, "latestRun", { run: item.lastRunAt })}`}
          </span>
        </summary>
        <ul className="nre-experiment-evals">
          {item.evalRows.map((row) => (
            <EvalRow key={row.evalId} row={row} attemptHref={attemptHref} />
          ))}
        </ul>
      </details>
    </li>
  );
}

export function ExperimentList({
  items,
  attemptHref,
  className,
  locale = DEFAULT_REPORT_LOCALE,
}: {
  items: ExperimentListItem[];
  attemptHref: (locator: AttemptLocator) => string;
  className?: string;
  locale?: ReportLocale;
}): ReactElement {
  return (
    <div className={cx("nre", "nre-experiment-list", className)}>
      {items.length === 0 && <p className="nre-experiment-list-empty">{localeText(locale, "attemptList.empty")}</p>}
      <ul className="nre-experiments">
        {items.map((item) => (
          <ExperimentCard key={item.experimentId} item={item} attemptHref={attemptHref} locale={locale} />
        ))}
      </ul>
    </div>
  );
}
