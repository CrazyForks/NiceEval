"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import type { Dictionary, TerminalCopy } from "../lib/content";

// Hero 终端动画:一个终端窗口里回放一次真实的评估闭环——
// `niceeval exp compare` 跑 4 个 attempt(live 面板动态覆盖计数,失败证据逐条追加),
// 结束后 `niceeval show --exp A --exp B` 打出对照矩阵。所有输出格式照抄真实 CLI
// (docs/feature/experiments/cli.md 的 live 面板、docs/feature/reports/show/compare.md 的矩阵);
// 动效规则也沿用 CLI 自己的契约:新值使旧值失去意义的动态覆盖,证据只追加。
// SSR 与 prefers-reduced-motion 输出终帧(完整成绩单),动画只是渐进增强。

// ---- 时间轴(ms):关键帧集中在这里,不散进 JSX。
const T = {
  cmd1Start: 350,
  cmd1Done: 1750,
  plan: 2100,
  panelIn: 2500,
  evidence: 6750,
  panelOut: 7500,
  summary: 7650,
  cmd2Start: 8400,
  cmd2Done: 10100,
  compareHead: 10450,
  tableHead: 10900,
  row1: 11150,
  row2: 11400,
  totals: 11750,
  footer: 12050,
  end: 12500,
} as const;

// 语言无关的标识符与数字:命令、id、token/成本。数字彼此自洽——
// 四格成本 0.09+0.12+0.22+0.31 = $0.74(live 面板计价终值),tokens 合计 144.8k。
const CMD1 = "niceeval exp compare";
const CMD2 = "niceeval show --exp compare/gpt-5.4 --exp compare/deepseek-v4";
const PLAN_LINE = "plan: 4 attempts · 2 evals × 2 configs · runs 1";
const RUN_COST_USD = 0.74;
const RUN_SECONDS = 62;
const EVIDENCE_LINE = "@1qrdcfq8 image-understanding [deepseek-v4]";
const EVIDENCE_DETAIL = 'toolCalled("describe_image"): no matching tool call';
const COST_LINE = "$0.74 · 144.8k tokens";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

function typedSlice(cmd: string, now: number, start: number, done: number): string {
  if (now <= start) return "";
  if (now >= done) return cmd;
  return cmd.slice(0, Math.floor(((now - start) / (done - start)) * cmd.length));
}

function fmtSec(totalSec: number): string {
  if (totalSec < 60) return `${totalSec}s`;
  return `${Math.floor(totalSec / 60)}m ${String(totalSec % 60).padStart(2, "0")}s`;
}

// ---- live 面板的 ACTIVE slot:两条并发 lane,随运行进度换题、换阶段。
type Slot = { evalId: string; expId: string; sinceP: number; phase: string };

function activeSlots(p: number, d: TerminalCopy): Slot[] {
  const slots: Slot[] = [];
  if (p < 0.3) {
    slots.push({ evalId: "weather-tool", expId: "gpt-5.4", sinceP: 0, phase: p < 0.12 ? d.phaseSandbox : d.phaseRun });
  } else {
    slots.push({
      evalId: "image-understanding",
      expId: "gpt-5.4",
      sinceP: 0.3,
      phase: p < 0.42 ? d.phaseSandbox : p < 0.92 ? d.phaseRun : d.phaseScoring,
    });
  }
  if (p < 0.55) {
    slots.push({ evalId: "weather-tool", expId: "deepseek-v4", sinceP: 0, phase: p < 0.15 ? d.phaseSandbox : d.phaseRun });
  } else if (p < 0.85) {
    slots.push({ evalId: "image-understanding", expId: "deepseek-v4", sinceP: 0.55, phase: d.phaseRun });
  }
  return slots;
}

// rAF 驱动的时间轴:SSR / 无 JS / reduced-motion 都停在终帧,挂载后自动播一遍。
function useTimeline(end: number) {
  const [now, setNow] = useState(end);
  const rafRef = useRef(0);
  const play = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const t0 = performance.now();
    const tick = (ts: number) => {
      const t = ts - t0;
      setNow(Math.min(t, end));
      if (t < end) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [end]);
  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) play();
    return () => cancelAnimationFrame(rafRef.current);
  }, [play]);
  return { now, play };
}

function Prompt({ cmd, cursor }: { cmd: string; cursor: boolean }) {
  return (
    <div className="term-line">
      <span className="term-prompt">$ </span>
      {cmd}
      {cursor ? <span className="term-cursor" /> : null}
    </div>
  );
}

