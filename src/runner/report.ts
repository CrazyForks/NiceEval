// reporter 编排与运行级汇总。reporter 是「结果消费方」:单个 reporter 抛错只记
// diagnostic,不能让整次调度崩。

import type { EvalResult, LocalizedText, Reporter, ReporterEvent, RunSummary } from "../types.ts";
import { t } from "../i18n/index.ts";
import { formatThrown } from "../util.ts";

/** reporter 调用的统一兜错。返回 void,永不 reject(供 Promise.all 安全聚合)。 */
export async function runReporter(stage: string, fn: () => unknown): Promise<void> {
  try {
    await fn();
  } catch (e) {
    process.stderr.write(t("runner.reporterDiagnostic", { stage, message: formatThrown(e) }));
  }
}

export async function emitReporterEvent(reporters: readonly Reporter[], event: ReporterEvent): Promise<void> {
  await Promise.all(reporters.map((r) => runReporter(`event:${event.type}`, () => r.onEvent?.(event))));
}

/** 全局汇总:outcome 计数 + token / cost 折叠。按 attempt 计(eval 级折叠见 shared/outcome.ts)。 */
export function summarize(
  results: EvalResult[],
  agent: string,
  startedAt: string,
  durationMs: number,
  name?: LocalizedText,
): RunSummary {
  const counts = { passed: 0, failed: 0, skipped: 0, errored: 0 };
  let inTok = 0;
  let outTok = 0;
  let cost = 0;
  for (const r of results) {
    counts[r.outcome] += 1;
    inTok += r.usage?.inputTokens ?? 0;
    outTok += r.usage?.outputTokens ?? 0;
    cost += r.estimatedCostUSD ?? 0;
  }
  return {
    name,
    agent,
    startedAt,
    completedAt: new Date().toISOString(),
    passed: counts.passed,
    failed: counts.failed,
    skipped: counts.skipped,
    errored: counts.errored,
    durationMs,
    usage: { inputTokens: inTok, outputTokens: outTok },
    estimatedCostUSD: cost || undefined,
    results,
  };
}
