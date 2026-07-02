# vm0 示例(占位,非真实集成)

**这不是一个能真的调用 vm0 的示例。** 调研下来(过程见下)vm0
(`github.com/vm0-ai/vm0`)目前没有可在自己代码里 `import` 的 npm SDK,也没有公开
文档化的 HTTP API——没有稳定的第三方集成面可以对着写一个"用 vm0 搭 agent 后端"
的真实 demo。这个目录只是把 [`docs/adapters/targets.md`](../../../../docs/adapters/targets.md)
里已有的"暂不接 vm0"结论,摊开成一份可读的调研记录 + 一个和其它 examples 同构、
但只有 mock 模式能跑的占位骨架,好让 README 索引/Roadmap 里的 vm0 条目有个落点。

如果你在找**真的能跑**的 agent 框架接入示例,看
[`examples/zh/before/langgraph`](../langgraph/)、[`examples/zh/before/codex-sdk`](../codex-sdk/)、
[`examples/zh/before/claude-agent-sdk`](../claude-agent-sdk/) 或
[`examples/zh/before/ai-sdk-v7`](../ai-sdk-v7/)。

## vm0 号称是什么

按 GitHub 仓库简介和 README(2026-07 查看):

> Zero, your trustworthy AI teammate for real work.
> Zero connects to 100+ tools and does the work — reports, triage, outreach,
> research. In Slack or on the web.

也就是说 vm0(产品名 **Zero**)定位是一个**托管的"AI 队友"SaaS**——你在
[vm0.ai](https://vm0.ai) 网页或 Slack 里 `@` 它、给它分配"角色"(晨报、Sentry
错误分诊、销售外联邮件草稿……),它接 100+ 个第三方工具(Slack/GitHub/Gmail/
Linear/Notion/Sentry/…),在自己的 Firecracker microVM 沙箱里跑,产物回帖到
Slack 或写进 Notion/Linear。仓库本身是开源的(TypeScript 61.6% / Rust 25.3% /
Python 10.6%,1.1k+ star),但"开源"指的是可以 fork/自托管整个平台(需要裸机
Linux + KVM 跑 Firecracker,见 `docs/architecture.md`),不是"这里有个库可以
`npm install` 进你自己的后端"。

## 调研结论:为什么这里做不成真集成

调研过程(检查了什么、看到了什么):

1. **GitHub 仓库**(`github.com/vm0-ai/vm0`,`gh api repos/vm0-ai/vm0` +
   README)——描述如上,`docs/` 目录里有 `architecture.md`、`resource-model.md`、
   `cli-design-guideline.md` 等面向**贡献者/自托管者**的文档,没有面向第三方
   开发者的"如何用 API 集成 vm0"文档。
2. **npm 上没有可 import 的 SDK**。`npm view vm0` / `@vm0/sdk` / `@vm0/core`
   全部 404。唯一存在的公开包是:
   - `@vm0/cli`(`npm view @vm0/cli`):bin 是 `vm0` 和 `zero`,license 字段是
     `Proprietary`,依赖 `ably`(印证了 `targets.md` 里"CLI/REST + Ably"的判断)。
     这是一个**命令行客户端**,不是能 `import` 进 TS 代码的库。
   - `@vm0/runner`:自托管 runner(跑 Firecracker microVM 的那部分),同样不是
     "调用 vm0 agent"用的 SDK。
3. **`@vm0/cli` 的调用形状不是"发消息、拿回复"**。按 `docs/cli-design-guideline.md`
   里的官方示例:

   ```sh
   vm0 secret set MY_API_KEY --body "sk-..."
   vm0 compose vm0.yaml        # 部署一个 agent 定义(agent compose)
   vm0 run my-agent "analyze the dataset"   # 触发一次异步 run
   vm0 logs <run-id>           # 轮询 / 查看这次 run 的日志
   ```

   要先 `vm0 auth login` 到 vm0.ai 账号(按 `docs/resource-model.md`,账号体系是
   Clerk Organization,资源分 Agent Org / Runtime Org 两层),再写一份
   `vm0.yaml` 部署成"agent compose",`vm0 run` 触发的是一次**异步**的 Firecracker
   microVM 执行,结果通过 webhook 回调或 `vm0 logs` 轮询拿到——不是可以直接包进
   一个 HTTP handler、同步返回 `{reply, toolCalls}` 的调用。
