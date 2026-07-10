// 报告的元素树与双面组件基座(docs/reports.md「元素树与两个宿主」「双面组件」)。
//
// 报告函数返回的树不是「React 树」,只是 { type, props } 节点 —— 标准 react
// jsx-runtime 产的元素恰好就是这个形状。本文件是基础实现:零 react 运行时依赖
// (只有类型层的 `import type`,编译后擦除);text 宿主遍历渲染不需要 react-dom,
// web 宿主(web.ts)才真正 import react。渲染面是纯同步函数:零 IO、零 await ——
// 计算全部发生在报告函数体里,可达百 MB 的工件永远不进渲染路径。

import type { ReactNode } from "react";
import type { AttemptRef } from "../results/index.ts";

// ───────────────────────── 节点形状 ─────────────────────────

/** 标准 jsx-runtime 元素形状;text 宿主只认 type / props,不管 $$typeof。 */
export interface ReportElement {
  type: unknown;
  props: Record<string, unknown>;
  key?: unknown;
}

/** 报告树节点:元素、文本、数组 / Fragment 的儿子们,或渲染为空的空值。 */
export type ReportNode = ReportElement | string | number | boolean | null | undefined | ReportNode[];

// react/jsx-runtime 的 Fragment 是注册符号,跨 react 版本稳定;不 import react 也认得它
const REACT_FRAGMENT = Symbol.for("react.fragment");

function isReportElement(node: unknown): node is ReportElement {
  return (
    typeof node === "object" &&
    node !== null &&
    !Array.isArray(node) &&
    "type" in node &&
    "props" in node &&
    typeof (node as ReportElement).props === "object"
  );
}

// ───────────────────────── 双面组件 ─────────────────────────

/** 挂 faces 的私有键:text 宿主与树校验靠它识别双面组件。 */
export const COMPONENT_FACES: unique symbol = Symbol.for("niceeval.report.faces");

export interface TextContext {
  /** 可用列宽;Row 分栏后变窄。 */
  width: number;
  /** 容器组件渲染 children 用,宽度显式传递。 */
  render(node: ReportNode, width?: number): string;
  /** 下钻命令,通证据室。 */
  attemptCommand(ref: AttemptRef): string;
}

export interface WebContext {
  /** 证据室深链,同 view 的 attempt 路由。 */
  attemptHref(ref: AttemptRef): string;
}

export interface ComponentFaces<P> {
  /** 真 React JSX 在这个面里;返回静态可渲染的 ReactNode。 */
  web(props: P, ctx: WebContext): ReactNode;
  text(props: P, ctx: TextContext): string;
}

/**
 * 双面组件的产物:可直接用于 JSX(React 把它当函数组件调用,走 web 面),
 * text 宿主经 COMPONENT_FACES 调 text 面。
 */
export type ReportComponent<P> = ((props: P) => ReactNode) & {
  [COMPONENT_FACES]: ComponentFaces<P>;
  displayName?: string;
};

// web 面的环境上下文:web 宿主渲染前设好;宿主之外(组件直接嵌进用户 React 应用)
// 用默认值 —— attemptHref 默认 view 的 attempt 路由格式(自定义组件显式调 ctx.attemptHref
// 时总有去处);官方组件的「宿主里自动接证据室」只在宿主上下文激活时发生,
// 宿主外不传 attemptHref 就是纯展示,不发明断链。
const DEFAULT_WEB_CONTEXT: WebContext = {
  attemptHref: (ref) => `#/attempt/${ref.run}/${ref.result}`,
};
let activeWebContext: WebContext | null = null;

/** web 宿主用:在给定 WebContext 下同步渲染(React 静态渲染本身是同步的)。 */
export function runWithWebContext<T>(ctx: WebContext, fn: () => T): T {
  const prev = activeWebContext;
  activeWebContext = ctx;
  try {
    return fn();
  } finally {
    activeWebContext = prev;
  }
}

/** 官方组件的装配用:宿主上下文激活时才把 ctx.attemptHref 当默认下钻。 */
export function isHostWebContextActive(): boolean {
  return activeWebContext !== null;
}

/**
 * 定义一个双面组件:faces 两键必填 —— 少实现一个面编译不过,配对是结构义务。
 * 基础实现不 import react;产物以可调用组件的形状兼容 React 渲染。
 */
export function defineComponent<P>(faces: ComponentFaces<P>): ReportComponent<P> {
  if (typeof faces?.web !== "function" || typeof faces?.text !== "function") {
    throw new Error(
      "defineComponent requires both faces: { web(props, ctx), text(props, ctx) }. " +
        "Every report component must render in both hosts (niceeval view and niceeval show).",
    );
  }
  const component = ((props: P) => faces.web(props, activeWebContext ?? DEFAULT_WEB_CONTEXT)) as ReportComponent<P>;
  component[COMPONENT_FACES] = faces;
  return component;
}

