// web 宿主(view --report)的装载入口:同一棵树走 web 面,renderToStaticMarkup 吐静态
// HTML 烘进查看器的报告槽。只有这一侧真正 import react-dom(import 边界即运行时边界),
// 所以本文件不从 niceeval/report 的入口 re-export —— 宿主与测试按源路径 import。

import * as React from "react";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { AttemptLocator } from "../results/locator.ts";
import type { SelectionWarning } from "../results/types.ts";
import { resolveReportTree, runWithWebContext, validateReportTree, type WebContext } from "./tree.ts";
import { DEFAULT_REPORT_LOCALE, type ReportLocale } from "./locale.ts";
import type { ReportContext, ReportDefinition } from "./report.ts";

export interface StaticHtmlOptions {
  /** 证据室深链;缺省用 view 的 attempt 路由 `#/attempt/@<locator>`(单段、不透明)。 */
  attemptHref?: (locator: AttemptLocator) => string;
  /** 官方组件 chrome 文案的 locale;默认 "en"。 */
  locale?: ReportLocale;
}

/**
 * 挑选警告的 HTML 形态:宿主级前置块,与 RunOverview 里的警告用同一套结构和类名
 * (`.nre nre-report-warnings` 外壳内一个 `ul.nre-warnings` + `li.nre-warning[data-kind]`,
 * 复用 styles.css 已有的 `.nre .nre-warnings` 样式)。经 renderToStaticMarkup 走 React,
 * message 文本自动转义,不裸拼 HTML。裸跑 / --report 都在报告顶上如实报残缺,不静默。
 */
function renderSelectionWarningsHtml(warnings: SelectionWarning[]): string {
  return renderToStaticMarkup(
    React.createElement(
      "div",
      { className: "nre nre-report-warnings" },
      React.createElement(
        "ul",
        { className: "nre-warnings" },
        warnings.map((w, i) =>
          React.createElement("li", { key: i, className: "nre-warning", "data-kind": w.kind }, w.message),
        ),
      ),
    ),
  );
}

/**
 * build → 渲染前解析数据组件(唯一的 await 边界)→ 树校验(与 text 宿主同一遍)→ 静态渲染
 * web 面;Selection 有挑选警告时在报告顶部前置一块警告 HTML；报告树里的 RunOverview
 * 已经渲染同一条时不重复。
 */
export async function renderReportToStaticHtml(
  definition: ReportDefinition,
  ctx: ReportContext,
  options?: StaticHtmlOptions,
): Promise<string> {
  const node = await definition.build(ctx);
  const resolved = await resolveReportTree(node);
  validateReportTree(resolved);
  const webCtx: WebContext = {
    attemptHref: options?.attemptHref ?? ((locator) => `#/attempt/${locator}`),
    locale: options?.locale ?? DEFAULT_REPORT_LOCALE,
  };
  const body = runWithWebContext(webCtx, () => renderToStaticMarkup(resolved as ReactNode));
  const missingWarnings = ctx.selection.warnings.filter((warning) => {
    const escapedMessage = renderToStaticMarkup(React.createElement(React.Fragment, null, warning.message));
    return !body.includes(escapedMessage);
  });
  const warnings = missingWarnings.length > 0 ? renderSelectionWarningsHtml(missingWarnings) : "";
  return warnings + body;
}
