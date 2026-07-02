// 真实模型 + 手写 tool-calling 循环:直接用 openai npm SDK 打 OpenAI 兼容 API，
// 每一轮模型调用和工具调用都经 tracing.ts 里的 traceChatCall / traceToolCall 埋点。
import OpenAI from "openai";
import { traceChatCall, traceToolCall, type ChatMessage } from "./tracing.ts";
import { executeTool } from "./tools.ts";

export interface ToolCallRecord {
  name: string;
  input: unknown;
  output: unknown;
}

export interface ChatResult {
  reply: string;
  toolCalls: ToolCallRecord[];
}

const TOOL_DEFS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_weather",
      description: "查询城市当前天气(mock 数据，仅用于演示，不接真实天气 API)",
      parameters: {
        type: "object",
        properties: { city: { type: "string", description: "城市名，例如 北京" } },
        required: ["city"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "calculate",
      description: "计算一个只含数字和 + - * / ( ) 的算术表达式",
      parameters: {
        type: "object",
        properties: { expression: { type: "string", description: "算术表达式，例如 (3+4)*2" } },
        required: ["expression"],
      },
    },
  },
];

function toChatMessage(
  m: OpenAI.Chat.Completions.ChatCompletionMessageParam | OpenAI.Chat.Completions.ChatCompletionMessage,
): ChatMessage {
  const content = typeof m.content === "string" ? m.content : JSON.stringify(m.content ?? null);
  return { role: m.role, content };
}

export async function runAgent(message: string): Promise<ChatResult> {
  const model = process.env.AGENT_MODEL ?? "gpt-4o-mini";
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, baseURL: process.env.OPENAI_BASE_URL });
  const toolCalls: ToolCallRecord[] = [];
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: "你是一个能查天气、能做算术的助理。需要时调用工具，不要自己瞎编数字。" },
    { role: "user", content: message },
  ];

  const maxRounds = 5;
  for (let round = 0; round < maxRounds; round++) {
    const inputMessages = messages.map(toChatMessage);
    const assistantMessage = await traceChatCall(model, { messages: inputMessages }, async () => {
      const response = await client.chat.completions.create({ model, messages, tools: TOOL_DEFS });
      const choice = response.choices[0];
      if (!choice?.message) throw new Error(`模型 ${model} 没有返回 message`);
      return { result: choice.message, outputMessages: [toChatMessage(choice.message)] };
    });

    messages.push(assistantMessage);

    if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
      return { reply: assistantMessage.content ?? "", toolCalls };
    }

    for (const call of assistantMessage.tool_calls) {
      if (call.type !== "function") continue;
      const args = JSON.parse(call.function.arguments || "{}") as Record<string, unknown>;
      const output = await traceToolCall(call.function.name, call.id, args, async () =>
        executeTool(call.function.name, args),
      );
      toolCalls.push({ name: call.function.name, input: args, output });
      messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(output) });
    }
  }

  throw new Error(`工具调用循环超过 ${maxRounds} 轮还没收敛，可能陷入死循环`);
}
