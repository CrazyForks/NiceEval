// cases: docs/engineering/testing/unit/sandbox.md
// E2BSandbox.downloadDirectory 走 vercel/e2b 共用的 find+read 两阶段模板(见
// download-directory.test.ts;这里只证明 e2b provider 自己的接线——不重新验证模板本身的
// ignore/剥离/写盘逻辑)。fake `sbx.commands.run` / `sbx.files.read`,不连真实 e2b API——
// 真实 E2B 沙箱行为归 E2E(../../docs/engineering/testing/e2e/README.md)。
import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { E2BSandbox } from "./e2b.ts";

let roots: string[] = [];
afterEach(async () => {
  await Promise.all(roots.map((r) => rm(r, { recursive: true, force: true })));
  roots = [];
});

async function makeLocalDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "niceeval-e2b-download-"));
  roots.push(dir);
  return dir;
}

/** e2b 的构造函数是 TS `private`(编译期限定,运行时只是普通函数);测试绕开它直接注入 fake sbx,
 *  不必走 `E2BSandbox.create()`(需要真实 API key、起真实 microVM)。 */
function makeSandbox(sbx: unknown): E2BSandbox {
  const Ctor = E2BSandbox as unknown as new (sbx: unknown, id: string, timeoutMs: number) => E2BSandbox;
  return new Ctor(sbx, "test-sandbox", 5_000);
}

describe("E2BSandbox.downloadDirectory", () => {
  it("lists under the resolved remote dir, threads ignore into the find script, and writes exact bytes", async () => {
    const localDir = await makeLocalDir();
    const files = new Map<string, Buffer>([
      ["a.txt", Buffer.from("hello")],
      ["nested/b.bin", Buffer.from([0, 1, 2, 255])],
    ]);
    let capturedScript = "";
    let capturedCwd = "";
    const sandbox = makeSandbox({
      commands: {
        run: async (script: string, opts: { cwd: string }) => {
          capturedScript = script;
          capturedCwd = opts.cwd;
          // 不重新实现 find 语义:直接回放已知的(已被剪枝过的)相对路径清单。
          return { stdout: [...files.keys()].map((p) => `./${p}`).join("\n"), stderr: "", exitCode: 0 };
        },
      },
      files: {
        read: async (path: string, opts: { format: string }) => {
          const rel = path.slice(capturedCwd.length + 1);
          const content = files.get(rel);
          if (!content) throw new Error(`unexpected read: ${path}`);
          return opts.format === "bytes" ? new Uint8Array(content) : content.toString("utf8");
        },
      },
    });

    await sandbox.downloadDirectory(localDir, "out", { ignore: ["node_modules"] });

    expect(capturedCwd).toBe(`${sandbox.workdir}/out`);
    expect(capturedScript).toContain("node_modules");
    expect((await readFile(join(localDir, "a.txt"))).toString()).toBe("hello");
    expect(await readFile(join(localDir, "nested/b.bin"))).toEqual(Buffer.from([0, 1, 2, 255]));
  });

  it("falls back to workdir when targetDir is omitted", async () => {
    let capturedCwd = "";
    const sandbox = makeSandbox({
      commands: {
        run: async (_script: string, opts: { cwd: string }) => {
          capturedCwd = opts.cwd;
          return { stdout: "", stderr: "", exitCode: 0 };
        },
      },
      files: { read: async () => new Uint8Array() },
    });

    await sandbox.downloadDirectory(await makeLocalDir());

    expect(capturedCwd).toBe(sandbox.workdir);
  });
});
