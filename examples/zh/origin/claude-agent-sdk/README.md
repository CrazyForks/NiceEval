# Claude Agent SDK 示例

这是一个**独立示例应用**,演示用 [`@anthropic-ai/claude-agent-sdk`](https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk)
(把 Claude Code CLI 包成子进程的 harness SDK,`query()` 返回 `SDKMessage` 流——**不是**普通
Messages API 的 `@anthropic-ai/sdk`)搭一个带工具调用 + 人工审批(HITL)的 agent 后端,并接到
`examples/zh/origin/ai-sdk-v7` 那套 React 聊天前端上,长什么样。

这个目录不依赖、不 import `niceeval`,没有 `adapter/`、`evals/`、`niceeval.config.ts`——它只是
仓库根 README「Agent Frameworks」路线图里 "Claude SDK" 一项配的文档/示例素材,**不是**一个可用的
niceeval 接入实现。

每次对话都是真实的 `query()` 调用——没有 mock 模式、没有离线开关。两个工具(`get_weather` /
`calculate`)背后是确定性模拟数据,那只是"假天气",跟"是否真的调用了模型"是两回事。

## 前端复用,后端自己翻译协议

前端直接复用 `ai-sdk-v7` 的 `@ai-sdk/react` `useChat` + `DefaultChatTransport` 界面(消息列表 /
工具调用气泡 / 审批气泡),这个目录里裁掉了那边用不上的模型选择器和图片上传。

`useChat` 认的是 AI SDK 的 **UI Message Stream 协议**(`UIMessageChunk` 序列:
`start` → `text-start`/`text-delta`/`text-end` → `tool-input-available` → ... →
`finish`),这是个纯协议类型,不需要真的经过 `ai` 包自己的 `streamText`/`LanguageModel` 抽象——
任何后端只要产出这个形状的 chunk,`useChat` 就能原样渲染。所以这个 demo 完全不用
`@ai-sdk/openai` 之类的 provider,而是自己写了一层翻译:

- `ui-stream.ts`:`buildUiStream(message, sessionId, signal)` 消费 `runTurn()` 的
  `SDKMessage` 异步流(`includePartialMessages: true` 打开后是 Anthropic 原始流事件:
  `content_block_start`/`content_block_delta`/`content_block_stop`),手写
  `writer.write(...)` 把它们翻成对应的 `UIMessageChunk`——不调用 `createUIMessageStream` 之外的
  任何 `ai` 模型接口。
- `server.ts` 收 `DefaultChatTransport` 发来的 `{messages: UIMessage[], sessionId?}`,只取
  **最后一条**用户消息的文本喂给 `runTurn()`(这个后端是"每轮一次 `query()` + `resume` 找回历史"
  的会话形态,不是整份 `messages[]` 重放),再用 `pipeUIMessageStreamToResponse` 把
  `buildUiStream` 的输出转成 SSE 写回去。

## HITL:calculate 需要人工审批

`calculate` 工具挂了 `needsApproval` 式的人工审批;`get_weather` 不需要,直接放行。整条链路:

1. `ui-stream.ts` 在看到 `mcp__demo-tools__calculate` 的 `tool_use` 块结束时,先发
   `tool-input-available`(创建这个 tool part),再发 `tool-approval-request`
   (`approvalId` = `toolCallId` = tool_use 块的 `id`)。前端据此渲染"允许/拒绝"按钮
   (`App.tsx` 的 `approval-requested` 分支)。
2. 用户点按钮时,前端**不是**调 `useChat` 的 `addToolApprovalResponse`(那是 AI SDK 自己
   "结束流、客户端带着审批结果重放整段历史"的 resume 模式用的),而是直接
   `fetch('/api/chat/approve', {body: {toolUseId, approved}})`——一次独立请求,不经过
   `useChat` 的消息发送路径。
3. `agent.ts` 里 `query()` 的 `canUseTool` 回调,在看到 `mcp__demo-tools__calculate` 时,把一个
   `resolve` 函数存进 `pending-approvals.ts` 的进程级 `Map<toolUseId, resolve>`,然后
   `await` 一个 `Promise<boolean>`。`query()` 的 async generator 在这个 Promise resolve 之前
   不会产出新消息——`server.ts` 那条 SSE 连接因此**全程保持打开**,不是"停流等前端重发"的模式。
4. `POST /api/chat/approve` 从 `pendingApprovals` 里取出那个 `resolve`、调用它,`canUseTool`
   的 Promise 立刻 resolve,`query()` 接着往下跑,`ui-stream.ts` 的 `for await` 循环自然见到
   后续消息(工具结果或拒绝后的错误 `tool_result`),翻成 `tool-output-available` /
   `tool-output-error` 继续往前端推。

踩过的坑,记下来供参考(也写进了下面的 API 速记):

