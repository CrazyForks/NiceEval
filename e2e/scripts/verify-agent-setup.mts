#!/usr/bin/env -S node --import tsx
// verify-agent-setup:校验 `AttemptHandle.agentSetup()` 的懒加载结果与磁盘上该 attempt 目录下
// 的 `agent-setup.json` 逐字节(深等)一致 —— 不是只验证文件存在(定稿见
// plan/docs-code-alignment-closeout.md 3.1「artifact 机械验收」)。Claude Code / Codex 两条
// e2e 路径共用同一份检查,不各写一份(见该文件 3.1 末尾的建议)。
//
// 读取路径经 `niceeval/results` 的 `openResults()` + `resolveLocator()`——与 CLI (`niceeval show
// @<locator>`)、view 走的是同一套读取实现,不另起一套解析逻辑。
//
// 用法:
//   tsx e2e/scripts/verify-agent-setup.mts <projectResultsRoot> <locator>
//
// 例(从仓库根跑):
//   tsx e2e/scripts/verify-agent-setup.mts e2e/projects/claude-code/.niceeval @1a2b3c4
//
// <projectResultsRoot> 是 openResults() 认的结果根 —— 即项目下的 `.niceeval` 目录(与
// `niceeval show` 的 root = join(cwd, ".niceeval") 同一层),不是仓库根或项目根。
// <locator> 是该 attempt `result.json` 里的 `locator` 字段值(带 `@` 前缀)。
//
// 退出码:0 = attempt.agentSetup() 与磁盘 manifest 深等;非 0 = 不等 / locator 解析失败 /
// 磁盘 manifest 缺失,差异或原因打印到 stderr。
import { deepStrictEqual } from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { openResults, resolveLocator, LocatorNotFoundError, MalformedLocatorError } from "niceeval/results";

function usage(): string {
  return [
    "Usage: tsx e2e/scripts/verify-agent-setup.mts <projectResultsRoot> <locator>",
    "  <projectResultsRoot>  the project's .niceeval directory (what openResults() opens)",
    "  <locator>             attempt locator from result.json's `locator` field, e.g. @1a2b3c4",
  ].join("\n");
}

function fail(message: string): never {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

async function main(): Promise<void> {
  const [rootArg, locatorArg] = process.argv.slice(2);
  if (!rootArg || !locatorArg) fail(usage());

  const root = resolve(process.cwd(), rootArg);
  const results = await openResults(root);

  let attempt;
  try {
    attempt = resolveLocator(results, locatorArg);
  } catch (e) {
    if (e instanceof MalformedLocatorError || e instanceof LocatorNotFoundError) fail(e.message);
    throw e;
  }

  // 磁盘上的真值:同一 attempt 目录(ref.snapshot 是根相对快照目录,ref.attempt 是快照相对
  // attempt 目录,见 results/types.ts AttemptRef)下的 agent-setup.json —— 与 attemptSetup()
  // 懒加载走的是同一份候选路径规则的第一候选(本 attempt 目录,不是 --resume 的原快照回退)。
  const diskPath = join(root, attempt.ref.snapshot, attempt.ref.attempt, "agent-setup.json");
  const diskRaw = await readFile(diskPath, "utf-8").catch((e: unknown) =>
    fail(`Cannot read manifest on disk at ${diskPath}: ${e instanceof Error ? e.message : String(e)}`),
  );
  const diskManifest: unknown = JSON.parse(diskRaw);

  const handleManifest = await attempt.agentSetup();
  if (handleManifest === null) {
    fail(
      `attempt.agentSetup() returned null but a manifest exists on disk at ${diskPath}. ` +
        "The lazy loader did not find the artifact it should have.",
    );
  }

  try {
    deepStrictEqual(handleManifest, diskManifest);
  } catch {
    process.stderr.write("attempt.agentSetup() does not deep-equal the on-disk agent-setup.json.\n\n");
    process.stderr.write(`attempt.agentSetup():\n${JSON.stringify(handleManifest, null, 2)}\n\n`);
    process.stderr.write(`disk (${diskPath}):\n${JSON.stringify(diskManifest, null, 2)}\n`);
    process.exit(1);
  }

  process.stdout.write(`OK: attempt.agentSetup() deep-equals ${diskPath}\n`);
}

main().catch((e: unknown) => fail(e instanceof Error ? (e.stack ?? e.message) : String(e)));
