---
format: concord.document/v1
id: changed-paths-source-unavailable
title: 范围断言证据 unavailable，但同 Attempt 的公开 diff 完整
createdAt: 2026-10-26T06:28:03.811Z
kind: issue
state: draft
memoryRelations: []
adoptions:
  current: []
  history: []
history: []
---

## 观察与期望
NiceEval-Eval 的 OpenSandbox/Kata 真实运行中，同一个 Attempt 的 `sandbox-result/v1`、`operation: changed-paths` 断言返回 `unavailable`，原因为 `source-unavailable`；但公开 `niceeval show @<locator> --diff` 给出 complete、无 limitations 的 send-window diff，并且仅修改了该断言允许的 `experiments/local.ts`。
期望可用于范围断言的变更证据与公开 diff 一致；若二者有不同的采集时机或归属限制，应在公开断言详情中解释具体缺失，便于判断是否仍可验证范围。此记录不预判根因。

## 公开入口证据
- Experiment：`harness/canary`，Eval：`harness/terminal-bench/regex-log-authorized`。
- Run：`20c8c52f-ad07-4443-a666-446486bcf3a8`，Attempt：`@1RTDYW6J8B4MG`。
- 运行 `niceeval query discover` 后，以 `niceeval.query/v3` 调用 `attempt.assertion.detail`，选取 key 为 `harness.regex-log-authorized.changed-only-config` 的 entry。
- `criterion.value.data` 为 `{"operation":"changed-paths","paths":["experiments/local.ts"]}`；decision.result 为 unavailable，materials.coverage.reason 为 source-unavailable；材料 preview 为 agent-attributed send-window endpoint deltas。
- `niceeval show @1RTDYW6J8B4MG --diff`：State complete、Windows 1、无 limitations；turn1 只有 `experiments/local.ts` 的 modified，before/after 均为可读文本。

## 影响与边界
Attempt verdict 为 passed、得分 10/10，但这条不计分的范围断言没有自动证明通过。下游只能另行核对公开 diff，不能把分数当作范围约束的证明。尚未构造无模型的最小复现；需要 maintainer 确认这是缺口还是受支持的不同证据边界。

## 环境与来源
2026-10-26，Linux、Node.js 24.19.0、pnpm 11.12.0；外层通过官方 dev:link 消费本地 NiceEval 候选（0.0.0-development），OpenSandbox SDK 1.1.1、Kata 单并发。内层被测候选为 0.19.1-canary.104，不能据此声称外层发布包 .104 已复现。
来源为 NiceEval-Eval dogfood 的公开 Query/show 结果；未读取私有 Record、未包含凭据或原始对话。已搜索 open/closed Issue 的 changedFiles 和 source-unavailable diff，无匹配。
建议标签：bug、area:library、area:record、needs-triage。
