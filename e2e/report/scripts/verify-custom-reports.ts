// 自定义报告的用户操作回归 domain(docs/engineering/testing/e2e/report.md §5 第五个 bullet
// "自定义报告的用户操作回归";plan/testing-layer-realignment.md B5)。渲染验收不止对内建
// `standard` 报告做——本模块对仓库签入的两份代表性 `--report` 文件各走一遍同样的读面 + 渲染面
// 验收:页导航与 `--page` 索引、折叠展开、过滤框、locator 深链与下钻命令在真实浏览器里逐项操作
// 可达。用户改一份报告文件就能踩到的路径,回归也要踩到。
//
// 消费 scripts/evidence.ts 产出的 Evidence 对象,自己从不运行任何 Experiment——`show --report`
// 与 `view --report --out` 都是纯读命令,只是换一份报告定义重新渲染 evidence.resultsRoot 里已有
// 的真实结果,不写 `.niceeval`、不产生新 attempt。但本模块确实现场调用 `niceeval show`/`view`
// 去核对 evidence.main/deliberateFail/deliberateError 的原始 locator(不只读
// evidence.siteExportDir 里已经导出好的静态文件——这两份自定义报告有自己独立的 `--out` 导出,
// 与 evidence.siteExportDir 无关),按 scripts/e2e.ts 头注的顺序规则,必须排在 verifyReadback
// 之前(见 memory/verify-readback-mutation-orders-later-e2e-report-domains.md)。
//
// 两份代表性报告文件(e2e/report/reports/):
//   - branded.tsx —— `extends: standard` 叠外壳:pages 完全沿用内建 standard,只加标题、
//     footer 与一条带内联 SVG 图标的外链。顺手覆盖 verify-render-structure.ts 头注
//     COVERAGE GAP #4(`ReportLink.icon` 在既有证据里从未出现过)。
//   - site.tsx —— 自定义多页(pages 字面量,不 extends 任何内建报告)+ 自定义组件与
//     attempt page:overview 页用嵌套 Section 包一个现算 Grid/Stat 的组合组件与 MetricMatrix,
//     scoreboard 页用 Scoreboard 与带过滤框的 MetricTable,attempts 页用带过滤框的
//     AttemptList,外加一张不进导航的自定义 attempt-input page(组合已有叶子组件,不照抄
//     AttemptDetail)。顺手覆盖 verify-render-structure.ts 头注 COVERAGE GAP #2/#3
//     (Section 嵌套、Grid 列数规划、MetricTable/MetricMatrix/Scoreboard 在内建 standard 报告
//     里从未渲染过)。
//
// 覆盖缺口——如实列出,不假装覆盖了:
//   1. MetricScatter 相关的标记分配顺序/connect 位移摘要不在本模块覆盖范围——两份自定义报告都
//      没有用 MetricScatter(本仓库证据里可绘制的点数不够,B3 COVERAGE GAP #1 已经记过同一个
//      根因),不重复声明。
//   2. AttemptSource 视觉规范里的黄色(soft-fail/unavailable)状态染色同样没有证据可测——与 B4
//      COVERAGE GAP #1 同一根因(本仓库 3 个 Eval 从不产生 soft/unavailable 断言),不是本模块
//      能在现有证据内解决的。
//   3. `Table` 排版原语(带 `locator` 字段的自定义表格行、text 面的证据列)本模块没有用到——
//      两份报告都用官方指标/实体组件表达对比与列表,没有手写 `<Table rows={...} />`;
//      Section/Grid/MetricTable/MetricMatrix/Scoreboard/自定义组件/attempt page 已经是用户
//      任务书点名的覆盖对象,`Table` 原语留给未来需要它的报告域覆盖。

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import { sh } from "./sh.ts";
import type { Evidence } from "./evidence.ts";

const BRANDED_REPORT = "reports/branded.tsx";
const SITE_REPORT = "reports/site.tsx";

/** 与 sh() 同底层逻辑,但不断言退出码——用于预期会以特定用法错误失败的调用。 */
function shRaw(cmd: string): { stdout: string; stderr: string; combined: string; status: number } {
  const res = spawnSync(cmd, { shell: true, encoding: "utf8" });
  const stdout = res.stdout ?? "";
  const stderr = res.stderr ?? "";
  return { stdout, stderr, combined: `${stdout}\n${stderr}`, status: res.status ?? -1 };
}

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

