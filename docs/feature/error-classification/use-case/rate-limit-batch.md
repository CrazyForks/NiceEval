# 高并发批跑撞限流:attempt 内自愈,不再整批 errored

## 解决什么问题

`--max-concurrency 12` 批跑一套题,服务端按用户限并发。十几个 attempt 同时开 turn,大概率有几个撞上入场拒绝——`Concurrency limit exceeded for user, please retry later`。没有 turn 级重试时,这几个 attempt 当场 `errored`;更糟的是同一个错误 code 连续复现会触发 [run 级 fail-fast](../../../runner.md#首过即停earlyexit),把最该重试的场景当成确定性错误停止派发。你想要的只是「这一次 send 换个时机再试」,而不是重跑整个实验。

## 全流程

1. 照常跑,不需要任何 flag 或配置:

   ```bash
   niceeval exp onboarding --max-concurrency 12
   ```

2. 某个 attempt 的 send 撞限流。兜底分类器从错误文本认出限流关键字 → 可重试(reason `rate_limit`),进入退避重试;activity 行如实显示,期望形态:

   ```text
   ⠸ onboarding/greet#2  turn retry 2/4 (rate_limit) — waiting 8s
   ```

3. 退避中的 attempt 让出并发槽位,排队中的其它 attempt 顶上——整批吞吐不因几个 attempt 在睡而塌下来;睡醒后重新排队拿槽位再发。
4. 大多数情况下第二三次尝试就过。重试成功的 attempt 在结果里**零痕迹**:事件流、turn 数、判定与一次成功的 send 无异,不产生 diagnostic。
5. 限流持续到重试预算耗尽时(单次 send 封顶 4 次尝试;多轮 eval 整个 attempt 另有加总上限),该 attempt 照常 `errored`,message 带重试摘要(`… · retries exhausted (4 attempts, rate_limit)`),fail-fast 看到的已是这个干净得多的最终信号。`errored` 不进指纹缓存——限流窗口过去后**重跑同一条命令即是续跑**,只补跑失败的那几个 attempt。

## 边界

- **重试参数固定,不可调。** 两层预算与基数 5 秒是[非目标](../README.md#非目标)里定死的值(数值见 [Architecture · 退避与槽位](../architecture.md#退避与槽位));限流持续到预算耗尽说明并发本身超出配额,把 `--max-concurrency` 降下来才是对因下药,重试只兜抖动不兜超卖。
- **不要把 `runs` 当重试预算。** `runs` 是通过率的分母(衡量 agent 稳不稳),拿它对冲基建抖动会污染分布;瞬时故障的自愈已经在 send 层内建。
- **中断安全。** Ctrl-C 或外层超时能干净打断退避睡眠,attempt 走正常收尾,不会挂在 sleep 里。

## 相关阅读

- [README](../README.md) —— 为什么限流归 `rate_limit`、判据全文。
- [Architecture · 退避与槽位](../architecture.md#退避与槽位) —— 精确参数与槽位契约。
- [Runner](../../../runner.md) —— fail-fast、缓存与续跑语义。
