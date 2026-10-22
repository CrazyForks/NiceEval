# Concepts

什么时候读这一篇:

- 你碰到一个不认识的 niceeval 术语;
- 你在写文档 / 代码,想跟现有用法保持一致;
- 你需要一页纸把整套词汇过一遍。

术语定义由 [`concepts.json`](concepts.json) 拥有，写作政策由 [`concord-writing.json`](concord-writing.json) 拥有。
本页解释概念关系与使用案例，不维护另一份词表。

## 术语总表

全项目术语、来源和作用范围由 Concord 只读汇总：

```sh
pnpm exec concord concepts index --json
pnpm exec concord concepts show --path docs/concepts.json --json
pnpm exec concord writing index --json
```

目录中的稳定 ID 表示概念身份。中文与英文的 preferred 是正文首选写法；aliases 是允许的名称，deprecated 才派生禁词。
代码标识可以作为别名，但代码示例仍服从对应 Feature 的公开 API。

## 概念关系与案例

### 从评估用例到发布结果

[Eval](feature/eval/README.md) 描述任务和评判条件，[Experiment](feature/experiments/README.md) 选择被测 Adapter、模型与运行条件。
例如，同一条 Eval 可以比较两个 Experiment 的表现；每次实际执行形成一条 Attempt。

[Run](feature/run/README.md) 中的 Planned attempt 表示计划执行的位置，Attempt 表示已发布的执行事实。
Member 将两者关联；历史结果沿用时，新的 Run 引用既有 Attempt，而不复制执行事实。

### 运行条件与生命周期

[Sandbox](feature/sandbox/README.md) 提供执行空间，Adapter 连接被测系统，Agent 是提供会话协议的 Adapter。
例如，Sandbox Agent 在隔离空间里运行 CLI，Direct Agent 则直接调用函数、SDK 或服务端点。

生命周期 Hook 使用 `before` / `after`；所在对象决定执行范围与次数。
[Sandbox Layer](feature/sandbox/layers.md) 的可缓存前置动作形成 before cache；它与 [结果沿用](feature/experiments/cache.md) 分别复用环境起点和已发布结果。

### 证据与评判

[Assertion](feature/assertions/README.md) 记录检查，[Judge](feature/judge/README.md) 对显式材料求 measurement，
[Verdict](feature/verdict/README.md) 表达 Attempt 的判定。Score Eval 还保存显式数值贡献。
例如，Judge 给出质量 measurement，作者再通过 handle 的 `gate` 或 `score` 决定怎样使用它。

## 候选术语

[Roadmap](roadmap/README.md) 中的候选术语保留其来源和候选身份，不能据此推断公开 API 已存在。
采用或否决时，用 Concord 同步概念定义与引用；本页不复制候选词库。

## 禁用写法

概念的弃用名由 Concord 派生禁词，其它禁用写法在写作政策中声明具体替换和理由。
维护步骤见 [Documentation terminology skill](../.agents/skills/docs-terminology/SKILL.md)，检查入口为 `pnpm exec concord docs check --json`。
需要讨论旧词本身时使用行内代码；不要把历史拼写重新当作当前正文用语。

## 相关阅读

- [Architecture](architecture.md) —— 这些名词在模块图里各自的位置。
- [Authoring](feature/eval/README.md) —— Eval / Task / Dataset 怎么写。
- [Assertions](./feature/assertions/README.md) —— Assertion、scope、计分与证据。
- [Judge](./feature/judge/README.md) —— 裁判模型调用与不可用语义。
- [Verdict](./feature/verdict/README.md) —— AssertionResult 与执行终态怎样折叠成四态。