- **`allowedTools` 里的通配符会绕过 `canUseTool`。** 最早两个工具都塞进
  `allowedTools: ["mcp__demo-tools__*"]` 配 `permissionMode: "dontAsk"`,`calculate`
  完全不会触发审批——SDK 文档写得很明白,`allowedTools` 命中的工具"execute automatically
  without asking",`dontAsk` 模式下没命中白名单的工具是直接 auto-deny,两条路径都不经过
  `canUseTool`。要让 `calculate` 走到 `canUseTool` 的 ask 流程,`allowedTools` 只能放
  `get_weather`,`permissionMode` 得用 `"default"`。
- **`canUseTool` 返回 `{behavior:'allow'}` 会被拒。** TS 类型里 `PermissionResult` 的
  `updatedInput` 是可选字段,但 CLI 子进程那边校验用的 zod schema 实测要求 `allow` 分支必须带
  `updatedInput`(一个 record),不带会在控制通道里报 `ZodError: invalid_type`。改成
  `{behavior:'allow', updatedInput: input}`(原样回传收到的 input)就正常了。
- **`canUseTool` 主动 `deny` 不会触发 `SDKPermissionDeniedMessage`。** 这条系统消息
  (`system`/`permission_denied`)只在权限引擎自己短路拒绝(如 `dontAsk` 模式下没命中白名单)
  时才发;`canUseTool` 回调自己返回 `deny` 时,SDK 只是把 `message` 包成一个普通的
  `is_error: true` 的 `tool_result`——`ui-stream.ts` 已经在处理这种情况(翻成
  `tool-output-error`),不需要额外分支。

## 目录结构

- `tools.ts`:两个工具的纯逻辑实现(`WEATHER_TABLE`/`getWeather`/`calculate`,确定性模拟数据,
  `calculate` 是自写的小型递归下降算术求值器,不用 `eval`/`Function`),包成
  Claude Agent SDK `tool()` 形状导出为 `demoTools`。
- `agent.ts`:`SYSTEM_PROMPT`、`MODEL`、进程级的 `createSdkMcpServer` 实例、`canUseTool`
  (HITL 审批门),以及真实调用 `query()` 的 `runTurn(message, resumeSessionId)`——返回
  `SDKMessage` 的 `AsyncGenerator`,不在这层做任何折叠。
- `pending-approvals.ts`:进程级 `Map<toolUseId, resolve>`,HITL 审批状态的唯一存储——写入方
  只有 `agent.ts` 的 `canUseTool`,读取/消费方只有 `server.ts` 的 `/api/chat/approve`。
- `ui-stream.ts`:把 `SDKMessage` 流翻成 AI SDK `UIMessageChunk` 流的适配器,`buildUiStream()`
  是唯一导出。
- `server.ts`:HTTP 层,一个 `node:http` 服务器(无框架)。
  - `GET /healthz` → `{ok:true}`
  - `POST /api/chat`,body `{messages: UIMessage[], sessionId?}` → AI SDK UI Message Stream
    协议的 SSE;浏览器断开时中断这轮 agent(`query.interrupt()`)。
  - `POST /api/chat/approve`,body `{toolUseId, approved}` → 唤醒 `pending-approvals.ts`
    里对应的 `canUseTool` 等待。
- `src/client/App.tsx` + `App.css`:复用 `ai-sdk-v7` 的聊天界面骨架(useChat + 消息列表 + 工具/
  审批气泡),裁掉模型选择器和图片上传;审批按钮走 `fetch('/api/chat/approve')` 而不是
  `addToolApprovalResponse`(见上面 HITL 一节)。
- `index.html` / `vite.config.ts`:Vite 开发服务器,`/api` 代理到 `server.ts`(默认端口 5189)。
- `package.json`:`"private": true`,自带 `pnpm-workspace.yaml`(`packages: []`)使它脱离仓库根
  workspace,是完全独立的 npm 项目。`pnpm dev` 用 `concurrently` 同时起 `server.ts` 和 Vite。
- `.env.example`:`ANTHROPIC_API_KEY` / `ANTHROPIC_BASE_URL` / `AGENT_MODEL` / `PORT`。

## Claude Agent SDK API 速记(2026-07 核实)

以下结论来自 SDK 自带的 `sdk.d.ts` 类型声明(`@anthropic-ai/claude-agent-sdk@0.3.198`)以及
`code.claude.com/docs/en/agent-sdk/typescript`:

- 调用面:`query({ prompt, options }) → AsyncGenerator<SDKMessage>`。`SDKMessage` 是一个成员很多
  (~30+)的联合类型,核心是 `assistant` / `user` / `result` / `system`;tool_use 是 assistant 消息
  content 里的标准 Anthropic 块,tool_result 通过 user 消息块回流,`tool_use.id` 与
  `tool_result.tool_use_id` 显式配对。`ui-stream.ts` 靠 `includePartialMessages: true` 打开的
  `stream_event`(原始 `BetaRawMessageStreamEvent`)逐 token 渲染文本,tool_use 的 `input` 在
  `content_block_start` 时是空对象 `{}`,要把后续 `input_json_delta` 的 `partial_json` 片段拼起来,
  在 `content_block_stop` 时才能 `JSON.parse` 出完整参数。
