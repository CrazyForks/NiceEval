// 排版原语 Row / Col / Section / Text / Style:五个内置双面组件,没有特殊机制。
// web 面是普通 React 渲染;text 面用 ctx.render(child, 子宽) 显式传宽,
// Row 分栏、宽度不足降级纵向。Style 给自定义组件带样式:web 面吐 <style> 标签,
// text 面渲染为空 —— 静态导出不打包用户代码,className 引用的 CSS 靠它随树走。

import type { ReactNode } from "react";
import { defineComponent, type ReportNode } from "./tree.ts";
import { indentBlock, joinColumns, wrapDisplay } from "./text/layout.ts";

function childArray(children: ReportNode): ReportNode[] {
  if (children === null || children === undefined || typeof children === "boolean") return [];
  return Array.isArray(children) ? children : [children];
}

function cx(...parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

export interface LayoutProps {
  children?: ReportNode;
  className?: string;
}

/** 纵向依次排列:网页是块级堆叠,终端是逐块输出(块间空一行)。 */
export const Col = defineComponent<LayoutProps>({
  web({ children, className }) {
    return <div className={cx("nre", "nre-col", className)}>{children as ReactNode}</div>;
  },
  text({ children }, ctx) {
    return childArray(children)
      .map((child) => ctx.render(child))
      .filter((block) => block.length > 0)
      .join("\n\n");
  },
});
Col.displayName = "Col";

// Row 的每栏至少留这个宽度,不硬挤;不够就降级纵向
const MIN_COLUMN_WIDTH = 24;
const COLUMN_SEPARATOR = " │ ";

/** 并排:网页横向排布,终端字符分栏;终端宽度不够时自动降级为纵向。 */
export const Row = defineComponent<LayoutProps>({
  web({ children, className }) {
    return <div className={cx("nre", "nre-row", className)}>{children as ReactNode}</div>;
  },
  text({ children }, ctx) {
    const blocks = childArray(children).filter(
      (child) => child !== null && child !== undefined && typeof child !== "boolean",
    );
    if (blocks.length === 0) return "";
    if (blocks.length === 1) return ctx.render(blocks[0]);
    const columnWidth = Math.floor(
      (ctx.width - COLUMN_SEPARATOR.length * (blocks.length - 1)) / blocks.length,
    );
    if (columnWidth < MIN_COLUMN_WIDTH) {
      // 宽度不足:降级纵向,与 Col 同一形态
      return blocks
        .map((child) => ctx.render(child))
        .filter((block) => block.length > 0)
        .join("\n\n");
    }
    const rendered = blocks.map((child) => ctx.render(child, columnWidth));
    return joinColumns(rendered, rendered.map(() => columnWidth), COLUMN_SEPARATOR);
  },
});
Row.displayName = "Row";

export interface SectionProps extends LayoutProps {
  title: string;
}

/** 带标题的块:网页是标题层级,终端是标题行加缩进。 */
export const Section = defineComponent<SectionProps>({
  web({ title, children, className }) {
    return (
      <section className={cx("nre", "nre-section", className)}>
        <h2 className="nre-section-title">{title}</h2>
        {children as ReactNode}
      </section>
    );
  },
  text({ title, children }, ctx) {
    const body = childArray(children)
      .map((child) => ctx.render(child, ctx.width - 2))
      .filter((block) => block.length > 0)
      .join("\n\n");
    return body.length > 0 ? `${title}\n${indentBlock(body, "  ")}` : title;
  },
});
Section.displayName = "Section";

/** 说明文字:网页是段落,终端是折行文本。 */
export const Text = defineComponent<LayoutProps>({
  web({ children, className }) {
    return <p className={cx("nre", "nre-text", className)}>{children as ReactNode}</p>;
  },
  text({ children }, ctx) {
    return wrapDisplay(ctx.render(children), ctx.width).join("\n");
  },
});
Text.displayName = "Text";

export interface StyleProps {
  children?: string;
}

/** 自定义组件的样式随树带走:web 面吐 <style> 标签,text 面渲染为空。 */
export const Style = defineComponent<StyleProps>({
  web({ children }) {
    return <style>{children}</style>;
  },
  text() {
    return "";
  },
});
Style.displayName = "Style";
