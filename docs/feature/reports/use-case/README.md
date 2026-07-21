# Reports —— CLI 用例

本目录是 `niceeval show` / `niceeval view` 全部位置参数与 flag 的用例文档(体裁约定见[功能文档](../../README.md)):一篇讲一个真实用例的全流程——用户遇到什么问题、带上它之后从命令到结束反馈的完整路径、边界与何时改用别的模式。契约单源在 [Show](../show.md)、[View](../view.md) 与 [`show/`](../show/attempt.md) 各证据分篇,这里只做叙事串联,不复制契约定义。

## `niceeval show`(终端)

- [`@locator`:从榜单一行下钻到一次失败的全部证据](show-locator-drilldown.md)
- [`--history`:一道题时好时坏,按 attempt 看历次执行](show-history-flaky-eval.md)

## `niceeval view`(浏览器与静态站)

- [裸 `view` 与收窄:在浏览器里复盘,只看关心的那部分](view-local-narrowing.md)
- [`--out`:把结果导出成静态站发布](view-out-publish.md)

## show 与 view 共用

- [`--results` / `--snapshot`:换结果根,或只看一份快照](results-root-and-snapshot.md)
- [`--report` / `--page`:show 与 view 共用同一份自定义报告](report-shared-show-view.md)

## flag → 篇目对照

| 输入 | 命令 | 所在篇目 |
|---|---|---|
| 位置参数(eval id 前缀) | show / view | [`--history` 用例](show-history-flaky-eval.md) · [裸 `view` 与收窄](view-local-narrowing.md) |
| `@<locator>` 位置参数 | show | [`@locator` 下钻](show-locator-drilldown.md) |
| `--source` / `--execution` / `--timing` / `--diff` | show | [`@locator` 下钻](show-locator-drilldown.md) |
| `--history` | show | [`--history` 用例](show-history-flaky-eval.md) |
| `--exp` | show / view | [`--history` 用例](show-history-flaky-eval.md) · [裸 `view` 与收窄](view-local-narrowing.md) |
| `--results` | show / view | [换结果根](results-root-and-snapshot.md) |
| `--snapshot` | view | [换结果根](results-root-and-snapshot.md) |
| `--no-open` / `--port` | view | [裸 `view` 与收窄](view-local-narrowing.md) |
| `--out` | view | [静态导出](view-out-publish.md) |
| `--report` / `--page` | show / view | [自定义报告](report-shared-show-view.md) |
