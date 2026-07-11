// #/attempt/<snapshot>/<attempt> 深链的纯函数单测:解析 / 格式化往返、坏输入、按 attemptRef 定位。

import { describe, expect, it } from "vitest";
import { formatAttemptHash, parseAttemptHash, resolveAttemptRef } from "./attempt-route.ts";
import type { ViewResult, ViewSnapshot } from "../types.ts";

const attempt = (snapshot: string, attemptPath: string, index: number): ViewResult => ({
  id: `demo/eval-${index}`,
  agent: "demo-agent",
  verdict: "passed",
  attempt: 0,
  durationMs: 1,
  assertions: [],
  attemptRef: { snapshot, attempt: attemptPath },
});

// 快照只有 results 参与定位,其余元信息字段与路由无关。
const snap = (results: ViewResult[]): ViewSnapshot => ({ results }) as ViewSnapshot;

describe("parseAttemptHash", () => {
  it("parses the canonical experiment-dir/snapshot-dir + evalId/aN shape", () => {
    expect(parseAttemptHash("#/attempt/compare_bub/2026-07-11T07-29-54-873Z-x1f2/weather/brooklyn/a0")).toEqual({
      snapshot: "compare_bub/2026-07-11T07-29-54-873Z-x1f2",
      attempt: "weather/brooklyn/a0",
    });
  });

  it("round-trips through formatAttemptHash, including segments that need encoding", () => {
    for (const ref of [
      { snapshot: "compare_bub/2026-07-11T07-29-54-873Z-x1f2", attempt: "weather/brooklyn/a0" },
      { snapshot: "exp/snap", attempt: "a0" }, // 无 "/" 的 evalId
      { snapshot: "with space/snap", attempt: "eval id/a3" },
      { snapshot: "nested/exp/snap", attempt: "a/b/a12" }, // snapshot 段本身含 "/"(理论上不出现,但解析按前两段切)
    ]) {
      const parsed = parseAttemptHash(formatAttemptHash(ref));
      if (ref.snapshot === "nested/exp/snap") {
        // snapshot 恒按前两段切:"nested/exp" 被当成 snapshot,"snap/a/b/a12" 归 attempt。
        expect(parsed).toEqual({ snapshot: "nested/exp", attempt: "snap/a/b/a12" });
      } else {
        expect(parsed).toEqual(ref);
      }
    }
  });

  it("accepts a bare `aN` attempt tail with no evalId path segment", () => {
    expect(parseAttemptHash("#/attempt/exp/snap/a0")).toEqual({ snapshot: "exp/snap", attempt: "a0" });
  });

  it("rejects non-attempt hashes and malformed shapes", () => {
    for (const hash of [
      "",
      "#",
      "#/",
      "#tab-experiments", // 页内锚点不归这条路由
      "#/compare/a/b",
      "#/attempt",
      "#/attempt/",
      "#/attempt/exp",
      "#/attempt/exp/snap", // 少了 aN 尾段
      "#/attempt/exp/snap/eval/notanumber",
      "#/attempt/exp/snap/eval/a1.5",
      "#/attempt/exp/snap/eval/a-1",
      "#/attempt/exp//eval/a0", // 空段
      "#/attempt/exp/snap/eval/a0/", // 末段为空
      "#/attempt/exp/%zz/eval/a0", // 非法 % 转义
    ]) {
      expect(parseAttemptHash(hash), hash).toBeNull();
    }
  });
});

describe("resolveAttemptRef", () => {
  const snapA = "exp/2026-07-01T10-00-00-000Z-aaaa";
  const snapB = "exp/2026-07-02T10-00-00-000Z-bbbb";
  const snapshots = [
    snap([attempt(snapA, "eval/a0", 0), attempt(snapB, "eval/a0", 0)]),
    snap([attempt(snapA, "eval/a1", 1)]),
  ];

  it("finds the attempt whose injected ref matches snapshot + attempt", () => {
    expect(resolveAttemptRef(snapshots, { snapshot: snapA, attempt: "eval/a1" })).toBe(snapshots[1]!.results[0]);
    expect(resolveAttemptRef(snapshots, { snapshot: snapB, attempt: "eval/a0" })).toBe(snapshots[0]!.results[1]);
  });

  it("returns null for unknown snapshots and attempt paths", () => {
    expect(resolveAttemptRef(snapshots, { snapshot: "no-such-snap", attempt: "eval/a0" })).toBeNull();
    expect(resolveAttemptRef(snapshots, { snapshot: snapA, attempt: "eval/a99" })).toBeNull();
  });

  it("returns null when results predate attemptRef injection (old baked data)", () => {
    const legacy = attempt(snapA, "eval/a0", 0);
    delete (legacy as { attemptRef?: unknown }).attemptRef;
    expect(resolveAttemptRef([snap([legacy])], { snapshot: snapA, attempt: "eval/a0" })).toBeNull();
  });
});
