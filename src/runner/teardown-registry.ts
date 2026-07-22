// 强杀后的收尾登记表:`.niceeval/teardowns/` 下的逐条目文件,与留存注册表
// (sandbox/keep-registry.ts)同一套原子写纪律(temp → fsync → rename → fsync 目录)。
// 契约见 docs/feature/experiments/architecture.md「强杀后的收尾兜底:收尾登记与启动自愈」。

import { createHash } from "node:crypto";
import { mkdir, open, readdir, readFile, rename, rm } from "node:fs/promises";
import { join } from "node:path";

/** 一条收尾登记项(逐条目文件的 JSON 形状)。 */
export interface TeardownRegistration {
  experimentId: string;
  /** 定义该实验的文件路径(项目相对),纯展示/诊断用途,不参与恢复判定。 */
  experimentFile: string;
  selectedEvalIds: readonly string[];
  pid: number;
  host: string;
  startedAt: string;
}

export function teardownsDirOf(niceevalRoot: string): string {
  return join(niceevalRoot, "teardowns");
}

/** entry id:experimentId 的稳定散列(条目文件名),与该实验的登记一一对应。 */
export function teardownEntryId(experimentId: string): string {
  return createHash("sha256").update(experimentId).digest("hex").slice(0, 12);
}

/** 原子写入一条登记项:临时文件 → fsync → rename → fsync 目录(与 keep-registry.ts 同纪律)。 */
export async function writeTeardownRegistration(niceevalRoot: string, entry: TeardownRegistration): Promise<void> {
  const dir = teardownsDirOf(niceevalRoot);
  await mkdir(dir, { recursive: true });
  const id = teardownEntryId(entry.experimentId);
  const tmpPath = join(dir, `.${id}.${process.pid}.tmp`);
  const finalPath = join(dir, `${id}.json`);
  const handle = await open(tmpPath, "w");
  try {
    await handle.writeFile(JSON.stringify(entry, null, 2), "utf-8");
    await handle.sync();
  } finally {
    await handle.close();
  }
  await rename(tmpPath, finalPath);
  await fsyncDir(dir);
}

/** 读一条登记项(不存在或损坏都返回 undefined,不抛错)。 */
export async function readTeardownRegistration(
  niceevalRoot: string,
  experimentId: string,
): Promise<TeardownRegistration | undefined> {
  const path = join(teardownsDirOf(niceevalRoot), `${teardownEntryId(experimentId)}.json`);
  try {
    return JSON.parse(await readFile(path, "utf-8")) as TeardownRegistration;
  } catch {
    return undefined;
  }
}

/** 读全部登记项(损坏条目跳过,不整体失败;目录不存在时返回空集合)。 */
export async function readTeardownRegistrations(
  niceevalRoot: string,
): Promise<{ id: string; entry: TeardownRegistration }[]> {
  const dir = teardownsDirOf(niceevalRoot);
  let files: string[];
  try {
    files = await readdir(dir);
  } catch {
    return [];
  }
  const out: { id: string; entry: TeardownRegistration }[] = [];
  for (const file of files) {
    if (!file.endsWith(".json") || file.startsWith(".")) continue;
    try {
      const raw = await readFile(join(dir, file), "utf-8");
      out.push({ id: file.slice(0, -".json".length), entry: JSON.parse(raw) as TeardownRegistration });
    } catch {
      // 跳过损坏条目,不让一条坏文件拖垮整次扫描。
    }
  }
  return out;
}

/**
 * 删登记是互斥点:成功删除(返回 true)即拿到执行权;登记已被别的进程删除(ENOENT,返回 false)
 * 则跳过——同一份遗留义务不会被两个进程双跑。
 */
export async function removeTeardownRegistrationIfPresent(niceevalRoot: string, id: string): Promise<boolean> {
  const dir = teardownsDirOf(niceevalRoot);
  try {
    await rm(join(dir, `${id}.json`));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw e;
  }
  await fsyncDir(dir);
  return true;
}

async function fsyncDir(dir: string): Promise<void> {
  try {
    const handle = await open(dir, "r");
    try {
      await handle.sync();
    } finally {
      await handle.close();
    }
  } catch {
    // 平台不支持目录 fsync(如 Windows)时静默降级;rename/rm 本身已是原子操作。
  }
}

/** 同宿主 pid 存活探测,与 sandbox/run-identity.ts 的 `isPidAlive` 同语义(此处不共享该模块,
 *  避免 runner/ 反向依赖 sandbox/ 的孤儿核对细节)。 */
function isPidAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return (e as NodeJS.ErrnoException).code === "EPERM";
  }
}

/** 遗留义务判定:同宿主且 pid 不存活。pid 存活或异宿主可能属于并发 run,不触碰。 */
export function isStaleTeardownRegistration(entry: TeardownRegistration, currentHost: string): boolean {
  return entry.host === currentHost && !isPidAlive(entry.pid);
}

/**
 * `niceeval exp` 启动提醒:遗留义务里「不在本次选择」的那部分,各给一行 `--teardown` 命令。
 * 在本次选择里的遗留义务由 run.ts 在该实验触发 setup 前自动补执行,不出现在这里
 * (见 docs/feature/experiments/architecture.md「强杀后的收尾兜底」)。
 */
export async function staleTeardownReminder(
  niceevalRoot: string,
  selectedExperimentIds: ReadonlySet<string>,
  currentHost: string,
): Promise<string | undefined> {
  const registrations = await readTeardownRegistrations(niceevalRoot);
  const lines: string[] = [];
  for (const { entry } of registrations) {
    if (!isStaleTeardownRegistration(entry, currentHost)) continue;
    if (selectedExperimentIds.has(entry.experimentId)) continue;
    lines.push(
      `stale experiment teardown for "${entry.experimentId}" from a killed run — niceeval exp ${entry.experimentId} --teardown\n`,
    );
  }
  return lines.length > 0 ? lines.join("") : undefined;
}
