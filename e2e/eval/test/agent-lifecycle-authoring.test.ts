import { command } from "@niceeval/testkit";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { expect, test } from "vitest";
import { evalE2E } from "./context.ts";

// @feature docs/feature/adapters/README.md
test.concurrent("内建 Agent 工厂只接受 before 与 after 生命周期声明", async () => {
  await evalE2E.case("agent-lifecycle-authoring", async ({ paths }) => {
    await writeFile(join(paths.projectRoot, "agent-lifecycle-authoring.mjs"), `
      import assert from "node:assert/strict";
      import { codexAgent, claudeCodeAgent, bubAgent } from "niceeval/adapter";
      for (const factory of [codexAgent, claudeCodeAgent, bubAgent]) {
        assert.doesNotThrow(() => factory({ before: [() => {}], after: [() => {}] }));
        for (const [oldName, newName] of [["postSetup", "before"], ["preTeardown", "after"]]) {
          for (const value of [undefined, [], [() => {}]]) {
            assert.throws(() => factory({ [oldName]: value }), (error) => {
              assert.ok(error instanceof TypeError);
              assert.match(error.message, new RegExp(oldName));
              assert.match(error.message, new RegExp(newName));
              return true;
            }, factory.name + " must reject " + oldName);
          }
        }
      }
    `);
    const result = await command([process.execPath]).run(["agent-lifecycle-authoring.mjs"], {
      cwd: paths.projectRoot,
    });
    expect(result.exitCode, result.diagnostic()).toBe(0);
  });
});
