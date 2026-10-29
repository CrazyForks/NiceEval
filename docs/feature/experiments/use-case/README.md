# Experiments 用例手册

规则难懂的地方来这里按场景查。
一个目录对应一个 flag、API 组或功能主题；目录 README 只帮助选择，叶子文档一篇讲一个用户目标的完整路径。
契约单源始终在 [CLI](../cli.md)、[Library](../library.md) 与 [Runner](../../../runner.md)，用例只做搭配与叙事，不复制定义。

## Library 与配置主题

- [并发用例](并发/) —— 独立执行、共享状态、固定顺序、服务限流、严格重试与多 Invocation 协作。
- [生命周期用例](生命周期/) —— 装依赖、起服务、载入状态分别写在哪层 before。
- [实验值归属](实验值归属/) —— flags、labels 与运行时观测分别放哪里。
- [选择 Eval](选择评测/) —— `evals` 声明、tag 谓词、CLI 收窄与题型拆分。

## 位置参数(选择器)

- [选择器 + `--dry`:几十个实验里只跑要跑的,先看清计划再花钱](selection-dry-preview.md)

## 输出形态(`--json`)

- [`--json` 用例](机器输出/) —— AI 修复循环与 CI 门禁分开说明。

## 调度

- [`--budget`:一批长跑实验,给烧钱装安全网](budget-limit.md)
- [`--max-concurrency`:本地资源耗尽或 provider 限流,收并发](concurrency-max-global.md)

## 判定

- [`--early-exit`:只想知道能不能做到,不为通过率分布跑满](early-exit.md)

## 缓存

- [缓存与 Attempt 采用用例](缓存与沿用/) —— 不同改动是否作废已有 Attempt，以及何时必须主动重跑。
- [`--rerun` 用例](重新运行/) —— 只复验失败项与全量重验。

## 对比怎么计分

通过制 eval(`defineEval`)读 Verdict 的通过率；计分制 eval(`defineScoreEval`)同时读取 Verdict 与 sealed Assertions score facts 的 earned score。
两种 Eval 都保留四态 Verdict；Score Eval 另显示 complete、partial 或 unavailable。`failed + complete` 保留 earned score，但不是成功结果且不进入成功排名。
两种题型拆成两个 Experiment；一次实际选择混型会在启动前失败。
「死在哪层」「部分完成」「质量差」各有下钻读法,契约见[计分粒度](../../assertions/library/score-points.md)。

<!-- concord.use-case-index/v1:start -->
## Use Case 索引（生成）

- [`--budget`:一批长跑实验,给烧钱装安全网](budget-limit.md)
- [审阅后采用历史结果](cache-adopt-migrated-config.md)
- [指纹未变时主动重新运行](cache-explicit-rerun.md)
- [Agent 或外部服务变化后重验](cache-external-behavior-change.md)
- [修改评测源码后只重跑受影响项](cache-modify-eval-source.md)
- [修改 timeout 或 Attempt 数量](cache-modify-execution-scope.md)
- [修改非运行元数据不重跑](cache-modify-non-runtime-metadata.md)
- [修改运行条件后执行新的 Attempt](cache-modify-runtime-condition.md)
- [修改 Sandbox 起点](cache-modify-sandbox-origin.md)
- [升级 NiceEval 后沿用已有结果](cache-niceeval-upgrade.md)
- [留存每轮变化的运行时坐标](cache-retain-runtime-coordinate.md)
- [让 Eval 按固定顺序执行](concurrency-fixed-order.md)
- [独立 Eval 使用默认并发](concurrency-independent-evals.md)
- [并发下隔离每个 Sandbox 的状态](concurrency-isolate-hook-state.md)
- [`--max-concurrency`:本地资源耗尽或 provider 限流,收并发](concurrency-max-global.md)
- [只限制撞限额的 Experiment](concurrency-max-per-experiment.md)
- [快慢 Experiment 交给调度器混跑](concurrency-mix-fast-slow.md)
- [并行 Invocation 独立发布 Run](concurrency-parallel-invocations.md)
- [恢复中断运行留下的协调状态](concurrency-resume-interrupted-run.md)
- [串行保护共享状态](concurrency-serialize-shared-state.md)
- [让重复运行严格按顺序发生](concurrency-strict-retry-order.md)
- [`--early-exit`:只想知道能不能做到,不为通过率分布跑满](early-exit.md)
- [把重依赖烘进镜像](lifecycle-bake-dependencies.md)
- [配置 Sandbox 准备命令](lifecycle-configure-sandbox-prep.md)
- [用外部编排管理长生命周期资源](lifecycle-external-long-lived-resource.md)
- [启动实验级共享服务](lifecycle-shared-services.md)
- [准备任务 Fixture](lifecycle-task-fixture.md)
- [`--json`：让 coding agent 跑、查、改、复验](machine-output-ai-fix-loop.md)
- [CI 门禁:退出码、JUnit 与人读日志](machine-output-ci-gate.md)
- [用 flags 声明运行条件](observations-declare-flags.md)
- [用 labels 标注报告坐标](observations-label-report.md)
- [上报运行时观测](observations-report-runtime.md)
- [按角色区分条件与运行时观测](observations-separate-conditions.md)
- [外部条件变化后全量重验](rerun-all.md)
- [修复被测对象后只复验失败项](rerun-failures.md)
- [按路径前缀选择 Eval](selection-by-path-prefix.md)
- [按标签或运行时要求选择 Eval](selection-by-tags.md)
- [选择器 + `--dry`:几十个实验里只跑要跑的,先看清计划再花钱](selection-dry-preview.md)
- [列出已发现的 Eval](selection-list-evals.md)
- [先列出 Experiment，再选择运行范围](selection-list-experiments.md)
- [拆开通过制与计分制 Eval](selection-split-eval-kinds.md)
<!-- concord.use-case-index/v1:end -->
