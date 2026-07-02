import { existsSync, readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import { defineEval } from "niceeval";
import type { StreamEvent } from "niceeval";

// agent.ts 的 WORKSPACE_DIR 是这个示例目录下的 workspace/(见 ../agent.ts)。
// eval 直接读这个真实路径,而不是只信模型自己说"创建成功"——这是这条 eval
// 要证明的核心:Codex 真的在磁盘上落了文件,不是话术。
const WORKSPACE_DIR = fileURLToPath(new URL("../workspace/", import.meta.url));

// Codex 自己决定怎么建文件——有时是 file_change(apply_patch 直接写),有时是
// command_execution(比如 shell heredoc / echo 重定向)。断言按"文件名有没有
// 出现在 action.called 的 input 里"判定,不锁死具体机制,这样测的是"文件真的
// 被创建"而不是"Codex 选了哪种底层实现"。见 ../agent.ts 的
// mapThreadItemsToToolCalls 对 file_change / command_execution 的 input 形状。
function createdFile(events: readonly StreamEvent[], filename: string): boolean {
  return events.some((e) => {
    if (e.type !== "action.called") return false;
    if (e.name === "file_change") {
      const changes = (e.input as { changes?: unknown })?.changes;
      return (
        Array.isArray(changes) &&
        changes.some((c) => typeof (c as { path?: unknown }).path === "string" && (c as { path: string }).path.endsWith(filename))
      );
    }
    if (e.name === "command_execution") {
      const command = (e.input as { command?: unknown })?.command;
      return typeof command === "string" && command.includes(filename);
    }
    return false;
  });
}

export default defineEval({
  description: "T1:自然语言编码请求真的落地成文件——command_execution/file_change 二选一皆可,并核对磁盘上的真实文件",

  async test(t) {
    // 每次跑随机生成文件名/内容,既避免多次运行之间互相污染断言,也让"回复里
    // 提到这个文件名"不可能是训练数据里背出来的静态答案。
    const filename = `hello-${randomBytes(4).toString("hex")}.txt`;
    const content = `niceeval says hi ${randomBytes(4).toString("hex")}`;

    const turn = await t.send(`帮我在 workspace 目录下创建一个叫 ${filename} 的文件，内容是 ${content}`);
    turn.expectOk();

    await t.group("真的执行了文件创建(file_change 或 command_execution)", () => {
      turn.eventsSatisfy(
        (events) => createdFile(events, filename),
        `action.called 的 file_change/command_execution 里出现了 ${filename}`,
      );
      t.noFailedActions();
    });

    await t.group("磁盘上真实存在这个文件,内容也对得上(不是模型话术)", () => {
      const path = `${WORKSPACE_DIR}${filename}`;
      if (!existsSync(path)) {
        throw new Error(`期望 ${path} 存在,但 workspace/ 里没有这个文件——Codex 说创建成功了但磁盘上没有。`);
      }
      const actual = readFileSync(path, "utf8");
      if (!actual.includes(content)) {
        throw new Error(`期望 ${path} 的内容包含 "${content}",实际内容是: ${JSON.stringify(actual)}`);
      }
    });

    await t.group("回复确认了创建成功", () => {
      turn.messageIncludes(filename);
    });

    turn.judge.autoevals
      .closedQA(`助手的回复是否明确告知用户「${filename}」这个文件已经创建成功?`)
      .atLeast(0.7);
  },
});
