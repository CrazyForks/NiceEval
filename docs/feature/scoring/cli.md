# Scoring —— CLI 预期反馈

## `--strict`

默认模式下，soft Assertion 无论是否有 threshold 都只记录分数，不使 attempt failed。使用 `--strict` 后，带 `.atLeast(x)` 的 soft Assertion 低于阈值时改判 failed；没有阈值的 soft Assertion仍只记录。

```sh
npx niceeval exp compare --strict
```

Gate Assertion 不受 `--strict` 影响，任何模式下不通过都 failed。

## 退出与展示

- failed 表示评分未通过。
- errored 表示执行、环境、超时或作者错误。
- skipped 表示显式跳过且此前没有更高优先级失败。
- passed 表示没有触发上述条件。

终端和报告必须分别统计 failed 与 errored，不能把基础设施故障展示成 Agent 答错。多 runs 展示通过率和各 attempt 分数，不把多个 Verdict 合并成新的状态。

Judge 缺少 API key 时不会记录 judge Assertion；CLI 不把它单独报成失败。要求 judge 必须运行的 CI 应在启动 niceeval 前校验环境变量。
