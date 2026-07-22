// AttemptAssertions:全量 assertion,非 passed 默认展开、passed 按 group 折叠计数。
// 没有 assertion 时零输出(docs/feature/reports/library/attempt-detail.md)。

import type { ReactElement } from "react";
import type { AttemptAssertionsData } from "../../model/types.ts";
import type { AssertionResult, ScoreEntry } from "../../../types.ts";
import { stripControl } from "../../../scoring/display.ts";
import { formatPointsSuffix } from "../../model/format.ts";
import { cx } from "../shared.ts";

function assertTone(a: AssertionResult): "good" | "warn" | "bad" | "na" {
  if (a.outcome === "unavailable") return "na";
  if (a.outcome === "passed") return "good";
  return a.severity === "soft" ? "warn" : "bad";
}

function AssertionRow({ a }: { a: AssertionResult }): ReactElement {
  return (
    <details className="nre-assertion-row" open>
      <summary>
        <span className={`nre-assertion-badge nre-tone-${assertTone(a)}`}>
          {a.outcome === "unavailable" ? "unavailable" : a.outcome}
        </span>
        <span className="nre-assertion-name">
          {a.groupPath?.length ? `${a.groupPath.join(" > ")} · ` : ""}
          {a.name}
        </span>
        {a.detail && a.detail !== a.name ? <span className="nre-assertion-detail">{a.detail}</span> : null}
      </summary>
      <div className="nre-assertion-body">
        {a.outcome === "unavailable" ? <div>{a.reason === undefined ? undefined : stripControl(a.reason)}</div> : null}
        {a.outcome !== "unavailable" && a.expected !== undefined ? <div>expected: {stripControl(a.expected)}</div> : null}
        {a.outcome !== "unavailable" && a.received !== undefined ? <div>received: {stripControl(a.received)}</div> : null}
        {/* 计分制(defineScoreEval)才有:.points(n) 挣到的分,0 分也如实显示(见
            docs/feature/scoring/library/display.md「计分制:.points 与给分记录」)。 */}
        {a.outcome !== "unavailable" && a.points !== undefined ? (
          <div className="nre-assertion-points">{formatPointsSuffix(a.points)}</div>
        ) : null}
      </div>
    </details>
  );
}

/** `t.score(label, n)` 记录一行:label + 挣分,不带 severity/outcome(它不是一条被评估的断言)。 */
function ScoreEntryRow({ entry }: { entry: ScoreEntry }): ReactElement {
  return (
    <div className="nre-score-entry-row">
      <span className="nre-score-entry-label">{entry.label}</span>
      <span className="nre-assertion-points">{formatPointsSuffix(entry.points)}</span>
    </div>
  );
}

export function AttemptAssertions({
  data,
  className,
}: {
  data: AttemptAssertionsData | null;
  className?: string;
}): ReactElement | null {
  if (data === null) return null;
  return (
    <div className={cx("nre", "nre-attempt-assertions", className)}>
      {data.attention.map((a, i) => (
        <AssertionRow key={i} a={a} />
      ))}
      {data.passedGroups.length > 0 ? (
        <details className="nre-assertions-passed">
          <summary>passed · {data.passedGroups.reduce((n, g) => n + g.items.length, 0)}</summary>
          {data.passedGroups.map(({ group, items }) => (
            <details key={group || "·"} className="nre-assertions-passed-group">
              <summary>
                {group || "—"} · {items.length}
              </summary>
              {items.map((a, i) => (
                <AssertionRow key={i} a={a} />
              ))}
            </details>
          ))}
        </details>
      ) : null}
      {data.scoreEntries && data.scoreEntries.length > 0 ? (
        <details className="nre-score-entries" open>
          <summary>score entries · {data.scoreEntries.reduce((n, g) => n + g.items.length, 0)}</summary>
          {data.scoreEntries.map(({ group, items }) => (
            <details key={group || "·"} className="nre-score-entries-group" open>
              <summary>
                {group || "—"} · {items.length}
              </summary>
              {items.map((entry, i) => (
                <ScoreEntryRow key={i} entry={entry} />
              ))}
            </details>
          ))}
        </details>
      ) : null}
    </div>
  );
}
