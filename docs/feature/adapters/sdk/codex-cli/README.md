# Codex CLI

使用 `codexAgent` 在 Sandbox 中安装并运行 Codex CLI。

```ts
import { codexAgent } from "niceeval/adapter";

const agent = codexAgent({
  skills: [{ kind: "repo", source: "acme/codex-skills", ref: "v2" }],
  mcpServers: [{ name: "browser", command: "npx", args: ["-y", "server"] }],
  plugins: [{
    // name 必须等于 acme/codex-plugins 仓库 manifest 里声明的 name,不是随意起的别名
    marketplace: { name: "acme-plugins", source: "acme/codex-plugins", ref: "v2" },
    name: "repo-map",
  }],
});
```

`settings` 用 codex 自己的 config.toml 词汇配置 CLI 行为，setup 阶段按 TOML 语义合并进 `~/.codex/config.toml`：

```ts
const agent = codexAgent({
  settings: {
    web_search: "disabled",
  },
});
```

键名与取值以 codex 官方 config 文档为准，niceeval 不翻译、不发明中间词汇。保留键是 `model`、`model_provider`、`model_providers`、`model_reasoning_effort`、`mcp_servers` 与 `otel`——模型与 reasoning effort 归 experiment，provider 路由、MCP 表和 OTel 导出归 Adapter——出现在 `settings` 里 setup 报错并点名冲突键。settings 进安装 checkpoint key 与安装 manifest；secret 走环境变量，不写进 settings。上例关闭内置 web_search：评测答案能被搜到时，联网检索会污染通过率。

Codex Adapter 把 Skills 写到可发现目录并提供稳定发现指引；不能假设存在与 Claude Code Skill Tool 相同的自动加载事件。验证 Skill 使用时检查读取行为或 Skill 特有结果。

行为轨来自 `codex exec --json` 的结构化 stdout，session ID 来自 thread started 事件；工具调用优先按显式 call ID 配对。实际模型可能被网关改写，需要时从 Codex session 侧写读取，不能只信请求参数。

## 预制环境

Adapter 的 setup 检测 PATH 上的 `codex`：预装命中即跳过安装，缺失时回退 npm 全局安装——预装只是快速路径，不是正确性前提。E2B 官方 `codex` template 与 NiceEval 公共模板 `correctroads-default-team/niceeval-codex`（CI 钉 release tag）都是可用起点；构建项目自己的镜像/模板见 [Sandbox · 预制环境](../../../sandbox/library/prebuilt-environments.md)。

Codex 原生 Plugin 使用 Codex 专属 factory 字段。Codex SDK 的服务接入是另一种形态，见 [Codex SDK](../codex-sdk/README.md)。
