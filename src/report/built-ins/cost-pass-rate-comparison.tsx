// CostPassRateComparison:show / view 裸跑时的出厂报告槽。
//
// 它是一份普通 ReportDefinition,零特权:只声明「摆什么」——成本 × 通过率的散点(比较
// experiments)和实验列表。散点走 selection-form(`MetricScatter` 声明了 `resolve`,宿主
// 渲染前的 resolveReportTree 会替它调 `.data`);`ExperimentList` 没有 selection-form,
// 报告函数体里直接 `await ExperimentList.data(selection)` 拿到普通数组再传 `items`——
// 这正是三个实体列表统一的用法,内置默认报告不搞一套特权写法。包外用户复制这段 TSX
// (只改 import 路径与 export 形式)会走完全相同的解析与渲染管线。

import { Col } from "../primitives.tsx";
import { ExperimentList, MetricScatter } from "../components.tsx";
import { costUSD, passRate } from "../metrics.ts";
import { defineReport } from "../report.ts";

export const CostPassRateComparison = defineReport(async ({ selection }) => {
  const experiments = await ExperimentList.data(selection);
  return (
    <Col>
      <MetricScatter selection={selection} points="experiment" series="agent" x={costUSD} y={passRate} />
      <ExperimentList items={experiments} />
    </Col>
  );
});
