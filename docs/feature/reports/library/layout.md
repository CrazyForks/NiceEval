# 排版原语与自定义组件

`Row`、`Col`、`Section`、`Text`、`Style`、`Tabs` 和 `Table` 是七个内置双面组件，用于组织报告树：

```tsx
// reports/nightly.tsx —— 排版原语组织报告树的完整文件形态
import {
  Col, Row, Section, Style, Text,
  MetricTable, costUSD, defineReport, endToEndPassRate,
} from "niceeval/report";

export default defineReport(async ({ selection }) => {
  const board = await MetricTable.data(selection, {
    rows: "agent",
    columns: [endToEndPassRate, costUSD],
  });

  return (
    <Col>
      <Text className="team-note">nightly benchmark · publishes at 06:00</Text>
      <Row>
        <Section title="Overall">
          <MetricTable data={board} />
        </Section>
        <Section title="Cost">
          <MetricTable data={board} />
        </Section>
      </Row>
      <Style>{`.nre .team-note { color: #6b7280; }`}</Style>
    </Col>
  );
});
```

本页其余示例都是这样一个 `defineReport` build 函数返回树中的片段；更多完整文件按场景收在[配方](recipes.md)。

## `Tabs`

把一页里的并列视图组织成可切换的块。tab 是页内浏览状态，不是数据边界，也不是宿主寻址单位——需要能从 CLI 单独打开、有自己路由和导航项的块，用[页](shell.md)而不是 tab。tab 不进 `defineReport` 的配置对象：把 tab 提到定义层，它就会被追问 id、深链和 CLI 选择器，页与 tab 的边界就塌了。

```tsx
<Tabs>
  <Tab title="质量 × 成本">
    <MetricScatter selection={selection} points="experiment" series="agent" x={costUSD} y={endToEndPassRate} />
  </Tab>
  <Tab title="分科得分">
    <Scoreboard data={scoreboard} />
  </Tab>
</Tabs>
```

- 两个渲染面都输出全部 tab 的完整内容。web 面静态 HTML 把每个 tab 渲染为独立 `<details>`，第一个默认展开；渐进增强把它们变成单选 tab 条。切换是纯浏览状态，不改变数据、指标口径或初始 HTML 中的数值。text 面按声明顺序把每个 tab 输出为带标题的分节。
- `Tab` 只有 `title: string` 一个属性。tab 不参与路由，没有 id，也没有 CLI 选择器。
- **text 面不给 tab 做索引，也不隐藏任何 tab。** 可比组和页在 text 面折成索引，是因为它们有可复制的下钻命令；tab 没有选择器，索引只能是死路，所以 `show` 全量输出。多 tab 报告在终端长到读不动，正是把这些 tab 升级成[页](shell.md)的信号——这层阅读压力是设计的一部分，不用隐藏内容来缓解。

## `Table`

自定义表格的标准件：给一份 `columns` 和 `rows`，text 面按显示宽度对齐、web 面输出 `<table>`。

```tsx
<Table
  columns={[
    { key: "eval", header: "题目" },
    { key: "pass", header: "通过率", align: "right" },
    { key: "cost", header: "成本", align: "right" },
  ]}
  rows={[
    {
      key: "memory/写缓存",
      locator: "@160iuj3h",
      cells: { eval: "memory/写缓存", pass: "87%", cost: "$0.09" },
    },
    {
      key: "memory/读缓存",
      cells: { eval: "memory/读缓存", pass: null, cost: null },
    },
  ]}
/>
```

`TableProps`：

| Prop | 类型 | 含义 |
|---|---|---|
| `columns` | `TableColumn[]` | 列定义；数组顺序即渲染顺序 |
| `rows` | `TableRow[]` | 行数据；数组顺序即渲染顺序 |
| `locale` | `ReportLocale` | 组件自带文案的语言；省略时随宿主 |
| `className` | `string` | web 面挂在 `<table>` 上 |

`TableColumn`：

| 字段 | 类型 | 含义 |
|---|---|---|
| `key` | `string` | 取 `row.cells[key]` 的键 |
| `header` | `string` | 表头文案，原样渲染 |
| `align` | `"left" \| "right"` | 默认 `"left"`；`"right"` 按显示宽度右对齐，数字列用 |

`TableRow`：

| 字段 | 类型 | 含义 |
|---|---|---|
| `key` | `string` | 行身份 |
| `cells` | `Record<string, string \| null>` | 已格式化的显示值 |
| `locator` | `AttemptLocator` | 可选；带上就多一列 attempt |

渲染契约：

- **列宽按显示宽度算**，CJK / 全角记 2 列。中文列不会撕歪。
- **`null` 渲染成 `—`**，不补 0；`cells` 里缺这个键同样是 `—`。
- **超宽先折行再丢列。** 总宽超过可用列宽时，先压最宽的左对齐列（按显示宽度折行）；右对齐列不折行——数字折行读不了。左对齐列压到下限仍放不下，就从右侧丢列，并在表下如实标注丢了几列。
- **两个面各自成立。** text 面列间 3 空格、首行表头；web 面是 `<table>` + `<thead>` / `<tbody>`，右对齐落成 `nre-align-right` 类，不用内联样式。
- **带 `locator` 的行接证据室。** 有任一行带 `locator` 时多出一列 attempt：web 面是指向证据室的链接，text 面列出 locator（`niceeval show <locator>` 的位置参数）。

`MetricTable`、`MetricMatrix`、`Scoreboard` 和 `DeltaTable` 的 text 面建在 `Table` 上：自定义表和官方表用同一把尺子。

## 文本排版工具箱

表格之外的形态要自己写 text 面时，用 `niceeval/report` 导出的这组纯函数。不要用 `String.prototype.padEnd` / `padStart` 对齐：它们数的是 UTF-16 码元，不是终端显示列宽，agent 名或 eval id 一带中文，整张表就撕歪。

| 导出 | 签名 | 用途 |
|---|---|---|
| `stringWidth` | `(text: string) => number` | 显示宽度：CJK / 全角记 2 列，其余 1 列 |
| `padEnd` | `(text: string, width: number) => string` | 按显示宽度在右侧补齐（左对齐） |
| `padStart` | `(text: string, width: number) => string` | 按显示宽度在左侧补齐（右对齐，数字列用） |
| `wrapText` | `(text: string, width: number) => string[]` | 按显示宽度折行 |
| `indent` | `(block: string, prefix: string) => string` | 每行加缩进 |
| `bar` | `(ratio: number, width: number) => string` | 字符条：`█` 填充、`░` 补齐到 `width` |
| `columns` | `(blocks: string[], widths: number[], separator?: string) => string` | 多块并排 |

## 自定义组件

要让自定义组件同时出现在 `show` 和 `view`，用 `defineComponent` 同时提供 `web` 与 `text` 面。只服务自己网页的组件直接写普通 React 组件即可。

## 相关阅读

- [外壳与多页](shell.md) —— 树之上的导航外壳与页。
- [指标组件](metric-views.md) —— 官方表格与图形组件。
- [Architecture](../architecture.md) —— 报告树的 build / resolve / validate / render 管线。
