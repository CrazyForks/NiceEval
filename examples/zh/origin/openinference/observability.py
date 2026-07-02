"""OpenInference + Phoenix 埋点接线。

对应 docs-site/zh/guides/connect-otel.mdx 「2. 应用侧」OpenInference tab 的几行配置：

    from openinference.instrumentation.langchain import LangChainInstrumentor
    from phoenix.otel import register

    register()  # 或标准 OTel SDK；endpoint 走 OTEL_EXPORTER_OTLP_ENDPOINT
    LangChainInstrumentor().instrument()

必须在 import 任何会触发 LangChain 调用的代码之前完成——LangChainInstrumentor
在 import 时就会 patch LangChain 的 callback 系统，晚了不会报错，只会静默拿不到
span。所以这个模块必须在 server.py 里被放在最前面 import（在 agent.py /
tools.py 之前），靠 import 的副作用生效，本身不对外导出任何东西。
"""

from __future__ import annotations

import os

from dotenv import load_dotenv

load_dotenv()  # 必须在读任何 env 变量之前跑：PHOENIX_*、OPENAI_* 都靠它

# ---------------------------------------------------------------------------
# register() 内部读环境变量决定 collector 端点，优先级：
#   PHOENIX_COLLECTOR_ENDPOINT > OTEL_EXPORTER_OTLP_ENDPOINT > 都没设时用
#   http://localhost:6006。注意：没有显式传 protocol="http/protobuf" 时，
#   phoenix.otel 只取上面这个值的 host、把端口强制换成 gRPC 端口（默认 4317，
#   `PHOENIX_GRPC_PORT` 可改）——即便你写的是 6006，实际连的还是
#   `<host>:4317`，走 gRPC，不是 HTTP。docker-compose.yml 里的本地 Phoenix
#   两个端口都开着（6006 UI + HTTP OTLP，4317 gRPC OTLP），所以默认配置直接
#   能用；这是读了 phoenix/otel/otel.py 的 `_normalized_endpoint()` 源码确认
#   的实际行为，不是文档描述的“看起来应该”那样。
# ---------------------------------------------------------------------------
from openinference.instrumentation.langchain import LangChainInstrumentor
from phoenix.otel import register

_tracer_provider = register(
    project_name=os.getenv("PHOENIX_PROJECT_NAME", "niceeval-openinference-example"),
)
# register() 默认已经把这个 provider 设成全局的了，所以像文档里那样裸调
# `LangChainInstrumentor().instrument()`（不传参）效果是一样的；这里显式传
# tracer_provider 只是为了在代码里把“这是刚才 register() 建的那个 provider”写明白。
LangChainInstrumentor().instrument(tracer_provider=_tracer_provider)
