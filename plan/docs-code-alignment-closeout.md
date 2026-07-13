# Plan：docs ↔ code alignment 收口

> 本计划只处理 `plan/docs-code-alignment-todo.md` 落地后仍未闭环、或完成口径互相矛盾的部分。2026-07-13 用户追加裁决：裸 show 以 `docs/feature/reports/show.md` 的同构 attempt 表为准；下文原先“保持嵌套卡片”的要求已被该裁决取代。
> 执行时不得以“已有 commit”“单测通过”或“命令能运行”代替下面逐项验收；所有要求与验收均须逐项勾选。

## 完成定义

- [x] A 的契约矛盾已消除：报告实体列表仍是嵌套卡片；裸 `niceeval show` 是独立的同构 attempt 表，两者不再混为同一组件。
- [ ] A 的真实消费项目冒烟已完成：本地链接来源已证明，自定义中文 `<Table>` 报告在终端中按显示宽度对齐。
- [ ] B 的 Claude Code / Codex 安装路径已在真实 sandbox 中验证，或以可复现的失败证据形成明确实现修复并复验通过。
- [ ] 原 TODO 已标注每一项的最终状态，不再让“代码提交了”和“验收完成了”混为一谈。
- [ ] 全仓验证通过，且没有覆盖、格式化或提交用户及其他 agent 的无关改动。

## 0. 执行前基线

### 要求

- [ ] 阅读 `docs/README.md`，只沿索引加载本计划涉及的 Reports、Adapters、Results 契约。
- [ ] 阅读 `memory/INDEX.md`，再读取命中的 `npx-skills-add-headless-hang.md` 与 `codex-no-native-skill-tool.md` 正文。
- [ ] 在 `niceeval` 与 `/Users/ctrdh/Code/coding-agent-memory-evals` 分别记录 `git status --short`；未知改动全部视为用户或其他 agent 所有。
- [ ] 确认消费项目的 `node_modules/niceeval` 实际解析目标，不得仅凭 `package.json` 版本号判断运行来源。
- [ ] 确认 `node_modules/.bin/niceeval` 最终执行的是同一目标下的 `bin/niceeval.js`。
- [ ] 记录 `niceeval/package.json` 版本与消费项目依赖范围不一致的事实；本计划不授权为此修改版本或发布。

### 验收

- [ ] `readlink node_modules/niceeval` 的规范化路径为 `/Users/ctrdh/Code/niceeval`。
- [ ] `node -p "require('./node_modules/niceeval/package.json').version"` 的结果已记录，但没有被误用为源码新旧的判断依据。
- [ ] 两个仓库的基线状态已保存到执行记录，后续 diff 能区分本次改动与既有改动。

## 1. 收口 A 的契约矛盾

### 固定裁决

- [ ] 将 `MetricTable`、`MetricMatrix`、`Scoreboard`、`DeltaTable` 定义为表状组件；它们的 text 面必须走共享 `renderTableText` / `<Table>` 机制。
- [ ] 将 `ExperimentList`、`EvalList`、`AttemptList` 定义为层级化实体卡片；它们不是表，不要求为了满足数量而强塞进 `<Table>`。
- [x] 裸 `niceeval show` 按后续裁决输出 `STATUS / EVAL / ATTEMPT / RESULT / DURATION / COST` 平铺表格。
- [x] `src/show/show.test.ts` 已改为保护四态标签、短失败原因、纯 locator、单实验无比较空态及窄终端截断。
- [x] 层级信息与完整 evidence 留在 `niceeval show @<locator>` 首页；默认索引不再打印 capability 缩写。

### 文档修改要求

- [ ] 修改 `plan/docs-code-alignment-todo.md` 中“六个表状组件”的错误表述，列出四个真正的表状组件。
- [ ] 在原 TODO 中明确说明三个实体列表保留卡片形态的原因：它们表达层级、展开与证据详情，不是规则二维表。
- [ ] 将原 TODO 的 A 阶段拆成“实现完成”和“真实冒烟完成”两个可独立判断的状态。
- [ ] 检查 Reports 的目标契约与公开文档，不得仍宣称三个实体列表通过 `<Table>` 构造。
- [ ] 不把目标文档降格成“当前代码说明”；只修正已经裁决为错误或自相矛盾的表述。

