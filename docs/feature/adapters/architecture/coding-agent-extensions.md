# Coding Agent 扩展边界

Skills、MCP servers 和原生 Plugins 在 Agent setup 阶段安装。core 只保存安装 manifest，不理解每个 Agent 的配置目录、Marketplace 或包管理器。

## 类型边界

`SkillSpec` 只统一 Skill 来源：本地路径或带可选 ref/选择列表的仓库。安装位置和发现机制由 Adapter 决定。

MCP 使用共享 `McpServer` 形状，因为 Claude Code 与 Codex 都能表达 command、args 和 env；Bub 没有该构造字段。

Native Plugin 不统一：Claude Code 和 Codex 使用各自的 PluginSpec，Bub 使用 PythonPluginSpec。一个 Agent 不支持的扩展类型不出现在其 config 上。

原生设置是 Sandbox coding-agent Adapter 契约的标准组成：被测 CLI 有原生配置文件，factory 就提供 `settings` 字段；没有的（如 Bub）config 上没有这个字段。`settings` 的形状不跨 Agent 统一——各 Agent 用自己的配置词汇（Claude Code 是 settings.json 的 JSON 对象，Codex 是 config.toml 的 TOML 形状对象）。core 不定义设置词汇，也不为单个行为需求铸语义字段：新需求先看 CLI 原生配置能不能表达，能表达就天然被 `settings` 覆盖，不能表达的去上游提，不在 niceeval 造中间层。

序列化是无损的语法载体转换，不解释键的语义。落位正确性由 Adapter 负责——TOML 顶层键写在所有表之前，`settings` 作者不需要知道配置文件的段落顺序。保留键规则对所有 Adapter 是同一套：由 experiment 与 Adapter 写入主配置的键（模型、鉴权、OTel 导出、MCP 表）出现在 `settings` 里时，setup 立刻报错并点名冲突键，不做静默合并或后写覆盖——冲突拖到 CLI 读配置时才暴露就丢了归因。逐 Agent 的保留键清单在各自的 SDK 页。

TypeScript 是结构类型系统；两个供应商 Spec 恰好同形时，类型系统无法根据 marketplace source 的值判断是否传错。归属由字段所在的 factory 确定，实际来源是否合法由 Adapter setup 校验。

`marketplace.name` 不是调用方任意起的连接别名：真实 CLI 在 `marketplace add` 时按目标仓库自己 manifest 里的 `name` 注册，名字对不上时 add 静默成功、直到下一步 `plugin install <plugin>@<name>` 才失败。因此契约是 **`marketplace.name` 必须等于目标仓库 manifest 声明的 `name`**；Adapter setup 在 add 之后回读已注册的 marketplace 列表校验这个名字，对不上立刻抛出带两个名字的错误，不把失败拖延到 install 一步。

## 安装顺序

1. 准备 CLI 主配置和鉴权，合入 `settings` 声明的原生设置（保留键冲突在这一步报错）。
2. 安装 Skills。
3. 写 MCP 配置。
4. 安装供应商原生 Plugin / Python package。
5. 写安装 manifest。

每个 attempt 只执行一次。多轮 `send` 不重复安装。

## 可复现性

- Repo Skill 和 Marketplace 可以固定 ref。
- 多 Skill 仓库必须显式选择，除非仓库只有唯一 Skill。
- 同名 Skill 来自多个来源时按配置顺序安装，manifest 保留每个来源，不静默合并。
- 安装 checkpoint key 必须包含所有影响环境的配置，包括 Bub Python packages 与原生 `settings`；settings 不同的两个变体不复用同一份安装缓存。

## 失败语义

路径不存在、仓库无法拉取、Skill 选择歧义、Plugin 不存在、MCP 配置无法写入、`settings` 含保留键或安装命令失败，都在 setup 阶段抛出并使 attempt errored。只有 Agent 已开始执行任务后的行为失败才进入 Turn status。

## Manifest

Adapter 通过共享 manifest writer 记录安装事实，runner 将其提升为 attempt artifact。Manifest 同时记录写入的原生 `settings`——secret 只走环境变量、不进 settings，所以可以原样落盘。Manifest 是审计结果，不参与能力分发，也不能替代实际行为事件；例如 Skill 是否被模型使用仍需 `skill.loaded` 或任务结果证据。
