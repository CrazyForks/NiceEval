# `--output agent`:让 coding agent 驱动「跑→读失败→改→重跑」循环

## 解决什么问题

让 Claude Code / Codex 这类 coding agent 替你修 eval 失败:它自己跑 niceeval、读失败证据、改代码、再跑。human 面板对它全是噪音——原地重绘的 live 面板、spinner、框线和 ANSI 都要浪费上下文去解析,整份 transcript 塞进去更是灾难。它真正需要三样:低频存活信号、失败的稳定身份(locator)、下一步可直接执行的命令。`--output agent` 就是这份反馈模型。

## 全流程

1. agent 先 `--dry` 看将运行什么,确认选择没扩大:

   ```sh
   niceeval exp compare memory/commit0 --dry --output agent
   ```

2. 实跑。运行中 `stderr` 只追加低频 checkpoint:开始一行;失败、错误立即一条;连续 30 秒没有永久事件才补一条 heartbeat。普通状态变化不触发输出:

   ```sh
   niceeval exp compare memory/commit0 --output agent
   ```

   ```text
   NICEEVAL progress elapsed=0s total=5 reused=1 running=4 queued=0 completed=0
   NICEEVAL failure locator=@17m2k9pq eval=memory/commit0-cachetool experiment=compare/bub-e2b verdict=failed
   ```

3. 结束时 `stdout` 只打印一个有界 handoff block:结论、快照路径、有界的失败清单与下一步命令(形态单源见 [CLI · AI agent 怎么用](../cli.md#ai-agent-怎么用)):

   ```text
   NICEEVAL RESULT failed
   summary: 4 passed, 1 failed, 0 errored (1 reused)
   snapshots:
     - .niceeval/compare/bub-e2b/<snapshot>
   failures:
     - @17m2k9pq memory/commit0-cachetool [compare/bub-e2b]
   next:
     niceeval show @17m2k9pq
     niceeval show @17m2k9pq --source
     niceeval show @17m2k9pq --execution
     niceeval show @17m2k9pq --diff
   ```

4. 用 locator 只展开所需证据,不整段拉 transcript:

   ```sh
   niceeval show @17m2k9pq
   niceeval show @17m2k9pq --execution
   ```

5. 修复后只重跑受影响项;正常依赖指纹缓存,通过项不重付(怀疑缓存口径时才配 [`--force`](force.md)):

   ```sh
   niceeval exp compare/bub-e2b memory/commit0-cachetool --output agent
   ```

## 边界

- checkpoint 和 handoff 不是另一份结果 schema;权威数据是快照与 attempt artifacts,批量分析读 [Results](../../results/README.md) 或 `--json`。
- 退出码是第一层红绿信号,agent 不靠自然语言猜成败。
- handoff 的失败清单有上限(展开前 5 条),其余给总数并指向 `niceeval view` / JSON。
- 非 TTY 下 `--output auto` 已经选中 `agent`;显式写上是为了不依赖环境检测。

## 相关阅读

- [CLI · AI agent 怎么用](../cli.md#ai-agent-怎么用) —— envelope 词法、checkpoint 节奏、handoff 上限的单源。
- [CLI · 三种反馈模型](../cli.md#三种反馈模型) —— `human` / `agent` / `ci` 分别回答什么问题。
