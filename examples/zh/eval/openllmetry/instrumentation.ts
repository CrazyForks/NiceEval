// 必须在 openai SDK 被 import 之前先执行(见 server.ts 顶部的 import 顺序)——
// OpenLLMetry 靠 monkey-patch 拿到 openai 模块的调用点,晚了就 patch 不到。
import * as traceloop from "@traceloop/node-server-sdk";

// @traceloop/node-server-sdk 自己不认标准的 OTEL_EXPORTER_OTLP_ENDPOINT,只认
// TRACELOOP_BASE_URL / options.baseUrl(而且会在后面自动拼上 /v1/traces)。
// 这里把标准变量名转译过去,这样 .env 里和文档里其它 tab(AI SDK / LangGraph)保持
// 同一个变量名,读者不用记 OpenLLMetry 的私有变量。
const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT?.replace(/\/v1\/traces\/?$/, "");

traceloop.initialize({
  appName: "openllmetry-example",
  baseUrl: otlpEndpoint,
  disableBatch: true, // 演示/eval 场景要马上看到 span,不等 batch 攒够再发
  tracingEnabled: Boolean(otlpEndpoint), // 没配置导出端点时干脆不启动 exporter,
  // 避免请求默认打到 Traceloop 云端(api.traceloop.com)而不断报鉴权失败
  silenceInitializationMessage: true,
});

if (!otlpEndpoint) {
  process.stderr.write(
    "[openllmetry] 未设置 OTEL_EXPORTER_OTLP_ENDPOINT,已跳过 trace 导出。" +
      "`docker compose up -d` 起本地 Jaeger 后在 .env 里配置该变量即可看到 trace。\n",
  );
}
