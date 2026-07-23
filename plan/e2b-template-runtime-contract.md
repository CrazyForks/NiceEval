# E2B coding-agent 模板统一 Node 工具契约：实现 TODO

目标契约已定稿，正文见
[`docs/feature/sandbox/library/prebuilt-environments.md`](../docs/feature/sandbox/library/prebuilt-environments.md)
「E2B: TemplateBuilder 派生」与「官方 coding agent 起点」。本计划只列实现、验证与发布次序，
不复制第二份行为定义。

## 背景与当前状态

当前公共 release `v0.6.1` 继承了两套不相容的 Node 布局：

| baseline | node | 默认 npm prefix | 运行用户 `npm install -g` |
|---|---|---|---|
| Codex / Bub | `/usr/local/bin/node` | `/usr/local` | 成功 |
| Claude Code | `/usr/bin/node` | `/usr` | EACCES |

`/usr/local/bin` 在三份模板的 PATH 中，且当前实例验证可由运行用户写入。因此现阶段 Eval 使用
`npm install -g --prefix /usr/local <pkg>` 可以保持 Agent-neutral。源码 factory 已实现默认 prefix
规范化，构建脚本也已加入最终状态自检；但已发布模板不会被源码提交倒改，真实制品验证、同 tag
发布与常量切换仍未完成。

## TODO

- [x] **A. 派生配方**
  - [x] A1. 在 `src/sandbox/e2b-agent-template.ts` 用一个共同步骤包住 Claude Code / Codex / Bub
    三条 recipe；为 `user` 准备 `/usr/local/bin` 与 `/usr/local/lib/node_modules` 的写权限。
  - [x] A2. 以运行用户写 npm config，使普通 `npm install -g` 的 prefix 为 `/usr/local`。
  - [x] A3. 不改 Agent CLI 的安装选择：Claude Code 继续 native installer，Codex 继续固定 npm
    版本，Bub 继续 uv tool + marker。Node 工具契约是横切层，不是第四套 Agent 安装逻辑。

- [ ] **B. 守护**
  - [x] B1. `Template.toJSON()` 结构测试覆盖三种 Agent，证明共同 prefix / 目录准备步骤都存在。
  - [x] B2. `sandbox/e2b/build-agent-template.mts` 在 build 内以 `user` 身份验证：
    `npm config get prefix === /usr/local`、PATH 包含 `/usr/local/bin`、两个目标目录可写。
  - [ ] B3. 发布前真实启动三份构建结果，各执行一次普通 `npm install -g`，再在新的 login shell
    用 `command -v` 解析二进制。至少覆盖 pnpm；Claude Code 分支额外确认 native `claude` 未被
    npm 路径遮蔽。

- [ ] **C. 发布次序**
  - [ ] C1. 构建并发布三份同 tag 模板，记录 Template ID / Build ID 与验证结果。
  - [ ] C2. 只有三份均通过后，统一 bump `NICEEVAL_E2B_TEMPLATE_RELEASE`；不能让常量先指向
    不存在或只发布了两份的 release。
  - [ ] C3. 更新 `sandbox/e2b/published.json`、`sandbox/README.md` 与公开 Sandbox 教程，移除
    `v0.6.1` workaround，并记录新 release 的共同契约。

## 错误证据的配套边界

模板修复解决根因，不等于 renderer 能从 Eval 抛出的截断摘要里恢复字节。当前尚无独立失败命令
artifact，Eval 若只把 stderr 的 `.slice(-500)` 放进错误，读取面确实只剩这 500 字节；目标修法是
由公开 Sandbox wrapper 在完整 `CommandResult` 返回给 Eval **之前**登记非零命令的 stdout/stderr，
写进 `commands.json`，因此不受调用方随后截断摘要影响。实现按
[`plan/failed-command-evidence.md`](failed-command-evidence.md) 与
[`docs/error-feedback.md`](../docs/error-feedback.md) 的分层规则推进；不能用「TUI 摘要更聪明」
代替原始证据采集。

## 验收

1. 三份新模板内，普通用户执行 `npm install -g pnpm@10.34.5` 均成功，新的 login shell 可直接
   `command -v pnpm`。
2. 同一条安装 Eval 只换 Agent，不需要条件分支、sudo 或修改 shell rc。
3. 构建自检若发现 prefix、PATH、目录权限任一漂移，模板发布在 registry 写入前失败。
4. release 常量、published 记录、内部运维文档和公开教程指向同一组已验证制品。
