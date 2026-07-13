// native-plugin 实验专用:同一个 claude-code adapter,只挂一个真实公开 Native Plugin
// Marketplace,不挂 Skill、不挂 MCP——把「native plugin 安装」单独隔离出来验证。
//
// 关键点(见 memory/native-plugin-marketplace-name-not-caller-assignable.md):
// `marketplace.name` 必须等于目标仓库自己 manifest(`.claude-plugin/marketplace.json`)里的
// `"name"` 字段("duyet-claude-plugins"),不是随便起的标识符——`claude plugin marketplace add`
// 没有让调用方另起别名的 flag,名字对不上会在下一步 `plugin install` 才报错。
//
// 仓库固定到 commit 82de4021a311034a9596e891baf3a8266fb33bf7(执行前需用
// `git ls-remote https://github.com/duyet/codex-claude-plugins.git HEAD` 复核 HEAD 漂移,
// 漂移不影响本次验收,fixture 仍钉这个 commit)。选的 plugin 是 "commit"——纯 slash command
// (commands/commit.md),不含 MCP server、不含需要鉴权的 App,是这个 marketplace 里最小、
// 风险最低的 plugin,已在本机(非 tty)验证过 `claude plugin install` 不会卡在确认框。
import { claudeCodeAgent } from "niceeval/adapter";

export default claudeCodeAgent({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseUrl: process.env.ANTHROPIC_BASE_URL,
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
