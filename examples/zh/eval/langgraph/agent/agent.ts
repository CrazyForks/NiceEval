// 真的经 LangGraph 的 createReactAgent 跑一遍 ReAct 循环
// (LLM -> 决定要不要调工具 -> 执行工具 -> 把结果喂回 LLM -> ...)。
// 这条路径会经过 @langchain/core 的埋点,配合 ../observability.ts 里注册的
// LangSmith OTel exporter 出 span。
import { AIMessage, ToolMessage, type BaseMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { agentTools } from "./tools.ts";
import type { ChatTurnResult, ToolCallRecord } from "./types.ts";

const SYSTEM_PROMPT = `你是一个乐于助人的中文 AI 助手。
需要天气信息时调用 get_weather,并用工具返回的数据作答,不要凭空编造天气。
需要精确计算时调用 calculate,把表达式交给它算,不要心算。
普通闲聊不要调用任何工具。回复保持中文、友好、简洁。`;

let cachedAgent: ReturnType<typeof buildAgent> | undefined;

function buildAgent() {
  const llm = new ChatOpenAI({
    model: process.env.AGENT_MODEL ?? "gpt-4o-mini",
    apiKey: process.env.OPENAI_API_KEY,
    configuration: process.env.OPENAI_BASE_URL ? { baseURL: process.env.OPENAI_BASE_URL } : undefined,
  });
  return createReactAgent({
    llm,
    tools: agentTools,
    prompt: SYSTEM_PROMPT,
    // 内存态 checkpointer:同一个 sessionId(-> thread_id)内的多轮对话有记忆,
    // 进程重启就丢——演示用足够了,生产场景换持久化 checkpointer。
    checkpointer: new MemorySaver(),
  });
}

function getAgent() {
  cachedAgent ??= buildAgent();
  return cachedAgent;
}

export async function runTurn(message: string, sessionId: string): Promise<ChatTurnResult> {
  const agent = getAgent();
  const result = await agent.invoke(
    { messages: [{ role: "user", content: message }] },
    { configurable: { thread_id: sessionId } },
  );
  const messages = result.messages as BaseMessage[];
  const toolCalls = extractToolCalls(messages);
  const last = messages.at(-1);
  const reply = typeof last?.content === "string" ? last.content : JSON.stringify(last?.content ?? "");
  return { reply, toolCalls };
}

/** 把这一轮里产生的 AIMessage.tool_calls + 对应 ToolMessage 配对成 {name, input, output}。 */
function extractToolCalls(messages: BaseMessage[]): ToolCallRecord[] {
  const callsById = new Map<string, { name: string; input: unknown }>();
  for (const msg of messages) {
    if (msg instanceof AIMessage) {
      for (const call of msg.tool_calls ?? []) {
        if (call.id) callsById.set(call.id, { name: call.name, input: call.args });
      }
    }
  }
  const toolCalls: ToolCallRecord[] = [];
  for (const msg of messages) {
    if (msg instanceof ToolMessage) {
      const meta = msg.tool_call_id ? callsById.get(msg.tool_call_id) : undefined;
      toolCalls.push({
        name: meta?.name ?? String(msg.name ?? "unknown_tool"),
        input: meta?.input ?? {},
        output: parseToolContent(msg.content),
      });
    }
  }
  return toolCalls;
}

function parseToolContent(content: BaseMessage["content"]): unknown {
  if (typeof content !== "string") return content;
  try {
    return JSON.parse(content);
  } catch {
    return content;
  }
}
