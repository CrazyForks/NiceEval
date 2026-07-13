import { defineEval } from "niceeval";
import { equals, includes } from "niceeval/expect";

// 固定 fixture 的唯一标记(与 e2e/fixtures/skills/local-smoke/SKILL.md 逐字节对应)。
const MARKER = "niceeval-local-skill-smoke-v1";

// 本地 Skill 安装验收(plan/docs-code-alignment-closeout.md 3.2):只验证「安装痕迹」——
// send 之前,sandbox 内的 SKILL.md 与 agent-setup.json 是否如实反映了本地 Skill 的安装
// 结果。不测行为痕迹(是否被模型用到),那是 skillUsed() 已经覆盖的 repo Skill 路径
// (feature-skill-used.eval.ts);这里只需要一个便宜的收尾 send 让 attempt 正常收轮。
export default defineEval({
  description: "本地 Skill fixture 安装验收:SKILL.md 内容与 agent-setup.json manifest 都对得上路径与哈希",
  async test(t) {
    await t.group("安装痕迹:sandbox 内文件与 manifest 在 send 前就已就绪", async () => {
      const skillFile = await t.sandbox.readFile(".claude/skills/local-smoke/SKILL.md");
      t.check(skillFile, includes(MARKER));

      const manifestRaw = await t.sandbox.readFile("__niceeval__/agent-setup.json");
      const manifest = JSON.parse(manifestRaw) as { skills?: unknown[] };
      const first = manifest.skills?.[0] as
        | { kind?: string; name?: string; path?: string; sha256?: string }
        | undefined;
      t.check(first?.kind, equals("local"));
      t.check(first?.name, equals("local-smoke"));
      t.check(first?.path, equals("../../fixtures/skills/local-smoke"));
      // sha256 内容随 fixture 字节变化,断言只钉形状(64 位小写十六进制),不钉具体值。
      t.check(typeof first?.sha256 === "string" && /^[0-9a-f]{64}$/.test(first.sha256), equals(true));
    });

    // 便宜的收尾轮:证明 attempt 真的跑通了 agent,不产生额外 judge 成本。
    const turn = await t.send('Say "ok" and nothing else. Do not run any commands or read any files.');
    turn.expectOk();
    t.succeeded();
    t.noFailedActions();
  },
});
