---
format: concord.document/v1
id: repository-tools
title: Repository Tools
createdAt: 2026-08-23T12:48:57+08:00
createdAtSource:
  kind: first-recorded
  path: docs/engineering/repository-tools/README.md
  commit: 7871a6b3939fef8c750ce18e733603a40afa22c7
kind: engineering
---


# Repository Tools

中立治理命令直接由全局 `concord` 提供。NiceEval 的 Feature、Test、Trace、Memory 与 Feedback 使用 `concord repo` repository profile，保留现有参数、关系与 formal evidence 语义。

`@niceeval/repo-tools` 拥有 Preview、Examples、下游链接、Repository setup、PR，以及文档 generators/site/reference/diff-code/work 等 NiceEval 产品流程。NiceEval CLI 只组合这些自有流程，不转发 Concord 自身的领域命令。

当前测试关系使用源码注释，新正式证据使用 `concord.native-reliability/v1`，历史证据原样保留。

`concord.repository.json` 指向 NiceEval 自己的 E2E host。真实 candidate、Testkit、inventory 与 formal evidence 仍由 `packages/e2e-runner` 执行；Concord 原生模式的命令收据不能替代 formal evidence。CLI 与库都固定为 0.12.0；repository host 还会验证实现身份。

NiceEval 自有文档生成与站点流程从字面入口 `pnpm run repo docs` 进入。Concord 命令直接写作 `concord ...`，不保留 pnpm 别名、启动包装或额外版本检查包装。

## 安装与按需指引

