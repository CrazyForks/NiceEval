# 流中断不重试:读懂一次「诚实的 errored」

## 解决什么问题

attempt `errored`,message 是响应中途的流中断或连接重置——看起来明明是基建抖动,框架却没有重试。这不是遗漏:message 里**没有** `retries exhausted` 后缀,说明这个错误被分类为 `unknown`、从未进入重试。这篇讲怎么读这个结果、为什么设计如此、下一步做什么。

## 全流程

1. 从结果里取证。`niceeval show` 或 `view` 打开该 attempt,看结构化错误的 message:

   ```text
   This send returned failed (turn status = failed): stream reset mid-response
   after 3 tool calls
   ```

   没有重试摘要后缀 = 判了 `unknown`;有后缀 = 框架已试满 4 次仍失败。两种 `errored` 的下一步不同,先分清是哪种。

2. 理解为什么不重试:流已经断在响应中途,无法证明 agent 未开始处理——上例里 agent 已经跑了 3 次工具调用、可能写了 workspace。重试等于把同一段 user text 原样重发,agent 会把做过的操作再做一遍,产出一个被污染的判定,比一次诚实的 `errored` 更糟(判据全文见 [README · 分类](../README.md#分类))。即使错误文本里混着限流字样,失败 Turn 里已有 agent 产出事件时[受理证据门](../architecture.md#分类链)也会拦下重试。
3. 下一步:`errored` 不进指纹缓存,**重跑同一条命令只补跑这个 attempt**,已 `passed` / `failed` 的照常携带——偶发抖动用一次续跑吸收即可。
4. 同一形状的错误频繁出现时,它就不是抖动:顺错误链查 adapter 与网络路径(代理、超时配置、服务端稳定性),这是要修的问题,不是要重试的问题。

## 边界

- **「大概率能过」不等于「安全重试」。** 分类判据是重试安全性,不是复发概率;歧义错误宁可判死一个 attempt,不产出不可信的 verdict。
- **adapter 作者的例外通道。** 若你的协议能证明某个流中断文案只在受理前出现(如固定的入场拒绝短语),给 adapter 写分类器把它归入瞬时——流程见[给 adapter 写分类器](adapter-classifier.md);eval 作者侧没有、也不会有强制重试的开关。

## 相关阅读

- [README](../README.md) —— 三分类与判据的理由。
- [Architecture · 分类链](../architecture.md#分类链) —— 受理证据门为什么压过一切分类器。
- [错误与警告反馈](../../../error-feedback.md) —— 报错必带下一步的总纪律。