- 工具名带 MCP 命名空间前缀:`createSdkMcpServer({name:"demo-tools", tools})` 注册的
  `calculate` 工具,在 `tool_use` 块里的真实 `name` 是 `mcp__demo-tools__calculate`,不是裸的
  `calculate`——`agent.ts` 的 `GATED_TOOL_NAME` 和 `ui-stream.ts` 里判断要不要发
  `tool-approval-request` 用的都是这个带前缀的全名,实测确认过(见上面 HITL 一节的踩坑记录)。
- 系统提示:`options.systemPrompt`,可以是纯字符串,也可以是
  `{type:'preset', preset:'claude_code', append}` 这种预设+追加的形式。
- 自定义工具:`tool(name, description, zodShape, handler)` 建工具,`createSdkMcpServer({name, tools})`
  打包成一个进程内 MCP server,再通过 `options.mcpServers` 挂上去——SDK 的工具模型确实是走 MCP
  wiring,不是随便传个函数数组。
- 权限:`allowedTools` 里的工具会跳过所有询问直接执行,不会经过 `canUseTool`;`permissionMode`
  决定"没命中白名单的工具"默认怎么处理——`'dontAsk'` 是直接拒绝(同样不经过 `canUseTool`),
  `'default'` 会把决策交给 `canUseTool`(headless 场景下这就是"询问"的实现方式)。这个 demo:
  `get_weather` 进 `allowedTools` 直接放行,`calculate` 靠 `permissionMode: 'default'` +
  `canUseTool` 做人工审批。
- 会话续接:`options.resume: <session_id>`(接着某个具体会话)、`options.continue: true`(接最近一次
  会话)、`options.forkSession: true`(复制历史开新分支)。每次 `query()` 都会重新起一个 CLI 子进程——
  会话记忆完全靠 `resume` 找回历史,不是进程内状态。`session_id` 从流里第一条带这个字段的消息
  就能拿到(不用等到 `result`),`ui-stream.ts` 把它放进 `start` chunk 的 `messageMetadata`,
  前端存进 `message.metadata.sessionId`,下一轮请求带回来。
- Model id:`options.model` 接受 `'claude-sonnet-5'` / `'claude-opus-4-8'` / `'claude-fable-5'` 这类
  别名,也接受模型服务商自己的 model id(比如接 DeepSeek 的 Anthropic 兼容端点时用
  `deepseek-v4-flash`)。这个 demo 通过 `AGENT_MODEL` 环境变量配置,默认 `deepseek-v4-flash`。
- 遥测:SDK 本身不产生 OTel 数据,只是把 env 透传给 CLI 子进程;CLI 有自己的 OTel 三信号开关,traces
  还在 beta 且默认内容脱敏。这个 demo 没有接观测,纯粹是一个能跑的 agent。

## 运行时依赖

- 需要 `ANTHROPIC_API_KEY`;`query()` 会把它(以及 `ANTHROPIC_BASE_URL`,如果设置了的话)透传给
  Claude Code CLI 子进程。默认走官方 Anthropic API;也可以指向任何 Anthropic 兼容端点——本仓库
  已用 DeepSeek 的 `https://api.deepseek.com/anthropic` + `deepseek-v4-flash` 端到端验证过:
  天气/算术工具调用、HITL 审批(允许/拒绝)、多轮 `resume` 会话续接均正常。
- SDK 把 `claude-code` 原生可执行文件作为 optional dependency 一起装;如果你的包管理器跳过了
  optional deps,需要额外装 `@anthropic-ai/claude-code` 并设置
  `options.pathToClaudeCodeExecutable` 指向那个可执行文件。

## 跑起来

这个目录是一个**独立的 npm 项目**(自带 `package.json` + `pnpm-workspace.yaml`)。

```sh
cd examples/zh/origin/claude-agent-sdk
pnpm install
cp .env.example .env
# 编辑 .env,填入 ANTHROPIC_API_KEY(以及可选的 ANTHROPIC_BASE_URL / AGENT_MODEL)

pnpm dev
# server.ts 监听 :5189,Vite 开发服务器监听 :5173(代理 /api 到 5189)
```

浏览器打开 `http://localhost:5173/` 就是聊天界面。

命令行冒烟(不开浏览器):

```sh
curl localhost:5189/healthz

curl -N -X POST localhost:5189/api/chat -H 'content-type: application/json' \
  -d '{"messages":[{"id":"m1","role":"user","parts":[{"type":"text","text":"北京天气怎么样"}]}]}'

# 触发 calculate 会在 SSE 里停在 tool-approval-request(流不会继续,直到审批):
curl -N -X POST localhost:5189/api/chat -H 'content-type: application/json' \
  -d '{"messages":[{"id":"m1","role":"user","parts":[{"type":"text","text":"帮我算 (3+4)*2"}]}]}'
# 另开一个终端,把上面输出里 tool-approval-request 的 approvalId 抄过来:
curl -X POST localhost:5189/api/chat/approve -H 'content-type: application/json' \
  -d '{"toolUseId":"<approvalId>","approved":true}'
```