### 代码核对要求

- [ ] 用静态引用证明四个表状组件最终进入 `renderTableText`。
- [ ] 用静态引用证明三个实体列表仍走各自的 card renderer，且这是文档允许的目标形态。
- [ ] 核对 `niceeval/report` 确实公开导出 `Table`、`TableProps`、`stringWidth`、`padEnd`、`padStart`、`wrapText`、`indent`、`bar`、`columns`。
- [ ] 核对 `<Table>` 两面共享 `null -> —`、locator 下钻、按显示宽度对齐与超宽降级契约。

### 验收

- [ ] `rg` 不再命中“六个表状组件”或要求三个实体列表改走 `<Table>` 的有效契约文字。
- [ ] 四个表状组件均有覆盖共享 table renderer 的测试。
- [ ] 三个实体列表的测试明确保护层级卡片输出，而不是把未迁移当成遗漏。
- [x] `pnpm exec niceeval show` 的输出符合 `docs/feature/reports/show.md`，不再以旧基线不变作为通过条件。

## 2. A 的中文 `<Table>` 真实冒烟

### 唯一执行路径

本节不让执行者自行选择文件名或 API。长期 fixture 固定写在消费项目：

- 工作目录：`/Users/ctrdh/Code/coding-agent-memory-evals`
- 报告文件：`reports/alignment-table-smoke.tsx`
- 输出记录：`tmp/alignment-table-smoke.txt`（若 `tmp/` 已有用户文件，只新增这一文件）

报告文件固定使用以下形状；`locator` 从当前结果里选一个真实值替换示例值：

```tsx
import { defineReport, Table } from "niceeval/report";

export default defineReport(async ({ selection }) => {
  const locator = selection.snapshots.flatMap((s) => s.attempts)[0]?.locator;
  return (
    <Table
      columns={[
        { key: "name", header: "任务" },
        { key: "kind", header: "KIND" },
        { key: "score", header: "SCORE", align: "right" },
        { key: "missing", header: "MISSING" },
      ]}
      rows={[
        { key: "zh", cells: { name: "中文任务", kind: "cjk", score: "7", missing: null }, locator },
        { key: "en", cells: { name: "ascii", kind: "latin", score: "123", missing: "present" } },
      ]}
    />
  );
});
```

`TableRow.locator` 的类型不接受 `undefined`。实际写 fixture 时必须使用条件展开：

```tsx
{ key: "zh", cells: { /* ... */ }, ...(locator ? { locator } : {}) }
```

不得用 `as`、`any` 或 `!` 绕过这个边界。

### Fixture 要求

- [ ] 在 `/Users/ctrdh/Code/coding-agent-memory-evals` 创建最小自定义 report fixture，使用 `niceeval/report` 导出的 `<Table>`，不得直接 import `src/` 内部模块。
- [ ] fixture 至少包含一列中文值、一列 ASCII 值、一列右对齐数字和一个 `null` 单元格。
- [ ] 中文值必须选择 `.length` 与终端显示宽度不同的内容，例如 `中文任务`，以真正覆盖 CJK 回归。
- [ ] 至少一行带真实 attempt locator，验证 text 面生成可执行的证据室命令。
- [ ] fixture 必须使用消费项目当前结果数据或最小确定性数据，不得依赖修改 niceeval 源码内测试才能运行。
- [ ] 明确 fixture 是临时验收文件还是仓库长期示例；临时文件验收后只可删除本次新建文件，禁止用清理命令影响其他未提交文件。

### 执行要求

