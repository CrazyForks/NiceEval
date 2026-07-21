# `--output ci`:CI 门禁要稳定日志、单行结论、可归档产物

## 解决什么问题

把 eval 挂成 PR 门禁或夜间任务后,消费者变成 CI runner:它按行缓冲日志、按退出码判红绿、把产物归档给平台注解。human 面板的 ANSI、光标控制和原地重绘在 CI 日志里全是乱码;长 eval 几分钟不输出还会被平台当成挂死杀掉。`ci` profile 给的是单一有序事件流 + 单行结论,`--json` / `--junit` 再把完整结果落成可归档文件。

## 全流程

1. 门禁命令固定语言、严格判定和报告路径:

   ```sh
   NICEEVAL_LANG=en niceeval exp ci \
     --output ci \
     --strict \
     --json .niceeval/ci-summary.json \
     --junit .niceeval/junit.xml
   ```

2. 从 start 到 result 全走 `stdout` 单一事件流(不把 failure 分流 `stderr`,避免 CI 分开缓冲打乱顺序);通过项不逐条打印,失败与 errored 立即一行,静默 60 秒才补 heartbeat:

   ```text
   niceeval: start total=24 configs=3 concurrency=10 reused=18
   niceeval: progress elapsed=60s reused=18 running=6 queued=0 completed=0
   niceeval: failed locator=@1bwcxxiy eval=memory/swelancer-manager-15193 experiment=ci/claude severity=gate assertion="Issue 15193: selected proposal matches the accepted proposal" matcher="equals(4)" expected=4 received=3
   niceeval: result=failed passed=23 failed=1 errored=0 reused=18 duration=128s
   niceeval: json=.niceeval/ci-summary.json
   niceeval: junit=.niceeval/junit.xml
   niceeval: snapshots=<3 snapshots>
   ```

3. 门禁只认退出码:`0` 全部通过且运行完整覆盖计划;`1` 有 `failed` / `errored`、budget 未覆盖计划或 required reporter 写失败;`2` 未捕获崩溃;`130` 中断。折叠规则见 [Runner · 退出码](../../../runner.md#退出码)。
4. 归档产物:`--json` / `--junit` 是整次运行的最终聚合,收尾时写临时文件并原子替换目标——CI 归档到的要么是完整文件,要么不存在,不会是半成品。attempt 级快照则逐个原子落盘,进程中断时已完成的照常可读(见 [CLI · 输出流和落盘节奏](../cli.md#输出流和落盘节奏))。
5. JUnit 交给平台做测试注解,JSON 交给自建看板;`niceeval: result=` 行可单独 grep,但完整记录以文件和快照为准。

## 边界

- `--json` / `--junit` 不是终端格式开关,与 profile 正交——`human` 也可以同时写 CI 文件;它们是 required reporter,写失败必须判红,不降级成 warning。
- 只有连 profile 都没能启动的 argv / 配置加载错误走 `stderr`。
- budget 到顶时结论是 `result=incomplete`、退出码 `1`,不伪装全绿——流程见 [`--budget` 用例](budget.md)。
- `--dry` 不创建快照、JSON 或 JUnit。

## 相关阅读

- [CLI · CI 怎么用](../cli.md#ci-怎么用) —— 事件行形态、heartbeat 节奏与 CI 常见 case 的单源。
- [Runner · 完成状态](../../../runner.md#完成状态) —— `complete` / `incomplete` / `interrupted` 怎样进结论。
