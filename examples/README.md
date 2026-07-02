# niceeval Examples

`examples/zh/` 按**接没接 niceeval** 分两组：

- `zh/before/` —— **还没接 niceeval 的普通应用**。每个都是独立可跑的项目，不 import niceeval。它们是未来接入的 before 基线：接入后的版本放到 `zh/<同名目录>`，用 `diff -ru examples/zh/before/<name> examples/zh/<name>` 或 `pnpm run gen:diff-code` 统一对比"接入前后代码动了多少"。
- `zh/<name>` —— **接入 niceeval 之后的完整评测项目**，定义了 evals / experiments，能 `niceeval exp` 跑起来（需要先 `npm install -D niceeval`；这里的示例以 link 方式指向仓库根）。

每个目录都有独立的 `README.md` 说明如何配置环境变量并运行。

## 接入后（`zh/<name>`）

| 目录 | 用途 |
|---|---|
| [`zh/ai-sdk-v7/`](zh/ai-sdk-v7/) | **官方内建适配器 `aiSdkAgent`** 接入 AI SDK v7 应用：tool approval HITL、多模态、tracing，eval 与 UI 共用同一次模型调用。before 基线：[`zh/before/ai-sdk-v7/`](zh/before/ai-sdk-v7/)，代码 diff 见 [before/after 文档](../docs-site/zh/example/ai-sdk-v7-before-after.mdx) |
| [`zh/ai-sdk/`](zh/ai-sdk/) | **自己写 adapter**（`defineAgent` + `fromAiSdk`）接入 AI SDK v6 HTTP web agent，演示 remote adapter、事件流映射、双可观测 |
| [`zh/coding-agent-skill/`](zh/coding-agent-skill/) | 评测 Claude Code **Skill / Plugin** 对编码任务的实际提升（sandbox 工作区、文件断言） |

## 接入前（`zh/before/`）

| 目录 | 应用形态 | 对应的接入后目录 |
|---|---|---|
| [`zh/before/ai-sdk-v7/`](zh/before/ai-sdk-v7/) | AI SDK v7 聊天应用（HTTP 服务器 + React UI） | [`zh/ai-sdk-v7/`](zh/ai-sdk-v7/) |
| [`zh/before/langgraph/`](zh/before/langgraph/) | LangGraph / LangChain ReAct agent + **LangSmith** OTel 导出（JS 侧需要显式 `initializeOTEL()`） | 未接入 |
| [`zh/before/openllmetry/`](zh/before/openllmetry/) | 工具调用聊天服务 + **OpenLLMetry** 埋点（`@traceloop/node-server-sdk` 不认标准 OTLP 端点环境变量，需代码转译） | 未接入 |
| [`zh/before/openinference/`](zh/before/openinference/) | Python / FastAPI + LangChain agent + **OpenInference / Phoenix** 埋点 | 未接入 |
| [`zh/before/custom-genai/`](zh/before/custom-genai/) | 不用 vendor SDK，`@opentelemetry/api` **手写 GenAI 语义约定 span** | 未接入 |
| [`zh/before/claude-agent-sdk/`](zh/before/claude-agent-sdk/) | **Claude Agent SDK**（`@anthropic-ai/claude-agent-sdk`，MCP 工具 + resume 续会话） | 未接入 |
| [`zh/before/codex-sdk/`](zh/before/codex-sdk/) | **Codex SDK**（`@openai/codex-sdk`，coding-agent-in-a-directory 的任务形状） | 未接入 |
| [`zh/before/vm0/`](zh/before/vm0/) | **vm0 占位**：无公开 SDK / API，调研记录 + 仅 mock 模式可跑的骨架 | 未接入 |

其中 `before/langgraph`、`before/openllmetry`、`before/openinference`、`before/custom-genai` 同时是[连接可观测性指南](../docs-site/zh/guides/connect-otel.mdx)「2. 应用侧」各 tab 的完整可跑版本；`before/claude-agent-sdk`、`before/codex-sdk`、`before/vm0` 对应仓库根 README「Agent Frameworks」Roadmap 的条目（Roadmap 勾选追踪 adapter 实现进度，不是示例有无）。
