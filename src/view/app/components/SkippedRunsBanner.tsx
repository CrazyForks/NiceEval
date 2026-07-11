import { useState } from "react";
import { AlertCircle, ChevronRight, Copy, Check } from "lucide-react";
import type { T } from "../shared.ts";
import type { MessageKey } from "../i18n.ts";
import type { SkippedRunNotice } from "../types.ts";
import { copyText } from "./CopyControls.tsx";

// 折叠前默认可见的条目数(跨分组累计);超出的部分收进「展开其余」。
const DEFAULT_VISIBLE = 3;

type GroupKind = "incompatible" | "incompatibleForeign" | "malformed" | "incomplete";

interface SkippedGroup {
  key: string;
  kind: GroupKind;
  messageKey: MessageKey;
  vars: Record<string, string | number>;
  items: SkippedRunNotice[];
}

/** 同一原因(且描述文案完全相同)的失败 run 归成一组,组内条目只保留目录名 + 命令,
 *  避免把完整原因句子重复 N 遍——这正是原实现把首屏挤满的根因。 */
function groupSkippedRuns(runs: SkippedRunNotice[]): SkippedGroup[] {
  const groups = new Map<string, SkippedGroup>();
  for (const run of runs) {
    let kind: GroupKind;
    let key: string;
    let messageKey: MessageKey;
    let vars: Record<string, string | number>;

    if (run.reason === "malformed") {
      kind = "malformed";
      vars = { detail: run.detail ?? "?" };
      key = `malformed:${vars.detail}`;
      messageKey = "banner.skipped.malformed";
    } else if (run.reason === "incomplete") {
      kind = "incomplete";
      vars = {};
      key = "incomplete";
      messageKey = "banner.skipped.incomplete";
    } else if (run.producerName && run.producerName !== "niceeval") {
      kind = "incompatibleForeign";
      vars = { name: run.producerName, version: run.producerVersion ?? "?", schemaVersion: run.schemaVersion ?? "?" };
      key = `foreign:${vars.name}:${vars.version}:${vars.schemaVersion}`;
      messageKey = "banner.skipped.incompatibleForeign";
    } else {
      kind = "incompatible";
      vars = { producer: run.producerVersion ?? "?", schemaVersion: run.schemaVersion ?? "?" };
      key = `incompatible:${vars.producer}:${vars.schemaVersion}`;
      messageKey = "banner.skipped.incompatible";
    }

    const existing = groups.get(key);
    if (existing) {
      existing.items.push(run);
    } else {
      groups.set(key, { key, kind, messageKey, vars, items: [run] });
    }
  }
  return [...groups.values()];
}

function CopyCommandButton({ command, t }: { command: string; t: T }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={`ib-copy${copied ? " is-copied" : ""}`}
      title={t("banner.copyCommand")}
      onClick={async () => {
        await copyText(command);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
    >
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
    </button>
  );
}

export function SkippedRunsBanner({ skippedRuns, t }: { skippedRuns: SkippedRunNotice[]; t: T }) {
  const [expanded, setExpanded] = useState(false);
  if (skippedRuns.length === 0) return null;

  const groups = groupSkippedRuns(skippedRuns);
  const total = skippedRuns.length;
  let budget = expanded ? total : DEFAULT_VISIBLE;
  const hiddenCount = expanded ? 0 : Math.max(0, total - DEFAULT_VISIBLE);

  return (
    <section className="incompatible-banner" role="alert">
      <div className="ib-head">
        <AlertCircle className="ib-icon" aria-hidden="true" />
        <b>{t("banner.skippedTitle", { count: total })}</b>
      </div>
      <div className="ib-groups">
        {groups.map((group) => {
          const visibleItems = group.items.slice(0, Math.max(0, budget));
          budget -= visibleItems.length;
          const hiddenInGroup = group.items.length - visibleItems.length;
          return (
            <div className="ib-group" key={group.key}>
              <div className="ib-group-head">
                <span className="ib-group-count">{group.items.length}</span>
                <span className="ib-group-desc">{t(group.messageKey, group.vars)}</span>
              </div>
              {visibleItems.length > 0 && (
                <ul>
                  {visibleItems.map((item) => (
                    <li key={item.dir}>
                      <span className="ib-dir">{item.dir}</span>
                      {item.command && <CopyCommandButton command={item.command} t={t} />}
                    </li>
                  ))}
                  {hiddenInGroup > 0 && !expanded && (
                    <li className="ib-more" aria-hidden="true">
                      +{hiddenInGroup}
                    </li>
                  )}
                </ul>
              )}
            </div>
          );
        })}
      </div>
      {hiddenCount > 0 && (
        <button type="button" className="ib-toggle" onClick={() => setExpanded(true)}>
          <ChevronRight aria-hidden="true" />
          {t("banner.expandRest", { count: hiddenCount })}
        </button>
      )}
      {expanded && total > DEFAULT_VISIBLE && (
        <button type="button" className="ib-toggle" onClick={() => setExpanded(false)}>
          <ChevronRight className="is-open" aria-hidden="true" />
          {t("banner.collapse")}
        </button>
      )}
    </section>
  );
}
