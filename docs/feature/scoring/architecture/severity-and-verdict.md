# Severity 与 Verdict

## Severity

- **gate**：硬要求，不通过即 failed。
- **soft**：质量分；无阈值时只记录，带 `.atLeast(x)` 时仅在 strict 模式下影响 Verdict。

`.gate()` 使用 matcher 默认通过线，`.gate(x)` 指定硬阈值；`.atLeast(x)` 始终是 soft threshold。

## Verdict

Verdict 只有 passed、failed、errored、skipped，按固定优先级取第一个成立项：

```text
执行异常、超时或作者错误                           → errored
任一 gate 不通过，或 strict 下 soft 低于阈值       → failed
显式 t.skip(reason)                                → skipped
否则                                               → passed
```

Errored 压过一切，因为执行证据已经不可信。Failed 压过 skipped，避免 `t.skip()` 掩盖此前记录的硬失败。

Turn failed 和 attempt errored 不是同一概念：Agent 行为失败可以形成可评分结果；基础设施、超时或作者异常使本次执行无法形成可信结论。
