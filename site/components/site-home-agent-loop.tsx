"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal } from "lucide-react";
import { track } from "../src/analytics";
import { loopFrames } from "../src/agent-loop";
import type { Dictionary, Locale } from "../lib/content";

// 环的几何:viewBox 400×400,四段带箭头的环形扇区绕圆心顺时针一圈,步骤标题
// 写在扇区中段。每段是一条闭合路径:外弧 → 箭头外肩 → 箭尖 → 箭头内肩 → 内弧,
// 填充 + 1px 描边,和站点卡片同一质感;段与段之间的空隙就是箭头指向的方向。
const RING_SIZE = 400;
const R_OUT = 184;
const R_IN = 124;
const R_MID = (R_OUT + R_IN) / 2;

function ringPoint(deg: number, r: number) {
  const rad = (deg * Math.PI) / 180;
  return {
    x: RING_SIZE / 2 + r * Math.sin(rad),
    y: RING_SIZE / 2 - r * Math.cos(rad),
  };
}

function pt(deg: number, r: number) {
  const { x, y } = ringPoint(deg, r);
  return `${x.toFixed(1)} ${y.toFixed(1)}`;
}

// 每段扇区的弧体对称落在 12/3/6/9 点(-26°..+26°),箭尖再往对角空隙探 16°。
// 标签在 0° 正好是弧体中心,四个方向都不偏。
function segmentPath(index: number) {
  const from = index * 90 - 26;
  const to = index * 90 + 26;
  const tip = to + 16;
  const flare = 13;
  return [
    `M ${pt(from, R_OUT)}`,
    `A ${R_OUT} ${R_OUT} 0 0 1 ${pt(to, R_OUT)}`,
    `L ${pt(to, R_OUT + flare)}`,
    `L ${pt(tip, R_MID)}`,
    `L ${pt(to, R_IN - flare)}`,
    `L ${pt(to, R_IN)}`,
    `A ${R_IN} ${R_IN} 0 0 0 ${pt(from, R_IN)}`,
    "Z",
  ].join(" ");
}

// 「Agent 也是用户」区块：左侧是四段弧带箭头组成的循环图（评估→诊断→定位→优化），
// 右侧终端按当前步骤展示对应输出。自动轮播的手感与 Setup 一致：进入视口才转，
// 悬停暂停，点击只把倒计时清零——绿色弧带沿环推进，本身就是在演示这个循环。
export default function AgentLoop({ t, locale }: { t: Dictionary; locale: Locale }) {
  const [activeStep, setActiveStep] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (hovering || !inView) return undefined;
    const timer = window.setInterval(() => {
      setActiveStep((prev) => (prev + 1) % loopFrames.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [hovering, inView, resetKey]);

  const activate = (index: number) => {
    setResetKey((key) => key + 1);
    if (index === activeStep) return;
    track("Switch Agent Loop Step", { step: loopFrames[index].id, locale });
    setActiveStep(index);
  };

  const frame = loopFrames[activeStep];

  return (
    <section
      id="agent-loop"
      className="loop shell"
      ref={sectionRef}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="loop-intro">
        <p className="eyebrow">{t.loopEyebrow}</p>
        <h2>{t.loopTitle}</h2>
        <p className="setup-caption">{t.loopCaption}</p>
        {/* 四段带箭头的扇区排成顺时针的环,标题写在扇区里,整段扇区就是切换按钮。
            环本身就是这段叙事——fix 的箭头指回 run,当前步骤的扇区点绿。 */}
        <div className="loop-ring" role="tablist" aria-label={t.loopEyebrow}>
          <svg className="loop-ring-svg" viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
            {t.loopSteps.map(([label, cmd], index) => {
              const mid = ringPoint(index * 90, R_MID);
              return (
                <g
                  key={label}
                  role="tab"
                  tabIndex={0}
                  aria-selected={index === activeStep}
                  className={index === activeStep ? "loop-arc-group active" : "loop-arc-group"}
                  onClick={() => activate(index)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      activate(index);
                    }
                  }}
                >
                  <path className="loop-arc" d={segmentPath(index)} vectorEffect="non-scaling-stroke" />
                  <text className="loop-arc-label" x={mid.x} y={mid.y - 7} textAnchor="middle" dominantBaseline="central">
                    {label}
                  </text>
                  <text className="loop-arc-cmd" x={mid.x} y={mid.y + 11} textAnchor="middle" dominantBaseline="central">
                    {cmd}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
      <div className="terminal" role="tabpanel">
        <div className="terminal-head">
          <Terminal size={13} />
          <span>{t.loopTerminalLabel}</span>
          <code>{frame.lines[0].text.slice(2)}</code>
        </div>
        <pre className="terminal-body">
          {frame.lines.map((row, index) => (
            <span key={index} className={`term-line term-${row.kind}`}>
              {row.text}
              {"\n"}
            </span>
          ))}
        </pre>
      </div>
    </section>
  );
}