- [ ] 在消费项目执行 `readlink node_modules/niceeval`；预期输出 `../../niceeval`，再执行 `realpath node_modules/niceeval`；预期输出 `/Users/ctrdh/Code/niceeval`。
- [x] 执行 `pnpm exec niceeval show`；退出码 `0`，输出包含 `dev-e2b/codex-e2b`、`SUMMARY` 与 attempt 表，且不含单实验 scatter 空态。
- [ ] 执行 `pnpm exec niceeval show --report reports/alignment-table-smoke.tsx | tee tmp/alignment-table-smoke.txt`；预期退出码 `0`，首行包含 `任务`、`KIND`、`SCORE`、`MISSING`。
- [ ] 执行 `COLUMNS=48 pnpm exec niceeval show --report reports/alignment-table-smoke.tsx | tee tmp/alignment-table-smoke-narrow.txt`；如果当前 CLI 不读取 `COLUMNS`，改用 `script`/PTY 把终端宽度设为 48，并在执行记录中写明实际方法，不得把未触发窄宽分支标成通过。
- [ ] 保存上述三个原始纯文本输出；不得只贴终端截图，因为空格对齐需要可检查文本。
- [ ] 执行 `pnpm run typecheck`；预期退出码 `0`，证明消费项目使用公开类型可以编译 fixture。
- [ ] 若命令失败，先证明加载的是哪个 report 文件和哪个 niceeval 包入口，再判断实现问题。

### 验收

- [ ] 中文列的后续列起始位置按 `stringWidth` 计算一致，不按 JavaScript `.length` 假对齐。
- [ ] 数字列右对齐。
- [ ] `null` 显示为 `—`，没有被补成 `0`、空字符串或 `undefined`。
- [ ] 带 locator 的行显示可执行的 `niceeval show @...` 下钻信息。
- [ ] 窄宽度输出符合“优先压文本列，必要时截断并报告剩余”的契约。
- [x] 裸 `show` 使用专用 attempt 表；自定义 `--report` 继续使用双面报告组件，两条路径差异已在目标文档中解释。

### 输出的机械检查

- [ ] 执行 `node -e 'const s="中文任务"; console.log(s.length)'`；预期输出 `4`，并在记录里注明其终端显示宽度是 `8`，本用例确实能抓住 `.length` 假对齐。
- [ ] 检查常规宽度输出中两条数据行的 `KIND` 起始显示列相同；不能仅凭肉眼说“看起来齐”。可用 `niceeval/report` 的 `stringWidth` 写一个临时只读检查，断言表头与每行分隔后的列起点一致。
- [ ] 检查 `score=7` 前有两个显示列空格、`score=123` 前没有空格，证明 SCORE 按最宽值右对齐。
- [ ] 检查第一行 MISSING 为 `—`。
- [ ] 检查存在真实 locator 时，输出含该 `@...`；随后执行 `pnpm exec niceeval show @<该值>`，预期退出码 `0` 且打开同一 attempt。

## 3. B 的真实 sandbox 验证

### 3.1 Claude Code repo Skill：固定现成 fixture

本验收复用已有 E2E，不另造临时项目：

- 仓库根：`/Users/ctrdh/Code/niceeval`
- E2E 项目：`e2e/projects/claude-code`
- agent config：`e2e/projects/claude-code/agents/claude-code-features.ts`
- experiment：`e2e/projects/claude-code/experiments/features.ts`
- eval：`e2e/projects/claude-code/evals/feature-skill-used.eval.ts`
- 共享断言正文：`e2e/shared/evals.ts` 的 `skillUsed()`
- sandbox 安装路径：相对 workdir 的 `.claude/skills/effect-ts/SKILL.md`
- sandbox manifest：相对 workdir 的 `__niceeval__/agent-setup.json`
- attempt artifact：`.niceeval/features/<snapshot>/feature-skill-used/a<n>/agent-setup.json`；若 experiment id 被规范化，以本次 `snapshot.json.experimentId` 为准，不猜目录名。

当前 Skill repo 固定到 commit `b5026c68318f395bbfd258182ea6b524ff2be549`。执行前必须再次运行：

```sh
git ls-remote https://github.com/Effect-TS/skills.git HEAD
```

HEAD 漂移不影响本次验收：fixture 仍使用上面的 commit，除非单独审阅并更新固定值。必须把 agent config 改为：

```ts
skills: [{
  kind: "repo",
  source: "Effect-TS/skills",
  ref: "b5026c68318f395bbfd258182ea6b524ff2be549",
}],
```

