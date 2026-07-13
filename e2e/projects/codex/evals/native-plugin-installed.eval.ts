import { defineEval } from "niceeval";
import { equals } from "niceeval/expect";

// Native Plugin 安装验收(plan/docs-code-alignment-closeout.md 3 节「测试矩阵要求」)。镜像
// e2e/projects/claude-code/evals/native-plugin-installed.eval.ts:同一仓库、同一 ref、同一
// plugin,只有安装目录不同(codex 落在 `~/.codex/plugins/cache/...`,不是 `~/.claude/...`)。
// 只验证「安装痕迹」,不测行为痕迹(commit slash command 有没有被模型触发)。
//
// 关键背景(memory/native-plugin-marketplace-name-not-caller-assignable.md):Codex 的
// `codex plugin marketplace add` 按目标仓库自己 manifest 里的 `name` 注册,不认调用方起的
// 别名——agent 配置(codex-native-plugin.ts)里的 `marketplace.name` 必须原样等于
// "duyet-claude-plugins"。
export default defineEval({
  description: "Native Plugin 安装验收:agent-setup.json manifest 与真实安装文件都对得上 marketplace/plugin/version",
  async test(t) {
    await t.group("安装痕迹:sandbox 内 manifest 与真实安装文件在 send 前就已就绪", async () => {
      const manifestRaw = await t.sandbox.readFile("__niceeval__/agent-setup.json");
      const manifest = JSON.parse(manifestRaw) as {
        nativePlugins?: {
          agent?: string;
          marketplace?: { name?: string; source?: string; ref?: string };
          name?: string;
          resolvedVersion?: string;
        }[];
      };
      const plugin = manifest.nativePlugins?.[0];
      t.check(plugin?.agent, equals("codex"));
      t.check(plugin?.marketplace?.name, equals("duyet-claude-plugins"));
      t.check(plugin?.marketplace?.source, equals("duyet/codex-claude-plugins"));
      t.check(plugin?.marketplace?.ref, equals("82de4021a311034a9596e891baf3a8266fb33bf7"));
      t.check(plugin?.name, equals("commit"));
      t.check(plugin?.resolvedVersion, equals("1.3.2"));

      // 真实安装文件确实落在 Codex 的 plugin cache 里(`~` 交给真实 shell 展开,不硬编码
      // $HOME,见 memory/sandbox-home-hardcode.md)。
      const check = await t.sandbox.runShell(
        "test -s ~/.codex/plugins/cache/duyet-claude-plugins/commit/1.3.2/commands/commit.md",
      );
      t.check(check.exitCode, equals(0));
    });

    // 便宜的收尾轮:证明 attempt 真的跑通了 agent,不触发任何 LLM 打分开销
    // (本 eval 全程只用 t.check / turn.expectOk,不引用打分 API)。
    const turn = await t.send('Say "ok" and nothing else. Do not run any commands or read any files.');
    turn.expectOk();
    t.succeeded();
    t.noFailedActions();
  },
});
