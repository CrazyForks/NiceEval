# 执行错误类型 —— 用例

本目录是 turn 级错误分类与重试的用例文档(体裁约定见[功能文档](../../README.md)):一篇讲一个真实用例的全流程——用户遇到什么问题、从现象到结束反馈的完整路径、边界与何时改用别的模式。契约单源在 [README](../README.md)、[Architecture](../architecture.md) 与 [Library](../library.md),这里只做叙事串联,不复制契约定义。

## 内建自愈行为(零配置面)

- [高并发批跑撞限流:attempt 内自愈,不再整批 errored](rate-limit-batch.md)
- [流中断不重试:读懂一次「诚实的 errored」](stream-drop-no-retry.md)

## `classifyTurnError`(adapter 作者)

- [兜底认不出自家错误:给 adapter 写分类器](adapter-classifier.md)

API → 篇目对照:

| API | 篇目 |
| --- | --- |
| (无配置面,内建行为的观察面) | [rate-limit-batch](rate-limit-batch.md)、[stream-drop-no-retry](stream-drop-no-retry.md) |
| `Agent.classifyTurnError` / `turnErrorText` | [adapter-classifier](adapter-classifier.md) |
