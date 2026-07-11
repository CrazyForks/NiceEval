# 设计裁决:落盘单位改为快照,判决落 attempt 级 result.json(schemaVersion 4)

**裁决**(2026-07-11,用户拍板):废除 run 级 `summary.json`;落盘布局改为实验目录在外层(`.niceeval/<experiment>/<timestamp>-<rand>/snapshot.json + <evalId>/aN/result.json`);判决/断言的权威落点是 attempt 级 `result.json`(完成即写、一次写成),`snapshot.json` 只装快照级元数据(开始时写,收尾补 `completedAt`);快照目录独占创建保证唯一性。跨实验聚合(总计数/总成本)不落盘,归消费方。`createRunWriter` 改名 `createResultsWriter`,`RunDir`/`runDirs`/synthetic 合成键/`AttemptRef {run, result}` 随之消亡。

**曾选方案与否决理由**:

- *run 级 summary.json 聚合*(schemaVersion ≤3 现状):读取器拿到后第一步就是按 experiment 切碎(`sliceSnapshots`),领域模型里没有 run 的位置;顶层 agent/model 对多实验 run 是错的(第一个配置的值);`snapshots` 元数据字段本身就是「快照级数据被压进 run 级文件」的补丁;并发进程竞争同一聚合文件酿成真实数据丢失(见 [[parallel-runs-same-ms-summary-clobber]])。
- *只修唯一性(目录加后缀/独占 mkdir),保留 run 级 summary*:治并发覆盖,不治 crash 丢判决与领域模型错位;写→合→拆的损耗仍在。
- *保留 run 目录、里面每实验一份 json*:目录唯一性仍要修,attempt 路径仍要 agent/model/experiment 三段消歧;实验目录在外层则目录树 1:1 映射 Experiment→Snapshot,不同实验的并行进程天然零共享。
- *「判决 journal 不做」*(2026-07-10 旧裁决,原文曾在 docs/results-lib.md「读」一节:恢复成立的前提是 writer 增量落一份判定 journal——那是 Results Format 级的新落盘物,代价大于收益)——**本次翻案**:并行覆盖事故证明「判决只活在收尾聚合里」是真实数据丢失的单点,不是理论洁癖;且落点不是额外 journal,而是把判决放进 attempt 自己的记录文件,与「attempt artifact 完成即写」同构,没有第二套写入路径。`skipped("incomplete")` 从数据黑洞收窄为「快照目录建好、元数据没写完的极小窗口」;进程中断的常态变成可正常读取的未收尾快照(缺 completedAt,`latest()` 出 `unfinished-snapshot` 警告)。

**代价与接受理由**:读侧扫描从每 run 一个文件变成每 attempt 一个文件,本地规模(几百 attempt)无感;旧落盘(≤3)按既有不兼容策略提示 npx 旧版查看,不迁移;旧版本 CLI 看新落盘会误报 incomplete(旧读取器找不到 summary.json),beta 阶段接受。

定稿契约:docs/results-format.md、docs/results-lib.md。
