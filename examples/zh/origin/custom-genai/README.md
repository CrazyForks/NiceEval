# custom-genai(自己埋 GenAI 语义约定)

不用任何 vendor SDK(没有 `@ai-sdk/otel`、`@traceloop/node-server-sdk`、OpenInference)，
直接用 `@opentelemetry/api` 手写 span、按 [OTel GenAI 语义约定](https://opentelemetry.io/docs/specs/semconv/gen-ai/)
打属性。一个能查天气 / 算算术的最小聊天 app,独立项目,不接 niceeval,真的调 OpenAI
兼容 API(需要 `OPENAI_API_KEY`)。

## 目录结构

- `tracing.ts`:OTel 初始化(`NodeTracerProvider` + `SimpleSpanProcessor`,导出走
  `OTEL_EXPORTER_OTLP_ENDPOINT`)和两个埋点 helper:
  - `traceChatCall(model, input, fn)`——span 名 `chat {model}`,打
    `gen_ai.operation.name = "chat"`、`gen_ai.request.model`。
  - `traceToolCall(toolName, callId, args, fn)`——span 名 `execute_tool {tool}`,打
    `gen_ai.operation.name = "execute_tool"`、`gen_ai.tool.name`、`gen_ai.tool.call.id`、
    `gen_ai.tool.call.arguments`。
  两个 helper 都会在异常时 `recordException` + 把 span status 设成 ERROR。
- `tools.ts`:两个工具的真实实现:`get_weather(city)`(mock 数据,不打真实天气 API)、
  `calculate(expression)`(白名单正则 + `Function` 的安全算术求值),以及按名字分发调用
  的 `executeTool`。
- `agent.ts`:真实模型 + 手写 tool-calling 循环。`runAgent(message)` 用 `openai` npm
  SDK 打 OpenAI 兼容 API,每一轮模型调用和工具调用都经 `traceChatCall` / `traceToolCall`
  埋点,循环上限 5 轮。
- `server.ts`:一个 `node:http` 服务器,只负责 HTTP 层——`/healthz`、`/api/chat`(调
  `runAgent`)、`/`(静态首页)。
- `public/index.html`:单文件前端,原生 JS `fetch()`,没有构建步骤。
- `docker-compose.yml`:起一个 Jaeger,本地看 span 树用。

## 两种 span 的属性形状

模型调用(`chat {model}`):

```
gen_ai.operation.name = "chat"
gen_ai.request.model  = "gpt-4o-mini"
gen_ai.input.messages  = [...]   # 只有开了内容采集才有
gen_ai.output.messages = [...]   # 只有开了内容采集才有
```

工具调用(`execute_tool {tool}`):

```
gen_ai.operation.name    = "execute_tool"
gen_ai.tool.name         = "get_weather"
gen_ai.tool.call.id      = "call_..."
gen_ai.tool.call.arguments = "{\"city\":\"北京\"}"
```

**消息内容是 opt-in**:OTel 官方 instrumentation 出于隐私考量,默认不采模型输入输出的
原文。这个例子里由 `OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT` 控制(见
`.env.example`),关着的时候 `gen_ai.input.messages` / `gen_ai.output.messages` 这两个
属性根本不会出现在 span 上——如果你的断言依赖消息内容(比如 niceeval 的
`messageIncludes`),记得打开这个开关。

## 跑起来

这个目录是一个**独立的 npm 项目**(自带 `package.json`),不依赖 niceeval。

```sh
cd examples/zh/origin/custom-genai
pnpm install
cp .env.example .env
# 在 .env 里填 OPENAI_API_KEY(可选 OPENAI_BASE_URL / AGENT_MODEL,接 DeepSeek 等
# OpenAI 兼容服务时用)
pnpm dev               # 监听 5299
```

浏览器打开 `http://localhost:5299`,问「北京天气怎么样」或者「(3+4)*2 等于多少」,能看到
回复里带工具调用记录。

看 span 树:

```sh
docker compose up -d          # 起 Jaeger,OTLP HTTP 端口 4318
# .env 里设 OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces,重启 pnpm dev
open http://localhost:16686   # Jaeger UI,选 custom-genai-example 服务看 span
```

在 Jaeger 里能直接看到 `chat {model}`(比如 `chat gpt-4o-mini`)套着 `execute_tool get_weather`
这类父子结构,
以及每个 span 上的 `gen_ai.*` 属性——如果你要给自己的 agent 手写埋点,这就是能直接照抄的
形状。

## 相关文档

这个示例把 [接 OTel 观测](../../../../docs-site/zh/guides/connect-otel.mdx) 文档「2. 应用侧」
里「自己埋的 gen_ai」那个 tab 展开成完整可跑的 app,也是自定义埋点想对齐 GenAI semconv 时
能直接抄的参考实现。
