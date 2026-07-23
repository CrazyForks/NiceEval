# `--stats`:eval × experiment 稳定性矩阵

「哪几道题从来没通过过」是判断题目质量的第一诊断:一道在所有条件、所有历史执行里零通过的题,先怀疑题目(prompt 缺公开契约、隐藏测试断言过强),再怀疑 agent。`--stats` 把范围内每个 eval 摊成一行、每个 experiment 一组列,格内是该组合**全部历史执行**的判定计数——一条命令回答稳定性,不需要脚本遍历落盘文件。

## 口径

- 证据面与 [`--history`](history.md) 相同:跨快照按 [attempt 身份键](../../results/library.md#身份键与去重)去重后的历次执行,**不设可比性门槛**——旧配置下的执行也计入。它回答「这道题曾经怎样」,不是榜单的现刻水位;两个口径的分工同 history 篇。
- **`✗`(failed)与 `!`(errored)永远分列**。判定失败是题目/agent 的事实,基础设施错误是环境的事实——把 provider 限流的一片 `!` 混进失败列,会把环境事故误判成题目难度。`skipped` 不计入任何列。
- `--fresh` 照常收窄(只统计新执行);eval 前缀与 `--exp` 照常收窄行与列。`--stats` 与 `--history` 是同一份事实的两个投影:矩阵行是时间轴节的聚合,从矩阵格下钻用 `<eval 前缀> --history` 摊开逐次执行。

## 输出

```sh
$ niceeval show --stats
稳定性 · 30 个 eval × 3 个 experiment · 全部历史执行 · ✗ 判定失败 / ! 执行错误分列

eval                                  baseline        mempal          nowledge
react-datepicker/pr-6058   never ✓    ✓0 ✗3 !0        ✓0 ✗2 !1        ✓0 ✗3 !0
react-tooltip/pr-1269      never ✓    ✓0 ✗2 !1        ✓0 ✗3 !0        ✓0 ✗3 !0
lightbox/pr-482            never ✓    ✓0 ✗3 !0        ✓0 ✗3 !0        ✓0 ✗2 !1
rhf/pr-13594                          ✓1 ✗2 !0        ✓2 ✗1 !0        ✓1 ✗1 !1
memory/agent-037-updatetag-cache      ✓3 ✗0 !0        ✓3 ✗0 !0        ✓2 ✗0 !1
downshift/pr-1502                     ✓2 ✗0 !1        —               ✓1 ✗0 !5
…

汇总                                  ✓48 ✗22 !2      ✓55 ✗17 !0      ✓41 ✗19 !12
```

- 行按历史最高通过率升序——零通过的题排最前,行首标 `never ✓`;它们是题目质量审查的第一队列。
- 格内三计数固定顺序 `✓ ✗ !`;该组合没有任何执行时显示 `—`,不写三个 0 冒充跑过。
- 汇总行给各 experiment 的三列合计。`!` 合计异常高的列指向环境事故(限流、配额),先修环境再谈通过率——矩阵只陈列计数,不替读者下结论。
- `--json` 形态见下;终端宽内容照常横向滚动,不合并列。

## `--json` 形状

```typescript
interface StatsJson {
  evals: Array<{
    evalId: string;
    /** 全部条件历史执行中通过次数为 0 且执行数 > 0。 */
    neverPassed: boolean;
    cells: Record<string, {   // 键是 experiment id;无执行的组合无键
      passed: number; failed: number; errored: number;
      executions: number;     // 三者之和(skipped 不计)
    }>;
  }>;
  totals: Record<string, { passed: number; failed: number; errored: number }>;
}
```

## 边界

- 与 `--report` 互斥(宿主证据投影,不经报告树);与 `@<locator>` 组合是用法错误——单 attempt 没有稳定性可言。
- 要看某一格的逐次执行与失败原因,下钻 `niceeval show <eval 前缀> --history`;要看现刻水平对比,用[对照矩阵](compare.md)。
- 发布用的稳定性报告走报告库(`MetricMatrix` + 三种通过率,见[可靠性诊断](../use-case/diagnose-reliability.md));`--stats` 服务终端里的即时诊断。

## 相关阅读

- [`--history`](history.md) —— 同一证据面的逐次执行时间轴。
- [对照矩阵](compare.md) —— 现刻水位的逐题对照。
- [`--json`](json.md) —— 结构化形态的信封。
