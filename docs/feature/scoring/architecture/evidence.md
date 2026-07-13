# 评分证据与完整性

作用域断言消费 Turn status、标准事件、派生事实和 usage；Sandbox 结果断言消费最终 diff 与文件；值断言消费显式值；judge 消费接收者默认材料或 `{ on }`。

正断言缺数据通常失败，负断言和上限断言在空数据上可能通过。因此 `notCalledTool`、`usedNoTools`、`notEvent`、`maxTokens` 和 `maxCost` 的可信度取决于 Adapter 是否提供完整行为轨与 usage。

Scoring 不从缺失数据推断“没有发生”，也不使用 OTel span 补写行为事件。Adapter 提供证据的约束见 [Adapter · 断言证据](../../adapters/architecture/evidence.md)。

Sandbox 延迟断言在 attempt finalize 时读取结果；值 matcher 与 `require` 可以立即求值。两种时机都记录统一 Assertion，不改变最终 Verdict 规则。