/** 极简静态文件 server(与 verify-render-visual.ts 同一个零依赖技术路子):index.html 的
 * locator 深链要现场 fetch 对应的 attempt 文档,file:// 协议下会被同源策略挡掉。 */
async function serveStaticDir(rootDir: string): Promise<{ baseUrl: string; close: () => Promise<void> }> {
  const server = createServer((req, res) => {
    void (async () => {
      try {
        const url = new URL(req.url ?? "/", "http://localhost");
        const pathname = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
        const filePath = join(rootDir, pathname);
        if (!filePath.startsWith(rootDir)) {
          res.writeHead(403);
          res.end();
          return;
        }
        const data = await readFile(filePath);
        res.writeHead(200, { "content-type": MIME_TYPES[extname(filePath)] ?? "application/octet-stream" });
        res.end(data);
      } catch {
        res.writeHead(404);
        res.end("not found");
      }
    })();
  });
  await new Promise<void>((resolvePromise) => server.listen(0, "127.0.0.1", resolvePromise));
  const address = server.address() as { port: number };
  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () => new Promise<void>((resolvePromise, reject) => server.close((err) => (err ? reject(err) : resolvePromise()))),
  };
}

// ---------------------------------------------------------------------------
// branded.tsx —— extends: standard 叠外壳
// ---------------------------------------------------------------------------

/** 读面:页导航与 --page 索引、attempt 下钻、未知 page id 报错——都经同一条 extends: standard
 * 报告定义,和内建报告的读面行为逐条对应。 */
async function verifyBrandedReportReadback(evidence: Evidence): Promise<void> {
  const root = evidence.resultsRoot;

  // 裸渲染:extends 继承内建 standard 的完整 pages(report/attempts/traces + 隐藏的详情页),
  // 尾部页索引列 attempts/traces,不把当前渲染的 report 自己列进去。
  const bare = sh(`pnpm exec niceeval show --report ${BRANDED_REPORT} --results ${root}`);
  assert.ok(bare.includes("Other pages:"), `裸渲染 ${BRANDED_REPORT} 应附页索引; got:\n${bare}`);
  assert.ok(
    bare.includes(`niceeval show --results ${root} --report ${BRANDED_REPORT} --page attempts`),
    `页索引命令应带完整 --results/--report 上下文; got:\n${bare}`,
  );
  assert.ok(
    bare.includes(`niceeval show --results ${root} --report ${BRANDED_REPORT} --page traces`),
    `页索引应列出 traces; got:\n${bare}`,
  );
  assert.ok(!/--page report\b/.test(bare), "页索引不应把当前渲染的 report 页自己列进去");

  // --page attempts:索引改列 report/traces,不重复列 attempts 自己。
  const attemptsPage = sh(`pnpm exec niceeval show --report ${BRANDED_REPORT} --results ${root} --page attempts`);
  assert.ok(
    attemptsPage.includes(`niceeval show --results ${root} --report ${BRANDED_REPORT} --page report`),
    `attempts 页索引应能跳回 report; got:\n${attemptsPage}`,
  );
  assert.ok(
    attemptsPage.includes(`niceeval show --results ${root} --report ${BRANDED_REPORT} --page traces`),
    `attempts 页索引应列出 traces; got:\n${attemptsPage}`,
  );

  // attempt 下钻:extends 继承的 standardAttemptPage 在真实失败 attempt 上工作。
  const drill = sh(`pnpm exec niceeval show ${evidence.deliberateFail.attempt.locator} --report ${BRANDED_REPORT} --results ${root}`);
  assert.ok(
    drill.includes("expected: 3") && drill.includes("received: 2"),
    `继承的 standardAttemptPage 应渲染真实失败细节; got:\n${drill}`,
  );

  // 未知 page id:报用法错误并列出可用页,不静默回退。
  const bad = shRaw(`pnpm exec niceeval show --report ${BRANDED_REPORT} --results ${root} --page bogus`);
  assert.notEqual(bad.status, 0, "--page bogus 应是用法错误");
  assert.ok(
    bad.combined.includes("Available pages: report, attempts, traces"),
    `错误应列出继承自 standard 的可用页; got:\n${bad.combined}`,
  );
}

