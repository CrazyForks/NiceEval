// DefaultReport:官方水位整块 —— 官方两扇门裸跑时渲染的就是它,零 props、纯声明。
// 「渲染面纯同步」与它不冲突,靠的是一个数据事实:官方水位(overview、榜单、失败清单)
// 只读瘦身条目、不碰任何懒加载工件,宿主对着已挑好的选集总是把这份数据备好、经上下文
// 注入(renderReportToText / renderReportToStaticHtml 里 prepareDefaultReportData)。
// 它渲染的口径钉死为宿主注入的那份选集 —— 零 props 意味着没有跟随的通道,这是锚点语义:
// 官方口径与自定义口径并排对照。默认无特权:数据全部来自公开计算函数。

import type { Selection } from "../results/index.ts";
import { defineComponent } from "./tree.ts";
import type { CaseListData, OverviewData, TableData } from "./types.ts";
import { caseListData, overviewData, tableData } from "./compute.ts";
import { costUSD, durationMs, passRate } from "./metrics.ts";
import { RunOverview, MetricTable, CaseList } from "./components.tsx";
import { caseListText, overviewText, tableText } from "./text/faces.ts";

export interface DefaultReportData {
  overview: OverviewData;
  /** 现刻榜单:experiment × (passRate, costUSD, durationMs)。 */
  verdicts: TableData;
  cases: CaseListData;
}

/** 失败清单的出厂截断;完整清单自己摆 <CaseList>(截断如实报剩余)。 */
const DEFAULT_CASE_LIMIT = 10;

/** 宿主渲染前备好官方水位:只读瘦身条目,代价可忽略。 */
export async function prepareDefaultReportData(selection: Selection): Promise<DefaultReportData> {
  return {
    overview: await overviewData(selection),
    verdicts: await tableData(selection, {
      rows: "experiment",
      columns: [passRate, costUSD, durationMs],
      sort: passRate,
    }),
    cases: await caseListData(selection, { limit: DEFAULT_CASE_LIMIT }),
  };
}

let activeData: DefaultReportData | null = null;

/** 宿主(与渲染入口)用:在注入好的官方水位下同步渲染。 */
export function runWithDefaultReportData<T>(data: DefaultReportData, fn: () => T): T {
  const prev = activeData;
  activeData = data;
  try {
    return fn();
  } finally {
    activeData = prev;
  }
}

function requireData(): DefaultReportData {
  if (!activeData) {
    throw new Error(
      "<DefaultReport /> renders the host-injected selection; render the report via " +
        "`niceeval show --report` / `niceeval view --report` (or renderReportToText / renderReportToStaticHtml). " +
        "Outside a host, compose the same blocks yourself: RunOverview, MetricTable, CaseList.",
    );
  }
  return activeData;
}

export const DefaultReport = defineComponent<Record<string, never>>({
  web() {
    const data = requireData();
    return (
      <div className="nre nre-default-report">
        <RunOverview data={data.overview} />
        <MetricTable data={data.verdicts} />
        {data.cases.rows.length > 0 && <CaseList data={data.cases} />}
      </div>
    );
  },
  text(_props, ctx) {
    const data = requireData();
    const blocks = [overviewText(data.overview), tableText(data.verdicts)];
    if (data.cases.rows.length > 0) blocks.push(`Failing:\n${caseListText(data.cases, ctx)}`);
    return blocks.join("\n\n");
  },
});
DefaultReport.displayName = "DefaultReport";
