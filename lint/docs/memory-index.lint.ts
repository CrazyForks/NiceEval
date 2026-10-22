import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const MEMORY_DIR = join(import.meta.dirname, "../..", "memory");
describe("memory owners", () => {
  it("every Memory is decoded by the public Concord CLI", async () => {
    const { stdout } = await promisify(execFile)("concord", ["repo", "memory", "list", "--json"], {
      cwd: join(MEMORY_DIR, ".."), timeout: 30_000, maxBuffer: 32 * 1024 * 1024,
    });
    const result: unknown = JSON.parse(stdout);
    expect(result).toMatchObject({ domain: "memory", operation: "list", memories: expect.any(Array) });
    const entries = readdirSync(MEMORY_DIR).filter(f => f.endsWith(".md") && f !== "INDEX.md");
    const memories = (result as { memories: { metadata: { id: string } }[] }).memories;
    expect(memories.map(item => `${item.metadata.id}.md`).sort()).toEqual(entries.sort());
  }, 35_000);
  it("the human index has no dangling file links", () => {
    const index = readFileSync(join(MEMORY_DIR, "INDEX.md"), "utf8");
    const files = new Set(readdirSync(MEMORY_DIR));
    const linked = [...index.matchAll(/\]\(([\w-]+\.md)\)/g)].map(m => m[1]);
    expect(linked.filter(path => !files.has(path!))).toEqual([]);
  });
});