这是可重复性修复，不允许继续省略 `ref`。

#### 前置检查

- [ ] 在仓库根执行 `docker info >/dev/null`；预期退出码 `0`。失败则状态是“环境阻塞”，不是代码失败或验收通过。
- [ ] 执行 `test -f e2e/projects/claude-code/.env`；预期退出码 `0`。
- [ ] 执行 `set -a; source e2e/projects/claude-code/.env; set +a; test -n "$ANTHROPIC_API_KEY" && test -n "$ANTHROPIC_BASE_URL"`；预期退出码 `0`，不得打印变量值。
- [ ] 若 `feature-skill-used` 保留 judge 断言，同样检查 `NICEEVAL_JUDGE_KEY` 与 `NICEEVAL_JUDGE_BASE` 非空，不打印值。
- [ ] 执行 `pnpm install --dir e2e --frozen-lockfile`；预期退出码 `0`，`e2e/node_modules/niceeval` 解析到仓库根。

#### 单条黑盒执行

从仓库根执行，不走整个 `verify.mjs` 矩阵：

```sh
cd /Users/ctrdh/Code/niceeval/e2e/projects/claude-code
node ../../../bin/niceeval.js exp features feature-skill-used --force
```

- [ ] 预期命令在 `600000ms` 项目 timeout 内退出，不出现等待 TTY 的无限挂起。
- [ ] 预期退出码 `0`，终端摘要中 `feature-skill-used` 为 passed。
- [ ] 若模型行为断言抖动导致 failed，但 setup 已成功，必须分别记录“安装验证通过、行为验证失败”，不得混成安装失败；最终全链路验收仍保持未通过。
- [ ] 本路径不得出现 `npx skills add`。当前实现的正确路径是 `git clone -> git checkout <ref> -> cp -R`；从日志或代码静态核对证明这一点。

#### artifact 机械验收

在 `e2e/projects/claude-code` 执行：

```sh
find .niceeval -path '*/feature-skill-used/a*/agent-setup.json' -print
```

取本次最新文件为 `$MANIFEST` 后执行：

```sh
node -e '
const fs=require("node:fs");
const m=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));
if (m.skills?.length !== 1) process.exit(1);
const s=m.skills[0];
if (s.kind !== "repo" || s.source !== "Effect-TS/skills") process.exit(2);
if (s.ref !== "b5026c68318f395bbfd258182ea6b524ff2be549") process.exit(3);
if (JSON.stringify(s.skills) !== JSON.stringify(["effect-ts"])) process.exit(4);
' "$MANIFEST"
```

- [ ] 预期退出码 `0`。
- [ ] 同目录 `result.json` 存在，且执行 `node -e 'const r=require(process.argv[1]); if ("agentSetup" in r) process.exit(1)' "$(dirname "$MANIFEST")/result.json"` 退出码为 `0`，证明 manifest 是 artifact、没有内联进判决。
- [ ] 用 `openResults()` 找到 locator 对应的 AttemptHandle 并执行 `await attempt.agentSetup()`；预期深等于 `$MANIFEST` JSON，而不是只验证文件存在。建议将该检查落成 `e2e/scripts/verify-agent-setup.mts`，参数为项目结果根和 locator，供 Claude/Codex 共用。

#### sandbox 内路径验收为何可信

- [ ] `feature-skill-used` 在 agent send 前读取 `__niceeval__/agent-setup.json` 并断言含 `effect-ts`，证明该文件存在于真实容器而非事后宿主伪造。
- [ ] Claude Code 的行为断言 `calledTool("Skill", { input: { skill: "effect-ts" } })` 通过，证明 `.claude/skills/effect-ts/SKILL.md` 被 Claude 原生发现和使用。
- [ ] 若还要直接断言文件路径，给 `skillUsed()` 增加 `await t.sandbox.readFile(".claude/skills/effect-ts/SKILL.md")` 并检查非空；该断言必须在 `t.send()` 前执行，失败应归因 setup。

### 3.2 Claude Code local Skill：固定 fixture

