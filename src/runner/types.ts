// runner 域的编排类型:CLI / 实验展开产出 AgentRun,runEvals 消费 RunOptions,
// 调度器内部把两者展开成 Attempt。核心数据类型(EvalResult / RunSummary …)在 src/types.ts。

import type {
  Agent,
  Config,
  DiscoveredEval,
  EvalResult,
  Reporter,
  SandboxOption,
} from "../types.ts";

/** 一个 (agent, model, flags) 的运行配置 —— 由 CLI / 实验展开。 */
export interface AgentRun {
  agent: Agent;
  model?: string;
  flags: Record<string, unknown>;
  runs: number;
  earlyExit: boolean;
  sandbox?: SandboxOption;
  timeoutMs?: number;
  budget?: number;
  evalFilter: (id: string) => boolean;
  experimentId?: string;
  strict?: boolean;
}

export interface RunOptions {
  config: Config;
  evals: DiscoveredEval[];
  agentRuns: AgentRun[];
  reporters: Reporter[];
  maxConcurrency: number;
  signal?: AbortSignal;
  /** TTY live display 的进度回调;设置后 attempt 的 log 消息路由到它而不是 stderr。 */
  onProgress?: (evalId: string, who: string, msg: string) => void;
  /** 上次运行的结果。outcome === "passed" 的 (experimentId, evalId) 组合跳过重跑,结果直接合入本次汇总。 */
  priorResults?: EvalResult[];
}

/** 调度器内部的一次尝试:eval × run × 第几轮。 */
export interface Attempt {
  evalDef: DiscoveredEval;
  run: AgentRun;
  attempt: number;
  /** agent+model+evalId,用于早停。 */
  key: string;
  fingerprint: string;
}
