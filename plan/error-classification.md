# PLAN：turn 级瞬时错误分类与有界重试

## 契约（单一来源，先读再动手）

- `docs/feature/error-classification/README.md` —— 动机、三分类判据（重试安全性）、挂载点（只包 `agent.send`）、与 run 级 fail-fast 的关系、非目标。
- `docs/feature/error-classification/architecture.md` —— **实现对照的主契约**：类型形状（`TurnErrorKind` / `TurnFailure` 两形态 / `TurnErrorClassifier` / `turnErrorText`，均从 `niceeval/adapter` 导出）、三道分类链（adapter 分类器 → 保守兜底 → 受理证据门）、重试执行体时序（4 次封顶 / 基数 5s 全抖动 / `ProvisionSlot` 释放槽位 / activity 形态 / 耗尽 message 摘要 / interruption 干净打断）、不变量清单。
- `docs/feature/error-classification/library.md` —— adapter 作者 API 面与 eval/实验作者观察面。
- `docs/feature/error-classification/use-case/` —— 三篇叙事（批跑限流、流中断不重试、adapter 分类器），期望反馈形态以此为准。
- `docs/feature/adapters/architecture/agent-contract.md` —— `Agent.classifyTurnError?` 已入穷尽形状。
- `docs/runner.md` 首过即停一节已声明「fail-fast 看到的 turn-failed 是重试耗尽后的最终结果」。
- 用户文档已更新：`docs-site/zh/explanation/runner.mdx` 「Turn 瞬时错误重试」一节。

## 已核实的源码落点（上一轮调查验证过，动手前再对一遍）

- turn 失败拍平点：`src/runner/attempt.ts:711-714`、`src/context/context.ts:513-519`（i18n key `context.turnFailed`）。
- 被包住的调用：`src/context/session.ts:245` 的 `this.deps.agent.send(...)`；会话记账（`turnCount` 自增、`userEvent` 推入）发生在 send 之前，重试不得重复。
- run 级 fail-fast streak：`src/runner/run.ts:717-726`——不改它。
- 形状参照：`src/sandbox/errors.ts`（`SandboxIoErrorKind` 与保守正则）、`src/sandbox/retry.ts`（退避执行体与 `ProvisionSlot` 槽位接口——**复用接口，不复用/不修改 provisioning 重试实现**）。

## 实现范围

1. **分类器模块**（建议 `src/context/turn-errors.ts`）：`TurnErrorKind`、`isRetryableTurnError`、`TurnFailure`、`TurnErrorClassifier`、`turnErrorText`、保守兜底 `classifyTurnError(failure)`。兜底文本源：`thrown` 取错误链（含 `cause`）message 串接；`turn-failed` 取 `turnErrorText(turn)`，与 `context.turnFailed` 报错文案同源。正则按契约判据写：限流关键字 / 明示 retry later → `rate_limit`；连接建立层（DNS / 拒连 / TLS / 首字节前超时）→ `network`；其余 → `unknown`。真实样本「Concurrency limit exceeded for user, please retry later」必须归 `rate_limit`。类型经 `niceeval/adapter` 入口导出并补 TSDoc。
2. **adapter 覆盖面**：`Agent` 契约加可选 `classifyTurnError?: TurnErrorClassifier`；adapter 分类器先问、`undefined` 回落兜底、抛错按 `unknown` 吞掉。本次不为任何内置 adapter 写专属分类器（样本不足，兜底即可），只留好挂载点。
3. **受理证据门**：执行体层的硬否决——失败 Turn 的 `events` 含任何 agent 产出事件（message / thinking / `action.called` / `action.result`）时，分类结果强制降为 `unknown`，压过 adapter 分类器与兜底。
4. **重试执行体**：包住 `session.ts` 的 `agent.send(...)` 一次调用。封顶 4 次尝试（每次 send 独立计数）、第 n 次重试前睡 `uniform(0, 5000ms × 2^(n-1))`；退避期间经 `ProvisionSlot` 接口释放并发槽位、睡醒重新排队；进度走 activity（形态 `turn retry 2/4 (rate_limit) — waiting 8s`），不产生 diagnostic；退避睡眠必须可被 Effect interruption 干净打断（外层 attempt deadline 原样生效，不新增超时语义）。被吸收尝试的失败 Turn 事件不进会话事件流与结果。
5. **耗尽路径**：不改 `expectOk()` → `TurnFailed` → `AttemptError{code: "turn-failed"}` 及任何下游契约；发生过重试的失败在 message 追加摘要（`… · retries exhausted (4 attempts, rate_limit)`），未重试的失败无后缀；fail-fast、`errored` 判定、结果格式零变化。

## 测试（只实现已登记的行）

- `docs/engineering/testing/unit/eval.md` 「turn 瞬时错误与重试」类别（已按新契约扩写：两形态分类、adapter 回落与吞错、受理证据门、记账不重放与事件不落账、封顶/摘要/中断）。
- `docs/engineering/testing/unit/experiments-runner.md` 「并发」分区：退避释放槽位一行。
- 用 scripted agent fixture 注入瞬时/确定性失败序列（抛错与 failed Turn 两种形态）；受控时钟，不用真实 `setTimeout` 睡眠。

## 验证与收尾

- `pnpm run typecheck`；`pnpm test`。
- 新公开类型经 `niceeval/adapter` 导出后补 TSDoc 并跑 `pnpm docs:reference`。
- `docs/source-map.md` 补契约 → 源码落点。
- 行为无新 CLI 面，无需 i18n `--help` 变更；docs-site 行为说明已在 runner.mdx，`classifyTurnError` 属 adapter 进阶面，公开参考页由 TSDoc 生成即可，暂不加教程页。
