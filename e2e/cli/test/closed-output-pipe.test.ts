import { withProcess } from "@niceeval/testkit";
import { expect, test } from "vitest";
import { cliBinary, cliE2E } from "./context.ts";

// @feature docs/feature/inspection/README.md
test.concurrent("下游关闭 stdout 后 query 正常退出且不打印未捕获异常", async () => {
  await cliE2E.case("closed-output-pipe", async ({ paths }) => {
    await withProcess([
      process.execPath, "--input-type=module", "-e", `
        import { spawn } from "node:child_process";
        const child = spawn(process.argv[1], process.argv.slice(2), { stdio: ["ignore", "pipe", "pipe"] });
        child.stdout.destroy();
        child.stderr.pipe(process.stderr);
        child.on("error", (error) => { console.error(error); process.exitCode = 2; });
        child.on("close", (code) => { process.exitCode = code ?? 2; });
      `,
      ...cliBinary, "query", "discover",
    ], { cwd: paths.projectRoot, processGroup: true, timeoutMs: 30_000 }, async (controlled) => {
      const result = await controlled.done;
      expect(result.exitCode, result.diagnostic()).toBe(0);
      expect(result.stderr, result.diagnostic()).toBe("");
    });
  });
});
