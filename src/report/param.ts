// param():把 experiment 声明的 params 当维度或轴(docs/reports.md「params 与新摆法」)。
// 变量来自配置,不来自命名 —— 报告不解析 experiment id 字符串抠变量。

import type { ParamRef } from "./types.ts";

export function param(
  name: string,
  opts?: {
    /** 组标签 / 轴标签;函数形态把声明值折成组名(如 `(v) => \`${v} agents\``)。 */
    label?: string | ((value: string | number | boolean) => string);
    unit?: string;
  },
): ParamRef {
  if (typeof name !== "string" || name.length === 0) {
    throw new Error("param: name must be a non-empty string (the key declared in the experiment's params).");
  }
  return { kind: "param", name, label: opts?.label, unit: opts?.unit };
}
