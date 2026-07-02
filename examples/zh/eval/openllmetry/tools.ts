// 两个工具的实现 + OpenAI 工具 schema。
import type OpenAI from "openai";

export const TOOL_SCHEMAS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_weather",
      description: "查询指定城市当前的天气(演示用固定数据,不接外部 API)。",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "城市名,例如 北京、上海" },
        },
        required: ["city"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "calculate",
      description: "计算一个只含数字和 + - * / ( ) 的算术表达式。",
      parameters: {
        type: "object",
        properties: {
          expression: { type: "string", description: "算术表达式,例如 (12 + 8) * 3" },
        },
        required: ["expression"],
      },
    },
  },
];

// 固定城市表,查不到的城市用基于名字的确定性伪随机数,保证同一输入永远同一输出——
// 录制 span 示例需要可复现。
const KNOWN_CITIES: Record<string, { condition: string; tempC: number }> = {
  "北京": { condition: "晴", tempC: 24 },
  "上海": { condition: "多云", tempC: 27 },
  "广州": { condition: "小雨", tempC: 30 },
  "深圳": { condition: "阴", tempC: 29 },
};

export function getWeather(city: string): { city: string; condition: string; tempC: number } {
  const known = KNOWN_CITIES[city.trim()];
  if (known) return { city, ...known };
  const seed = [...city].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const conditions = ["晴", "多云", "阴", "小雨"];
  return {
    city,
    condition: conditions[seed % conditions.length],
    tempC: 15 + (seed % 18),
  };
}

/** 只支持数字、+ - * / ( ) 和空格的递归下降解析器——不用 eval()/Function()。 */
export function calculate(expression: string): number {
  if (!/^[\d\s+\-*/().]+$/.test(expression)) {
    throw new Error(`表达式只能包含数字和 + - * / ( ):收到 "${expression}"`);
  }

  let pos = 0;

  function peek(): string | undefined {
    return expression[pos];
  }

  function skipSpaces(): void {
    while (peek() === " ") pos++;
  }

  function parseNumber(): number {
    skipSpaces();
    const start = pos;
    while (peek() !== undefined && /[\d.]/.test(peek()!)) pos++;
    if (pos === start) throw new Error(`表达式在位置 ${pos} 处缺少数字:"${expression}"`);
    return Number(expression.slice(start, pos));
  }

  function parseFactor(): number {
    skipSpaces();
    if (peek() === "(") {
      pos++;
      const value = parseExpr();
      skipSpaces();
      if (peek() !== ")") throw new Error(`表达式缺少右括号:"${expression}"`);
      pos++;
      return value;
    }
    if (peek() === "-") {
      pos++;
      return -parseFactor();
    }
    return parseNumber();
  }

  function parseTerm(): number {
    let value = parseFactor();
    for (;;) {
      skipSpaces();
      const op = peek();
      if (op === "*" || op === "/") {
        pos++;
        const rhs = parseFactor();
        value = op === "*" ? value * rhs : value / rhs;
      } else {
        return value;
      }
    }
  }

  function parseExpr(): number {
    let value = parseTerm();
    for (;;) {
      skipSpaces();
      const op = peek();
      if (op === "+" || op === "-") {
        pos++;
        const rhs = parseTerm();
        value = op === "+" ? value + rhs : value - rhs;
      } else {
        return value;
      }
    }
  }

  const result = parseExpr();
  skipSpaces();
  if (pos !== expression.length) {
    throw new Error(`表达式在位置 ${pos} 处有多余字符:"${expression}"`);
  }
  return result;
}