- [ ] 新增 `e2e/fixtures/skills/local-smoke/SKILL.md`，内容包含唯一标记 `niceeval-local-skill-smoke-v1`。
- [ ] 新增 `e2e/projects/claude-code/agents/claude-code-local-skill.ts`，配置仅包含 `skills: [{ kind: "local", path: "../../fixtures/skills/local-smoke" }]`；路径按 CLI cwd `e2e/projects/claude-code` 解析，执行前用 `realpath ../../fixtures/skills/local-smoke` 验证确实命中 `e2e/fixtures/skills/local-smoke`。
- [ ] 新增独立 experiment `e2e/projects/claude-code/experiments/local-skill.ts`，只选一个专用 eval，`runs: 1`，避免复用 features 的 MCP 与 judge 成本。
- [ ] 专用 eval 在 send 前读取 `.claude/skills/local-smoke/SKILL.md`，预期包含唯一标记；再读取 `__niceeval__/agent-setup.json`，预期第一项为 `{ kind: "local", name: "local-smoke", path: "../../fixtures/skills/local-smoke", sha256: <64位小写十六进制> }`。
- [ ] 从 `e2e/projects/claude-code` 执行 `node ../../../bin/niceeval.js exp local-skill --force`；预期退出码 `0`。
- [ ] 修改 fixture 内容一个字节后复跑，预期 manifest 的 `sha256` 改变；还原该字节并复跑，预期恢复原 hash。只用 `apply_patch` 修改 fixture，不用 shell 写文件。

### 3.3 Codex repo Skill：镜像执行

路径与 Claude 对称，但安装目录和行为信号不同：

- agent config：`e2e/projects/codex/agents/codex-features.ts`
- 命令工作目录：`/Users/ctrdh/Code/niceeval/e2e/projects/codex`
- 命令：`node ../../../bin/niceeval.js exp features feature-skill-used --force`
- sandbox Skill：`.agents/skills/effect-ts/SKILL.md`
- sandbox 发现指引：workdir 下 `AGENTS.md` 必须包含 `.agents/skills` 与 `effect-ts`
- artifact：`.niceeval/features/<snapshot>/feature-skill-used/a<n>/agent-setup.json`

- [ ] 把 Codex fixture 同样固定到 commit `b5026c68318f395bbfd258182ea6b524ff2be549`。
- [ ] 检查 Docker、`CODEX_API_KEY`、`CODEX_BASE_URL` 和 judge env，只检查非空不打印值。
- [ ] 执行单条命令，预期退出码 `0`，不跑无关 MCP eval。
- [ ] 在 eval 的 send 前直接读取 `.agents/skills/effect-ts/SKILL.md` 和 `AGENTS.md`；预期前者非空，后者包含发现指引。
- [ ] 行为验收使用已存在的 completed shell tool 断言，command 命中 `.agents/skills/effect-ts`；不得期待不存在的 Codex 原生 Skill tool。
- [ ] 用与 Claude 相同的 manifest Node 检查和 `AttemptHandle.agentSetup()` 检查，预期 JSON 仅在 agent 行为路径上不同，repo Skill 记录完全一致。

### 测试矩阵要求

- [ ] 为 Claude Code 建立最小矩阵：本地 Skill、repo Skill（含 `ref`）、选择多 Skill 仓库中的指定 Skill、native plugin。
- [ ] 为 Codex 建立最小矩阵：本地 Skill、repo Skill（含 `ref`）、选择多 Skill 仓库中的指定 Skill、native plugin。
- [ ] Bub 只验证其允许的 `PythonPluginSpec` 路径；不得把 MCP 或其他 agent 的 plugin 类型塞给 Bub。
- [ ] 每个矩阵项明确预期安装命令、安装目录、生成的 `agent-setup.json` 内容以及读回结果。
- [ ] 外部 repo/ref 必须固定到可重复的版本；不得用会漂移的默认分支作为成功证据。

### 安全与可重复性要求

