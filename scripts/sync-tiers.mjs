// examples/zh 下 origin → tier1(→ tier2)目录同步工具。
//
// 用法：
//   pnpm tiers:sync [name]   —— 把 baseTree 到上游最新之间的变更重放进 tier（"tier rebase 上游"）
//   pnpm tiers:check         —— 只读检查：baseTree 是否落后、tier 里是否有未解决的冲突标记
//
// 设计与实现细节见 docs/tier-sync.md。合并机制 100% 由 `git merge-tree --write-tree`
// 提供（需要 git ≥ 2.38），本脚本只做状态文件读写、检出、冲突上报和 lockfile 重装的粘合。
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { dirname, join, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const STATE_FILE = join(ROOT, "examples/zh/.tier-sync.json");
const DIFFS_DIR = join(ROOT, "examples/zh/diffs");
const LOCKFILE = "pnpm-lock.yaml";

function git(args, opts = {}) {
  const result = spawnSync("git", args, {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 200,
    ...opts,
  });
  if (result.error) throw result.error;
  return result;
}

function gitOk(args, opts = {}) {
  const result = git(args, opts);
  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed:\n${result.stderr}`);
  }
  return result.stdout.trim();
}

function loadState() {
  return JSON.parse(readFileSync(STATE_FILE, "utf8"));
}

function saveState(state) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + "\n");
}

function isClean(paths) {
  const out = gitOk(["status", "--porcelain", "--", ...paths]);
  return out.length === 0;
}

/** 对两棵 tree 做 base 合并，返回 { treeOid, conflicts, clean, messages } */
function mergeTree(baseTree, tierTree, upstreamTree) {
  const result = git([
    "merge-tree",
    "--write-tree",
    "--name-only",
    `--merge-base=${baseTree}`,
    tierTree,
    upstreamTree,
  ]);
  if (result.status !== 0 && result.status !== 1) {
    throw new Error(`git merge-tree failed unexpectedly:\n${result.stderr}`);
  }
  const lines = result.stdout.split("\n");
  const treeOid = lines[0];
  const clean = result.status === 0;
  let conflicts = [];
  if (!clean) {
    const blankIdx = lines.indexOf("", 1);
    conflicts = lines.slice(1, blankIdx === -1 ? undefined : blankIdx).filter(Boolean);
  }
  return { treeOid, conflicts, clean };
}

function lsTreeFiles(treeOid) {
  return gitOk(["ls-tree", "-r", "--name-only", treeOid])
    .split("\n")
    .filter(Boolean);
}

function checkoutTree(treeOid, destDir) {
  const archive = git(["archive", treeOid], { encoding: "buffer" });
  if (archive.status !== 0) {
    throw new Error(`git archive failed:\n${archive.stderr}`);
  }
  const tar = spawnSync("tar", ["-x", "-C", destDir, `--exclude=${LOCKFILE}`], {
    input: archive.stdout,
  });
  if (tar.status !== 0) {
    throw new Error(`tar extract failed:\n${tar.stderr}`);
  }
}

function removeDeletedFiles(oldTierTree, newTreeOid, destDir) {
  const status = gitOk(["diff", "--name-status", oldTierTree, newTreeOid]);
  const changed = [];
  for (const line of status.split("\n").filter(Boolean)) {
    const [code, path] = line.split("\t");
    changed.push(path);
    if (code === "D" && path !== LOCKFILE) {
      rmSync(join(destDir, path), { force: true });
    }
  }
  return changed;
}

function syncPair(pair, state) {
  const { from, to, baseTree } = pair;
  const name = basename(to);

  if (!isClean([from, to])) {
    throw new Error(`${name}: ${from} 或 ${to} 有未提交改动，先提交或还原再同步`);
  }

  const upstreamTree = gitOk(["rev-parse", `HEAD:${from}`]);
  const tierTree = gitOk(["rev-parse", `HEAD:${to}`]);

  if (upstreamTree === baseTree) {
    console.log(`[skip] ${name}: 上游未变化，已是最新`);
    return { name, status: "up-to-date" };
  }

  const { treeOid, conflicts, clean } = mergeTree(baseTree, tierTree, upstreamTree);

  const destDir = join(ROOT, to);
  checkoutTree(treeOid, destDir);
  const changed = removeDeletedFiles(tierTree, treeOid, destDir);

  if (!clean) {
    console.error(`[conflict] ${name}: 以下文件有冲突，已在 ${to} 留下 <<<<<<< 标记，需人工解决后重跑 tiers:sync`);
    for (const file of conflicts) console.error(`  - ${to}/${file}`);
    return { name, status: "conflict", conflicts };
  }

  if (changed.some((f) => f === "package.json" || f === "pnpm-workspace.yaml")) {
    console.log(`[install] ${name}: package.json / pnpm-workspace.yaml 有变化，重跑 pnpm install`);
    const install = spawnSync("pnpm", ["install"], { cwd: destDir, stdio: "inherit" });
    if (install.status !== 0) {
      throw new Error(`${name}: pnpm install 失败`);
    }
  }

  mkdirSync(DIFFS_DIR, { recursive: true });
  const patch = gitOk(["diff", upstreamTree, treeOid, "--", `:!${LOCKFILE}`]);
  writeFileSync(join(DIFFS_DIR, `${name}.patch`), patch ? patch + "\n" : "");

  pair.baseTree = upstreamTree;
  saveState(state);
  console.log(`[synced] ${name}: baseTree -> ${upstreamTree}`);
  return { name, status: "synced" };
}

function runSync(nameFilter) {
  const state = loadState();
  const pairs = nameFilter
    ? state.pairs.filter((p) => basename(p.to) === nameFilter)
    : state.pairs;
  if (nameFilter && pairs.length === 0) {
    console.error(`未找到名为 ${nameFilter} 的 tier pair`);
    process.exit(1);
  }
  let hadConflict = false;
  for (const pair of pairs) {
    const result = syncPair(pair, state);
    if (result.status === "conflict") hadConflict = true;
  }
  if (hadConflict) process.exit(1);
}

function runCheck() {
  const state = loadState();
  let ok = true;
  for (const pair of state.pairs) {
    const name = basename(pair.to);
    const currentUpstreamTree = gitOk(["rev-parse", `HEAD:${pair.from}`]);
    if (currentUpstreamTree !== pair.baseTree) {
      console.error(
        `✗ ${pair.to} 落后于 ${pair.from}\n  base ${pair.baseTree.slice(0, 8)}… ≠ 当前 ${currentUpstreamTree.slice(0, 8)}…，运行 pnpm tiers:sync 后重新提交`,
      );
      ok = false;
    }

    const grep = git(["grep", "-l", "<<<<<<<", "--", pair.to]);
    if (grep.status === 0 && grep.stdout.trim()) {
      console.error(`✗ ${pair.to} 中存在未解决的冲突标记:\n${grep.stdout}`);
      ok = false;
    }
  }
  if (ok) console.log("✓ 所有 tier pair 均已同步，无冲突标记");
  process.exit(ok ? 0 : 1);
}

const [, , cmd, arg] = process.argv;
if (cmd === "sync") {
  runSync(arg);
} else if (cmd === "check") {
  runCheck();
} else {
  console.error("用法: node scripts/sync-tiers.mjs <sync|check> [name]");
  process.exit(1);
}
