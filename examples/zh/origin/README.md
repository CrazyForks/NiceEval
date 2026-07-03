# origin 示例一览

这些都是**还没接 niceeval 的独立应用**，各自真调用对应 SDK，没有 mock 模式。环境变量按各目录的 `.env.example` 配置即可，不再单独写 README。

| 目录 | 模型(默认) | HITL 审批的 tool | 跑起来 |
|---|---|---|---|
| [`ai-sdk-v7/`](ai-sdk-v7/) | deepseek-v4-flash(可切 deepseek-v4-pro / gpt-4o-mini / gpt-5.4) | `calculate`(AI SDK `needsApproval`) | `pnpm install && pnpm dev` → http://localhost:5173 |
| [`claude-agent-sdk/`](claude-agent-sdk/) | deepseek-v4-flash(可切 claude-sonnet-5 等) | `calculate`(`canUseTool`) | `pnpm install && pnpm dev` → http://localhost:5173 |
| [`codex-sdk/`](codex-sdk/) | gpt-5.4 | 无(Codex SDK 不支持) | `pnpm install && pnpm dev` → http://localhost:5173 |
| [`pi-sdk/`](pi-sdk/) | deepseek-v4-flash(可切 deepseek-v4-pro) | `calculate`(`beforeToolCall`) | `pnpm install && pnpm dev` → http://localhost:5300 |
| [`langgraph/`](langgraph/) | gpt-4o-mini | `calculate`(LangGraph 原生 `interrupt()` + `HumanInTheLoopMiddleware`) | `python3 -m venv .venv && .venv/bin/pip install -r requirements.txt && .venv/bin/python src/server.py` → http://localhost:5488 |

所有项目跑之前都要 `cp .env.example .env` 并填好对应的 key。
