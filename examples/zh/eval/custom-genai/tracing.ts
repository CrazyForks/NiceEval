// 手写 OTel GenAI 语义约定埋点 —— 不用任何 vendor SDK(没有 @ai-sdk/otel / traceloop /
// openinference),直接用 @opentelemetry/api 起 span、按语义约定打属性。
//
// 对应 docs-site/zh/guides/connect-otel.mdx「2. 应用侧」的「自己埋的 gen_ai」tab：
//   · 模型调用 span 名 `chat {model}`，gen_ai.operation.name = "chat"
//   · 工具调用 span 名 `execute_tool {tool}`，gen_ai.operation.name = "execute_tool"
//   · 消息内容(gen_ai.input.messages / gen_ai.output.messages)是 opt-in，
//     由 OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT 控制 —— 和 OTel 官方
//     instrumentation 的默认行为一致(默认不采内容，见 semconv 的隐私考量)。
import { NodeTracerProvider, SimpleSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { trace, SpanStatusCode, type Span, type Tracer } from "@opentelemetry/api";

const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

// eval 场景在意"这一轮的 span 及时到齐"，不在意导出吞吐 —— 用 SimpleSpanProcessor(每个
// span 结束就立即导出)而不是 BatchSpanProcessor(缓冲会让 span 跨轮迟到)。没配 endpoint
// 时(比如本地跑 mock 模式没接 collector)不装 processor，span 照样能创建，只是不导出。
const provider = new NodeTracerProvider({
  resource: resourceFromAttributes({ [ATTR_SERVICE_NAME]: "custom-genai-example" }),
  spanProcessors: endpoint ? [new SimpleSpanProcessor(new OTLPTraceExporter({ url: endpoint }))] : [],
});
provider.register();

export const tracer: Tracer = trace.getTracer("custom-genai-example");

/** gen_ai.input.messages / gen_ai.output.messages 是 opt-in —— 默认不采内容。 */
function captureMessageContent(): boolean {
  const flag = process.env.OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT;
  return flag === "true" || flag === "1";
}

export interface ChatMessage {
  role: string;
  content: string;
}

/**
 * 包一次模型调用：span 名 `chat {model}`，按 GenAI semconv 打
 * gen_ai.operation.name / gen_ai.request.model；内容采集开着才带
 * gen_ai.input.messages / gen_ai.output.messages。
 */
export async function traceChatCall<T>(
  model: string,
  input: { messages: ChatMessage[] },
  fn: (span: Span) => Promise<{ result: T; outputMessages: ChatMessage[] }>,
): Promise<T> {
  return tracer.startActiveSpan(`chat ${model}`, async (span) => {
    span.setAttribute("gen_ai.operation.name", "chat");
    span.setAttribute("gen_ai.request.model", model);
    if (captureMessageContent()) {
      span.setAttribute("gen_ai.input.messages", JSON.stringify(input.messages));
    }
    try {
      const { result, outputMessages } = await fn(span);
      if (captureMessageContent()) {
        span.setAttribute("gen_ai.output.messages", JSON.stringify(outputMessages));
      }
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      recordError(span, error);
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * 包一次工具执行：span 名 `execute_tool {tool}`，按 GenAI semconv 打
 * gen_ai.operation.name / gen_ai.tool.name / gen_ai.tool.call.id / gen_ai.tool.call.arguments。
 */
export async function traceToolCall<T>(
  toolName: string,
  callId: string,
  args: unknown,
  fn: (span: Span) => Promise<T>,
): Promise<T> {
  return tracer.startActiveSpan(`execute_tool ${toolName}`, async (span) => {
    span.setAttribute("gen_ai.operation.name", "execute_tool");
    span.setAttribute("gen_ai.tool.name", toolName);
    span.setAttribute("gen_ai.tool.call.id", callId);
    span.setAttribute("gen_ai.tool.call.arguments", JSON.stringify(args));
    try {
      const result = await fn(span);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      recordError(span, error);
      throw error;
    } finally {
      span.end();
    }
  });
}

function recordError(span: Span, error: unknown): void {
  const err = error instanceof Error ? error : new Error(String(error));
  span.recordException(err);
  span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
}

/** 进程退出前把还没导出的 span flush 掉——eval 场景每轮都该调,这里在 server 收到信号时调一次。 */
export async function shutdownTracing(): Promise<void> {
  await provider.shutdown();
}
