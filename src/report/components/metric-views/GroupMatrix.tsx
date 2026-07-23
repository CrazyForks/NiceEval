// GroupMatrix:行 = eval × t.group 组(按子树折叠),列 = experiment。与 MetricMatrix
// 共用 cell 的基础渲染(MetricCellView),额外叠加 localizedFailure 的失败定位标记——
// 通过制标哪层的 gate 直接挂了,计分制标中止发生在哪个组
// (docs/feature/reports/library/metric-views.md「GroupMatrix」)。
// cells 是稀疏的:没有样本的格子不出现,这里空着,不补 0。

import type { ReactElement } from "react";
import type { GroupMatrixData } from "../../model/types.ts";
import type { AttemptLocator } from "../../../results/locator.ts";
import { DEFAULT_REPORT_LOCALE, type ReportLocale } from "../../model/locale.ts";
import { MetricCellView } from "../cell.tsx";
import { colorClassForKey } from "../../assets/colors.ts";
import { cx } from "../shared.ts";

export function GroupMatrix({
  data,
  attemptHref,
  className,
  locale = DEFAULT_REPORT_LOCALE,
}: {
  data: GroupMatrixData;
  attemptHref?: (locator: AttemptLocator) => string;
  className?: string;
  locale?: ReportLocale;
}): ReactElement | null {
  if (data.rows.length === 0) return null;
  const byPosition = new Map<string, GroupMatrixData["cells"][number]["cell"]>();
  for (const entry of data.cells) {
    byPosition.set(JSON.stringify([entry.evalId, entry.groupPath, entry.column]), entry.cell);
  }

  return (
    <table className={cx("nre", "nre-group-matrix", className)}>
      <thead>
        <tr>
          <th scope="col" className="nre-dimension">
            eval × group
          </th>
          {data.columns.map((column) => (
            <th scope="col" key={column} className={cx("nre-col-key", "nre-key", colorClassForKey(column))}>
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.rows.map((row) => {
          const rowKey = JSON.stringify([row.evalId, row.groupPath]);
          return (
            <tr key={rowKey}>
              <th scope="row" className="nre-row-key">
                <span className="nre-group-eval">{row.evalId}</span>
                <span className="nre-group-path">{row.groupPath.join(" > ")}</span>
              </th>
              {data.columns.map((column) => {
                const cell = byPosition.get(JSON.stringify([row.evalId, row.groupPath, column]));
                return (
                  <td
                    key={column}
                    className={cx("nre-td", !cell && "nre-td-empty", cell?.localizedFailure && "nre-td-localized-failure")}
                  >
                    {/* 稀疏格子:没有样本就空着(数据里不存在),不是 0 也不是缺数据文案 */}
                    {cell ? <MetricCellView cell={cell} attemptHref={attemptHref} locale={locale} /> : null}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
