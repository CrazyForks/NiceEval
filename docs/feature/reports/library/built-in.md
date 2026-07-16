# 内建报告

裸 `niceeval show` 与 `niceeval view` 不带 `--report` 时装载的默认报告，不是私有实现，也不是省略字段时被召唤的隐式默认——它是独立入口 `niceeval/report/built-in` 导出的一份**普通的具名 `defineReport`**，按内容命名为 `comparisonReport`，因为它渲染的就是 `ExperimentComparison`。

它不住在 `niceeval/report` 里：那是工具箱（`defineReport`、组件、指标、排版原语），内建报告是用这套工具写成的**成品**，与用户的报告文件同层。这个模块的源码形状和你的 `reports/*.tsx` 完全相同——用公开 API 写成、默认导出一份定义：

```tsx
// niceeval/report/built-in —— 包里自带的一个报告文件，没有任何私有钩子
import { defineReport, ExperimentComparison } from "niceeval/report";

export const comparisonReport = defineReport(async ({ selection }) => (
  <ExperimentComparison data={await ExperimentComparison.data(selection)} />
));

export default comparisonReport;
```

这是契约，不是实现巧合：裸宿主与 `--report` 一个内容只有 `export default comparisonReport` 的文件完全等价，走同一条 `装载 → build → resolve → validate → render` 管线；外壳行为——标题取值链（`title` → 快照 `name` → `NiceEval`）、页脚的 `Powered by niceeval` 行、Runs 与 Traces 证据页恒随导航——对内建与自定义定义一致生效。「builtin」不是类型系统或装载逻辑里的类别，只是「宿主默认拿哪个值」的事实。任何用户报告都能达到内建报告的全部能力；反过来，报告 API 的验收标准之一就是内建自己必须写得顺——内建写不出来或写着别扭，说明 API 缺了东西。

## 从内建出发的升级路径

三档改造不换 API 形状：

```tsx
// reports/mine.tsx —— ① 换树：函数入参换成自己的报告树
import {
  Col, ExperimentList, MetricScatter,
  costUSD, defineReport, endToEndPassRate,
} from "niceeval/report";

export default defineReport(async ({ selection }) => (
  <Col>
    <MetricScatter selection={selection} points="experiment" series="agent" x={costUSD} y={endToEndPassRate} />
    <ExperimentList items={await ExperimentList.data(selection)} filter />
  </Col>
));
```

```tsx
// reports/branded.tsx —— ② 保留内建报告，只加品牌外壳：显式引用，不靠省略
import { defineReport } from "niceeval/report";
import { comparisonReport } from "niceeval/report/built-in";

export default defineReport({
  title: "Memory Evals",
  links: [{ label: "GitHub", href: "https://github.com/you/repo" }],
  report: comparisonReport,
});
```

```tsx
// reports/site.tsx —— ③ 拆页：内建报告作首页，再加自己的页
import { defineReport } from "niceeval/report";
import { comparisonReport } from "niceeval/report/built-in";
import exam from "./exam.tsx";

export default defineReport({
  title: "Memory Evals",
  links: [{ label: "GitHub", href: "https://github.com/you/repo" }],
  pages: [
    { id: "overview", title: { en: "Overview", "zh-CN": "总览" }, report: comparisonReport },
    { id: "exam", title: { en: "Exam", "zh-CN": "成绩单" }, report: exam },
  ],
});
```

② 是最小品牌化形态：一个 import 加一个字段，得到「内建报告 + 自己的标题与 GitHub 链接」。`report` 与 `pages` 必须恰好声明一个（见[外壳与多页](shell.md)）——「都不写就默认内建」这种隐式取值不存在，读文件的人必须能看出会渲染什么。

## 内建报告显示什么

内置 `ExperimentComparison` 的行为契约——可比组分区、text/web 两面差异、端到端成功率口径——单点定义在[概览组件](summaries.md#experimentcomparison)；宿主注入 Selection 的选择规则见 [Architecture](../architecture.md#selection-是计算入口)。

## 相关阅读

- [外壳与多页](shell.md) —— 对象入参的字段穷尽与行为约束。
- [概览组件](summaries.md) —— `ExperimentComparison` 的契约。
- [Architecture](../architecture.md) —— 装载规范化：内建与 `--report` 的同一条管线。
