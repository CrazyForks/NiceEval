// cases: docs/engineering/testing/unit/sandbox.md
// VercelSandbox.downloadDirectory 走 vercel/e2b 共用的 find+read 两阶段模板(见
// download-directory.test.ts;这里只证明 vercel provider 自己的接线,不重新验证模板本身的
// ignore/剥离/写盘逻辑)。fake `vsb.runCommand` / `vsb.readFileToBuffer`,不连真实 Vercel
// API——真实 Vercel Sandbox 行为归 E2E(../../docs/engineering/testing/e2e/README.md)。
import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { VercelSandbox } from "./vercel.ts";

let roots: string[] = [];
afterEach(async () => {
  await Promise.all(roots.map((r) => rm(r, { recursive: true, force: true })));
  roots = [];
});

async function makeLocalDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "niceeval-vercel-download-"));
  roots.push(dir);
  return dir;
}

/** vercel 的构造函数是 TS `private`(编译期限定,运行时只是普通函数);测试绕开它直接注入
 *  fake vsb,不必走 `VercelSandbox.create()`(需要真实凭据、起真实 microVM)。 */
function makeSandbox(vsb: unknown): VercelSandbox {
  const Ctor = VercelSandbox as unknown as new (vsb: unknown, id: string, timeoutMs: number, runtime: string) => VercelSandbox;
  return new Ctor(vsb, "test-sandbox", 5_000, "node24");
}

describe("VercelSandbox.downloadDirectory", () => {
  it("lists under the resolved remote dir, threads ignore into the find script, and writes exact bytes", async () => {
    const localDir = await makeLocalDir();
    const files = new Map<string, Buffer>([
      ["a.txt", Buffer.from("hello")],
      ["nested/b.bin", Buffer.from([0, 1, 2, 255])],
    ]);
    let capturedScript = "";
    let capturedCwd = "";
    const sandbox = makeSandbox({
      runCommand: async (opts: { cmd: string; args: string[]; cwd: string }) => {
        // runShell 经 runCommand("bash", ["-c", script], opts) 转发,script 是 args[1]。
        capturedScript = opts.args[1] ?? "";
        capturedCwd = opts.cwd;
        const stdout = [...files.keys()].map((p) => `./${p}`).join("\n");
        return { exitCode: 0, stdout: async () => stdout, stderr: async () => "" };
      },
      readFileToBuffer: async ({ path }: { path: string }) => {
        const rel = path.slice(capturedCwd.length + 1);
        return files.get(rel) ?? null;
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
      runCommand: async (opts: { cwd: string }) => {
        capturedCwd = opts.cwd;
        return { exitCode: 0, stdout: async () => "", stderr: async () => "" };
      },
      readFileToBuffer: async () => null,
    });

    await sandbox.downloadDirectory(await makeLocalDir());

    expect(capturedCwd).toBe(sandbox.workdir);
  });
});