export default function TerminalDemo({ t }: { t: Dictionary }) {
  const d: TerminalCopy = t.term;
  const { now, play } = useTimeline(T.end);
  const p = clamp01((now - T.panelIn) / (T.panelOut - T.panelIn));
  const runElapsed = fmtSec(Math.round(p * RUN_SECONDS));
  const countsIdx = p < 0.3 ? 0 : p < 0.55 ? 1 : p < 0.85 ? 2 : 3;
  const typing1 = now >= T.cmd1Start && now < T.plan;
  const typing2 = now >= T.cmd2Start && now < T.compareHead;

  return (
    <div className="term" aria-label={t.visualLabel}>
      <button type="button" className="term-replay" aria-label={d.replay} onClick={play}>
        <RotateCcw size={14} />
      </button>
      <div className="term-screen">
        <Prompt cmd={typedSlice(CMD1, now, T.cmd1Start, T.cmd1Done)} cursor={typing1} />
        {now >= T.plan ? <div className="term-line soft">{PLAN_LINE}</div> : null}

        {/* 失败证据:live 面板上方逐条追加,面板收起后仍然保留——这行是永久事实。 */}
        {now >= T.evidence ? (
          <>
            <div className="term-line">
              <b className="fail">✗</b> {EVIDENCE_LINE} <span className="soft">· {d.phaseRun}</span>
            </div>
            <div className="term-line soft term-indent">{EVIDENCE_DETAIL}</div>
          </>
        ) : null}

        {/* live 面板:只在运行期间存在,结束后被摘要面板取代(TTY 动态区的真实行为)。 */}
        {now >= T.panelIn && now < T.panelOut ? (
          <div className="term-panel">
            <span className="term-tag tl">{CMD1}</span>
            <span className="term-tag tr">{runElapsed}</span>
            <span className="term-tag br">${(p * RUN_COST_USD).toFixed(2)}</span>
            <div className="term-line">{d.countsFrames[countsIdx]}</div>
            <div className="term-rule">
              <span>ACTIVE</span>
            </div>
            {activeSlots(p, d).map((slot) => (
              <div className="term-slot" key={`${slot.evalId}-${slot.expId}`}>
                <i className="term-dot" />
                <span className="term-slot-eval">{slot.evalId}</span>
                <span className="soft">{slot.expId}</span>
                <span className="term-slot-time">{fmtSec(Math.max(1, Math.round((p - slot.sinceP) * RUN_SECONDS)))}</span>
                <span className="term-slot-phase">{slot.phase}</span>
              </div>
            ))}
          </div>
        ) : null}

        {now >= T.summary ? (
          <div className="term-panel done">
            <span className="term-tag tl fail">FAILED</span>
            <span className="term-tag tr">{fmtSec(RUN_SECONDS)}</span>
            <div className="term-line">{d.summaryLine}</div>
            <div className="term-line soft">{COST_LINE}</div>
          </div>
        ) : null}

        {now >= T.cmd2Start ? <Prompt cmd={typedSlice(CMD2, now, T.cmd2Start, T.cmd2Done)} cursor={typing2} /> : null}
        {now >= T.compareHead ? (
          <>
            <div className="term-line">{d.compareHead}</div>
            <div className="term-line soft">{d.coverage}</div>
          </>
        ) : null}

        {now >= T.tableHead ? (
          <div className="term-table">
            <span className="soft">eval</span>
            <span className="soft">gpt-5.4</span>
            <span className="soft">deepseek-v4</span>
            <span className="soft">Δ deepseek-v4</span>
            {now >= T.row1 ? (
              <>
                <span>weather-tool</span>
                <span>
                  <b className="pass">✓</b> 18.2k $0.09
                </span>
                <span>
                  <b className="pass">✓</b> 22.1k $0.12
                </span>
                <span className="soft">+3.9k +$0.03</span>
              </>
            ) : null}
            {now >= T.row2 ? (
              <>
                <span>image-understanding ⇄</span>
                <span>
                  <b className="pass">✓</b> 41.5k $0.22
                </span>
                <span>
                  <b className="fail">✗</b> 63.0k $0.31
                </span>
                <span className="soft">+21.5k +$0.09</span>
              </>
            ) : null}
            {now >= T.totals ? (
              <>
                <span className="soft">{d.totalsLabel}</span>
                <span>{d.totalsBaseline}</span>
                <span>{d.totalsCondition}</span>
                <span />
              </>
            ) : null}
          </div>
        ) : null}

        {now >= T.footer ? <div className="term-line soft">{d.footer}</div> : null}
        {now >= T.end ? <Prompt cmd="" cursor /> : null}
      </div>
    </div>
  );
}
