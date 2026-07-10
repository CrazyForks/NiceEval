// view --report 测试用的真实报告文件:defineReport 默认导出,官方水位 + 自定义摆法
// + <Style> 产物,与 docs-site/zh/guides/custom-reports.mdx 的示例同构。
// show 与 view 的宿主测试都吃这一份,两扇门同一棵树。

import { Col, DefaultReport, MetricTable, Section, Style, defineReport, passRate } from "../../../src/report/index.ts";

export default defineReport(async ({ selection }) => (
  <Col>
    <Style>{`.exam-note { color: #4a7; }`}</Style>
    <DefaultReport />
    <Section title="考试成绩单">
      <MetricTable data={await MetricTable.data(selection, { rows: "experiment", columns: [passRate] })} />
    </Section>
  </Col>
));
