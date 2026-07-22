// cases: docs/engineering/testing/unit/experiments-runner.md
// 覆盖「实验级生命周期」声明的「收尾登记的落盘与启动自愈」一行里,登记表本身的原子写/读/删纪律
// 与遗留义务判定(isStaleTeardownRegistration);run.ts 里"补执行"这半的调度编排由
// run.test.ts 的受控 fixture 覆盖(见 docs/feature/experiments/architecture.md「强杀后的收尾兜底」)。

import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir, hostname } from "node:os";
import { join } from "node:path";
import {
  isStaleTeardownRegistration,
  readTeardownRegistration,
  readTeardownRegistrations,
  removeTeardownRegistrationIfPresent,
  teardownEntryId,
  teardownsDirOf,
  writeTeardownRegistration,
  type TeardownRegistration,
} from "./teardown-registry.ts";

let roots: string[] = [];
async function makeRoot(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "niceeval-teardown-registry-"));
  roots.push(dir);
  return dir;
}
afterEach(async () => {
  await Promise.all(roots.map((r) => rm(r, { recursive: true, force: true })));
  roots = [];
});

function registration(over: Partial<TeardownRegistration> = {}): TeardownRegistration {
  return {
    experimentId: "compare/bub-e2b",
    experimentFile: "experiments/compare/bub-e2b.ts",
    selectedEvalIds: ["memory/commit0", "memory/commit1"],
    pid: 999_999_999,
    host: hostname(),
    startedAt: "2026-07-21T10:00:00.000Z",
    ...over,
  };
}

describe("teardown registry: 逐条目文件的原子写 / 读 / 删", () => {
  it("写入 → 按 experimentId 读回 → 删除,目录不留残留临时文件", async () => {
    const root = await makeRoot();
    const niceevalRoot = join(root, ".niceeval");
    await writeTeardownRegistration(niceevalRoot, registration());

    const read = await readTeardownRegistration(niceevalRoot, "compare/bub-e2b");
    expect(read).toEqual(registration());

    const id = teardownEntryId("compare/bub-e2b");
    const claimed = await removeTeardownRegistrationIfPresent(niceevalRoot, id);
    expect(claimed).toBe(true);

    const files = await readdir(teardownsDirOf(niceevalRoot));
    expect(files).toEqual([]); // 没有遗留的 .tmp 临时文件
  });

  it("删登记是互斥点:第二次删除同一个 id 返回 false(已被别的进程/路径删过)", async () => {
    const root = await makeRoot();
    const niceevalRoot = join(root, ".niceeval");
    await writeTeardownRegistration(niceevalRoot, registration());
    const id = teardownEntryId("compare/bub-e2b");

    expect(await removeTeardownRegistrationIfPresent(niceevalRoot, id)).toBe(true);
    expect(await removeTeardownRegistrationIfPresent(niceevalRoot, id)).toBe(false);
  });

  it("不同 experimentId 对应不同 entry id,互不覆盖", async () => {
    const root = await makeRoot();
    const niceevalRoot = join(root, ".niceeval");
    await writeTeardownRegistration(niceevalRoot, registration({ experimentId: "exp/a" }));
    await writeTeardownRegistration(niceevalRoot, registration({ experimentId: "exp/b" }));

    const all = await readTeardownRegistrations(niceevalRoot);
    expect(all.map(({ entry }) => entry.experimentId).sort()).toEqual(["exp/a", "exp/b"]);
  });

  it("读不存在的登记 / 目录返回 undefined 或空集合,不抛错", async () => {
    const root = await makeRoot();
    const niceevalRoot = join(root, ".niceeval");
    expect(await readTeardownRegistration(niceevalRoot, "nothing/here")).toBeUndefined();
    expect(await readTeardownRegistrations(niceevalRoot)).toEqual([]);
  });

  it("损坏的登记文件在 readTeardownRegistrations 里被跳过,不拖垮整次扫描", async () => {
    const root = await makeRoot();
    const niceevalRoot = join(root, ".niceeval");
    await writeTeardownRegistration(niceevalRoot, registration({ experimentId: "exp/good" }));
    const { writeFile, mkdir } = await import("node:fs/promises");
    await mkdir(teardownsDirOf(niceevalRoot), { recursive: true });
    await writeFile(join(teardownsDirOf(niceevalRoot), "deadbeefdead.json"), "{not json", "utf-8");

    const all = await readTeardownRegistrations(niceevalRoot);
    expect(all.map(({ entry }) => entry.experimentId)).toEqual(["exp/good"]);
  });
});

describe("isStaleTeardownRegistration: 遗留义务判定", () => {
  it("同宿主且 pid 不存活 → 遗留义务(true)", () => {
    expect(isStaleTeardownRegistration(registration({ host: hostname(), pid: 999_999_999 }), hostname())).toBe(true);
  });

  it("同宿主且 pid 存活 → 不是遗留义务(可能是并发 run,不触碰)", () => {
    expect(isStaleTeardownRegistration(registration({ host: hostname(), pid: process.pid }), hostname())).toBe(false);
  });

  it("异宿主 → 不是遗留义务,即使 pid 数值上确实不存在于本机", () => {
    expect(isStaleTeardownRegistration(registration({ host: "some-other-host", pid: 999_999_999 }), hostname())).toBe(
      false,
    );
  });
});
