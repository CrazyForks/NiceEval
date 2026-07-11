import { afterEach, describe, expect, it, vi } from "vitest";
import { Live, type LiveRow } from "./live.ts";

function withMockTty<T>(fn: () => T): { writes: string[]; result: T } {
  const writes: string[] = [];
  vi.spyOn(process.stderr, "write").mockImplementation((chunk: unknown) => {
    writes.push(String(chunk));
    return true;
  });
  Object.defineProperty(process.stderr, "isTTY", { value: true, configurable: true });
  Object.defineProperty(process.stderr, "columns", { value: 120, configurable: true });
  Object.defineProperty(process.stderr, "rows", { value: 40, configurable: true });
  return { writes, result: fn() };
}

describe("Live carried rows", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a carried row as already-done from the first frame, not waiting for a slot", () => {
    const rows: LiveRow[] = [
      { evalId: "memory/carried-fail", who: "codex-e2b", total: 1, carriedVerdict: "failed" },
      { evalId: "memory/fresh", who: "codex-e2b", total: 1 },
    ];
    const live = Live(rows, 2);

    const { writes } = withMockTty(() => {
      live.onRunStart?.([], { name: "codex", kind: "sandbox" } as never, {
        evals: 2,
        configs: 1,
        totalRuns: 1,
        maxConcurrency: 5,
      });
    });
    vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    live.onRunComplete?.({
      startedAt: "",
      finishedAt: "",
      durationMs: 0,
      results: [],
      totalRuns: 1,
    } as never);

    const out = writes.join("");
    const carriedLine = out.split("\n").find((l) => l.includes("memory/carried-fail"));
    const freshLine = out.split("\n").find((l) => l.includes("memory/fresh"));

    expect(carriedLine).toBeDefined();
    expect(carriedLine).toContain("✗");
    expect(carriedLine).not.toContain("waiting");

    expect(freshLine).toBeDefined();
    expect(freshLine).toContain("waiting");
  });
});
