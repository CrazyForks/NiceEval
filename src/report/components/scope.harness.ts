// Reports 家族共享的 Scope / Results 机械构造器(harness,规则见
// docs/engineering/testing/unit/harness.md):只做「Snapshot[] → Scope / Results」的无场景
// 语义包装,场景输入(snap()/res() 等 fixture)留在各测试文件里。makeScope / Scope 形状变更
// 只改这一处,不再在每个 report 测试文件里各改一份副本。
// 不进 dist/report 产物(tsconfig.report-build.json 按 *.harness.ts 排除)。

import type { Results, Scope, ScopeCoverage, ScopeWarning, Snapshot } from "../../results/index.ts";
import { makeScope } from "../../results/select.ts";

/** 现刻水位形态的 Scope:attempts 物化自各快照,warnings / coverage 按需注入。 */
export function scopeOf(snapshots: Snapshot[], warnings: ScopeWarning[] = [], coverage: ScopeCoverage[] = []): Scope {
  return makeScope("current-evals", snapshots, snapshots.flatMap((s) => s.attempts), warnings, coverage);
}

/** 按 experimentId 分组、startedAt 降序的最小 Results:latest()/current() 都取各实验最新快照。 */
export function resultsOf(snapshots: Snapshot[]): Results {
  const byId = new Map<string, Snapshot[]>();
  for (const s of snapshots) byId.set(s.experimentId, [...(byId.get(s.experimentId) ?? []), s]);
  const experiments = [...byId.entries()].map(([id, snaps]) => {
    const sorted = [...snaps].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
    return {
      id,
      snapshots: sorted,
      latest: sorted[0]!,
      evalIds: [...new Set(sorted.flatMap((s) => s.evals.map((e) => e.id)))].sort(),
    };
  });
  return {
    experiments,
    skipped: [],
    latest: () => makeScope("latest-snapshots", experiments.map((e) => e.latest), experiments.flatMap((e) => e.latest.attempts), []),
    current: () => makeScope("current-evals", experiments.map((e) => e.latest), experiments.flatMap((e) => e.latest.attempts), []),
  } as unknown as Results;
}

/** 空 Scope + 指回它的 Results:attempt-input page 场景里只需要一个合法的空上下文。 */
export function emptyScopeAndResults(): { scope: Scope; results: Results } {
  const scope = scopeOf([]);
  const results = { experiments: [], skipped: [], latest: () => scope, current: () => scope } as unknown as Results;
  return { scope, results };
}
