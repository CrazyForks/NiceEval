// cases: docs/engineering/testing/unit/sandbox.md
// DockerSandbox.downloadDirectory 走 getArchive 单次 tar 取回(不同于 vercel/e2b 共用的
// find+read 模板,见 download-directory.test.ts)。这里 fake 容器的 getArchive,不连真实
// daemon——真实容器行为归 E2E(../../docs/engineering/testing/e2e/README.md)。
import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import * as tar from "tar-stream";
import { DockerSandbox } from "./docker.ts";

let roots: string[] = [];
afterEach(async () => {
  await Promise.all(roots.map((r) => rm(r, { recursive: true, force: true })));
  roots = [];
});

async function makeLocalDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "niceeval-docker-download-"));
  roots.push(dir);
  return dir;
}

/** 构造一份 Docker getArchive 会返回的形状:目录归档,entry 名以请求路径 basename 为首段。 */
async function buildDirectoryArchive(): Promise<Buffer> {
  const pack = tar.pack();
  pack.entry({ name: "out/", type: "directory" }, () => {});
  pack.entry({ name: "out/a.txt" }, "hello");
  pack.entry({ name: "out/nested/", type: "directory" }, () => {});
  pack.entry({ name: "out/nested/b.bin" }, Buffer.from([0, 1, 2, 255]));
  pack.entry({ name: "out/node_modules/", type: "directory" }, () => {});
  pack.entry({ name: "out/node_modules/x.txt" }, "should be pruned");
  pack.finalize();
  const chunks: Buffer[] = [];
  for await (const chunk of pack) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks);
}

/** 给 DockerSandbox 实例注入一个 fake container——绕开真实 dockerode 连接,只验证我们自己的下载逻辑。 */
function withFakeContainer(sandbox: DockerSandbox, getArchive: (opts: { path: string }) => Promise<NodeJS.ReadableStream>) {
  (sandbox as unknown as { container: { getArchive: typeof getArchive } }).container = { getArchive };
}

describe("DockerSandbox.downloadDirectory", () => {
  it("strips the archive's leading directory segment, honors ignore, and writes exact bytes", async () => {
    const localDir = await makeLocalDir();
    const sandbox = new DockerSandbox();
    const archive = await buildDirectoryArchive();
    let requestedPath: string | undefined;
    withFakeContainer(sandbox, async (opts) => {
      requestedPath = opts.path;
      return Readable.from(archive);
    });

    await sandbox.downloadDirectory(localDir, "out", { ignore: ["node_modules"] });

    expect(requestedPath).toBe(`${sandbox.workdir}/out`);
    expect((await readFile(join(localDir, "a.txt"))).toString()).toBe("hello");
    expect(await readFile(join(localDir, "nested/b.bin"))).toEqual(Buffer.from([0, 1, 2, 255]));
    expect(existsSync(join(localDir, "node_modules"))).toBe(false);
    // 归档里的顶层目录条目("out/")本身不应该在本地磁盘上冒出同名文件或空目录。
    expect(existsSync(join(localDir, "out"))).toBe(false);
  });

  it("throws instead of silently no-op-ing when the container has not been initialized", async () => {
    const sandbox = new DockerSandbox();
    await expect(sandbox.downloadDirectory(await makeLocalDir(), "out")).rejects.toThrow();
  });
});
