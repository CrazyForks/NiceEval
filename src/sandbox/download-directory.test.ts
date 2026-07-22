// cases: docs/engineering/testing/unit/sandbox.md
// downloadDirectoryByList 是 vercel / e2b 共用的两阶段模板(docker 走 getArchive,不经过它,
// 见 docker.test.ts)。这里 fake runShell/readOne(两个 provider 自有能力的最小面),证明模板
// 本身的行为:剥离 find 输出的 `./` 前缀、按相对路径写回本地磁盘(自动建目录)、二进制内容
// 原样落盘、空目录不报错。
import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { downloadDirectoryByList } from "./download-directory.ts";
import type { CommandResult } from "../types.ts";

let roots: string[] = [];
afterEach(async () => {
  await Promise.all(roots.map((r) => rm(r, { recursive: true, force: true })));
  roots = [];
});

async function makeLocalDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "niceeval-download-directory-"));
  roots.push(dir);
  return dir;
}

function findResult(paths: readonly string[]): CommandResult {
  return { stdout: paths.join("\n"), stderr: "", exitCode: 0 };
}

describe("downloadDirectoryByList", () => {
  it("writes each listed file to the corresponding nested local path with exact bytes", async () => {
    const localDir = await makeLocalDir();
    const remote = new Map<string, Buffer>([
      ["out.txt", Buffer.from("hello")],
      ["nested/deep/file.bin", Buffer.from([0, 1, 2, 255])],
    ]);

    await downloadDirectoryByList({
      localDir,
      ignore: [],
      runShell: async () => findResult(["./out.txt", "./nested/deep/file.bin"]),
      readOne: async (relPath) => {
        const content = remote.get(relPath);
        if (content === undefined) throw new Error(`unexpected relPath: ${relPath}`);
        return content;
      },
    });

    expect((await readFile(join(localDir, "out.txt"))).toString()).toBe("hello");
    expect(await readFile(join(localDir, "nested/deep/file.bin"))).toEqual(Buffer.from([0, 1, 2, 255]));
  });

  it("does not touch the local disk when the remote listing is empty", async () => {
    const localDir = await makeLocalDir();
    let readOneCalls = 0;

    await downloadDirectoryByList({
      localDir,
      ignore: [],
      runShell: async () => findResult([]),
      readOne: async () => {
        readOneCalls += 1;
        return Buffer.from("");
      },
    });

    expect(readOneCalls).toBe(0);
  });
});