export function facesOf(type: unknown): ComponentFaces<unknown> | undefined {
  if (typeof type !== "function") return undefined;
  return (type as Partial<ReportComponent<unknown>>)[COMPONENT_FACES] as ComponentFaces<unknown> | undefined;
}

// ───────────────────────── 树校验 ─────────────────────────

function componentLabel(type: unknown): string {
  if (typeof type === "string") return `<${type}>`;
  if (typeof type === "function") {
    const name = (type as { displayName?: string; name?: string }).displayName || (type as { name?: string }).name;
    return name ? `<${name}>` : "<anonymous component>";
  }
  if (type === REACT_FRAGMENT) return "<>";
  return `<${String(type)}>`;
}

/**
 * 渲染前树校验:页面树里只放双面组件、排版原语与普通组合函数,字符串 intrinsic
 * (<div>)报错、指名组件路径。这是运行时校验而非编译期(标准 JSX 下 TS 把一切
 * JSX 表达式统一成 JSX.Element);两个宿主渲染前跑同一遍 —— 不做单侧宽容,否则
 * 对着 view 写的页面到 show 才炸。校验只下钻 children(children 就是报告树);
 * 普通函数组件调用展开(渲染面纯同步,重复调用无副作用)。
 */
export function validateReportTree(node: ReportNode, path: string[] = []): void {
  if (node === null || node === undefined || typeof node === "boolean") return;
  if (typeof node === "string" || typeof node === "number") return;
  if (Array.isArray(node)) {
    for (const child of node) validateReportTree(child, path);
    return;
  }
  if (!isReportElement(node)) return;
  const { type, props } = node;
  if (typeof type === "string") {
    const where = path.length > 0 ? ` (in ${path.join(" > ")})` : "";
    throw new Error(
      `Raw HTML <${type}> has no terminal face; use <Text>, layout primitives, or a defineComponent component.${where}`,
    );
  }
  if (type === REACT_FRAGMENT) {
    validateReportTree(props.children as ReportNode, path);
    return;
  }
  const label = componentLabel(type);
  if (facesOf(type)) {
    // 双面组件是校验的信任边界之内的叶子,但 children 仍是报告树的一部分
    validateReportTree(props.children as ReportNode, [...path, label]);
    return;
  }
  if (typeof type === "function") {
    // 普通函数组件 = 用户拿函数组合页面片段:调用展开继续校验
    const expanded = (type as (p: unknown) => ReportNode)(props);
    validateReportTree(expanded, [...path, label]);
    return;
  }
  const where = path.length > 0 ? ` (in ${path.join(" > ")})` : "";
  throw new Error(`Unsupported node type ${label} in report tree.${where}`);
}

// ───────────────────────── text 渲染 ─────────────────────────

export interface TextRenderOptions {
  /** 终端可用列宽;默认 80。 */
  width?: number;
  /** 下钻命令的生成;宿主注入,默认指向 view 的 attempt 路由。 */
  attemptCommand?: (ref: AttemptRef) => string;
}

export function createTextContext(options?: TextRenderOptions): TextContext {
  const width = Math.max(20, options?.width ?? 80);
  const attemptCommand =
    options?.attemptCommand ?? ((ref: AttemptRef) => `niceeval view "#/attempt/${ref.run}/${ref.result}"`);
  const make = (w: number): TextContext => ({
    width: w,
    attemptCommand,
    render(node, childWidth) {
      return renderNodeToText(node, childWidth === undefined ? this : make(Math.max(10, childWidth)));
    },
  });
  return make(width);
}

/** text 宿主的遍历渲染:双面组件走 text 面,普通函数调用展开,块之间以换行相接。 */
export function renderNodeToText(node: ReportNode, ctx: TextContext): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) {
    return node
      .map((child) => renderNodeToText(child, ctx))
      .filter((text) => text.length > 0)
      .join("\n");
  }
  if (!isReportElement(node)) return "";
  const { type, props } = node;
  if (typeof type === "string") {
    // 校验先行会拦住;这里兜底同一条错误,渲染路径自身也不宽容
    throw new Error(
      `Raw HTML <${type}> has no terminal face; use <Text>, layout primitives, or a defineComponent component.`,
    );
  }
  if (type === REACT_FRAGMENT) return renderNodeToText(props.children as ReportNode, ctx);
  const faces = facesOf(type);
  if (faces) return faces.text(props, ctx);
  if (typeof type === "function") {
    return renderNodeToText((type as (p: unknown) => ReportNode)(props), ctx);
  }
  return "";
}
