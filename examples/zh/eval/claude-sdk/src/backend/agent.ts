// 真实调用 @anthropic-ai/claude-agent-sdk 的 query()。
// 需要 ANTHROPIC_API_KEY,且需要能找到 claude-code 可执行文件(SDK 把它作为
// optional dependency 一起装;如果包管理器跳过了 optional deps,要另装
// @anthropic-ai/claude-code 并设置 pathToClaudeCodeExecutable)。

import { createSdkMcpServer, query, type SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import { buildTools, type ToolCallLog } from "./tools.ts";

// Claude Agent SDK 的 model 选项接受 'claude-sonnet-5' / 'claude-opus-4-8' / 'claude-fable-5' 这类
// 别名(见 SDK 自带的 Options.model 文档注释),也接受任何模型服务商自己的 model id——这里默认
// 走 DeepSeek 的 Anthropic 兼容端点,通过 AGENT_MODEL 可覆盖。
const MODEL = process.env.AGENT_MODEL ?? "deepseek-v4-flash";

const SYSTEM_PROMPT = [
  "你是 niceeval 仓库里的一个示例助手,名字叫“小天”。",
  "你有两个工具:get_weather(查询城市天气)和 calculate(算术表达式求值)。",
  "只要问题涉及天气或算式,必须调用对应工具拿到结果,不要凭空编造数字。",
  "回答使用简体中文,简洁直接,不需要多余的寒暄。",
].join("\n");

// 我们自己的 sessionId -> Claude Agent SDK 内部 session_id 的映射。
// 每次 query() 调用都会重新起一个 CLI 子进程,会话记忆完全靠 resume 携带上一轮
// 拿到的 session_id 找回历史,而不是进程里保留了什么状态。
const claudeSessionIdByOurSession = new Map<string, string>();

export async function runTurn(message: string, ourSessionId: string): Promise<{ reply: string; toolCalls: ToolCallLog[] }> {
  const toolCalls: ToolCallLog[] = [];
  const demoTools = createSdkMcpServer({
    name: "demo-tools",
    version: "1.0.0",
    tools: buildTools(toolCalls),
  });

  const resumeId = claudeSessionIdByOurSession.get(ourSessionId);

  let reply = "(未收到 result 消息)";
  const stream: AsyncGenerator<SDKMessage> = query({
    prompt: message,
    options: {
      systemPrompt: SYSTEM_PROMPT,
      model: MODEL,
      // 关掉内置工具(Bash/Read/...),这个 demo 只暴露我们自己的两个 MCP 工具。
      tools: [],
      mcpServers: { "demo-tools": demoTools },
      // 这是个无人值守的 HTTP 服务,没有终端可以交互式批准权限请求。默认
      // permissionMode('default')会为工具调用弹出权限提示,在这里等不到回应,
      // 模型只能眼睁睁跳过工具、自己编答案(实测:天气瞎编数据,算术直接说"需要
      // 先授权")。这两个工具是我们自己写的确定性逻辑,不是危险操作,所以直接
      // bypassPermissions——生产场景如果要暴露给不受信输入,应该换成 canUseTool
      // 按工具名做白名单,而不是整体 bypass。
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
      ...(resumeId ? { resume: resumeId } : {}),
    },
  });

  for await (const msg of stream) {
    if (msg.type !== "result") continue;
    if (msg.subtype === "success") {
      reply = msg.result;
    } else {
      reply = `agent 执行出错(${msg.subtype}):${msg.errors.join("; ")}`;
    }
    // 无论成功还是出错,result 消息都带 session_id —— 存起来供下一轮 resume。
    claudeSessionIdByOurSession.set(ourSessionId, msg.session_id);
  }

  return { reply, toolCalls };
}