4. **vm0 自己的 web 前端用的 API 是内部、未公开的**。仓库里
   `turbo/packages/api-contracts/src/contracts/chat-threads.ts` 是一份用
   `ts-rest` + `zod` 定义的 chat thread 契约,但它要 Clerk 会话鉴权,是内部
   monorepo 包,没有作为"公开、稳定、有文档"的第三方 API 发布过——这正是
   `targets.md` 说的"事件 schema / resume / usage 全未公开"。
5. **没有找到公开的 REST API 文档站**。`vm0.ai/en/docs`、
   `vm0.ai/en/docs/api(-reference)` 等路径都是营销站的软路由(WebFetch/curl
   验证:统一 307 到文档首页或落地页),首页只列了 Agents/Chat/Schedules/
   Permissions/Skills 等产品概念,没有 API 参考、没有代码示例、没有 SDK 链接。

结论和本仓库 `docs/adapters/targets.md` 里"矩阵 · Agent Frameworks"一节完全一致
(搜索该文件里的 "vm0" 可看到完整判据):vm0 记为观察项——"事件 schema / resume /
usage 全未公开,定位还在从『runtime』向『托管 teammate』漂移;等接入面稳定,不要
对着移动目标写 adapter"。这个结论不只适用于 niceeval 的 adapter,也适用于这里想
写的"教程级"示例:没有一个稳定、公开、可 `import` 或有文档的 API 可以对着写。

来源:
- <https://github.com/vm0-ai/vm0>(README、`docs/architecture.md`、
  `docs/resource-model.md`、`docs/cli-design-guideline.md`、
  `docs/create-oauth-app.md`、`turbo/packages/api-contracts/src/contracts/chat-threads.ts`)
- <https://www.npmjs.com/package/@vm0/cli>、`npm view @vm0/cli`
- <https://vm0.ai>、<https://vm0.ai/en/docs>
- 本仓库 [`docs/adapters/targets.md`](../../../../docs/adapters/targets.md)("矩阵 ·
  Agent Frameworks" 一节的 vm0 行,以及"六、不接"清单第 6 条)

## 这个目录里实际有什么

结构照抄同批的 `examples/zh/before/langgraph`、`examples/zh/before/codex-sdk`,好让三个
Agent Framework 示例读起来一致——但这里 **`AGENT_MODE=ai` 是个会抛错的桩**,不是
真实现:

- `server.ts`:一个 `node:http` 服务器,`GET /healthz`、`POST /api/chat`、
  `GET /` 三个路由。`AGENT_MODE=mock`(默认)靠关键词直接命中两个纯函数工具
  (`get_weather(city)` 固定数据表 / `calculate(expression)` 递归下降算术解析
  器),和其它 examples 同款,离线零配置可跑。`AGENT_MODE=ai` 只有一个函数
  `runAiTurn()`,唯一的行为是 `throw new Error(...)`,错误信息复述上面调研
  结论、指回本文件——不会假装发出任何网络请求。
- `public/index.html`:单文件静态聊天页,原生 `fetch()`,没有构建步骤,顶部有
  一条醒目提示条说明这不是真集成。
- `package.json`:独立 npm 项目(`"private": true`),没有 `niceeval` 依赖,
  也没有任何 `vm0` 相关依赖——因为没有能装的库。
- `.env.example`:没有任何凭证项可填,只有 `AGENT_MODE` / `PORT`。
- `tsconfig.json`:照抄 `examples/zh/before/ai-sdk-v7/tsconfig.json` 的
  Node/ESM 配置。

没有 `adapter/`、`evals/`、`niceeval.config.ts`——这是一个普通项目,不接
niceeval,和仓库根的 pnpm workspace 无关(见根 `pnpm-workspace.yaml` 里
`packages: []` 的说明,以及这里自己的 `pnpm-workspace.yaml`)。

## 跑起来

```sh
cd examples/zh/before/vm0
pnpm install
cp .env.example .env
pnpm dev   # http://localhost:5588,浏览器直接打开这个地址聊天
```

试着问"北京天气怎么样"或"12\*(3+4)等于多少"看 mock 工具调用效果。把 `.env` 里
的 `AGENT_MODE` 设成 `ai` 再 `pnpm dev`,`/api/chat` 会返回 500,错误信息就是上面
调研结论的摘要——这是预期行为,不是 bug。

## 什么时候可以回来补真集成

按 `docs/adapters/targets.md` 的判据:vm0 发布一个可 `import` 的 npm SDK,或者
公开一份稳定、有版本保证的 HTTP API 文档(尤其是事件 schema、resume/会话恢复、
usage 计量这三块目前完全空白的部分)之后,再回来把 `server.ts` 里的
`runAiTurn()` 换成真实现。在那之前,继续对着一个会漂移的内部接口写"教程"只会
很快过期。
