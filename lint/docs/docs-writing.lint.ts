import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { formatLintHits, lintCalledToolContract, lintCalledToolContractText, lintSvgTerms, svgTexts } from "./writing.js";

const ROOT = resolve(import.meta.dirname, "../..");

describe("公开 API 示例契约", () => {
  it("正文中的 calledTool 示例符合公开签名", () => {
    const hits = lintCalledToolContract();
    expect(hits.length, formatLintHits(hits)).toBe(0);
  });

  it("calledTool 示例只接收一个参数，并拒绝局部命令匹配", () => {
    const rules = JSON.parse(readFileSync(join(ROOT, "lint/docs/public-api-examples.json"), "utf8"));
    const contract = rules.publicApiExamples.calledToolContract;
    const hits = lintCalledToolContractText(
      "docs/feature/assertions/example.md",
      [
        'turn.calledTool("shell", { input: { command: /pnpm test/ } });',
        "turn.calledTool(toolMatch(\"shell\"), { count: 2 });",
        "turn.notCalledTool(toolMatch(\"shell\"), { count: 1 });",
        'turn.calledTool(toolMatch("get_weather", { input: jsonMatch({ city: "Taipei" }) }).exactly(1));',
        'turn.notCalledTool("web_search");',
      ].join("\n"),
      contract,
    );

    expect(hits.map((hit) => hit.message)).toEqual([
      "calledTool 只接收一个 ToolMatch 或工具名；input、output、status 与次数都写在 toolMatch 上",
      "calledTool 只接收一个 ToolMatch 或工具名；input、output、status 与次数都写在 toolMatch 上",
      "notCalledTool 只接收一个 ToolMatch 或工具名；input、output、status 与次数都写在 toolMatch 上",
      "命令匹配使用 commandMatch，不在 JSON 片段内写正则或 predicate",
    ]);
  });
});

// 图和正文各说各话是这么开始的:画的人为了摆得下造个简称,读的人在正文里查不到它。
// 规矩写在 docs/SVG-DESIGN.md「用语:图里不立新词」,一次命中都不许有。
describe("docs/ 手绘 SVG 的用语", () => {
  it("盒标题与泳道名用的词在正文里都有出处,禁用写法也不许藏进图里", () => {
    const hits = lintSvgTerms();
    expect(hits.length, formatLintHits(hits)).toBe(0);
  });

  it("tspan 拼进父节点,不按 tspan 切词", () => {
    // 一行里用 tspan 分色的「已<tspan>受理</tspan>」是同一个词,拆开两边都不成词,
    // 于是两个半截都在正文里查不到——按节点切会把这种图逐个判红。
    const [node] = svgTexts(`<text class="label">已<tspan class="good">受理</tspan></text>`);
    expect(node.text).toBe("已受理");
    expect(node.classes).toEqual(["label"]);
  });

  it("说明句与图标题不按词判,只有盒标题与泳道名判", () => {
    // 这两格是为这张图现写的句子,拿「正文里出现过」去量,每一句都会红。
    const nodes = svgTexts(
      [
        `<text x="32" y="48" class="title">两条决策轴</text>`,
        `<text x="32" y="88">失败之后如何取舍</text>`,
        `<text x="32" y="120" class="label mono">agent.send</text>`,
      ].join("\n"),
    );
    expect(nodes.map((n) => n.classes)).toEqual([["title"], [], ["label", "mono"]]);
    expect(nodes.map((n) => n.line)).toEqual([1, 2, 3]);
  });
});
