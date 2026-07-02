"""两个工具：get_weather（查天气）、calculate（算算术）。

用 @tool 包一层是关键：LangChainInstrumentor 挂在 LangChain 的 callback 系统
上，任何 Runnable（工具、chain、agent）被 invoke 都会挂一个 span——工具被
agent 调用时同样能在 Phoenix 里看到 get_weather / calculate 的 TOOL span。
"""

from __future__ import annotations

import ast
import operator
from typing import Any

from langchain_core.tools import tool

# get_weather 用的是合成的天气表，不发真实请求——这是“诚实的确定性工具实现”，
# 不是要删除的 mock AI；同一个城市名永远返回同一个结果，方便复现和写断言。
_MOCK_WEATHER: dict[str, dict[str, Any]] = {
    "北京": {"condition": "晴", "tempC": 24},
    "beijing": {"condition": "晴", "tempC": 24},
    "上海": {"condition": "多云", "tempC": 27},
    "shanghai": {"condition": "多云", "tempC": 27},
    "广州": {"condition": "雷阵雨", "tempC": 30},
    "深圳": {"condition": "阵雨", "tempC": 29},
    "杭州": {"condition": "晴", "tempC": 26},
    "东京": {"condition": "小雨", "tempC": 19},
    "tokyo": {"condition": "小雨", "tempC": 19},
    "纽约": {"condition": "多云", "tempC": 16},
    "new york": {"condition": "多云", "tempC": 16},
    "伦敦": {"condition": "阴", "tempC": 14},
    "london": {"condition": "阴", "tempC": 14},
}


@tool
def get_weather(city: str) -> dict[str, Any]:
    """查询某个城市当前的天气。合成数据，不发真实请求，同一个城市名永远返回同一个结果。"""
    key = city.strip().lower()
    for name, data in _MOCK_WEATHER.items():
        if name.lower() == key:
            return {"city": city, **data}
    # 没收录的城市：按字符 codepoint 求和做确定性伪随机，保证可重复。
    seed = sum(ord(c) for c in city) if city else 0
    return {
        "city": city or "未知城市",
        "condition": ["晴", "多云", "阴", "小雨"][seed % 4],
        "tempC": 10 + seed % 20,
    }


_ALLOWED_BIN_OPS: dict[type, Any] = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Mod: operator.mod,
    ast.Pow: operator.pow,
}
_ALLOWED_UNARY_OPS: dict[type, Any] = {ast.UAdd: operator.pos, ast.USub: operator.neg}


def _safe_eval(node: ast.AST) -> float:
    """只认数字字面量、+-*/%** 和括号，其余节点类型一律拒绝——不是 eval()。"""
    if isinstance(node, ast.Expression):
        return _safe_eval(node.body)
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
        return node.value
    if isinstance(node, ast.BinOp) and type(node.op) in _ALLOWED_BIN_OPS:
        return _ALLOWED_BIN_OPS[type(node.op)](_safe_eval(node.left), _safe_eval(node.right))
    if isinstance(node, ast.UnaryOp) and type(node.op) in _ALLOWED_UNARY_OPS:
        return _ALLOWED_UNARY_OPS[type(node.op)](_safe_eval(node.operand))
    raise ValueError(f"不支持的表达式写法: {ast.dump(node)}")


@tool
def calculate(expression: str) -> str:
    """计算一个只含 + - * / % ** 和括号的算术表达式，返回结果字符串。"""
    try:
        tree = ast.parse(expression, mode="eval")
        return str(_safe_eval(tree))
    except Exception as error:  # noqa: BLE001 - 出错原因要带回给 agent / 前端，不能吞
        return f"无法计算 “{expression}”：{error}"


TOOLS = [get_weather, calculate]
