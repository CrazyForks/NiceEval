# LangGraph / LangChain + LangSmith OTel 示例

这个示例把 [`docs-site/zh/guides/connect-otel.mdx`](../../../../docs-site/zh/guides/connect-otel.mdx)
"2. 应用侧" 一节里 **LangGraph / LangChain** tab 的那几行配置摊开成一个完整可跑的
app:一个用 `createReactAgent` 搭的两工具 ReAct agent,HTTP server + 一个纯静态
聊天页面。它是一个**普通的 LangGraph 应用**——不接 niceeval,没有 `adapter/`、
`evals/`、`niceeval.config.ts`,单独一个 `package.json`,和仓库根的 pnpm workspace
无关。

## 目录结构

- `agent/tools.ts`:两个工具的纯函数实现——`get_weather(city)`(固定城市表 + 未知
  城市按名字算确定性伪随机)和 `calculate(expression)`(不用 `eval()`/`Function()`
  的递归下降算术解析器)。同时导出包了 `tool()` + zod schema 的 LangChain 工具对象。
- `agent/agent.ts`:`ChatOpenAI` + `@langchain/langgraph/prebuilt` 的
  `createReactAgent`,带 `MemorySaver` checkpointer(同一个 `sessionId` 内的多轮对话
  有记忆,进程重启就丢)。把 agent 跑完之后的 `messages` 里的 `AIMessage.tool_calls`
  / `ToolMessage` 配对成 `{name, input, output}`。
- `observability.ts`:LangSmith 的 OTel-only 导出接线,见下面「和文档 tab 的差异」。
- `server.ts`:一个 `node:http` 服务器,`GET /healthz`、`POST /api/chat`、
  `GET /` 三个路由,没有用任何 web 框架。
- `public/index.html`:单文件静态聊天页,原生 `fetch()`,没有 Vite/React/构建步骤。
- `docker-compose.yml`:本地自托管的 trace 查看器(Jaeger),接收 OTLP/HTTP。

## 和文档 tab 的差异

文档 tab 说这是"零依赖路线,三个环境变量"。这句话对 **Python** 版 `langsmith` SDK
成立(import 时自动挂 OTel hook)。但当前 **JS** 版(`langsmith@0.7.x`)还没做到
纯 env 驱动:`@langchain/core` 的埋点靠全局 OTel `TracerProvider`,JS 没有 Python
那种导入期自动注册机制——不主动调用一次 `initializeOTEL()`,SDK 只会打一行警告、
不产生任何 span。所以 `observability.ts` 比文档 tab 多了这一行 `initializeOTEL()`
调用,其余(三个 `LANGSMITH_*` 变量 + 标准的 `OTEL_EXPORTER_OTLP_ENDPOINT`)完全
是纯 env 变量驱动,没有别的应用代码改动。这些变量只在进程启动时读一次(标准 OTel
SDK 的限制),改了 `.env` 要重启进程才生效,热切换端点做不到。

## 跑起来

这个目录是一个**独立的 npm 项目**(自带 `package.json` 和 `pnpm-workspace.yaml`)。

```sh
cd examples/zh/origin/langgraph
pnpm install
cp .env.example .env
```

```sh
# .env 里填 OPENAI_API_KEY(可选 OPENAI_BASE_URL / AGENT_MODEL)
pnpm dev   # http://localhost:5388,浏览器直接打开这个地址聊天
```

看 trace(可选):

```sh
docker compose up -d
# .env 里取消注释 LANGSMITH_TRACING / LANGSMITH_OTEL_ENABLED / LANGSMITH_OTEL_ONLY
# / OTEL_EXPORTER_OTLP_ENDPOINT(默认已指向下面这个本地 Jaeger),重启 pnpm dev
open http://localhost:16686   # Jaeger UI,按 service 名筛 span
```

真要看 LangSmith 官方 UI(prompt/completion 内容、按 run 分组等),把 `.env` 里的
`OTEL_EXPORTER_OTLP_ENDPOINT` 换成 LangSmith 云端端点(`https://api.smith.langchain.com/otel/v1/traces`,
配 `OTEL_EXPORTER_OTLP_HEADERS="x-api-key=<你的 LangSmith key>"`)即可,应用代码不用改——
这正是文档 tab 里"端点值按……" 那句话说的东西。
