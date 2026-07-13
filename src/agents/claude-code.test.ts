// Claude Code native plugin 安装(installPlugins)的单测:单 plugin 的命令构造、同名
// marketplace 的去重、ref 钉定时改走 clone+checkout+本地路径连接、resolvedVersion 取不到
// 时优雅省略、marketplace/plugin 安装失败的报错。沙箱是内存 fake,风格与
// src/agents/skills.test.ts 一致(记命令的 FakeSandbox + 按命令前缀打脚本),不另起一套。
// 定稿见 docs/feature/adapters/architecture/coding-agent-extensions.md。

import { describe, expect, it } from "vitest";
import { installPlugins, type ClaudeCodePluginSpec } from "./claude-code.ts";
import type { CommandResult, Sandbox, SandboxFile } from "../types.ts";

/** 内存沙箱:runShell 记命令(可按命令包含的子串打脚本化输出)。 */
class FakeSandbox implements Partial<Sandbox> {
  readonly workdir = "/workspace";
  readonly sandboxId = "fake";
  readonly otlpHost = null;
  readonly commands: string[] = [];
  script: { match: string; result: (cmd: string) => Partial<CommandResult> }[] = [];

  async runShell(script: string): Promise<CommandResult> {
    this.commands.push(script);
    const hit = this.script.find((s) => script.includes(s.match));
    return { stdout: "", stderr: "", exitCode: 0, ...hit?.result(script) };
  }
  async writeFiles(): Promise<void> {}
  async uploadFiles(_files: SandboxFile[]): Promise<void> {}
  async fileExists(): Promise<boolean> {
    return false;
  }
  async readFile(): Promise<string> {
    throw new Error("not used in this test");
  }
}

const sb = (s?: FakeSandbox["script"]): FakeSandbox => {
  const box = new FakeSandbox();
  if (s) box.script = s;
  return box;
};
const asSandbox = (box: FakeSandbox): Sandbox => box as unknown as Sandbox;

