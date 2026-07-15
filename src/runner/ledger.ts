// 变更分类账(私有 git ledger):回答「**agent** 改了什么」,不是「workspace 相对空目录变了什么」。
// 契约见 docs/feature/sandbox/architecture.md「变更归因:send 窗口与分类账」:
// - ledger 的 git 目录在沙箱内、workdir 外(runner 私有路径),以 workdir 为 work-tree——
//   workdir 保持素净:agent 看不到 runner 的 .git,eval 需要真实 git repo 时自己 git init,
//   agent 在 workdir 里的任何 git 操作都碰不到分类账。
// - 三类 commit 时点:锚点一笔(workspace.baseline);每次 t.send() 进入前 workdir 有未记录
//   变化就落一笔 eval 归因;t.send() 返回后落一笔 agent 归因(send 窗口内的全部变化)。
// - 归因排除清单 runner 私有、锚点时冻结:项目自己的 .gitignore 不参与归因判断(add -f 绕过),
//   排除靠 pathspec,include 显式打洞加回。
// - agent 归因增量 = 逐窗口 delta 序列(DiffWindow[]),不做跨窗口压缩。

import type { DiffArtifact, DiffWindow, Sandbox, WindowChange } from "../types.ts";

/** ledger 的私有 git 目录:workdir 之外、runner 控制;agent 的工具默认不会去 /tmp 翻它。 */
const LEDGER_GIT_DIR = "/tmp/.niceeval-ledger";

/** 默认归因排除清单(锚点时冻结):依赖、构建产物、包管理器缓存与 niceeval 自己的落位。 */
const DEFAULT_EXCLUDES = [
  ".git",
  "node_modules",
  ".next",
  "dist",
  "build",
  ".turbo",
  ".niceeval",
  "__niceeval__",
  "coverage",
  ".cache",
  ".pnpm-store",
  ".npm",
  ".yarn",
  ".venv",
  "__pycache__",
];

export interface ChangeLedger {
  /** send 进入前:workdir 有未记录变化就落一笔 eval 归因(fixture / setup / runCommand 副作用)。 */
  commitEvalWindow(label: string): Promise<void>;
  /** send 返回后:落一笔 agent 归因——这个 send 窗口内的全部 workspace 变化(无变化也落空窗口)。 */
  commitAgentWindow(label: string): Promise<void>;
  /** workspace.diff 阶段:从分类账导出每个 send 窗口自己的 before/after,按时序。 */
  exportWindows(): Promise<DiffArtifact>;
}

interface LedgerOptions {
  /** defineEval({ diff }) 的归因调整:ignore 追加排除,include 打洞加回(优先级最高)。 */
  include?: string[];
  ignore?: string[];
}

/** 每条 git 命令都带上私有 GIT_DIR + workdir work-tree;项目/全局 gitignore 一律不参与。 */
function gitEnv(sandbox: Sandbox): Record<string, string> {
  return {
    GIT_DIR: LEDGER_GIT_DIR,
    GIT_WORK_TREE: sandbox.workdir,
    GIT_AUTHOR_NAME: "niceeval",
    GIT_AUTHOR_EMAIL: "niceeval@localhost",
    GIT_COMMITTER_NAME: "niceeval",
    GIT_COMMITTER_EMAIL: "niceeval@localhost",
    HOME: "/tmp",
  };
}

