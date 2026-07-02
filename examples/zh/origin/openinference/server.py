"""OpenInference + Phoenix 埋点示例后端。

对应 docs-site/zh/guides/connect-otel.mdx 「2. 应用侧」OpenInference tab 的几行配置：

    from openinference.instrumentation.langchain import LangChainInstrumentor
    from phoenix.otel import register

    register()  # 或标准 OTel SDK；endpoint 走 OTEL_EXPORTER_OTLP_ENDPOINT
    LangChainInstrumentor().instrument()

这个文件把它摊开成一个真的能跑的 FastAPI + LangChain 应用：一个带两个工具
（查天气 / 算算术）的 agent，工具调用和模型调用都经 LangChainInstrumentor
自动打点，span 发给本地 Phoenix（或任何 OTLP collector）。

这是一个独立的 Python 项目，不依赖、不导入 niceeval —— 跑起来看 README.md。

模块拆分（导入顺序很重要）：
- observability.py：必须最先 import，仅为其 side effect——注册 OTel 之后
  才能安全 import LangChain，见该文件顶部注释。
- tools.py：get_weather / calculate 两个工具的实现。
- agent.py：真的调用 LangChain create_agent 的 agent loop。
- server.py（这个文件）：只有 FastAPI app + 路由，不含 agent / 工具逻辑。
"""

from __future__ import annotations

import observability  # noqa: F401 - 必须最先 import，靠 side effect 注册 OTel

import os
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

from agent import get_reply

STATIC_DIR = Path(__file__).parent / "static"

app = FastAPI(title="niceeval openinference example")


class ChatRequest(BaseModel):
    message: str
    sessionId: str | None = None


class ToolCall(BaseModel):
    name: str
    input: dict[str, Any]
    output: Any


class ChatResponse(BaseModel):
    reply: str
    toolCalls: list[ToolCall]


@app.get("/healthz")
def healthz() -> dict[str, bool]:
    return {"ok": True}


@app.get("/", response_class=HTMLResponse)
def index() -> str:
    return (STATIC_DIR / "index.html").read_text(encoding="utf-8")


@app.post("/api/chat", response_model=ChatResponse)
def chat(body: ChatRequest) -> ChatResponse:
    message = body.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="message must be non-empty.")

    try:
        reply, tool_calls = get_reply(message)
    except RuntimeError as error:
        raise HTTPException(status_code=500, detail=str(error)) from error

    return ChatResponse(reply=reply, toolCalls=[ToolCall(**c) for c in tool_calls])


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=int(os.getenv("PORT", "8787")))
