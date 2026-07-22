// cases: docs/engineering/testing/unit/sandbox.md
import { describe, expect, it } from "vitest";
import { buildDownloadFindScript, shellQuote } from "./shell.ts";

describe("buildDownloadFindScript", () => {
  it("finds every regular file with no pruning when ignore is empty", () => {
    expect(buildDownloadFindScript({ ignore: [] })).toBe("find . -type f -print");
  });

  it("prunes matched basenames (files and directories alike) at any depth", () => {
    const script = buildDownloadFindScript({ ignore: ["node_modules", ".git"] });
    expect(script).toBe(
      "find . \\( -name 'node_modules' -o -name '.git' \\) -prune -o -type f -print",
    );
  });

  it("shell-quotes ignore entries so a name containing a quote can't break the script", () => {
    const script = buildDownloadFindScript({ ignore: ["weird'name"] });
    // 与 shellQuote 生成的转义形式完全一致——不能只在实现内联做等价但不同的转义。
    expect(script).toContain(shellQuote("weird'name"));
    expect(script).toBe(`find . \\( -name ${shellQuote("weird'name")} \\) -prune -o -type f -print`);
  });
});
