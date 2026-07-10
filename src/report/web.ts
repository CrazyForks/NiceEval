// web 宿主(view --report)的装载入口:同一棵树走 web 面,renderToStaticMarkup 吐静态
// HTML 烘进查看器的报告槽。只有这一侧真正 import react-dom(import 边界即运行时边界),
// 所以本文件不从 niceeval/report 的入口 re-export —— 宿主与测试按源路径 import。

import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { AttemptRef } from "../results/index.ts";
import { runWithWebContext, validateReportTree, type WebContext } from "./tree.ts";
import { prepareDefaultReportData, runWithDefaultReportData } from "./default-report.tsx";
import type { ReportContext, ReportDefinition } from "./report.ts";

export interface StaticHtmlOptions {
  /** 证据室深链;缺省用 view 的 attempt 路由 `#/attempt/<run>/<result>`。 */
  attemptHref?: (ref: AttemptRef) => string;
}

/** build → 渲染前树校验(与 text 宿主同一遍)→ 备好官方水位 → 静态渲染 web 面。 */
export async function renderReportToStaticHtml(
  definition: ReportDefinition,
  ctx: ReportContext,
  options?: StaticHtmlOptions,
): Promise<string> {
  const node = await definition.build(ctx);
  validateReportTree(node);
  const defaultData = await prepareDefaultReportData(ctx.selection);
  const webCtx: WebContext = {
    attemptHref: options?.attemptHref ?? ((ref) => `#/attempt/${ref.run}/${ref.result}`),
  };
  return runWithDefaultReportData(defaultData, () =>
    runWithWebContext(webCtx, () => renderToStaticMarkup(node as ReactNode)),
  );
}
