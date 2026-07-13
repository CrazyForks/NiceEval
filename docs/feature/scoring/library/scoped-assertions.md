# 作用域断言

同一组断言可以挂在 `t`、session 或 turn 上；接收者决定数据范围。

```ts
const first = await t.send("查布鲁克林天气");
first.calledTool("get_weather");       // 只看这一轮

const other = t.newSession();
await other.send("查旧金山天气");
other.calledTool("get_weather");       // 只看这条 session

t.calledTool("get_weather", { count: 2 }); // 全 attempt
```

## 共享词汇

| API | 断言内容 |
|---|---|
| `succeeded()` | 作用域没有失败，也没停在未回答的 HITL |
| `parked()` | 干净停在输入请求上 |
| `messageIncludes(token)` | assistant 文本包含 token |
| `calledTool(name, match?)` | 出现匹配的工具调用 |
| `notCalledTool(name, match?)` | 没有匹配工具调用 |
| `toolOrder(names)` | 工具按给定子序出现 |
| `usedNoTools()` | 没有工具调用 |
| `maxToolCalls(max)` | 工具调用数不超上限 |
| `loadedSkill(skill)` | 出现 `skill.loaded` 证据 |
| `calledSubagent(name, match?)` | 出现匹配的子 Agent 委派 |
| `noFailedActions()` | 没有 failed 工具或子 Agent 动作 |
| `event(type, opts?)` / `notEvent(type)` | 出现或未出现事件 |
| `eventOrder(types)` | 事件类型按给定子序出现 |
| `eventsSatisfy(label, predicate)` | 用谓词检查事件流 |
| `maxTokens(max)` / `maxCost(usd)` | token 或估算成本不超上限 |

负断言和上限断言依赖完整证据；Adapter 漏事件或 usage 时可能静默通过。见 [证据与完整性](../architecture/evidence.md)。

Sandbox 专属结果断言见 [断言 Sandbox 结果](../../sandbox/library/asserting-results.md)。

## 接收者专属能力

| 接收者 | API | 原因 |
|---|---|---|
| `t` | `check`、`require`、`skip`、`log`、`group` | 记录或控制整个 attempt |
| `t` | `newSession()` | 只有主上下文创建额外 session |
| `t` | `sandbox.*` | Sandbox 是 attempt 资源 |
| turn | `outputEquals(value)`、`outputMatches(schema)` | 直接评价这一轮的 `turn.data` |

不要为了表面一致把这些能力下放给 session 或 turn。
