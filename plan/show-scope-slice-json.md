# show 范围 × 切片 × 形态 + Usage 诚实化 + facts 通道:实现 TODO

契约已定稿,**一律以 docs 为准,本 plan 只列落点不复述契约**:

- 三轴模型、缺省切片选择、范围/互斥规则:`docs/feature/reports/show.md`
- 对照矩阵:`docs/feature/reports/show/compare.md`
- 稳定性矩阵:`docs/feature/reports/show/stats.md`
- `--usage` 与 usage 行组装口径:`docs/feature/reports/show/usage.md`
- `--json` 信封与逐视图形状:`docs/feature/reports/show/json.md`
- execution 卡片预算、`--expand` 句柄、范围化与 `--grep`:`docs/feature/reports/show/execution.md`
- 诊断首页 `usage:` / `facts:` 行:`docs/feature/reports/show/attempt.md`
- `Usage` 落盘形状、`facts` 字段(AttemptRecord / SnapshotMeta)与三通道语义:`docs/feature/results/architecture.md#usage`、`#facts运行事实`
- `ctx.fact` 三处上下文声明:`docs/feature/sandbox/library.md`、`docs/feature/experiments/architecture.md`、`docs/feature/adapters/architecture/agent-contract.md`
- 测试覆盖类别:`docs/engineering/testing/unit/reports.md`(show 范围×切片、usage 组装与 facts 投影、execution 预算/句柄/grep、--json 投影)、`docs/engineering/testing/unit/results.md`(Usage 与 facts 落盘)
- 设计背景与实测代价数据:`memory/show-scope-slice-json-ruling.md`

背景:这套设计来自一次真实的 benchmark 归因(MemoryBench 三条件对照)——93 次 show 调用 + 两段解析脚本才拼出一张对照表,证据覆盖已近乎完备,缺的是输出契约与调用正交性。验收标准同源:「search/保存到没到位」「A 条件哪里好」「为什么空库」三类问题各 ≤2 条命令终结。

## TODO

- [ ] **A. Results 层**(无依赖,先行)
  - [ ] A1. `Usage` 形状对齐 `src/types.ts`:字段按契约命名,`requests` 只在协议真实提供时写入——排查各 adapter 当前是否写死 `requests: 1`,是则删(bug,对应 usage 失真现象)
  - [ ] A2. `AttemptRecord.facts` / `SnapshotMeta.facts` 落盘与读取面(`src/results/`):writer 收集、快照封口补写 experiment 级、reader 原样读回;key 词法校验与非标量报错
  - [ ] A3. `ctx.fact()` 贯通:sandbox hook ctx、experiment hook ctx、`AgentContext`(`src/context/`、`src/runner/`),runner 按当前作用域自动归属
  - [ ] A4. 非零 Sandbox 命令证据(`commands.json` / `hasCommands`)按
    `plan/failed-command-evidence.md` 落盘并接入 Results reader/copy
- [ ] **B. show 选择层:切片接受范围**(依赖 A 的读取面,不依赖 A3)
  - [ ] B1. `src/cli.ts` + `src/report/` show 宿主:范围解析统一(locator = 单元素范围),`--source/--execution/--timing/--usage/--diff` 走同一条范围通路,多 attempt 分节输出
  - [ ] B2. 重复 `--exp` 的条件解析与互斥校验(恰好一个 experiment、`@locator` 冲突、`--grep`/`--expand` 的组合校验),错误文案按 `docs/error-feedback.md` 三段式
- [ ] **C. 新切片与视图**(依赖 B)
  - [ ] C1. 对照矩阵(缺省切片 × 重复 `--exp`):按 eval id 配对、逐行原始 Δ、共同题 paired delta、各条件自身汇总、占位与时效标注；覆盖不同时不得用各自总计直接归因，混型按通过制 / 计分制子集分段
  - [ ] C1b. `--stats` 稳定性矩阵:history 同源证据面聚合、✗/! 分列、neverPassed 排序(起因见 MemoryBench 题目质量审查:零通过题与 provider 限流误判)
  - [ ] C2. `--usage` 表 + usage 行组装口径重写(attempt 首页同步换新形态,`facts:` 行)
  - [ ] C3. execution:卡片 8 KiB 预览预算、`t<N>.c<M>` / `cmd<N>` 句柄派生、失败 Sandbox 命令按 timing node 合流、`--expand`、`--grep` 与命中汇总
- [ ] **D. `--json` 形态**(依赖 B/C)
  - [ ] D1. envelope + 逐视图 data 投影；JSON 与 text 选择同一批实体、共有派生字段同值，但作为数据超集可保留 text 省略的字段；compare 同时投影各条件 totals 与共同题 pairedDelta；timing JSON 恒全树；stdout 单文档、警告走 stderr
- [ ] **E. 单测**(依赖各自节点;只为已声明类别写测,测试名可指认类别)
- [ ] **F. 同步义务**
  - [ ] F1. `src/cli.ts` `FLAG_OPTIONS` 新 flag(`--usage`/`--json`/`--grep`/`--expand`/`--stats`)JSDoc → `pnpm docs:reference`;核对 `src/i18n/` 两份 `--help` 速查
  - [ ] F2. docs-site:`docs-site/zh/tutorials/viewing-results.mdx` 与 `agent-feedback-loop.mdx` 增补对照矩阵 / `--json` / `--grep` 任务路径(中文先定稿,英文入口核对后同步);`docs:validate` + `docs:links`(Node 22)
  - [ ] F3. 改 `src/report/**` 后 `pnpm run build:report`(linked 消费项目才能看到,见 memory 台账)
- [ ] **G. 验证**
  - [ ] G1. `pnpm run typecheck` → `pnpm test` 全绿
  - [ ] G2. 真机:在 `/Users/ctrdh/Code/MemoryBench` 用 `pnpm exec niceeval show` 复演三个验收问题,输出与 docs 各分篇示例形态一致

## 验收

1. MemoryBench 真机上:「search/保存到没到位」= 1 次 `--execution --grep`;「两条件哪里差」= 1 次多 `--exp` 矩阵;「起步库状态」= 榜单/矩阵 facts 行直读(需 A3 后 harness 侧补 `ctx.fact`)。
2. 任意视图 `--json | jq` 可直接消费：与 text 面选择同一批实体、共有派生字段同值，并保留机器归因所需的数据超集；无脚本解析人类排版的残留必要。
3. `usage` 行不再出现凑数 `requests: 1`;缺字段显示为省略,不显示 0。
