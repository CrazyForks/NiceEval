// viewData 快照明细 → 证据室页面模型的纯拼接,零聚合口径:Runs / Traces 的平铺列表
// 来自全部快照(server 侧已跨快照去重);统计口径整体住在报告槽的静态 HTML 里,
// 前端不再拼榜单行。修复 prompt 的失败清单(CopyControls 的 fixPromptEntries)
// 也从这份快照明细现算。

import type { RowRun } from "../shared.ts";
import type { ViewResult, ViewSnapshot } from "../types.ts";
import { displayExperimentName } from "../../../shared/aggregate.ts";

/** 快照的展示标签:experiment id 的末段。 */
export function snapshotLabel(snapshot: ViewSnapshot): string {
  return displayExperimentName(snapshot.experimentId) ?? snapshot.experimentId;
}

/** Runs / Traces 的平铺列表:全部快照(含历史)的 attempt,带所属实验的展示标注。 */
export function flattenAttempts(snapshots: ViewSnapshot[]): RowRun[] {
  return snapshots.flatMap((snapshot) => {
    const label = snapshotLabel(snapshot);
    return snapshot.results.map(
      (r): RowRun => ({ ...r, rowLabel: label, rowAgent: snapshot.agent, rowModel: r.model ?? snapshot.model }),
    );
  });
}

/** 旧版 ?modal= 深链的只读回退:在全部快照里按 (eval id, experimentId, attempt) 定位。 */
export function resultFromUrl(snapshots: ViewSnapshot[]): ViewResult | null {
  const p = new URLSearchParams(location.search);
  const id = p.get("modal");
  if (!id) return null;
  const exp = p.get("exp");
  const attempt = parseInt(p.get("a") ?? "0", 10);
  for (const snapshot of snapshots) {
    for (const result of snapshot.results) {
      if (result.id === id && (!exp || result.experimentId === exp) && result.attempt === attempt) {
        return result;
      }
    }
  }
  return null;
}
