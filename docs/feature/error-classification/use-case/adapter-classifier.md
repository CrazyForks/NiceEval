# 兜底认不出自家错误:给 adapter 写分类器

## 解决什么问题

自定义 adapter 对接的 agent 服务有自己的限流表达——不是 429、文案里也没有 "retry later",比如固定短语 `ACME_QUEUE_FULL` 加退出码 75。保守兜底分类器不认识它,只能判不可重试:每次撞上都白白 `errored`,批跑里还可能连续复现、触发 fail-fast。协议知识在 adapter 手里,就该由 adapter 声明。

## 全流程

1. **取证**。从 `errored` 的 message 拿到原始文案,确认它没有重试摘要后缀(= 被判不可重试):

   ```text
   This send returned failed (turn status = failed): acme exited with code 75 ·
   last error: ACME_QUEUE_FULL: too many concurrent runs
   ```

2. **裁决重试安全性**——写分类器前必须回答:这个文案在服务端语义里是否**只在受理前**出现?查服务文档或服务端代码确认 `ACME_QUEUE_FULL` 是入场闸拒绝、此时不会开始任何处理。答不上来就停在这里,保持不可重试(判据见 [README · 分类](../README.md#分类))。
3. **在 factory 里挂分类器**(完整写法与要点见 [Library](../library.md#adapter-作者classifyturnerror)):

   ```ts
   classifyTurnError(failure) {
     if (failure.type === "turn-failed" && turnErrorText(failure.turn)?.includes("ACME_QUEUE_FULL")) {
       return { retryable: true, reason: "acme_queue_full" };
     }
     return undefined; // 其余交给保守兜底
   },
   ```

   `reason` 用协议里最贴切的词——它是开放词表,原样进 activity 与耗尽摘要,不必伪装成内建的 `rate_limit`。

4. **验证**。单元层用按脚本失败的 fake agent 断言分类结果;真实批跑里撞限流时,activity 行出现 `turn retry 2/4 (acme_queue_full)` 即生效,重试成功的 attempt 结果零痕迹。

## 边界

- **受理证据门仍在你之上。** 失败 Turn 里已有 agent 产出事件时,你返回的可重试会被强制降回不可重试——分类器声明判断,执行体持有否决权;这不是 bug,是「证明未受理」的机器化。
- **只声明决策与词,碰不到策略。** 两层重试预算、退避、槽位对所有 agent 一致;想要更多重试次数不是分类器的事,那是[非目标](../README.md#非目标)里定死的参数。
- **别复述兜底。** 429、DNS 失败、拒连这些通用形状兜底已认得,分类器只写协议专属知识,其余一律 `undefined` 回落。

## 相关阅读

- [Library](../library.md) —— 签名、要点与完整示例。
- [Architecture · 分类链](../architecture.md#分类链) —— 三道链的次序与否决权。
- [Adapter · 编写 Adapter](../../adapters/library/writing-an-adapter.md) —— send 与错误从哪里浮出。
