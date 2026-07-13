# Scoring —— 架构

Scoring 将执行状态、记录的 Assertions 与 skip 信号折叠成 Verdict。matcher、作用域断言和 judge 最终都进入同一个 Assertion collector。

```text
value / scope / judge / sandbox / efficiency
                    │
                    ▼
              Assertion[]
                    │
        execution error + skip + strict
                    │
                    ▼
                 Verdict
```

## 设计主题

- [作用域绑定](architecture/scopes.md)
- [Severity 与 Verdict](architecture/severity-and-verdict.md)
- [证据与完整性](architecture/evidence.md)

`Assertion` 表达一次评分记录；`Verdict` 表达整个 attempt 的互斥结果。多次 runs 的报告聚合通过率和平均耗时，不制造第五种 Verdict。
