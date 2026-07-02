// runTurn 的响应形状,server.ts 直接透传给 /api/chat 调用方。
export interface ToolCallRecord {
  name: string;
  input: unknown;
  output: unknown;
}

export interface ChatTurnResult {
  reply: string;
  toolCalls: ToolCallRecord[];
}