describe("claude-code installPlugins · 命令构造", () => {
  it("单 plugin:先连 marketplace 再装 plugin,manifest 记 marketplace/name(无 ref 时不带 ref 键)", async () => {
    const box = sb();
    const plugins: ClaudeCodePluginSpec[] = [
      { marketplace: { name: "acme", source: "acme/claude-code-plugins" }, name: "safe-shell" },
    ];
    const out = await installPlugins(asSandbox(box), plugins);

    expect(box.commands).toEqual([
      "claude plugin marketplace add 'acme/claude-code-plugins'",
      "claude plugin install 'safe-shell@acme'",
      "claude plugin list --json",
    ]);
    expect(out).toEqual([
      { agent: "claude-code", marketplace: { name: "acme", source: "acme/claude-code-plugins" }, name: "safe-shell" },
    ]);
  });

  it("同名 marketplace 只连一次:两个 plugin 共用一个 marketplace.name → 只有一条 marketplace add,两条 install", async () => {
    const box = sb();
    const plugins: ClaudeCodePluginSpec[] = [
      { marketplace: { name: "acme", source: "acme/claude-code-plugins" }, name: "safe-shell" },
      { marketplace: { name: "acme", source: "acme/claude-code-plugins" }, name: "repo-map" },
    ];
    const out = await installPlugins(asSandbox(box), plugins);

    const marketplaceAdds = box.commands.filter((c) => c.startsWith("claude plugin marketplace add"));
    expect(marketplaceAdds).toHaveLength(1);
    const installs = box.commands.filter((c) => c.startsWith("claude plugin install"));
    expect(installs).toEqual(["claude plugin install 'safe-shell@acme'", "claude plugin install 'repo-map@acme'"]);
    expect(out.map((p) => p.name)).toEqual(["safe-shell", "repo-map"]);
    expect(out.every((p) => p.marketplace.name === "acme")).toBe(true);
  });

  it("ref 钉定:先 git clone + checkout,再以本地 clone 路径连接 marketplace(claude CLI 没有钉 ref 的入口);manifest 保留 ref", async () => {
    const box = sb();
    const plugins: ClaudeCodePluginSpec[] = [
      { marketplace: { name: "acme", source: "acme/claude-code-plugins", ref: "v1.3.0" }, name: "safe-shell" },
    ];
    const out = await installPlugins(asSandbox(box), plugins);

    const clone = box.commands.find((c) => c.includes("git clone"))!;
    expect(clone).toContain("https://github.com/acme/claude-code-plugins.git");
    expect(clone).not.toContain("--depth 1"); // ref 可能是任意 commit,浅克隆 checkout 不到
    expect(clone).toContain("checkout --quiet 'v1.3.0'");
    const cloneDir = /rm -rf '([^']+)'/.exec(clone)?.[1];
    expect(cloneDir).toBeTruthy();

    // marketplace add 用的是 clone 出来的本地路径,不是原始 "acme/claude-code-plugins" 字符串
    const add = box.commands.find((c) => c.startsWith("claude plugin marketplace add"))!;
    expect(add).toBe(`claude plugin marketplace add '${cloneDir}'`);

    expect(out).toEqual([
      {
        agent: "claude-code",
        marketplace: { name: "acme", source: "acme/claude-code-plugins", ref: "v1.3.0" },
        name: "safe-shell",
      },
    ]);
  });

  it("resolvedVersion:装完读 `claude plugin list --json` 命中 → manifest 记版本", async () => {
    const box = sb([
      {
        match: "claude plugin list --json",
        result: () => ({ stdout: JSON.stringify([{ id: "safe-shell@acme", version: "1.2.3" }]) }),
      },
    ]);
    const out = await installPlugins(asSandbox(box), [
      { marketplace: { name: "acme", source: "acme/claude-code-plugins" }, name: "safe-shell" },
    ]);
    expect(out[0]?.resolvedVersion).toBe("1.2.3");
  });

  it("resolvedVersion 取不到时优雅省略(不阻断安装):list 命令失败 → manifest 里没有 resolvedVersion 键", async () => {
    const box = sb([{ match: "claude plugin list --json", result: () => ({ exitCode: 1 }) }]);
    const out = await installPlugins(asSandbox(box), [
      { marketplace: { name: "acme", source: "acme/claude-code-plugins" }, name: "safe-shell" },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]).not.toHaveProperty("resolvedVersion");
  });

  it("resolvedVersion 取不到时优雅省略:list 输出不是合法 JSON(如空 stdout)同样不阻断安装", async () => {
    const box = sb(); // 默认 stdout 为空字符串,JSON.parse("") 抛错,installedVersion 内部吞掉
    const out = await installPlugins(asSandbox(box), [
      { marketplace: { name: "acme", source: "acme/claude-code-plugins" }, name: "safe-shell" },
    ]);
    expect(out[0]).not.toHaveProperty("resolvedVersion");
  });
});

describe("claude-code installPlugins · 失败语义", () => {
  it("marketplace 连接失败:抛错并点名 marketplace 名与来源,不继续装 plugin", async () => {
    const box = sb([{ match: "claude plugin marketplace add", result: () => ({ exitCode: 1, stderr: "boom" }) }]);
    await expect(
      installPlugins(asSandbox(box), [
        { marketplace: { name: "acme", source: "acme/claude-code-plugins" }, name: "safe-shell" },
      ]),
    ).rejects.toThrow(/acme/);
    expect(box.commands.some((c) => c.startsWith("claude plugin install"))).toBe(false);
  });

  it("plugin 安装失败:抛错并点名 plugin 名", async () => {
    const box = sb([{ match: "claude plugin install", result: () => ({ exitCode: 1, stderr: "boom" }) }]);
    await expect(
      installPlugins(asSandbox(box), [
        { marketplace: { name: "acme", source: "acme/claude-code-plugins" }, name: "safe-shell" },
      ]),
    ).rejects.toThrow(/safe-shell/);
  });
});
