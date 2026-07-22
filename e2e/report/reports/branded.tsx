// 代表性自定义报告 1/2 —— extends: standard 叠外壳(docs/engineering/testing/e2e/report.md §5
// "自定义报告的用户操作回归")。pages 完全沿用内建 standard(report / attempts / traces / 隐藏的
// attempt 详情页),本文件只声明外壳字段:标题、footer,以及一条带内联 SVG 图标的外链——顺手覆盖
// verify-render-structure.ts 头注 COVERAGE GAP #4(`ReportLink.icon` 从未在既有证据里出现过,
// 因为标准报告的 niceeval.config.ts 没有声明任何 `--report` 外链)。
import { defineReport } from "niceeval/report";
import { standard } from "niceeval/report/built-in";

// 一个极简、确定性的 GitHub 字标 —— 内容是作者义务,宿主只按白名单校验结构,这里用最小可辨认的
// SVG 路径,不追求视觉精确。
const GITHUB_ICON_SVG =
  '<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">' +
  '<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49' +
  "-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82" +
  ".72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15" +
  "-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2" +
  "-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73" +
  ".54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" +
  '"/></svg>';

export default defineReport({
  extends: standard,
  title: { en: "Results E2E · Branded", "zh-CN": "Results E2E · 品牌版" },
  links: [
    {
      label: { en: "GitHub", "zh-CN": "GitHub" },
      href: "https://github.com/niceeval/niceeval",
      icon: { svg: GITHUB_ICON_SVG },
    },
  ],
  footer: {
    en: "Rendered from the report E2E fixture — extends: standard.",
    "zh-CN": "由 report E2E 固定证据渲染 —— extends: standard。",
  },
});
