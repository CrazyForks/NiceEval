# 作用域绑定

作用域由接收者决定，不由断言名字决定。作用域断言共享同一套实现，只替换 selector。

| 接收者 | Selector |
|---|---|
| `t` | attempt 的全部 session 和 turn，在 test 结束后聚合 |
| session | 该 session 在记录断言时已有的事件和 usage |
| turn | 该轮不可变事件、状态和 usage |

`t.newSession()` 创建的 session 仍属于当前 attempt，因此它的事件进入 `t.*` 聚合，但不会进入主 session 的即时 `t.reply` / `t.events` 读取视图。

值断言只评价显式传入值；Sandbox diff 是 attempt 级最终资源；judge 默认材料按接收者分层。这些 scope 不能为了 API 表面一致而混合。

Session 和 Turn 的 author-facing 获取方式见 [Eval Context](../../eval/library/context.md)。
