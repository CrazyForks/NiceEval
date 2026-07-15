# 默认报告必须按实验组分区

**裁决（2026-07-15）**：`niceeval show` / `view` 的默认 `ExperimentComparison` 先按 experiment id 的完整父目录分区，再在组内计算 `GroupSummary`、成本 × 端到端成功率散点和 `ExperimentList`。`compare/*` 与 `dev-e2b/*` 不能共享坐标系、series 连线、排序、成功率、成本或比较表。顶层 experiment 没有父目录时以自己的完整 id 形成单例组，不能被丢弃。web 面默认持有完整 Selection，用组索引一次聚焦一组，切组不重新读盘；无 JS 时每组保留为独立 `<details>`。text 面命中多个组时只列组索引和单组查看命令，Selection 已是单组时才展开详情。通用 `MetricScatter` / `MetricTable` / `ExperimentList` 不隐式分区，自定义报告可以显式做跨组分析。

**被恢复的产品契约**：Experiments 一直把“文件夹 = 一组可对比实验、只有同一文件夹才互相对比”写成正式契约。旧 View 的 `GroupSelector` 也先选目录组，再把组内配置交给 `ExperimentTable`。默认首页迁入双面报告树后，`ExperimentComparison.data(selection)` 直接对整份 Selection 计算一个 scatter 和一个 `ExperimentList`，于是无关的 `compare/*`、`dev-e2b/*`、根目录实验被拍进同一张 frontier 与榜单。

**曾有的错误判断**：`visual-migration-silently-changed-computed-formulas.md` 把“所有组同时渲染”记成有意修复，因为旧 `GroupSelector` 会让根目录 experiment 永远不可见。这个判断把两个问题绑成了假二选一：不丢根目录实验，不等于必须跨组比较。最终解法是根目录 experiment 成为单例组，同时恢复目录组的可比边界。

**实现护栏**：分区必须发生在 Selection 收窄和 `current()` 现刻水位选择之后、任何指标计算之前；不能先算一张全局 scatter / summary 再按 DOM 隐藏行。回归测试至少用两个多配置组和一个根目录 experiment，断言每组 `.data()` 的 attempt refs、scatter 点、summary 与列表都不含其它组；双面渲染断言 web/text 组键同源。设计单一归属见 `docs/feature/reports/architecture.md`。
