// native-plugin 实验专用:同一个 codex adapter,只挂一个真实公开 Native Plugin Marketplace,
// 不挂 Skill、不挂 MCP——把「native plugin 安装」单独隔离出来验证。与
// e2e/projects/claude-code/agents/claude-code-native-plugin.ts 同一仓库、同一 ref、同一
// plugin,便于对照两家 Adapter 的 manifest 差异。
//
// 关键点(见 memory/native-plugin-marketplace-name-not-caller-assignable.md):
// `marketplace.name` 必须等于目标仓库自己 manifest(`.agents/plugins/marketplace.json`)里的
// `"name"` 字段("duyet-claude-plugins"),不是随便起的标识符——`codex plugin marketplace add`
// 同样没有让调用方另起别名的 flag(有 --ref 但没有 --name),名字对不上会在下一步
// `codex plugin add` 才报错(`plugin \`commit\` was not found in marketplace \`<错的名字>\`）。
//
// 仓库固定到 commit 82de4021a311034a9596e891baf3a8266fb33bf7(执行前需用
// `git ls-remote https://github.com/duyet/codex-claude-plugins.git HEAD` 复核 HEAD 漂移)。
// 选的 plugin 是 "commit"——纯 slash command(无 MCP server、无需鉴权的 App),已在本机
// (非 tty)验证过 `codex plugin add` 不会卡在确认框。
import { codexAgent } from "niceeval/adapter";

export default codexAgent({
  apiKey: process.env.CODEX_API_KEY,
  baseUrl: process.env.CODEX_BASE_URL,
  plugins: [
    {
      marketplace: {
        name: "duyet-claude-plugins",
        source: "duyet/codex-claude-plugins",
        ref: "82de4021a311034a9596e891baf3a8266fb33bf7",
      },
      name: "commit",
    },
  ],
});
