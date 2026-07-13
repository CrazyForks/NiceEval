# 自定义断言

内置 matcher 无法表达规则时，用 `makeAssertion` 创建同步或异步 matcher。

```ts
import { makeAssertion, type Assertion } from "niceeval/expect";

function jsonValid(): Assertion {
  return makeAssertion({
    name: "jsonValid",
    severity: "gate",
    score(value) {
      try {
        JSON.parse(String(value));
        return 1;
      } catch {
        return 0;
      }
    },
  });
}

t.check(t.reply, jsonValid());
```

Assertion 适合评价一个值或一个 scope。跨 attempts 的 pass@k、均值和趋势属于 reporter metric，不应在单 attempt Assertion 中自行读取历史结果。

优先组合已有 matcher；只有新的评分语义才创建新 Assertion，不为业务字段包装一层只转发参数的别名。
