# `--usage`：token、轮数与成本的组装口径

`--usage` 把范围内每个 attempt 的用量摊成一行：判定、轮数、工具调用数、token 拆分与成本。效率归因（「为什么这个条件更贵」）的最小证据面就是这张表，不需要逐个打开 attempt。

## usage 行的组装口径（单源）

show 里所有出现 usage 的地方（attempt 首页的 `usage:` 行、`--usage` 表、对照矩阵的用量列、`--execution` turn 头行）都按同一条口径组装，事实来自两处，不混淆来源：

- **行为计数来自标准事件流**：轮数（`turns`）与工具调用数（`tool calls`）从 `events.json` 派生，与 [`o11y.json` 行为摘要](../../results/architecture.md#o11yjson)同源。
- **token 与请求计数来自 `Usage`**：字段契约见 [Results · Usage](../../results/architecture.md#usage)。每个字段只在协议真实提供时存在；`requests` 是真实发生的模型请求数，协议不提供就整个不显示——**绝不显示一个凑数的 1**。
- **`uncached in` 是派生量**：`inputTokens − cacheReadTokens`，仅当两个输入都存在时派生并显示；缺任何一个就回退显示原始 `in`，不猜 0。缓存命中的输入同样计费，效率对比必须能看到这层拆分。

完整组装形态：

```text
usage: 6 turns · 21 tool calls · 62.3k uncached in + 942.6k cache read / 6.7k out · 24 requests · $1.14
```

某段事实缺失时对应片段整段省略，剩余片段保持顺序；全部缺失时 `usage:` 行不出现（与诊断首页「没有证据的块不出现」同一条规则）。

## 范围化的用量表

```sh
$ niceeval show --exp dev-e2b/codex-e2b --usage
用量 · dev-e2b/codex-e2b · 6 个 attempt

locator      eval                                 结果    turns   tools   uncached in   cache read     out    requests   成本
@160iuj3h    memory/agent-037-updatetag-cache     ✓ 通过      4       9         48.2k       201.5k    5.1k         13   $0.09
@1sxmo0m1    memory/repomod-hello-world-api       ✓ 通过     11      28        122.9k       1.98M    12.4k         39   $0.57
@1qrdcfq8    memory/swelancer-manager-proposals   ✗ 失败      2       3         13.9k        38.2k    6.4k          9   $0.05
@1pcdj0az    memory/terminal-cancel-async-tasks   ✓ 通过      6      14         71.0k       513.7k    8.0k         20   $0.13
@13wrnsc4    memory/terminal-pypi-server          ✗ 失败      7      19         88.3k       690.1k    9.2k         26   $0.19
@18etnsw5    memory/tool-call-observability       ✓ 通过      1       2          6.1k        11.0k    1.8k          3   $0.02

合计                                              4/6 通过    31      75        350.4k       3.43M    42.9k        110   $1.05
```

- 行按 experimentId、evalId、attempt 序排列；范围含多个 experiment 时逐 experiment 分节，节尾各自合计。
- 缺失字段的格显示 `—`，且不计入合计——缺 usage 不按零聚合，与[证据完整性](../../adapters/architecture/evidence.md)同一条纪律；合计行有任何 `—` 参与的列在数值后标 `*`，表示合计不完整。
- 对照范围（重复 `--exp`）下，`--usage` 输出逐 eval 的用量矩阵：每条件一组列，配对与占位规则同[对照矩阵](compare.md)。
- `--json` 形态输出同一批行的结构化形状（见 [`--json`](json.md)）。

## 相关阅读

- [Results · Usage 与 facts](../../results/architecture.md#usage) —— 落盘字段的家。
- [失败诊断首页](attempt.md) —— 单 attempt 的 `usage:` 行。
- [对照矩阵](compare.md) —— 条件间的用量差。
