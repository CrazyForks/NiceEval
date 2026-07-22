# 执行错误类型 —— 架构

分类与重试怎样长在 send 管道上:类型形状、分类链、重试执行体与不变量。判据本身(什么算瞬时、为什么歧义一律 `unknown`)单源在 [README · 分类](README.md#分类),本篇不复述。

## 数据建模

实体关系一句话:**分类器是 Agent 的可选声明,重试执行体是 context 层 send 管道的一段,二者经 `TurnFailure` 这个中性形状对话。** adapter 只声明「我认得自家错误长什么样」;要不要重试、重试几次、退避多久全部归执行体,adapter 不感知也不能影响策略——core 不按 agent 名字分支,策略对所有 agent 一致。

### 类型

类型随 agent 契约从 `niceeval/adapter` 导出:

```ts
/** 一次 send 失败的重试安全性分类。 */
export type TurnErrorKind = "rate_limit" | "network" | "unknown";

export function isRetryableTurnError(kind: TurnErrorKind): boolean {
  return kind !== "unknown";
}

/** 一次 send 失败的两种浮出形态。 */
export type TurnFailure =
  | { readonly type: "thrown"; readonly error: unknown }      // send() 抛出
  | { readonly type: "turn-failed"; readonly turn: Turn };    // send() 返回 status: "failed" 的 Turn

/** adapter 可选分类器:返回 undefined 表示「不认识,交给兜底」。 */
export type TurnErrorClassifier = (failure: TurnFailure) => TurnErrorKind | undefined;

/** 失败 Turn 的错误摘要:与 turn-failed 报错文案、兜底分类器读的同一段文本。 */
export function turnErrorText(turn: Turn): string | undefined;
```

挂载点是 `Agent` 上的可选字段 `classifyTurnError?: TurnErrorClassifier`(完整 interface 见 [agent 契约](../adapters/architecture/agent-contract.md#agent-与-turn))。`completed` 与 `waiting` 的 Turn 不是失败(HITL 挂起是成功形态),不进分类;分类只发生在上面两种形态上。`kind: "remote"` 与 `kind: "sandbox"` 的 agent 走同一条链,契约不分身份。

### 分类链

一次失败依次过三道,前两道谁先给出非 `undefined` 结果谁定分类,第三道持有否决权:

1. **adapter 分类器**(可选):最了解自家协议的错误形状,返回三词之一,或 `undefined` 回落。分类器抛错按返回 `unknown` 处理,自身错误被吞掉——分类是旁路,不得用新错误掩盖原始失败。
2. **保守兜底分类器**:对失败文本做正则匹配。限流关键字、明示 "retry later" → `rate_limit`;连接建立层错误(DNS 解析失败、连接被拒、TLS 握手失败、首字节前超时)→ `network`;其余 → `unknown`。失败文本与 `turn-failed` 报错文案同源:`thrown` 形态取错误链(含 `cause` 链)的 message 串接,`turn-failed` 形态取 `turnErrorText(turn)`——同一段文本既给人读也给分类器看,不出现「报错说 A、分类看 B」;adapter 分类器也用它,不必自己扒事件流。
3. **受理证据门**(执行体的否决权):失败 Turn 的 `events` 里已出现任何 agent 侧产出(message / thinking / `action.called` / `action.result`)即证明 agent 已受理并开始工作,分类结果强制降为 `unknown`——文本再像限流也不重发。这道门把「只有能证明未受理才重试」从判据文字变成机器不变量,不信任何分类器;`thrown` 形态没有事件可查,由前两道的文本判据独自把关。

兜底分类器的正则形状对齐 [sandbox IO 分类器](../sandbox/architecture.md#已创建-sandbox-的文件-io-重试),但各自实现——sandbox 的错误模块不外泄到 context 层,两份小正则表的重复是模块边界的价格,刻意付。

## 重试执行体

执行体包住 context 层对 `agent.send(...)` 的那一次调用——全仓库只有这一个 choke point,adapter、runner、eval 都不再各自处理瞬时错误。时序:

1. 会话记账(`session.turnCount` 自增、`userEvent` 推入事件流)在进入执行体之前完成,整个重试循环内不重复。
2. 调 `agent.send(input, ctx)`。返回 `completed` / `waiting` → 原样交回管道,循环结束。
3. 失败(抛出或 `failed` Turn)→ 走分类链。分类为 `unknown`,或本次已是第 4 次尝试 → 循环结束,失败向下浮出。
4. 可重试 → 退避睡眠 → 回到 2,原样重发同一个 `TurnInput`。

被吸收的失败尝试不留痕:失败 Turn 的事件不进会话事件流、不进结果,只有最终一次尝试的 Turn 落账——重试后成功的 attempt 与一次成功的 send 在结果里不可区分。

### 退避与槽位

| 参数 | 契约 |
| --- | --- |
| 尝试次数 | 每次 send 调用封顶 4 次(首次 + 至多 3 次重试);一个 attempt 内的多轮 send 各自独立计数 |
| 退避 | 指数 + 全抖动:第 n 次重试前睡 `uniform(0, 5s × 2^(n-1))`,上界依次 5s / 10s / 20s |
| 槽位 | 睡眠期间经 `ProvisionSlot` 接口释放全局并发槽位,睡醒重新排队——与 [provisioning 重试](../sandbox/architecture.md#provisioning-失败与重试)同一接口,不共享实现;被限流的一批 attempt 不占着并发名额陪睡 |
| 中断 | 退避睡眠可被 interruption 干净打断;attempt 外层 deadline 原样生效,重试不延长任何预算,不新增第二套超时语义 |

基数比 provisioning 的 1 秒大一个量级:限流窗口通常以十秒计,过小的基数只会让前几次重试在同一个限流窗口里白烧尝试次数。

### 观察面

- **重试中**:走 attempt 的 activity 行,期望形态 `turn retry 2/4 (rate_limit) — waiting 8s`;不产生 diagnostic——这是正常自愈过程,不是需要留痕的 warning。重试成功后 activity 恢复常态,永久输出零痕迹。
- **耗尽后**:浮出的失败 message 追加重试摘要,期望形态 `… · retries exhausted (4 attempts, rate_limit)`;未发生过重试的失败(`unknown`)不加后缀。摘要只进 message、不进结构化字段——它回答的是人在读 `errored` 时的「框架试过了吗」,不是程序要分支的数据;run 级 fail-fast 继续只看 `error.code`。

## 不变量

- 重试只包 `agent.send` 一次调用;会话记账、事件流、send 窗口都以「一次逻辑 send」为单位,重试对它们不可见。
- 分类链的任何一道都不能制造新失败;耗尽后浮出的必须是最终一次尝试的原始错误(message 允许追加重试摘要)。
- `AttemptError.code`、`errored` 判定、结果格式、缓存语义(`errored` 不缓存、下次运行照常重跑)零变化;run 级 fail-fast 的 streak 看到的 `turn-failed` 一定是重试耗尽后的最终结果。
- 分类结果为瞬时、但失败 Turn 带 agent 产出事件时,一律不重试(受理证据门压过一切分类器)。
- adapter 分类器只影响分类精度,不影响策略:封顶次数、退避参数、槽位行为对所有 agent 一致。

## 相关阅读

- [README](README.md) —— 动机、三分类判据、与 fail-fast 的关系、非目标。
- [Library](library.md) —— `classifyTurnError` 的写法与 eval / 实验作者的观察面。
- [Sandbox · Provisioning 失败与重试](../sandbox/architecture.md#provisioning-失败与重试) —— 被对齐的分类与退避形状。
- [Adapter · agent 契约](../adapters/architecture/agent-contract.md) —— `Agent` 完整 interface 与生命周期不变量。
