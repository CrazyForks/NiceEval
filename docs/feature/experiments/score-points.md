# 计分粒度：对比里一个 eval 记几分

实验对比（模型 A vs 模型 B、配置 X vs 配置 Y）的计分单位是什么？本篇前半是现状契约——**一个 eval 一分**，与 eve 一致；后半是**未定稿的方向讨论**：一个 eval 下有多个得分点（score point），让对比看得见「差在哪一层」。方向部分不是契约，裁决前不得按它实现。

## 现状契约：一个 eval 一分

- 对比横截面的计分单位是 **eval**：一条 eval 的一次 attempt 折叠成四态 [Verdict](../scoring/architecture/severity-and-verdict.md)，`passed` 记 1、其余记 0；`runs > 1` 时按通过率。`Scoreboard` / `ExperimentComparison` 读的就是这个数。
- 断言只是 verdict 的**内部构成**：一条 eval 写 3 条还是 20 条 gate，对比里都是一分。soft 断言与 judge 的分数落在 `AssertionResult`（含 `groupPath` / `severity` / `score` / `threshold`），供 show / view 下钻，但不进默认对比。
- 这与 eve 的模型一致：一个 eval 就是一分，soft 分数 tracked-only。

一分制是**对的默认**，三个理由：

1. **不被断言数量加权。** 写了 20 条断言的 eval 不该比写 3 条的权重大——断言多少反映作者的检查习惯，不反映题目的重要性。
2. **单位对齐。** 发现、缓存指纹、重试、首过即停的单位都是 eval；计分单位一致，「跑了 40 道题、过了 31 道」的心智直接成立。
3. **判定可信。** 四态互斥、优先级固定（errored > failed > skipped > passed），一分制不需要回答「部分可信的分数怎么折叠」这类没有好答案的问题。

## 动机：模型对比里一分太粗的三个场景

- **同 fail，不同深度。** 两个模型都挂了 `install/db-gpt`，但一个死在路由层（没找到文档）、一个死在命令调用链（找到了但命令写错）。榜单上都是 0 分，「哪个模型更接近做对」不可见，只能逐条下钻。
- **部分完成没有部分分。** 安装类任务五步走完三步与一步没走，对比里同为 0。对长链条任务，模型间的真实差距主要藏在这里。
- **质量分差异被判定吞掉。** 两个模型都通过，但 judge 分数一个 0.9 一个 0.6——默认对比面看不到，除非作者自建 Metric。

共同点：证据**已经存在**于 `AssertionResult`（组、分数、severity），缺的不是采集，是对比面的读取粒度。

## 方向（未定稿）：得分点是读取面派生，不动 authoring

候选粒度有三档：

| 得分点 = | 评价 |
|---|---|
| 单条断言 | 太细：断言数量差异直接污染权重，回到一分制要解决的问题 |
| 显式新 API（`t.scorePoint(...)`） | 违反「自组织优先于约定」：为报告需求增加 authoring 词汇，且与 `t.group` 语义重叠 |
| **`t.group` 组** | 倾向方案：组是作者已经在用的语义分块（「路由层」「命令调用链」），零新 API |

倾向的形状：**得分点 = 组级分数，纯读取面派生**。

- attempt 的组分从该组 `AssertionResult` 折叠而来；eval 的得分从一分变成**分数向量**（每组一个 0..1）。
- 报告层新增按 `groupPath` 聚合的视图（`MetricMatrix`：行 = eval × 组，列 = experiment），让「模型 A 死在路由层、模型 B 死在命令链」直接可视。
- authoring 契约零变化：作者继续写 `t.group` + 断言；组名第一次从「报告组织」升级为「跨 eval 可对比的维度」。

## 先钉住的不变量

方向怎么裁决，这几条都不动：

- **Verdict 四态与折叠优先级不变**：得分点不参与判定，只丰富对比。gate 挂了 eval 就是 failed，不存在「组分 0.6 所以算过了一半」。
- **默认榜单仍是一个 eval 一分**：得分点是 opt-in 的下钻视图，不替换默认心智。
- **发现 / 缓存 / 重试的单位仍是 eval**。
- **`unavailable` 不折叠成 0 分**：组内断言评不了时组分是缺数据（`null`），沿用 [Metric 的缺数据语义](../../concepts.md#结果数据与报告)，不能把证据缺口算成模型差。

## 开放问题

- **跨 eval 的组名对齐。** 「路由层」在 install 组和 undo 组里是不是同一个维度值？需要命名约定（目前 `evals/*/share/` 的共享检查函数天然产生一致组名，但没有契约保证）。
- **组分的折叠函数。** 组内 gate 挂了组分是 0，还是按断言得分均值？gate 与 soft 在组内怎么加权？
- **无组断言归属。** 不在任何 `t.group` 里的断言算一个隐式组，还是不产生得分点？
- **与 `--strict` 的交互。** strict 改变 soft 的判定贡献，要不要同步改变组分？
- 裁决后，本节内容毕业进 [Scoring](../scoring/README.md) 与 [Reports](../reports/README.md) 的正式契约，本篇收缩回现状契约。

## 相关阅读

- [Severity 与 Verdict](../scoring/architecture/severity-and-verdict.md) —— 四态折叠与 gate / soft 语义，一分制的判定基础。
- [Scoring Architecture](../scoring/architecture.md) —— `AssertionResult` 的字段（`groupPath` / `score`），得分点的既有素材。
- [Reports](../reports/README.md) —— Metric / Dimension 两级聚合，得分点视图的落点。
- [Observability](../../observability.md) —— 质量 × 成本对比的现有横截面。
