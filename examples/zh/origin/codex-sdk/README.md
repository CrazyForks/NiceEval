# Codex SDK example

演示怎么用 OpenAI 的 **Codex TypeScript SDK**(`@openai/codex-sdk`)搭一个 agent
后端,接一个共享的 React 聊天前端。**独立项目,不接 niceeval**——不 import
`niceeval`,没有 `adapter/`、`evals/`、`niceeval.config.ts`,是给
`README.md` / `README.zh.md` "Agent Frameworks" roadmap 里 "Codex SDK" 这一项
配的示例/文档素材,不是一个可用的 niceeval 集成。

## Codex SDK 是什么样的 SDK(为什么任务形状长这样)

Codex SDK 包的是 `codex` CLI 本身:`new Codex()` 起一个客户端,
`codex.startThread({ workingDirectory })` 开一条对话线程,
`thread.run(message)` 跑一轮——SDK 内部 spawn `codex` CLI 子进程、用 JSONL 协议
交换事件。它是**"目录里的编码 agent"**:内置文件读写、跑 shell 命令、
git 感知,不是一个"你注册任意自定义 tool(比如 `get_weather`)、它帮你调"的
通用 chat SDK。

所以这个示例的聊天框发的是**自然语言编码请求**("创建一个文件叫
notes.txt"、"列出这个目录下的文件"),而不是硬凑一个天气/计算器工具——那样
会掩盖 Codex 真正的能力形状。

## 前后端接口:把 Codex 的事件流翻译成 AI SDK 的 UI Message Stream 协议

这个示例接的是和 `examples/zh/origin/ai-sdk-v7` 同一套 React 聊天前端
(`@ai-sdk/react` 的 `useChat` + `DefaultChatTransport`)。`UIMessageChunk`
(`node_modules/ai/dist/index.d.ts` 里的 `type UIMessageChunk`)是协议层类型——
任何后端手写这些 chunk 都行,不一定要经过 `streamText`,`useChat` 照样能按
`text-start/delta/end`、`tool-input-available`、`tool-output-available` 等
chunk 类型正常渲染。所以这里不再把 `ThreadEvent` 原样转发给前端,而是加一层
适配:

- SDK 自己推荐的用法是 `thread.runStreamed()`:返回 `ThreadEvent` 的
  AsyncGenerator(`thread.started` / `turn.started` /
  `item.started|updated|completed` / `turn.completed` / `turn.failed` /
  `error`),官方示例(`sdk/typescript/samples/basic_streaming.ts`)就是拿这个
  事件循环驱动 UI 的。
- `src/ui-stream.ts` 的 `buildUiStream()` 消费这个 AsyncGenerator,用
  `createUIMessageStream({ execute })` 把每个 `ThreadEvent` 翻译成
  `UIMessageChunk`:`thread.started` → `start`(`messageMetadata.threadId`);
  `agent_message` 的 `item.started`/`item.completed` → `text-start` +
  一个携带整段文本的 `text-delta`(SDK 只在 item 完成时给出整段文本,没有
  token 级别的增量,不是真正的逐字流式)+ `text-end`;其余 item 类型
  (`command_execution` / `file_change` / `mcp_tool_call` / `web_search` /
  `todo_list` / `reasoning` / `error`)统一映射成一个"动态工具调用"气泡
  (`tool-input-available` → `tool-output-available`/`tool-output-error`,
  `dynamic: true`,`toolCallId` = item.id,`toolName` = item.type);
  `turn.completed` → `finish`(`messageMetadata.usage`);`turn.failed` /
  `error` → `error` chunk。

## 目录结构

- `agent.ts`:Codex 客户端构造(`new Codex({ apiKey, config })`)、
  `WORKSPACE_DIR`、真调用 Codex SDK 的 `runTurnStreamed()`——
  start/resume thread 之后把 `runStreamed()` 的事件流原样交给上层。
- `src/ui-stream.ts`:适配层,把 `runTurnStreamed()` 的 `ThreadEvent` 流翻译成
  `UIMessageChunk` 流(见上一节),供 `server.ts` 直接 pipe 给前端。
- `server.ts`:一个 `node:http` 服务器,没有任何框架依赖,只管 HTTP 路由和
  请求体解析,真正的 Codex 调用委托给 `agent.ts`,协议翻译委托给
  `src/ui-stream.ts`。
  - `GET /healthz` → `{ok:true}`
  - `POST /api/chat`,body 是 `DefaultChatTransport` 发的
    `{messages: UIMessage[], threadId?}` → AI SDK 的 UI Message Stream
    (SSE)。Codex 是"续接线程"模型(历史落在 `~/.codex/sessions`),不是
    "每轮把全部历史重新喂给模型",所以服务端只取 `messages` 里最后一条的文本
    当新一轮的 prompt。真调用 Codex SDK,在 `workspace/`(gitignored 的
    scratch 目录)里跑,没有 mock 模式。浏览器断开时经 `TurnOptions.signal`
    取消这一轮 turn。
- `src/client/App.tsx` / `App.css` / 根 `index.html` / `vite.config.ts`:
  和 `ai-sdk-v7` 同款的 React 聊天 UI(`useChat` + `DefaultChatTransport`),
  去掉了模型选择器、图片上传和审批气泡这几个此示例用不到的部分,`vite.config.ts`
  把 `/api` 代理到 `server.ts` 监听的 5199 端口。
- `.env.example` / `.gitignore` / `tsconfig.json` / `package.json`:独立项目
  配置,不属于仓库根 pnpm workspace(自带空 `pnpm-workspace.yaml`)。

## 没有 human-in-the-loop(HITL)

这个示例**没有**工具调用审批 UI,也不打算加——不是漏做,是 `@openai/codex-sdk`
的公开 TypeScript 接口(`ThreadEvent` / `ThreadOptions` / `TurnOptions`,见
`node_modules/@openai/codex-sdk/dist/index.d.ts`)根本没有暴露审批回调或审批
事件。`ThreadOptions.approvalPolicy`(`ApprovalMode`:`never` / `on-request` /
`on-failure` / `untrusted`)确实存在,但它是**跑之前定死的静态配置**,不是能在
某个工具调用上暂停、等前端点"允许/拒绝"再继续的编程接口——Codex 的交互式审批
是 CLI/TTY 场景的能力,这个 headless streaming API 没有对应出口。想要 HITL,
参照 `examples/zh/origin/claude-agent-sdk` 或 `examples/zh/origin/ai-sdk-v7`。

## 运行时要求(实测记录)

- `pnpm add @openai/codex-sdk` 会把 `@openai/codex`(即 `codex` CLI 本体,
  含平台二进制)当作依赖一起装下来——**不需要额外全局装 CLI**,`pnpm install`
  就够了(前提是有该平台的预编译包)。
- 需要 `CODEX_API_KEY`(直接传给 `new Codex({ apiKey, config })`,SDK 内部
  原样写进子进程的 `env.CODEX_API_KEY`,不经过 `OPENAI_API_KEY` 中转)。
  `CODEX_BASE_URL` 通过 `agent.ts` 里自定义的 `openai-no-ws`
  `model_providers` 条目(而不是 `CodexOptions.baseUrl`)接进去,原因见
  `agent.ts` 顶部注释:内置 `openai` provider id 是保留字改不了,而且默认
  会走一个对着 s2a 代理会不断重试的 WebSocket 流式回退,所以自定义了一个
  `supports_websockets: false` 的 provider。`ThreadOptions` 的 `model`
  字段控制模型,默认 `AGENT_MODEL=gpt-5.4`。见
  `node_modules/@openai/codex-sdk/dist/index.js` 里 `CodexExec.run()` 的实现。
- 会话续接用 Codex 原生机制:第一轮 `codex.startThread()`,`thread.started`
  事件带出 `thread_id`,由**前端**保存、下一轮随请求带回,服务端用
  `codex.resumeThread(threadId)` 接回去——服务端零会话状态,也不用自己攒
  对话历史。Codex 自己把 thread 落盘在 `~/.codex/sessions`。
- 来源:`node_modules/@openai/codex-sdk/README.md`(装完包后自带,内容与
  https://github.com/openai/codex/blob/main/sdk/typescript/README.md 一致)、
  `node_modules/@openai/codex-sdk/dist/index.d.ts`(`ThreadItem` / `Turn` /
  `ThreadOptions` / `CodexOptions` 的真实类型定义)。

## 跑起来

这个目录是一个**独立项目**(自带 `package.json`,不是仓库根 workspace 成员)。

```sh
cd examples/zh/origin/codex-sdk
pnpm install
cp .env.example .env
# 编辑 .env: CODEX_API_KEY=sk-...(可选 CODEX_BASE_URL、AGENT_MODEL)

pnpm dev
# 浏览器打开 http://localhost:5173(Vite 把 /api 代理到 5199 上的 server.ts),
# 或者直接看后端吐出的 UI Message Stream:
curl -N -X POST localhost:5199/api/chat -H 'content-type: application/json' \
  -d '{"messages":[{"role":"user","parts":[{"type":"text","text":"创建一个文件"}]}]}'
```

`pnpm typecheck` 跑 `tsc --noEmit`。
