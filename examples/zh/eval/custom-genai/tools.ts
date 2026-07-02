// 两个工具的真实实现:get_weather(city) 和 calculate(expression)，以及
// 按名字分发调用的 executeTool。
export const WEATHER_TABLE: Record<string, { condition: string; tempC: number }> = {
  北京: { condition: "晴", tempC: 31 },
  上海: { condition: "多云", tempC: 29 },
  深圳: { condition: "雷阵雨", tempC: 33 },
  广州: { condition: "阵雨", tempC: 32 },
};

export function getWeather(city: string): { city: string; condition: string; tempC: number } {
  const known = WEATHER_TABLE[city];
  if (known) return { city, ...known };
  // 没收录的城市：按字符串哈希出一个确定性的假天气，保证同一个城市每次结果一致。
  let hash = 0;
  for (const ch of city) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const conditions = ["晴", "多云", "小雨", "阴"] as const;
  return { city, condition: conditions[hash % conditions.length]!, tempC: 15 + (hash % 20) };
}

export function calculate(expression: string): number {
  if (!/^[0-9+\-*/(). \s]+$/.test(expression)) {
    throw new Error(`calculate 只支持数字和 + - * / ( )，收到不支持的表达式: ${expression}`);
  }
  // eslint-disable-next-line no-new-func -- 输入已用白名单正则校验过，不会跑到任意代码。
  const value = Function(`"use strict"; return (${expression});`)() as unknown;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`表达式 ${expression} 没算出一个有限数字`);
  }
  return value;
}

export function executeTool(name: string, args: Record<string, unknown>): unknown {
  switch (name) {
    case "get_weather": {
      const city = String(args.city ?? "");
      if (!city) throw new Error("get_weather 需要 city 参数");
      return getWeather(city);
    }
    case "calculate": {
      const expression = String(args.expression ?? "");
      if (!expression) throw new Error("calculate 需要 expression 参数");
      return { expression, result: calculate(expression) };
    }
    default:
      throw new Error(`未知工具: ${name}`);
  }
}
