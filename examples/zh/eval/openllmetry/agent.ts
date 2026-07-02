// 手写的工具调用循环:真调用 openai SDK,OpenLLMetry 自动给 chat completion 和
// 工具调用打 span(见 instrumentation.ts)。

import OpenAI from "openai";
import { TOOL_SCHEMAS, calculate, getWeather } from "./tools.ts";

export type ToolCallRecord = { name: string; input: unknown; output: unknown };
export type ChatResult = { reply: string; toolCalls: ToolCallRecord[] };

let client: OpenAI | undefined;
function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, baseURL: process.env.OPENAI_BASE_URL });
  }
  return client;
}

const SYSTEM_PROMPT =
  "你是一个演示助手,有两个工具:get_weather(查城市天气)和 calculate(算算术表达式)。" +
  "需要时调用工具,再用工具结果回答用户,不要编造数据。";

// 按 sessionId 存多轮历史;不传 sessionId 时都落到 "default",单进程演示够用。
const histories = new Map<string, OpenAI.Chat.Completions.ChatCompletionMessageParam[]>();

export async function chat(message: string, sessionId?: string): Promise<ChatResult> {
  const id = sessionId ?? "default";
  const model = process.env.AGENT_MODEL ?? "gpt-4o-mini";
  const openai = getClient();

  const history = histories.get(id) ?? [{ role: "system", content: SYSTEM_PROMPT }];
  history.push({ role: "user", content: message });

  const toolCalls: ToolCallRecord[] = [];

  // 工具调用循环:模型要工具就跑工具、把结果喂回去,直到模型给出最终文本回复,
  // 或者超过安全上限(说明模型在反复瞎调,直接报错比死循环好排查)。
  for (let turn = 0; turn < 8; turn++) {
    const completion = await openai.chat.completions.create({ model, messages: history, tools: TOOL_SCHEMAS });
    const responseMessage = completion.choices[0].message;
    history.push(responseMessage);

    if (!responseMessage.tool_calls || responseMessage.tool_calls.length === 0) {
      histories.set(id, history);
      return { reply: responseMessage.content ?? "", toolCalls };
    }

    for (const call of responseMessage.tool_calls) {
      if (call.type !== "function") continue;
      const args = JSON.parse(call.function.arguments) as Record<string, unknown>;
      const output = runTool(call.function.name, args);
      toolCalls.push({ name: call.function.name, input: args, output });
      history.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(output) });
    }
  }

  throw new Error(`工具调用循环超过 8 轮还没结束(sessionId=${id}),消息:"${message}"`);
}

function runTool(name: string, args: Record<string, unknown>): unknown {
  if (name === "get_weather") return getWeather(String(args.city));
  if (name === "calculate") return calculate(String(args.expression));
  throw new Error(`未知工具:${name}`);
}