全局 CLI 安装固定的 [Concord 0.12.0 Release](https://github.com/CorrectRoadH/Concord/releases/tag/v0.12.0)。根包、repo-tools 与 e2e-runner 的库依赖直接使用该 Release 的 `concord-sdlc-0.12.0.tgz` URL；仓库不存放发行 tarball，pnpm lockfile 保存其 integrity。

发行 SHA-256 为 `9908f62911d35091e70b7307286a772f2bc05942e1c3e830d6e986e7050f7556`。CI 下载后校验摘要，将包解到仓库外，用包内 lockfile 安装生产依赖，再将全局 `concord` 加入 PATH。全局 CLI 直接来自校验后解压的 Release 包。安装器若改写 JavaScript，repository host 会拒绝其实现身份，即使版本号相同。

`pnpm install --frozen-lockfile` 安装库依赖。生产代码只保留 JSON 解码、关系校验、host 与证据所需的库函数；CLI 调用直接使用 `concord`。pnpm 组合脚本内也直接写 `concord docs check`。

```sh
concord --skill
concord --skill repository
concord repo docs test --help
concord repo docs test regression refresh --help
concord repo docs test audit --json
```

`--skill` 只输出短入口，按 topic 读取具体命令，`--skill all` 才展开全文。它不加载 host 或执行 runner。
通用模式的 `init/document/test/memory/trace/recovery` 指引不改变 NiceEval 的 formal 证据门。

### 升级 Concord

升级步骤只在本节维护：

1. 从 Concord GitHub Release 取得新版本 tarball，核对发行 SHA-256，并同步安装该版本的全局 CLI；
2. 更新根包、`packages/repo-tools` 与 `packages/e2e-runner` 三处 Release URL dependency，重新生成 lockfile，并确认 integrity 对应同一发行文件；
3. 同步 CI 的固定版本 URL 与 SHA-256，按受管命令迁移 writing policy，评估新字段对实际消费者的影响；
4. 用 `concord --version`、`concord check`、repository profile 的公开命令、host identity、`pnpm lint`、`pnpm typecheck` 与 `pnpm test` 验证。`concord repo docs test audit --json` 会打包候选并执行 inventory，只在获准运行正式 E2E 的 CI job 或宿主执行。

0.12.0 的 writing policy 使用 `concord.writing/v3`；本次只迁移格式，不开启 controlled 检查。原生模式新增 stepGroups、analysis 与 `concord.native-evidence/v2`，现有 NiceEval formal host 仍消费 `concord.native-case-receipt/v1` 和 `concord.native-reliability/v1`。原生 observation 的 `observed`、存在关联或 analysis 结果都不代表 formal pass；采用步骤级证据时必须同时判断 current、complete 与 gaps。

## 组合边界

```text
pnpm run repo
  → repository root：进程、argv 交付、Layer 组装与退出码
  → docs contribution：只组合文档领域 contribution
  → explicit domain contribution：命令、options、help、JSON、receipt、errors、renderer
```

Repository root 只负责进程机制。它用 `effect/unstable/cli` 解码顶层 selector，组装 `Context.Service` 所需的 Layer，并把唯一根 Effect 交给 `@effect/platform-node` 的 `NodeRuntime.runMain`。
它把最终 renderer 的输出交给终端，不拥有文档 verb、option、help、JSON shape、receipt、错误或文本 renderer。

Docs contribution 只把显式领域挂到 `pnpm run repo docs` 下，也不解释领域输入或归一化领域结果。每个领域自行定义自己的 verbs、options、`--help`、机器结果、receipt、错误和人读 renderer；不同领域可以有不同的输入与输出形状。

没有 generic CRUD、中央 command registry、统一 receipt 或 `DocsTransaction`。需要同一份关系事实的领域复用有名字的 Trace ref/checker；需要文件、时钟、Git 或终端的领域各自在自己的 Effect 边界取得 `Context.Service`。共享机械代码进入 `internal/`，不能反过来夺走领域 owner。

## 当前命令入口

所有可运行命令与精确参数以相应的 `--help` 为准：

| 领域 | 入口 | 当前职责 |
|---|---|---|
| Feature | `concord repo docs feature --help` | 发现、显示，并通过 `create`、`page add`、`page set` 维护 Feature 结构 |
| Test | `concord repo docs test --help` | 发现与显示 E2E owner 的 Trace 投影，并通过 `case`、`regression`、`issue` 子命令维护受管关系；不是 Unit test runner |
| Use Case | `concord repo docs use-case --help` | 在既有 Feature 下创建叶子 Use Case 并维护父用例索引 |
| Trace | `concord repo docs trace recover --help` | 显式恢复中断的 relation publication |
| Design | `concord repo docs design --help` | `create`、`check`、`decide` 的候选到裁决闭环 |
| Research | `concord repo docs research --help` | `page`、`package`、`add-page` 与对精确 ref 的 `check` |
| Concepts / Writing | `concord concepts --help`、`concord writing --help` | 维护目录术语与写作政策；`concord docs check --json` 检查正文 |
| Work | `pnpm run repo docs work --help` | 准备、核对和收尾互斥的文档工作项 |
| Reference | `pnpm run repo docs reference --help` | 核对或重生成公开 API reference 区块 |
| Diff code | `pnpm run repo docs diff-code --help` | 核对或重生成接入示例前后对照页 |
| Site | `pnpm run repo docs site dev --help` | `dev`、`prepare`、`validate` 与 `links` 的 Mint owner 操作；其余 verbs 从父级 `--help` 发现 |

`pnpm test` 仍是代码测试入口，包括 Unit 验证；它不承担 Test Trace 的发现和显示。

Site 的四个操作共用 Node 24 选择逻辑。当前进程为 Node 24 时直接使用；否则依次检查
`NICEEVAL_DOCS_NODE_BIN`、Homebrew 的 Node 24、`PATH` 和 `mise where node@24`。
候选必须通过实际版本检查，选中目录只加入 Mint 子进程的 `PATH`，不修改用户 shell 或安装全局工具。
找不到 Node 24 时命令失败，并提示安装或设置显式目录。

Test inventory 的单 Repo 入口是 `concord repo docs test inventory --repo <id>`。它与全仓 `audit` 共用 E2E registry、隔离复制、candidate/Testkit 注入、安装和原生 collection，只返回当前 CLI 可消费的 Git-private `neinv_...` ID。formal evidence 与 regression 关系只接收该 ID，不接收任意 receipt 路径。

inventory 文件没有公开 format 或兼容期，也不是可编辑输入；CLI 实现变化、完整性检查失败或 ID 丢失时重新 collection。底层 runner adapter 不作为独立 CLI 暴露 `--cwd` collection。

Formal case evidence 使用同一边界：root runner 的 red 和 takeover 命令分别返回 `nered_...` 与 `netake_...`。
两者都要求 `--problem <canonical-memory-path> --problem-epoch <n>` 并绑定同一 Problem epoch。

Git-private bundle 持有 candidate bytes、native receipts 和 reliability certificate。`regression add` 和 `regression refresh` 只消费这些 ID 与 `neinv_...`。不接受任意 evidence 文件路径。实现变化或 bundle 完整性失败时重新运行 root runner，不修补 JSON 或 digest。

Feedback、Memory、PR、Examples、下游开发链接、Preview 与 Repository setup 保持各自的非 Docs 入口。准确入口是 `concord repo feedback`、`concord repo memory`、`pnpm pr:body`、`pnpm examples:sync`、`pnpm dev:link`、`pnpm preview:build`、`pnpm preview:accept` 与 `pnpm repo:setup`。`pnpm link` 是 pnpm 自带的反向链接命令，不能作为仓库脚本；构建并链接当前 candidate 使用 `pnpm dev:link <directory>`。

PR 正文入口 `pnpm pr:body` 拥有受模板约束的 Git-private 编辑状态；子命令、字段语义与发布边界见 [Pull Request skill](../../../.agents/skills/pull-request/SKILL.md) 与 `pnpm pr:body --help`。

`concord repo docs use-case create` 在显式指定的既有 Feature 下创建一个叶子 Use Case。
调用者提供单段名称、标题与完整 Markdown 正文；工具拒绝路径穿越、已有目标、正文 metadata 和生成区。
工具拥有 `use-case` frontmatter，并在同一次 Trace publication 中写入叶子和父用例索引。
缺少父 Feature 或既有用例索引时零写入失败，不隐式创建 package 或分组目录。
dry-run 与实际 publication 使用相同的输入、路径与索引校验；命令不创建测试或反向关系。

术语与写作政策由 Concord 基础 CLI 拥有：`concepts index/show/set` 管理 `docs/concepts.json`，
`writing index/show/set` 管理 `docs/concord-writing.json`。修改使用最新 owner digest，参数从各自 `--help` 发现。
Markdown 只解释关系与案例；API 示例规则由 `lint/docs/public-api-examples.json` 拥有，SVG 守护读取 Concord 的词汇裁决。

Roadmap 与 Engineering 的结构写入也使用 Concord 基础 CLI 的受管入口：

- `concord roadmap create/list/show/page/adopt`，参数见 `concord roadmap --help`；
- `concord engineering create/list/show/page`，参数见 `concord engineering --help`。

通用 Trace `check` / `move` 仍是未来目标。Feature 的结构写入只包括 `create`、`page add` 与 `page set`；Use Case 由独立领域创建。这些入口都不提供 retire、物理删除或 move，也不能以手抄模板、手动 relation 改写或假 receipt 代替。

追溯关系与各领域 mutation 的语义见[仓库文档追溯](../docs-traceability/README.md)。Design 与 Research 的闭环分别见[Design](../../design/README.md)和[Research](../../research/README.md)。

## 动态发现

维护者按任务意图逐层进入：

```text
任务意图
  → 最近的 AGENTS.md 路由
  → 对应 Skill 的触发条件与工作流
  → concord <domain> --help 或 pnpm run repo docs <NiceEval domain> --help
  → pnpm lint 验证文档与接线
```

AGENTS 只说明从哪里开始，不复制参数。Skill 保存判断顺序、安全边界和验收方式；完整参数只由领域自己的 `--help` 定义。设计页说明语义和边界，不能替代可运行 CLI 的帮助。

任何 guidance preflight 都绑定运行时读取的 AGENTS、相关 Skills 与 authority；HEAD 或这些规则在读取后变化时，下一项受影响动作之前必须重新动态发现。preflight receipt 只证明规则被呈现，不能证明理解或遵守，且不能授权绕过受管入口。

统一 lint 从当前事实检查接线，而不维护另一份 command registry：

1. 从根 package script 确认 NiceEval 自有入口；Concord 领域直接调用 `concord`；
2. 从 `.agents/skills/*/SKILL.md` 的 `command` 与 `design` frontmatter 读取多步工作流 owner；
3. 验证每个 Skill command 可运行 `--help`，且离线、只读并成功退出。只读在隔离副本中证明：lint 把当前 HEAD 的
   受跟踪文件导出到临时目录，链接现有依赖，在副本里运行全部 `--help`，再比较副本运行前后的完整内容摘要；
   共享 checkout 中其它 Agent 的并发改动不影响这项检查，副本在检查后删除；
4. 验证 design path 与 anchor 存在，且其中声明的当前入口能回到所属 domain；
5. 验证 workflow、hook 和 lint 提示只调用正式入口，不绕过到源码或退役脚本；
6. 删除或移动入口时，一并报告失效的 AGENTS 路由、Skill、design 和 workflow 调用。

单步 `pnpm lint`、`pnpm typecheck` 与 `pnpm e2e` 不需要各自建立 Skill。需要选择、会写入或包含远端副作用的工作流必须有 Skill。

## Effect 与错误边界

每个 domain handler 返回自己的结构化结果；handler 不读取 `process.argv`、写 stdout/stderr 或设置 `process.exitCode`。不可信 JSON、YAML、frontmatter、package metadata 与外部命令输出在所属 domain 边界立即用 Schema 解码。

领域错误必须具名。文件缺失、内容非法、引用冲突、锁冲突与外部命令失败不能压成一个通用字符串。写命令由各自领域提供 `--dry-run` 或 `check`，其 receipt 只描述该领域的计划或结果；`--help` 与离线 check 不访问网络、不写仓库。会 push、创建 PR、发布或修改远端状态的操作仍需要当次用户授权。

文件系统、时钟、Git、GitHub、子进程和终端输出由所需 domain 的 `Context.Service` 提供。临时目录、锁与子进程以 `Effect.acquireRelease` 或 `Effect.addFinalizer` 登记进 `Effect.scoped`；Scope 在成功、typed failure、defect 或 interruption 后都会运行 finalizer。根入口只调用一次 `@effect/platform-node` 的 `NodeRuntime.runMain`。

## 脚本与平台边界

根 `scripts/` 是迁移输入，不是长期 owner。NiceEval Docs 命令从 `pnpm run repo docs` 进入，中立文档治理使用 `concord`；不保留旧别名。`e2e/scripts/` 仍是 host-side E2E runner，入口为 `pnpm e2e`；产品 runtime 留在 `packages/niceeval`；lint adapter 留在 `lint/**`。

YAML、Netlify 配置和 hooks 只决定平台何时调用正式命令、传入哪些可信参数，以及如何保存 artifact。选择、校验、生成、重试、领域 receipt 与错误呈现都属于 domain contribution。平台文件不得复制文件列表、状态机或成功判定。

官方 Preview 的平台入口是 `pnpm preview:build`。Preview contribution 固定下游编排器，并构建当前 exact package artifact。
它通过候选包的同一 Record 导入入口验证和迁移下游的历史 portable 数据，不重跑评估或改写下游原件。
Function 的 Record、cutoff 和摘要来自同一已验证私有 generation；staging 完成前持有该 generation，并核对实际打包字节。

同一 contribution 关闭 Netlify context identity，形成发布 closure 与 build receipt。`netlify.toml` 只调用入口并声明 publish directory 与 response headers。部署后的只读验收从 `pnpm preview:accept --input <file>` 进入，不把 Netlify token 或 GitHub token 交给领域命令。

PR 的文档与源码审阅由 [Concord 变更预览](concord-preview.md)提供。Preview contribution 取得实际目标分支与提交身份，将只读页面纳入同一发布目录；产品页读取 Record，差异页读取 Git 提交。

## 验收

Repository Tools 不建立独立测试 project，也不签入用于复述实现的 fake。行为验收直接运行正式入口：只读命令核对退出码与该领域 receipt；写命令在临时目录或获准隔离消费仓库核对精确 Git diff、锁释放和子进程终止。

`pnpm lint` 只守 AGENTS、Skill、design、script、owner 与 workflow 接线，不复制领域状态机。每个写领域都要证明 `--help` 可运行、check / dry-run 与写入复用同一领域实现、旧调用方已经迁移、失败给出具名下一步，且取消后没有锁、临时目录或子进程残留。涉及 TypeScript、下游或平台时，再运行相应 owner 的定点验收。
