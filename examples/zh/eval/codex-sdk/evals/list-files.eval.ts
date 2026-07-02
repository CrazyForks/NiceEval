import { randomBytes } from "node:crypto";
import { defineEval } from "niceeval";
import type { StreamEvent } from "niceeval";

// 【T2 多轮 + 真实工具输出】上一轮创建的文件名是本次运行随机生成的,不可能是
// Codex 训练数据或缓存响应里背出来的静态答案。第二轮"列出目录"如果回复/工具
// 输出里真的出现了这个文件名,只可能来自它这一轮真的又跑了一次 ls/rg --files
// 之类的命令、读到了磁盘上第一轮真实写下的文件——而不是编造。
function toolOutputIncludes(events: readonly StreamEvent[], token: string): boolean {
  return events.some((e) => e.type === "action.result" && JSON.stringify(e.output ?? "").includes(token));
}

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
  description: "T2:同一会话里先建文件、再追问列出目录,工具调用的真实输出必须反映刚创建的文件(非幻觉)",

  async test(t) {
    const filename = `note-${randomBytes(4).toString("hex")}.txt`;

    const first = await t.send(`帮我在 workspace 目录下创建一个叫 ${filename} 的空文件。`);
    first.expectOk();

    await t.group("第一轮真的创建了文件", () => {
      first.eventsSatisfy((events) => createdFile(events, filename), `file_change/command_execution 里出现了 ${filename}`);
      t.noFailedActions();
    });

    const second = await t.send("列出 workspace 目录下的所有文件，并告诉我刚刚创建的是哪个。");
    second.expectOk();

    await t.group("第二轮真的又跑了一次命令,输出里包含刚创建的文件(不是编造)", () => {
      second.eventsSatisfy(
        (events) => toolOutputIncludes(events, filename),
        `action.result 的工具输出里包含 ${filename}`,
      );
      second.messageIncludes(filename);
      t.noFailedActions();
    });

    second.judge.autoevals
      .closedQA(`助手的回复是否准确指出「${filename}」是刚刚创建的文件?`)
      .atLeast(0.7);
  },
});
