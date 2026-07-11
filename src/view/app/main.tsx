import { createRoot } from "react-dom/client";
import type { ReportSlotHtml, ViewData } from "./types.ts";
import { App } from "./App.tsx";
import "../styles.css";

// 没有烘焙数据(比如直接打开裸产物)时的空页面兜底。
const emptyViewData: ViewData = {
  composedRuns: 0,
  snapshots: [],
};

const initialData: ViewData = window.__NICEEVAL_VIEW_DATA__ ?? emptyViewData;

// 报告槽:server 把报告树的静态 HTML 烘成 en / zh-CN 两个 <template> 静态块
// (__NICEEVAL_VIEW_DATA__ 旁)。前端按当前界面语言把对应块摆进报告槽位置,
// 切语言即换块;不解析、不 hydrate。
const reportHtml: ReportSlotHtml = {
  en: document.getElementById("niceeval-report-en")?.innerHTML ?? "",
  "zh-CN": document.getElementById("niceeval-report-zh-CN")?.innerHTML ?? "",
};

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Missing #root element");
createRoot(rootEl).render(<App data={initialData} reportHtml={reportHtml} />);
