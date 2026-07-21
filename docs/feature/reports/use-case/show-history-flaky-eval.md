# `--history`:一道题时好时坏,按 attempt 看历次执行

## 解决什么问题

同一道 eval 这次绿、上次红,榜单只呈现当前 Scope 的汇总,回答不了「这道题历次跑下来发生了什么」。`--history` 给出逐 attempt 的执行时间轴:每次执行一行,失败原因、耗时、成本与 locator 都在行内,从时间轴上任意一次执行都能继续下钻取证([契约](../show.md#--history一个-eval-的执行时间轴))。

## 全流程

1. 用 eval id 前缀选中这道题,加 `--history`:

   ```bash
   niceeval show memory/swelancer --history
   ```

   对 Scope 中匹配的每个 `experimentId + evalId` 分节,节内按 startedAt 升序列出跨快照按 attempt 身份键去重后的历次 attempt——时间、verdict、单行结果摘要(主失败断言或结构化 error 的一层摘要,与榜单同一 display 契约)、耗时、成本与 locator。

2. 多个 experiment 都跑过这道题时,用 `--exp` 收窄到一条线再看时间轴,位置参数按裸前缀过滤、`--exp` 按 experiment id 路径段匹配,两个维度语义不混([契约](../show.md#选择结果范围)):

   ```bash
   niceeval show memory/swelancer --exp dev-e2b/codex-e2b --history
   ```

3. 从时间轴上挑出可疑的那次执行,复制它的 locator 下钻:

   ```bash
   niceeval show @1qrdcfq8
   ```

   接下来看断言、对话、时间树与 diff 的路径见 [`@locator` 下钻](show-locator-drilldown.md)。

4. 时好时坏的题通常要对照两次执行:对失败与通过的 locator 各开一次 `--execution` 或 `--diff`,比对 agent 行为差在哪一轮。

## 边界

- `--history` 与 `--report` 互斥:两者都占据主输出,`--history` 是宿主证据面的时间轴,不经报告树。
- 它逐 attempt 而非逐快照。快照级趋势(成绩随配置版本变好还是变坏)不归它,用报告库的[历史配方](../library/recipes.md#历史一个实验的逐次快照走势)。
- 前缀匹配不到任何有结果的 eval 时明确报无匹配并列出有结果的 eval,不做模糊猜测([契约](../show.md#无匹配与不可读结果))。

## 相关阅读

- [Show](../show.md#--history一个-eval-的执行时间轴) —— `--history` 的单源契约。
- [`@locator` 下钻](show-locator-drilldown.md) —— 从时间轴上的一次执行继续取证。
- [Library · 配方](../library/recipes.md#历史一个实验的逐次快照走势) —— 快照级走势的报告写法。
