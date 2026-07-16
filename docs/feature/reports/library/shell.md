# 外壳与多页

`defineReport` 接受两种入参：传 build 函数得到一棵报告树，填进宿主默认外壳的报告槽；传配置对象则在报告之外声明导航外壳——标题、GitHub 等外部链接、页脚、自定义脚本与样式——并可把报告拆成多页。给报告加品牌、发布 benchmark 站、把成绩单与趋势分成独立页面，是同一个 API 的递进用法，形状不换轨：

```tsx
// reports/frontier.tsx —— ① 一棵树：函数入参，等价于 { report: build }
import { defineReport, ExperimentComparison } from "niceeval/report";

export default defineReport(async ({ selection }) => (
  <ExperimentComparison data={await ExperimentComparison.data(selection)} />
));
```

```tsx
// reports/branded.tsx —— ② 同一棵树 + 品牌外壳：对象入参，report 字段装树
import { defineReport, ExperimentComparison } from "niceeval/report";

export default defineReport({
  title: { en: "Memory Evals", "zh-CN": "记忆能力评测" },
  links: [{ label: "GitHub", href: "https://github.com/you/coding-agent-memory-evals" }],
  report: async ({ selection }) => (
    <ExperimentComparison data={await ExperimentComparison.data(selection)} />
  ),
});
```

```tsx
// reports/branded-builtin.tsx —— ③ 内建报告 + 你的外壳：显式引用，没有隐式默认
import { defineReport } from "niceeval/report";
import { comparisonReport } from "niceeval/report/built-in";

export default defineReport({
  title: { en: "Memory Evals", "zh-CN": "记忆能力评测" },
  links: [{ label: "GitHub", href: "https://github.com/you/coding-agent-memory-evals" }],
  report: comparisonReport,
});
```

多页用 `pages`，已有的单树报告文件直接复用为一页：

```tsx
// reports/site.tsx
import { defineReport } from "niceeval/report";
import { comparisonReport } from "niceeval/report/built-in";
import exam from "./exam.tsx";

export default defineReport({
  title: { en: "Memory Evals", "zh-CN": "记忆能力评测" },
  links: [
    { label: "GitHub", href: "https://github.com/you/coding-agent-memory-evals" },
    { label: { en: "CI", "zh-CN": "CI" }, href: "https://github.com/you/repo/actions" },
  ],
  footer: { en: "Published nightly from CI.", "zh-CN": "由 CI 每晚发布。" },
  scripts: [{ src: "./assets/annotate.js" }],
  styles: [{ inline: ".nre .nre-hero { letter-spacing: 0.02em; }" }],
  pages: [
    // build 函数与已有的报告定义都可以直接作一页
    { id: "overview", title: { en: "Overview", "zh-CN": "总览" }, report: comparisonReport },
    { id: "exam", title: { en: "Exam", "zh-CN": "成绩单" }, report: exam },
  ],
});
```

```sh
niceeval view --report reports/site.tsx              # 完整多页导航，首页是第一页
niceeval show --report reports/site.tsx              # 多页时输出页索引
niceeval show --report reports/site.tsx --page exam  # 渲染指定页
```

## 字段穷尽

```ts
function defineReport(build: ReportBuild): ReportDefinition;
function defineReport(def: ReportDef): ReportDefinition;

/** 接收宿主注入的 Selection 等上下文，返回一棵报告树。 */
type ReportBuild = (ctx: ReportContext) => ReportNode | Promise<ReportNode>;

interface ReportDef {
  /** 标题：浏览器标题、页头品牌与首页 hero。取值链是 def.title → 快照 name → "NiceEval"。 */
  title?: LocalizedText;
  /** 页头右侧的外部链接，如 GitHub、文档、CI。 */
  links?: ReportLink[];
  /** 每页页脚的一段文字；省略时页脚只有 Powered by 行。 */
  footer?: LocalizedText;
  /** 注入每个页面的脚本，在官方增强脚本之后、按声明顺序于 </body> 前加载。 */
  scripts?: ReportAsset[];
  /** 注入每个页面的样式表，在官方样式之后按声明顺序加载。 */
  styles?: ReportAsset[];
  /** 单页缩写：build 函数或单页、无外壳字段的定义（如 `niceeval/report/built-in` 的 comparisonReport）。
      等价于 pages: [{ id: "report", title: 内置页名「报告 / Report」, report: X }]。与 pages 恰好声明一个。 */
  report?: ReportBuild | ReportDefinition;
  /** 页列表：导航按数组顺序显示。与 report 恰好声明一个。 */
  pages?: ReportPage[];
}

interface ReportPage {
  /** 页面身份：`--page <id>` 的取值、web 路由 `#/page/<id>` 与导航锚。小写字母、数字与连字符，文件内唯一。 */
  id: string;
  /** 导航中的页名。 */
  title: LocalizedText;
  /** 这一页的报告：与 ReportDef.report 同型——build 函数或单页无外壳的定义；每页接受宿主注入的同一份 Selection。 */
  report: ReportBuild | ReportDefinition;
}

