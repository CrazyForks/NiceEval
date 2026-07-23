# 报告主读数随题型切换:实现 TODO 树

计分制 Scope 的散点、榜单、排序仍硬编码通过率;契约已定稿,**一律以 docs 为准,本 plan 只列落点不复述契约**:

- 主读数映射单点(新增 `scoringComposition()` 公开函数):`docs/feature/reports/library/metrics.md#题型构成与主读数`
- 实体列表 data 与主列规则:`docs/feature/reports/library/entity-lists.md`
- 默认报告 compose 与 mixed 拆组:`docs/feature/reports/library/summaries.md#experimentcomparison`
- show 面文案:`docs/feature/reports/show/default-report.md`;测试覆盖类别:`docs/engineering/testing/unit/reports.md`(三条新声明)
- 注意:计分制判定面刚翻案(commit `74b88fa`,failed 只来自前置中止)。本工作**不触碰判定面**,只接分数面读数;涉及 verdict 的呈现照旧读落盘 verdict。

## TODO 树

依赖关系标在节点上;无依赖标注的兄弟节点可交给不同 worker **并行**。并行提交遵守 memory 条目 `parallel-agents-shared-git-index`:路径限定 add 后立即提交。

- [ ] **A. 模型层:`scoringComposition` 判据单点**(无依赖,可与 B 并行)
  - [ ] A1. `src/report/model/` 新增 `scoringComposition(input: ReportInput)`,判据读快照的定义期 `EvalDescriptor.scoring`;从 `niceeval/report` 顶层导出(与内置指标同待遇,含 TSDoc——参考页文案单源在源码注释)
  - [ ] A2. `scopeSummaryData` 改为消费 A1 的函数,删除自带的第二份判据(串行,依赖 A1)
  - [ ] A3. 单测:「同规则同值」类别——同一 fixture 下公开函数与 `ScopeSummaryData.scoringComposition` 三态一致(串行,依赖 A2)
- [ ] **B. 实体列表 data 层**(无依赖,可与 A 并行——`scoring` 投影直接读快照,不经过 A1)
  - [ ] B1. `src/report/model/types.ts`:`ExperimentListItem` 增 `scoring` / `totalScore`,`EvalListItem`、`ExperimentListEvalRow`、`AttemptListItem` 各增 `totalScore`(MetricCell 语义见 entity-lists.md 字段注释)
  - [ ] B2. `src/report/components/entity-lists/compute.ts`:三级 `computeCell(totalScore, …)` 接线 + `scoring` 定义期投影;`validate*Data` 同步收新字段(串行,依赖 B1)
  - [ ] B3. 单测:「实体列表计分制字段」类别——fixture 必须多题不同分值(区分跨题 sum 与 mean),通过制 null cell 与 `endToEndPassRate` 并存(串行,依赖 B2)
- [ ] **C. 实体列表渲染面**(依赖 B;C1/C2 可并行,同文件时改为串行)
  - [ ] C1. web 面:主列按题型构成选择、混型两列并存不适用格 `—`、默认排序规则(含混型退回 id 字典序);计分制 Eval 父行 / Attempt 子行附挣分
  - [ ] C2. text 面:与 web 同列口径(共用同一份列选择逻辑,不写第二份判据)
  - [ ] C3. i18n:`Total score / 总分` 走既有 LocalizedText 机制(可与 C1/C2 并行)
- [ ] **D. `ExperimentComparison` compose**(依赖 A1;可与 B、C 并行)
  - [ ] D1. compose 阶段 `await scoringComposition(input)`:`"points"` 时散点 `y={totalScore}`、列表预排按总分
  - [ ] D2. `"mixed"`:按题型拆两个子 Scope,散点 + `ExperimentList` 每组一份,`ScopeSummary` 整 input 一份(串行,依赖 D1)
  - [ ] D3. 单测:「主读数解析」类别——展开树中散点 spec 的 y 与预排指标引用同一 Metric 实例;mixed 展开树构成(串行,依赖 D2)
- [ ] **E. 集成与收尾**(依赖 C 与 D 全部完成,单一 worker 串行执行)
  - [ ] E1. `pnpm run build:report`(改了 `src/report/**` 必做,否则消费方读旧 dist——memory `linked-consumer-stale-dist-report`;新增导出若炸穷尽 switch 见 memory `streamevent-new-member-cascade`)→ `pnpm run typecheck` → `pnpm test`
  - [ ] E2. 公开面变了:`pnpm docs:reference` 再生成参考页区块(A1 的 TSDoc 是文案单源),`pnpm test` 漂移守护须绿
  - [ ] E3. 真机验收(见下节)后,若行为与 docs 声明有出入:**改实现对齐 docs**,docs 有真问题则回设计侧,不在 worker 侧就地改契约

## 验收

按序执行,全部通过才算完成:

1. **单测覆盖**:`docs/engineering/testing/unit/reports.md` 本次声明的三条类别(`scoringComposition` 同规则同值、实体列表计分制字段、`ExperimentComparison` 主读数解析)各有对应测试且绿;只为已声明类别写测,不越界。
2. **全量守护**:`pnpm run typecheck`、`pnpm test` 全绿(`sandbox/orphans.test.ts` 的 ps 受限环境用例为已知无关失败,不因它挡验收,也不许出现新失败)。
3. **计分制冒烟**(`.smoke-score/` 夹具,mock agent 无外部依赖):在该目录跑裸 `pnpm run niceeval -- show`——散点标题为「… × 总分」、榜单主列为「总分」且按总分降序、通过率不出现在主 KPI;`checkpoints.eval.ts` 部分完成的行呈现部分分,`aborted.eval.ts` 前置中止的行挣 0 分而非 null。
4. **真实消费方验收**(本次动机场景):`/Users/ctrdh/Code/NiceEval-Eval`(纯计分制)`pnpm exec niceeval show` 与 `view`——顶栏、散点 y 轴、实验表主列、排序四处读数一致为总分;此前「顶栏总分 6、散点与表格却是通过率」的不一致消失。link 消费前确认 E1 的 build:report 已跑。
5. **通过制回归**:`/Users/ctrdh/Code/coding-agent-memory-evals` 的 `show` 输出与改动前一致(主列仍通过率、排序不变)——改前先留存一份输出用于对照。
6. **混型形态**:在 `.smoke-score` 旁加一个通过制实验构成 mixed Scope,确认按题型并排两组、各组主读数正确、`ScopeSummary` 两个 KPI 都显示。
7. **文档一致**:实现落地后 grep 核对可观察行为(列名、排序、mixed 形态)与上列 docs 声明逐条对得上,无超出 docs 的私自行为;英文 docs-site 入口由翻译流程跟进,不在本 plan 内。
