// reporter 共用的展示常量。符号表只此一份 —— console/live/table 各抄一份时,
// 改一个符号要同步三处且不报错。

import type { ResultOutcome } from "../../types.ts";

export const OUTCOME_SYM: Record<ResultOutcome, string> = {
  passed: "✓",
  failed: "✗",
  errored: "!",
  skipped: "○",
};

export function outcomeSymbol(outcome: string): string {
  return OUTCOME_SYM[outcome as ResultOutcome] ?? "?";
}
