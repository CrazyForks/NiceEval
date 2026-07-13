// local-skill 实验专用:同一个 claude-code adapter,只挂一个本地 Skill fixture
// (e2e/fixtures/skills/local-smoke),不挂 MCP、不挂 repo Skill——把「本地 Skill 安装」
// 单独隔离出来验证,不与 claude-code-features.ts 的 repo Skill / MCP 成本混在一起。
// path 相对 CLI cwd(跑 niceeval 的目录,即本项目 e2e/projects/claude-code)解析,
// 见 src/agents/skills.ts installLocalSkill 用 process.cwd() 兜底 projectRoot。
import { claudeCodeAgent } from "niceeval/adapter";

export default claudeCodeAgent({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseUrl: process.env.ANTHROPIC_BASE_URL,
  skills: [{ kind: "local", path: "../../fixtures/skills/local-smoke" }],
});
