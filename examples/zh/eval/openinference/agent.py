"""真的经 LangChain 的 create_agent 跑一遍 agent loop（LangChain 1.x 的推荐
写法，内部是个 LangGraph 单节点循环），走 OpenAI 兼容接口。

这个模块会 import LangChain，所以调用方必须保证 observability.py 已经先
import 过（见 server.py 里的 import 顺序），不然 LangChainInstrumentor 挂
不上 callback，span 会静默消失。
"""

from __future__ import annotations

import os
from typing import Any

from langchain.agents import create_agent
from langchain_core.messages import AIMessage, HumanMessage, ToolMessage
from langchain_openai import ChatOpenAI

from tools import TOOLS

_AGENT_SYSTEM_PROMPT = (
    "你是一个只有两个工具的助手：get_weather 查城市天气，calculate 算算术表达式。"
    "能用工具回答的问题必须调用工具，不要凭空编数字。"
)

_agent: Any = None


def build_agent() -> Any:
    model = ChatOpenAI(
        model=os.getenv("AGENT_MODEL", "gpt-4o-mini"),
        base_url=os.getenv("OPENAI_BASE_URL") or None,
        api_key=os.getenv("OPENAI_API_KEY"),
    )
    return create_agent(model=model, tools=TOOLS, system_prompt=_AGENT_SYSTEM_PROMPT)


def get_reply(message: str) -> tuple[str, list[dict[str, Any]]]:
    global _agent
    if _agent is None:
        if not os.getenv("OPENAI_API_KEY"):
            raise RuntimeError("缺少 OPENAI_API_KEY：在 .env 里配置真实的模型访问凭证后重启。")
        _agent = build_agent()

    result = _agent.invoke({"messages": [HumanMessage(content=message)]})
    messages = result["messages"]

    tool_calls_by_id: dict[str, dict[str, Any]] = {}
    for m in messages:
        if isinstance(m, AIMessage):
            for call in m.tool_calls or []:
                tool_calls_by_id[call["id"]] = {
                    "name": call["name"],
                    "input": call["args"],
                    "output": None,
                }
        elif isinstance(m, ToolMessage) and m.tool_call_id in tool_calls_by_id:
            tool_calls_by_id[m.tool_call_id]["output"] = m.content

    reply = next(
        (m.content for m in reversed(messages) if isinstance(m, AIMessage) and m.content),
        "",
    )
    return reply, list(tool_calls_by_id.values())
