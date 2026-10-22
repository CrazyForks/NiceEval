import type { ReactElement } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ExperimentResults } from "./experiment-table/index.tsx";
import type { Locale } from "../shell/types.ts";
import { overviewData, type ResultsPageModel } from "./model.ts";
import { useCurrentGeneration } from "../data/index.ts";
import { experimentQueryOptions, resultsQueryOptions } from "./load.ts";
import type { InsightRuntimeSnapshot } from "../shell/App.tsx";
import type { InsightTarget } from "../shell/types.ts";
import { Grid } from "../components/primitives/index.tsx";
import { CurrentResults } from "./CurrentResults.tsx";

export function ResultsPage({ model, locale, unavailableReason }: {
  readonly model: ResultsPageModel;
  readonly locale: Locale;
  readonly unavailableReason?: string | null;
}): ReactElement {
  const { t } = useTranslation();
  if (model.targetMode === "current" && model.current !== undefined) {
    return <CurrentResults project={model.current} history={model.currentHistory ?? model.current.history} locale={locale} />;
  }
  if (model.targetMode === "unavailable") {
    const historicalRun = model.overview.catalog.runExperiments[0]?.runId;
    return <section className="niceeval-report niceeval-section" role="alert">
      <h1>{t("current.unavailable")}</h1>
      <p>{t("current.unavailableDetail")}</p>
      {unavailableReason === undefined || unavailableReason === null ? null : <p>{t("current.unavailableReason")}: {unavailableReason}</p>}
      {historicalRun === undefined ? null : <a href={`#/run/${encodeURIComponent(historicalRun)}`}>{t("current.historicalRun")}</a>}
    </section>;
  }
  const experiments = overviewData(model.overview, model.selectedExperiments);
  return (
    <>
      <header className="niceeval-report niceeval-hero">
        <h1 className="niceeval-hero-title">{t("insight.title")}</h1>
        <p>{t("current.historicalResults")}</p>
      </header>
      <div className="niceeval-view-report-slot">
        {model.costSummary === undefined ? null : <ExperimentCosts summary={model.costSummary} />}
        {experiments.length <= 1 ? null : (
          <nav aria-label={t("nav.experiments")}>
            <ul>{experiments.map((experiment) => (
              <li key={experiment.experimentId}><a href={experiment.href}>{experiment.experimentId}</a></li>
            ))}</ul>
          </nav>
        )}
        <ExperimentResults
          data={{
            selectionTitle: model.selectionTitle,
            experiments,
          }}
          locale={locale}
        />
      </div>
    </>
  );
}

function ExperimentCosts({ summary }: {
  readonly summary: NonNullable<ResultsPageModel["costSummary"]>;
}): ReactElement {
  const { t } = useTranslation();
  const { totalCosts, coverage } = summary;
  const complete = totalCosts.state === "complete";
  const title = t(complete ? "experimentCost.totalCosts" : "experimentCost.knownSubtotal");
  const counts = [
    ["experimentCost.selectedSlots", coverage.selectedSlotCount],
    ["experimentCost.resolvedSlots", coverage.resolvedSlotCount],
    ["experimentCost.originAttempts", coverage.originAttemptCount],
    ["experimentCost.completeAttempts", coverage.completeAttemptCount],
    ["experimentCost.partialAttempts", coverage.partialAttemptCount],
    ["experimentCost.unavailableAttempts", coverage.unavailableAttemptCount],
    ["experimentCost.unresolvedSlots", coverage.unresolvedSlotCount],
  ] as const;
  return (
    <section className="niceeval-report niceeval-section" aria-label={title}>
      <h2 className="niceeval-section-title">{title}</h2>
      <p>{t("experimentCost.scope")}</p>
      <p>{t(complete ? "usage.costComplete" : "usage.costIncomplete")}</p>
      {totalCosts.missingSources.length === 0 ? null : (
        <p>{t("usage.missingSources")}: {totalCosts.missingSources.map((source) =>
          t(source === "application" ? "usage.applicationCost" : "usage.judgeUsage")).join(", ")}</p>
      )}
      {totalCosts.values.length === 0 ? (
        <p>{t(complete ? "usage.noRecordedCharges" : "cell.metricUnavailable")}</p>
      ) : totalCosts.values.map((cost) => (
        <p key={cost.currency}>{cost.value} {cost.currency} · {t(cost.source === "reported"
          ? "cell.costReported" : cost.source === "estimated" ? "cell.costEstimated" : "cell.costMixed")}</p>
      ))}
      <Grid>{counts.map(([label, count]) => (
        <div className="niceeval-kpi" key={label}>
          <span className="niceeval-kpi-label">{t(label)}</span>
          <span className="niceeval-kpi-value">{count}</span>
        </div>
      ))}</Grid>
    </section>
  );
}

export function ResultsRoute({ target }: {
  readonly target: Extract<InsightTarget, { readonly kind: "group" | "experiment" }>;
}): ReactElement {
  return target.kind === "group"
    ? <GroupResultsRoute groupKind={target.groupKind} groupKey={target.key} />
    : <ExperimentResultsRoute experimentId={target.experimentId} />;
}

function GroupResultsRoute({ groupKind, groupKey }: { readonly groupKind?: string; readonly groupKey?: string }) {
  const generation = useCurrentGeneration();
  const snapshot = generation.snapshot as InsightRuntimeSnapshot;
  const { data: model } = useSuspenseQuery(resultsQueryOptions(generation, snapshot.manifest, snapshot.overview, snapshot.targetMode, groupKind, groupKey));
  return <LocalizedResultsPage model={model} />;
}

function ExperimentResultsRoute({ experimentId }: { readonly experimentId: string }) {
  const generation = useCurrentGeneration();
  const snapshot = generation.snapshot as InsightRuntimeSnapshot;
  const { data: model } = useSuspenseQuery(experimentQueryOptions(generation, snapshot.overview, snapshot.targetMode, experimentId));
  return <LocalizedResultsPage model={model} />;
}

function LocalizedResultsPage({ model }: { readonly model: ResultsPageModel }) {
  const { i18n } = useTranslation();
  const generation = useCurrentGeneration();
  const locale = (i18n.resolvedLanguage ?? "en") as Locale;
  return <ResultsPage model={model} locale={locale} unavailableReason={(generation.snapshot as InsightRuntimeSnapshot).targetFailureReason} />;
}