/** 渲染面:真实浏览器打开 branded.tsx 的独立静态导出,验证外壳字段(title/footer/带图标的
 * 外链)与继承自 standard 的页导航、locator 深链都在真实 DOM 里成立。 */
async function verifyBrandedReportRender(evidence: Evidence): Promise<void> {
  const root = evidence.resultsRoot;
  const outDir = mkdtempSync(join(tmpdir(), "niceeval-custom-reports-branded-"));
  try {
    sh(`pnpm exec niceeval view --report ${BRANDED_REPORT} --results ${root} --out ${outDir} --no-open`);
    const { baseUrl, close } = await serveStaticDir(resolve(outDir));
    const browser = await chromium.launch();
    try {
      const page = await browser.newPage();
      try {
        await page.goto(`${baseUrl}/index.html`, { waitUntil: "networkidle" });

        // title 回退链:外壳声明的 title 落到浏览器标题(shell.md「title 的落点」)。
        assert.equal(await page.title(), "Results E2E · Branded", "浏览器标题应取外壳声明的 title");

        const topbar = page.locator("header.topbar");
        await topbar.waitFor({ state: "visible", timeout: 10_000 });
        const tabTitles = await topbar.getByRole("tab").allTextContents();
        assert.deepEqual(
          tabTitles,
          ["Report", "Attempts", "Traces"],
          "extends: standard 应原样沿用内建三张导航页,顺序不变",
        );

        // ReportLink.icon:内联 SVG 渲染在 label 前(shell.md「行为约束」)。
        const link = page.locator(".shell-links a").first();
        assert.equal(await page.locator(".shell-links a").count(), 1, "外壳应恰好渲染一条自定义外链");
        const linkHtml = await link.innerHTML();
        assert.ok(linkHtml.includes("<svg"), "带 icon 的 ReportLink 应内联渲染 SVG");
        const iconIdx = linkHtml.indexOf("shell-link-icon");
        const labelIdx = linkHtml.indexOf("GitHub");
        assert.ok(
          iconIdx !== -1 && labelIdx !== -1 && iconIdx < labelIdx,
          `icon 应出现在 label 文本前; got innerHTML:\n${linkHtml}`,
        );
        assert.equal(await link.getAttribute("href"), "https://github.com/niceeval/niceeval");

        // footer:外壳 footer 文案渲染在页面底部。
        const footerText = await page.locator(".site-footer .site-footer-text").textContent();
        assert.match(footerText ?? "", /extends: standard/, `footer 应渲染声明的文案; got: "${footerText}"`);

        // 页导航可达:点击 Attempts tab 后继承自 standard 的 AttemptList 内容可见。
        await page.getByRole("tab", { name: "Attempts" }).click();
        const attemptsPanel = page.locator("#tab-page-attempts");
        await attemptsPanel.locator(".nre-attempt").first().waitFor({ state: "visible", timeout: 10_000 });
        assert.equal(await attemptsPanel.locator(".nre-attempt").count(), 4, "Attempts 页应列出全部 4 个 attempt");

        // locator 深链:点击失败 attempt 打开 dialog,内容来自继承的 standardAttemptPage。
        const failHref = `attempt/${encodeURIComponent(evidence.deliberateFail.attempt.locator)}.html`;
        const failLink = attemptsPanel.locator(`a.nre-locator[href="${failHref}"]`);
        assert.equal(await failLink.count(), 1, `应能找到指向 ${failHref} 的 locator 链接`);
        await failLink.click();
        const dialog = page.getByRole("dialog");
        await dialog.waitFor({ state: "visible", timeout: 10_000 });
        const dialogText = await dialog.innerText();
        assert.ok(
          dialogText.includes("expected: 3") && dialogText.includes("received: 2"),
          "extends: standard 的深链应打开内建 attempt 详情内容",
        );
      } finally {
        await page.close();
      }
    } finally {
      await browser.close();
      await close();
    }
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------------
// site.tsx —— 自定义多页 + 自定义组件与 attempt page
// ---------------------------------------------------------------------------

/** 读面:三张导航页各自的内容、Grid/Stat/嵌套 Section/MetricMatrix 的下钻命令、自定义 review
 * attempt page,以及未知 page id 报错只列 3 张可导航页(不含 navigation:false 的 review)。 */
async function verifySiteReportReadback(evidence: Evidence): Promise<void> {
  const root = evidence.resultsRoot;

  // overview:现算的 Grid/Stat 摘要 + 嵌套 Section 包 MetricMatrix,矩阵稀疏时应附下钻命令。
  const overview = sh(`pnpm exec niceeval show --report ${SITE_REPORT} --results ${root}`);
  assert.ok(overview.includes("Other pages:"), `overview 应附页索引; got:\n${overview}`);
  assert.ok(
    overview.includes(`niceeval show --results ${root} --report ${SITE_REPORT} --page scoreboard`),
    `页索引应列出 scoreboard; got:\n${overview}`,
  );
  assert.ok(
    overview.includes(`niceeval show --results ${root} --report ${SITE_REPORT} --page attempts`),
    `页索引应列出 attempts; got:\n${overview}`,
  );
  assert.ok(overview.includes("Run overview"), "现算的 Grid/Stat 摘要应带 Section 标题");
  assert.ok(overview.includes("Eval × agent"), "嵌套 Section 的标题应可见(text 面降级成横隔条)");
  for (const label of ["Experiments", "Evals", "Attempts", "Pass rate"]) {
    assert.ok(overview.includes(label), `Grid 应包含 Stat 标签 "${label}"; got:\n${overview}`);
  }
  assert.ok(
    overview.includes("next: niceeval show deliberate-error"),
    `MetricMatrix 在稀疏矩阵上应输出下钻命令(rowKeys 字典序首个缺格行); got:\n${overview}`,
  );

  // scoreboard:Scoreboard(固定题集)+ 带过滤框的 MetricTable。
  const scoreboard = sh(`pnpm exec niceeval show --report ${SITE_REPORT} --results ${root} --page scoreboard`);
  assert.ok(scoreboard.includes("Exam"), "Scoreboard 应有 Section 标题 Exam");
  assert.ok(scoreboard.includes("/100"), "Scoreboard 应按声明的 fullMarks=100 显示总分");
  assert.ok(scoreboard.includes("Comparison"), "MetricTable 应有 Section 标题 Comparison");
  for (const experimentId of ["main", "deliberate-error", "deliberate-fail"]) {
    assert.ok(scoreboard.includes(experimentId), `Comparison 表应包含 experiment "${experimentId}"; got:\n${scoreboard}`);
  }
  assert.ok(
    scoreboard.includes(`niceeval show --results ${root} --report ${SITE_REPORT} --page overview`),
    `scoreboard 页索引应能跳回 overview; got:\n${scoreboard}`,
  );
  assert.ok(
    scoreboard.includes(`niceeval show --results ${root} --report ${SITE_REPORT} --page attempts`),
    `scoreboard 页索引应列出 attempts; got:\n${scoreboard}`,
  );

  // attempts:带过滤框的 AttemptList,全部 4 个真实 attempt 的 locator 都应出现。
  const attemptsPage = sh(`pnpm exec niceeval show --report ${SITE_REPORT} --results ${root} --page attempts`);
  for (const attempt of [...evidence.main.attempts, evidence.deliberateFail.attempt, evidence.deliberateError.attempt]) {
    assert.ok(attemptsPage.includes(attempt.locator), `attempts 页应包含 locator ${attempt.locator}; got:\n${attemptsPage}`);
  }
  assert.ok(
    attemptsPage.includes(`niceeval show --results ${root} --report ${SITE_REPORT} --page overview`),
    `attempts 页索引应能跳回 overview; got:\n${attemptsPage}`,
  );

  // 自定义 attempt-input page(review):组合 AttemptSummary/AttemptAssessment/AttemptFixPrompt/
  // AttemptDiagnostics,不是照抄 AttemptDetail,但仍应呈现真实失败细节。
  const review = sh(`pnpm exec niceeval show ${evidence.deliberateFail.attempt.locator} --report ${SITE_REPORT} --results ${root}`);
  assert.ok(
    review.includes("expected: 3") && review.includes("received: 2"),
    `自定义 review page 应通过 AttemptAssessment→AttemptSource 呈现失败细节; got:\n${review}`,
  );

  // 未知 page id:只列 3 张可导航页,不含 navigation:false 的 review。
  const bad = shRaw(`pnpm exec niceeval show --report ${SITE_REPORT} --results ${root} --page bogus`);
  assert.notEqual(bad.status, 0, "--page bogus 应是用法错误");
  assert.ok(
    bad.combined.includes("Available pages: overview, scoreboard, attempts"),
    `错误应只列 3 张可导航页,不含 review; got:\n${bad.combined}`,
  );
}

/** 渲染面:真实浏览器打开 site.tsx 的独立静态导出,验证 3 张导航页可点击可达、Grid/Stat 现算
 * 数值、MetricMatrix/Scoreboard/MetricTable 结构、两种过滤框输入后收窄、以及 locator 深链打开
 * 自定义 review page 后 <details> 折叠展开可操作。 */
async function verifySiteReportRender(evidence: Evidence): Promise<void> {
  const root = evidence.resultsRoot;
  const outDir = mkdtempSync(join(tmpdir(), "niceeval-custom-reports-site-"));
  try {
    sh(`pnpm exec niceeval view --report ${SITE_REPORT} --results ${root} --page overview --out ${outDir} --no-open`);
    const { baseUrl, close } = await serveStaticDir(resolve(outDir));
    const browser = await chromium.launch();
    try {
      const page = await browser.newPage();
      try {
        await page.goto(`${baseUrl}/index.html`, { waitUntil: "networkidle" });

        const topbar = page.locator("header.topbar");
        await topbar.waitFor({ state: "visible", timeout: 10_000 });
        const tabTitles = await topbar.getByRole("tab").allTextContents();
        assert.deepEqual(
          tabTitles,
          ["Overview", "Scoreboard", "Attempts"],
          "自定义多页应恰好列出 navigation !== false 的 3 张页、按声明顺序,不含自定义 attempt-input page",
        );

        // --page overview 生效:overview 面板默认可见,现算的 Grid/Stat 数值可读。
        const overview = page.locator("#tab-page-overview");
        const stats = overview.locator(".nre-stat");
        await stats.first().waitFor({ state: "visible", timeout: 10_000 });
        assert.equal(await stats.count(), 4, "Grid 应恰好渲染 4 个 Stat 格");
        const statValues: Record<string, string> = {};
        for (let i = 0; i < (await stats.count()); i++) {
          const label = (await stats.nth(i).locator(".nre-stat-label").textContent())?.trim() ?? "";
          const value = (await stats.nth(i).locator(".nre-stat-value").textContent())?.trim() ?? "";
          statValues[label] = value;
        }
        assert.equal(statValues["Experiments"], "3", `现算的 Experiments 计数应为 3; got: ${JSON.stringify(statValues)}`);
        assert.equal(statValues["Evals"], "3", `现算的 Evals 计数应为 3; got: ${JSON.stringify(statValues)}`);
        assert.equal(statValues["Attempts"], "4", `现算的 Attempts 计数应为 4(main runs:2 + 2 单次); got: ${JSON.stringify(statValues)}`);
        assert.equal(statValues["Pass rate"], "33.3%", `现算的通过率应为 1/3; got: ${JSON.stringify(statValues)}`);

        // 嵌套 Section 与 MetricMatrix:web 面每层仍是独立 <section>,标题都可见——覆盖 B3
        // COVERAGE GAP #2/#3(内建 standard 报告从未渲染过 Section 嵌套或 MetricMatrix)。
        assert.equal(
          await overview.locator(".nre-section-title", { hasText: "Run overview" }).count(),
          1,
          "外层 Section 标题应可见",
        );
        assert.equal(
          await overview.locator(".nre-section-title", { hasText: "Eval × agent" }).count(),
          1,
          "嵌套 Section 标题应可见(web 面不做文本降级)",
        );
        assert.equal(await overview.locator(".nre-metric-matrix").count(), 1, "MetricMatrix 应渲染为 <table class=nre-metric-matrix>");

        // 页导航:点击 Scoreboard tab,Scoreboard 表 + 带过滤框的 MetricTable 都可达。
        await page.getByRole("tab", { name: "Scoreboard" }).click();
        const scoreboardPanel = page.locator("#tab-page-scoreboard");
        await scoreboardPanel.locator(".nre-scoreboard-table").waitFor({ state: "visible", timeout: 10_000 });
        assert.equal(await scoreboardPanel.locator(".nre-scoreboard-table tbody tr").count(), 3, "Scoreboard 应有 3 个 experiment 行");

        const metricFilter = scoreboardPanel.locator("input[data-nre-filter]");
        assert.equal(await metricFilter.count(), 1, "MetricTable filter 应渲染过滤输入框——覆盖 B3 COVERAGE GAP #2/#3");
        const metricRowsBefore = await scoreboardPanel.locator(".nre-metric-table tbody tr:not(.nre-row-hidden)").count();
        assert.equal(metricRowsBefore, 3, "过滤前 MetricTable 应显示全部 3 行");
        await metricFilter.fill("main");
        await page.waitForTimeout(100);
        const metricRowsAfter = await scoreboardPanel.locator(".nre-metric-table tbody tr:not(.nre-row-hidden)").count();
        assert.equal(metricRowsAfter, 1, "MetricTable 过滤框输入后应只剩匹配行");

        // 页导航:点击 Attempts tab,AttemptList 过滤框输入后收窄,再点击 locator 深链。
        await page.getByRole("tab", { name: "Attempts" }).click();
        const attemptsPanel = page.locator("#tab-page-attempts");
        await attemptsPanel.locator(".nre-attempt").first().waitFor({ state: "visible", timeout: 10_000 });
        assert.equal(await attemptsPanel.locator(".nre-attempt").count(), 4, "Attempts 页应列出全部 4 个 attempt");

        const attemptFilter = attemptsPanel.locator("input[data-nre-attempt-filter]");
        assert.equal(await attemptFilter.count(), 1, "AttemptList filter 应渲染过滤输入框");
        await attemptFilter.fill("deliberate-fail");
        await page.waitForTimeout(100);
        assert.equal(
          await attemptsPanel.locator(".nre-attempt:not(.nre-row-hidden)").count(),
          1,
          "AttemptList 过滤框输入 eval id 后应只剩匹配行",
        );
        assert.equal(await attemptsPanel.locator(".nre-attempt.nre-row-hidden").count(), 3, "不匹配的 3 行应被标记为隐藏");

        // locator 深链:过滤后仍能点击唯一可见的失败 attempt,打开自定义 review page 的 dialog。
        const failHref = `attempt/${encodeURIComponent(evidence.deliberateFail.attempt.locator)}.html`;
        const failLink = attemptsPanel.locator(`a.nre-locator[href="${failHref}"]`);
        assert.equal(await failLink.count(), 1, `过滤后应仍能定位到指向 ${failHref} 的 locator 深链`);
        await failLink.click();
        const dialog = page.getByRole("dialog");
        await dialog.waitFor({ state: "visible", timeout: 10_000 });
        const dialogText = await dialog.innerText();
        assert.ok(
          dialogText.includes("expected: 3") && dialogText.includes("received: 2"),
          "自定义 review page 的 dialog 应展示真实失败细节(AttemptSummary + AttemptAssessment)",
        );

        // 折叠展开:review page 里失败源码行的原生 <details> 语义在真实浏览器里可操作。
        const badLine = dialog.locator("details.nre-source-line.nre-tone-bad");
        assert.equal(await badLine.count(), 1, "review page 应恰好有一条 gate-fail 行");
        assert.equal(await badLine.getAttribute("open"), "", "首个失败行应默认展开");
        await badLine.locator("> summary").click();
        assert.equal(await badLine.getAttribute("open"), null, "点击已展开的失败行应能收起(原生 <details> 语义)");
        await badLine.locator("> summary").click();
        assert.equal(await badLine.getAttribute("open"), "", "再次点击应能重新展开");
      } finally {
        await page.close();
      }
    } finally {
      await browser.close();
      await close();
    }
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
}

export async function verifyCustomReports(evidence: Evidence): Promise<void> {
  await verifyBrandedReportReadback(evidence);
  await verifySiteReportReadback(evidence);
  await verifyBrandedReportRender(evidence);
  await verifySiteReportRender(evidence);
}
