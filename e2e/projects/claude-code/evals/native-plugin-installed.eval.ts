import { defineEval } from "niceeval";
import { equals } from "niceeval/expect";

// Native Plugin 安装验收(plan/docs-code-alignment-closeout.md 3 节「测试矩阵要求」)。
// 只验证「安装痕迹」——send 之前,sandbox 内的 manifest 与真实安装文件是否如实反映了
// Native Plugin 的安装结果。不测行为痕迹(commit slash command 有没有被模型触发),
// 那需要真实 git 改动配合,成本和不确定性都更高,超出「装上了没有」这个验收范围。
//
// 关键背景(memory/native-plugin-marketplace-name-not-caller-assignable.md):Claude Code
// 的 `claude plugin marketplace add` 按目标仓库自己 manifest 里的 `name` 注册,不认调用方
// 起的别名——agent 配置(claude-code-native-plugin.ts)里的 `marketplace.name` 必须原样等于
// "duyet-claude-plugins",这不是巧合,是这个字段唯一能生效的用法。
//
// Native Plugin 默认按 `-s/--scope user` 装(claude-code.ts 的 installPlugins 没有传
// --scope,CLI 默认值是 user),不像 Skill 落在 project 相对路径的 `.claude/skills/`——
// 所以下面用 `~` 走真实 shell 展开定位安装文件,不硬编码 $HOME(见
// memory/sandbox-home-hardcode.md 的教训:不同 sandbox backend 的 $HOME 不一样)。
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
      t.check(plugin?.agent, equals("claude-code"));
      t.check(plugin?.marketplace?.name, equals("duyet-claude-plugins"));
      t.check(plugin?.marketplace?.source, equals("duyet/codex-claude-plugins"));
      t.check(plugin?.marketplace?.ref, equals("82de4021a311034a9596e891baf3a8266fb33bf7"));
      t.check(plugin?.name, equals("commit"));
      // 钉在这个 commit 上的 plugin.json version 是确定值,不是「取不到就省略」的兜底分支。
      t.check(plugin?.resolvedVersion, equals("1.3.2"));

      // 真实安装文件确实落在 Claude Code 的 plugin cache 里(user scope,`~` 交给真实 shell
      // 展开,不是我们猜的绝对路径)。
      const check = await t.sandbox.runShell(
        "test -s ~/.claude/plugins/cache/duyet-claude-plugins/commit/1.3.2/commands/commit.md",
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
