# OpenLLMetry 示例

这个示例把 [`docs-site/zh/guides/connect-otel.mdx`](../../../../docs-site/zh/guides/connect-otel.mdx)
「2. 应用侧」OpenLLMetry tab 里的几行配置摊开成完整可跑的 app:一个带工具调用的
HTTP 聊天服务 + 一个最简单的静态前端,零构建步骤。**不接 niceeval**,纯粹是一个
普通的 AI agent 应用,恰好用 `@traceloop/node-server-sdk` 把 trace 发出去。

## 目录结构

- `instrumentation.ts`:OpenLLMetry 初始化,必须在 `openai` SDK 被 import 之前执行。
  `@traceloop/node-server-sdk` 不认标准的 `OTEL_EXPORTER_OTLP_ENDPOINT`,只认自己的
  `baseUrl`(还会自动拼 `/v1/traces`),这里做了一层转译,好让 `.env` 里只出现一个
  "标准"变量名。
- `tools.ts`:两个工具的实现——`get_weather`(固定城市表 + 确定性伪随机,不打外部
  API)和 `calculate`(手写递归下降算术解析器,不用 `eval()`)——以及给 OpenAI 用的
  工具 schema。
- `agent.ts`:手写的工具调用循环,真调用 `openai` SDK 的 `chat.completions.create`,
  OpenLLMetry 自动给 chat 调用和工具调用打 span。
- `server.ts`:一个 `node:http` 服务器,`GET /healthz`、`POST /api/chat`、
  `GET /` 返回 `public/index.html`。
- `public/index.html`:单文件静态前端,原生 `fetch()`,没有 Vite/React/构建步骤。
- `docker-compose.yml`:本地 trace 查看器(Jaeger),接 OTLP HTTP 端口 `4318`,
  UI 在 `16686`。

## 跑起来

这个目录是一个**独立项目**(自带 `package.json`,不属于仓库根 pnpm workspace,不依赖
`niceeval`)。

```sh
cd examples/zh/origin/openllmetry
pnpm install
cp .env.example .env   # 填入 OPENAI_API_KEY(可选 OPENAI_BASE_URL / AGENT_MODEL)
pnpm dev               # http://127.0.0.1:5488
```

浏览器打开 `http://127.0.0.1:5488`,或者直接:

```sh
curl -X POST localhost:5488/api/chat \
  -H 'content-type: application/json' \
  -d '{"message":"北京天气怎么样"}'
```

每次请求都会真的调用 `.env` 里配置的模型,OpenLLMetry 自动打出 chat/tool span。

起本地 trace 查看器,发几条消息后去 UI 里看瀑布图:

```sh
docker compose up -d
open http://localhost:16686   # 选 service = openllmetry-example
```

真实团队多半已经有自己的观测后端:把 `.env` 里的 `OTEL_EXPORTER_OTLP_ENDPOINT` 换成
Traceloop 官方托管地址(`https://api.traceloop.com`)并配上 `TRACELOOP_API_KEY`,就能
用 Traceloop 自己的 dashboard 产品——应用侧代码(`instrumentation.ts`)不用改一行。

## 相关文档

这个示例把 [「通过 OTel 接入」](../../../../docs-site/zh/guides/connect-otel.mdx) 文档
「2. 应用侧」OpenLLMetry tab 里的几行配置摊开成完整可跑的 app,方便对照着看接入
点具体落在哪。niceeval 侧怎么用 `otelEvents()` 接住这些 span、写断言,看那篇文档。