- [ ] Claude Code 的 `npx skills add` 使用已裁决的非交互参数，禁止依赖 TTY 提示。
- [ ] 每个外部命令都有超时或 sandbox 生命周期上限，避免 headless 安装永久挂起。
- [ ] 日志不得泄露 API key、token 或宿主机凭据。
- [ ] 安装验证只改变测试 sandbox 与对应 attempt artifact，不写宿主机全局 Claude/Codex 配置。
- [ ] 若真实 provider 因凭据、额度或服务不可用而无法测试，记录具体命令、退出状态和阻塞条件；不得把单测通过标成真机通过。

### 行为验收

- [ ] Claude Code 的 Skill 安装全程无交互、命令正常退出，且目标文件实际存在。
- [ ] Codex 的 Skill 安装文件实际存在；同时明确“安装成功”不等于 Codex 原生支持 skill tool，不伪造能力结论。
- [ ] Claude Code 与 Codex 的 native plugin 均按各自契约安装，没有引入统一 `PluginSpec`。
- [ ] `agent-setup.json` 从 sandbox 内约定位置提升为 attempt artifact。
- [ ] Results 懒加载能从 attempt artifact 读回 `agent-setup.json`，内容与实际安装结果一致。
- [ ] 安装部分失败时，artifact 如实记录成功项与失败项；不得把部分成功汇总为全部成功。
- [ ] 相同 fixture 至少复跑一次，结果不依赖首次残留缓存。

### 回归验收

- [ ] 类型测试证明 Claude Code、Codex、Bub 只能接收各自合法的配置组合。
- [ ] 单元测试覆盖命令构造、路径提升、artifact 写入和懒加载。
- [ ] 至少一次真实 sandbox 成功记录与对应 attempt locator 被写入执行记录。

## 4. 原 TODO 状态回填

### 要求

- [ ] 在 `plan/docs-code-alignment-todo.md` 顶部增加状态区，分别列出 A、B、C，不用一句“全部完成”概括。
- [ ] A 状态分别记录：文档、`<Table>` 实现、官方四个表状组件迁移、默认 show 回归、中文自定义报告真机冒烟。
- [ ] B 状态分别记录：类型/实现、单元测试、Claude Code 真机、Codex 真机、artifact 读回。
- [ ] C 状态记录：死链修复、守护测试与全仓扫描结果。
- [ ] 每个已完成项附可核验的 commit、测试名或执行记录；未完成项保持 `- [ ]`。
- [ ] 不删除原 TODO，直到所有完成定义均已勾选；收口后可保留为历史记录并标注完成日期。

### 验收

- [ ] 新读者只看状态区即可判断哪些是代码完成、哪些是真机完成、哪些仍未完成。
- [ ] 状态区不存在“已有 commit 所以完成”这类不可验证判断。
- [ ] 本计划和原 TODO 对 A 的组件分类、默认 show 形态与 B 的真机状态说法一致。

## 5. 全仓最终验证

### 自动验证

- [ ] 在 `/Users/ctrdh/Code/niceeval` 运行 `pnpm run typecheck`。
- [ ] 在 `/Users/ctrdh/Code/niceeval` 运行 `pnpm test`。
- [ ] 在 `/Users/ctrdh/Code/niceeval` 运行 `pnpm docs:reference`，并检查生成 diff 只包含预期内容。
- [ ] 使用 Node 22 运行 `pnpm docs:validate`。
- [ ] 使用 Node 22 运行 `pnpm docs:links`。
- [ ] 在 `/Users/ctrdh/Code/coding-agent-memory-evals` 运行其 `pnpm run typecheck`。
- [ ] 复跑裸 `pnpm exec niceeval show` 与中文 `--report` 命令。

### Git 与交付验收

- [ ] 最终检查两个仓库的 `git status --short`、未暂存 diff 与已暂存 diff。
- [ ] 本次修改没有覆盖或顺手格式化任何基线中的未知改动。
- [ ] 如需提交，直接在 `main` 上用显式路径提交；不得创建 feature branch，不得把并发暂存内容带入 commit。
- [ ] commit message 说明行为与原因，区分契约收口、实现修复和真实验证记录。
- [ ] 最终交付逐项报告本计划仍未勾选的条目；只要有一项未完成，就不得宣称整个 alignment TODO 已完成。
