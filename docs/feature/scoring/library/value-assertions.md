# 值断言

从 `niceeval/expect` 导入 matcher，再用 `t.check` 或 `t.require` 评分任意值。

```ts
import { includes, matches, isDefined } from "niceeval/expect";

const reply = await t.require(t.reply, isDefined("reply"));
t.check(reply, includes("Brooklyn"));
t.check(turn.data, matches(MySchema));
```

## `check` 与 `require`

- `t.check(value, matcher)` 同步记录断言并继续执行，适合一次收集多条结果。
- `await t.require(value, matcher)` 立即等待；不通过就按 gate 中止依赖它的后续代码，通过后返回原 value。

只有后续逻辑依赖这个值时才使用 `require`。

## 内置 matcher

| Matcher | 用途 | 默认严重度 |
|---|---|---|
| `includes(needle, opts?)` | 包含字符串或命中正则 | gate |
| `excludes(needle, opts?)` | 不包含字符串或不命中正则 | gate |
| `equals(expected)` | 深度相等 | gate |
| `matches(schema)` | Standard Schema / Zod 校验 | gate |
| `similarity(expected)` | `[0,1]` 相似度 | soft |
| `satisfies(predicate, label?)` | 自定义谓词 | gate |
| `isDefined(label?)` | 非 null / undefined | gate |
| `isTrue(label?)` / `isFalse(label?)` | 严格布尔判断 | gate |
| `commandSucceeded()` | 命令退出码为 0 | gate |

## 分组

`t.group(title, fn)` 只组织报告，不改变各断言分数或严重度：

```ts
await t.group("天气查询", async () => {
  t.check(t.reply, includes("Brooklyn"));
  t.calledTool("get_weather");
});
```

分组可以嵌套，返回 `fn` 的返回值。