function shellQuote(s: string): string {
  return `'${s.replaceAll("'", `'\\''`)}'`;
}

/** 打分类账锚点(workspace.baseline 阶段,环境层钩子之后):git init + 冻结排除清单 + 首笔 commit。 */
export async function createChangeLedger(sandbox: Sandbox, opts?: LedgerOptions): Promise<ChangeLedger> {
  const excludes = [...DEFAULT_EXCLUDES, ...(opts?.ignore ?? [])];
  const includes = opts?.include ?? [];
  const env = gitEnv(sandbox);

  // add -A -f:绕过项目自己的 .gitignore(项目 ignore 的文件照常记录);排除靠 pathspec
  // (runner 私有清单,agent / fixture 写 .gitignore 影响不了它);include 用第二次 add 打洞加回。
  const excludeSpecs = excludes.map((e) => shellQuote(`:(exclude)${e}`)).join(" ");
  // include 打洞:路径此刻可能还不存在(如 agent 之后才写),unmatched pathspec 不算错。
  const includeAdd =
    includes.length > 0 ? ` && { git add -A -f -- ${includes.map(shellQuote).join(" ")} 2>/dev/null || true; }` : "";
  const addAll = `git add -A -f -- . ${excludeSpecs}${includeAdd}`;

  await sandbox.runShell(`git init -q "${LEDGER_GIT_DIR}" && ${addAll} && git commit -q --allow-empty -m "anchor"`, {
    env,
  });

  return {
    async commitEvalWindow(label: string): Promise<void> {
      // 有未记录变化才落这一笔;干净时不产生空的 eval 归因 commit。
      await sandbox.runShell(`${addAll} && (git diff --cached --quiet || git commit -q -m ${shellQuote(`eval ${label}`)})`, {
        env,
      });
    },
    async commitAgentWindow(label: string): Promise<void> {
      // 窗口内没有变化时也落一条(--allow-empty),diff.json 里该窗口 changes 为空对象。
      await sandbox.runShell(`${addAll} && git commit -q --allow-empty -m ${shellQuote(`agent ${label}`)}`, { env });
    },
    async exportWindows(): Promise<DiffArtifact> {
      return exportAgentWindows(sandbox, env);
    },
  };
}

async function exportAgentWindows(sandbox: Sandbox, env: Record<string, string>): Promise<DiffArtifact> {
  const windows: DiffWindow[] = [];
  let log: string;
  try {
    log = (await sandbox.runShell(`git log --reverse --format='%H %s'`, { env })).stdout;
  } catch {
    return windows;
  }
  const commits = log
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const space = line.indexOf(" ");
      return { hash: line.slice(0, space), subject: line.slice(space + 1) };
    });

  for (const commit of commits) {
    if (!commit.subject.startsWith("agent ")) continue;
    const label = commit.subject.slice("agent ".length);
    const changes: Record<string, WindowChange> = {};

    let nameStatus = "";
    let numstat = "";
    try {
      nameStatus = (await sandbox.runShell(`git diff --name-status ${commit.hash}^ ${commit.hash}`, { env })).stdout;
      numstat = (await sandbox.runShell(`git diff --numstat ${commit.hash}^ ${commit.hash}`, { env })).stdout;
    } catch {
      windows.push({ window: label, changes });
      continue;
    }

    // numstat 里 "-\t-\t<path>" 标记二进制文件(不内联内容,只记字节数)。
    const binaryPaths = new Set(
      numstat
        .trim()
        .split("\n")
        .filter((line) => line.startsWith("-\t-\t"))
        .map((line) => line.split("\t")[2] ?? "")
        .filter(Boolean),
    );

    for (const line of nameStatus.trim().split("\n").filter(Boolean)) {
      const tab = line.indexOf("\t");
      if (tab === -1) continue;
      const statusCode = line.slice(0, tab).trim();
      const path = line.slice(tab + 1).trim();
      if (!path) continue;
      const status: WindowChange["status"] = statusCode.startsWith("A")
        ? "added"
        : statusCode.startsWith("D")
          ? "deleted"
          : "modified";
      const change: WindowChange = { status };
      if (binaryPaths.has(path)) {
        const binary: NonNullable<WindowChange["binary"]> = {};
        if (status !== "added") {
          const size = await blobSize(sandbox, env, `${commit.hash}^`, path);
          if (size !== undefined) binary.beforeBytes = size;
        }
        if (status !== "deleted") {
          const size = await blobSize(sandbox, env, commit.hash, path);
          if (size !== undefined) binary.afterBytes = size;
        }
        change.binary = binary;
      } else {
        if (status !== "added") change.before = await blobContent(sandbox, env, `${commit.hash}^`, path);
        if (status !== "deleted") change.after = await blobContent(sandbox, env, commit.hash, path);
      }
      changes[path] = change;
    }
    windows.push({ window: label, changes });
  }
  return windows;
}

async function blobContent(sandbox: Sandbox, env: Record<string, string>, rev: string, path: string): Promise<string | undefined> {
  try {
    return (await sandbox.runShell(`git show ${rev}:${shellQuote(path)}`, { env })).stdout;
  } catch {
    return undefined;
  }
}

async function blobSize(sandbox: Sandbox, env: Record<string, string>, rev: string, path: string): Promise<number | undefined> {
  try {
    const out = (await sandbox.runShell(`git cat-file -s ${rev}:${shellQuote(path)}`, { env })).stdout.trim();
    const n = Number(out);
    return Number.isFinite(n) ? n : undefined;
  } catch {
    return undefined;
  }
}