interface ReportLink {
  label: LocalizedText;
  href: string;
}

/** src 是相对报告文件所在目录的资产路径；inline 是原样注入的脚本或样式正文。 */
type ReportAsset = { src: string } | { inline: string };
```

## 行为约束

- **单页与多页是同一个机制：页列表。** 装载规范化的唯一产物是「外壳 + 非空页列表」，页数只是列表长度。两级缩写各有精确展开：`defineReport(build)` ≡ `defineReport({ report: build })`；`report: X` ≡ `pages: [{ id: "report", title: 内置页名「报告 / Report」, report: X }]`。缩写不是隐式默认——展开完全由写下的值决定。因此单页文件同样有页身份：路由 `#/page/report` 与 `--page report` 都成立，导航项显示内置页名；`show` 只在页数大于一时输出页索引，单页直接渲染——这是展示规则，不是第二种机制。裸 `show` / `view` 装载的[内建报告](built-in.md)走同一条装载管线。
- **`report` 与 `pages` 恰好声明一个，没有隐式默认。** 同时声明或都省略，装载时以完整用户反馈报错，报错指出下一步：要品牌化内建报告，就从 `niceeval/report/built-in` import `comparisonReport` 填进 `report`。省略不是一种有含义的取值——读报告文件的人必须能看出会渲染什么。
- **页不嵌套外壳。** `report` 与 `page.report` 接受 build 函数或单页、无外壳字段的 `ReportDefinition`；带外壳字段或 `pages` 的产物放进这两处时装载报错。外壳只在顶层声明一次。
- **页是宿主寻址单位，tab 是页内浏览状态。** 页有 id、路由、导航项和 `--page` 选择器；[`Tabs`](layout.md#tabs) 没有。需要单独打开、深链或在终端独立渲染的内容做成页，同页内的并列视图用 tab。
- **所有页共享同一份 Selection。** 位置参数与 `--experiment` 收窄对全部页生效；页是对同一批数据的不同看法，不承担数据过滤职责。要看不同数据范围，用命令行收窄或在页的报告里显式 filter。
- **除 `title` 外的外壳字段是 web 面属性。** `links`、`footer`、`scripts`、`styles` 只被 `view` 与静态导出消费；`show` 读同一文件时消费 `pages`，并把 `title` 用作页索引的标题行。外壳文案是 `LocalizedText`，随外壳的语言切换取值。
- **web 面页脚恒含 `Powered by niceeval`。** 外壳页脚末行是指向 niceeval 官网的一行小字，自定义 `footer` 文案排在它前面。它是外壳自带的品牌行：不占 `footer` 的语义位、没有关闭配置、不改变任何数据。text 面与 `niceeval/report/react` 嵌入组件都不带它——品牌跟着官方 web 外壳走，不跟着组件走。
- **自定义脚本是增强层。** 与官方增强脚本同一不变量：初始静态 HTML 无 JS 时完整可读，脚本只添加浏览行为，不改变数据、指标口径或初始 HTML 中的数值。要改数据口径，改的是报告树或指标定义，不是脚本。
- **`{src}` 资产按路径纪律解析。** 允许普通相对路径和 `./` 前缀，不允许 `..` 路径段、绝对路径或 `~`；本地 `view` 直接提供这些文件，静态导出把它们复制进导出目录的 `assets/` 并保持相对路径。引用的文件缺失时在启动或导出时报错并给出解析后的路径。
- **校验在装载时完成。** `report` 与 `pages` 同时声明或都省略、重复或非法的 page id、页里嵌套外壳、缺任一渲染面的页内组件，都在宿主装载时以完整用户反馈报错，不渲染半套页面。
- **脚本随导出发布。** 静态导出会原样携带并在读者浏览器执行 `scripts`；[`--out` 的数据等级防呆](../view.md#静态导出)只检查证据文件的消毒标记，不检查脚本内容，脚本里别嵌密钥。

导航的完整组成规则——报告页按声明序在前，内置 Runs、Traces 证据页恒排其后、由宿主拥有——见 [View · 页面构成](../view.md#页面构成) 与 [Architecture](../architecture.md#外壳与页装载规范化)。

## 相关阅读

- [内建报告](built-in.md) —— 裸宿主装载的定义与升级路径。
- [Show](../show.md) / [View](../view.md) —— 页索引、`--page` 与静态导出。
- [Architecture](../architecture.md) —— 装载规范化与证据页边界。
