// turn 级瞬时错误分类:把一次 send 失败(抛出 / 返回 failed Turn)按重试安全性归类。
// 判据全文见 docs/feature/error-classification/README.md「分类」;这里只落三道分类链里
// 「保守兜底」与「受理证据门」两道的实现,adapter 分类器本身不在这个文件(它是 Agent 的可选字段,
// 挂载在 src/agents/types.ts)。执行体的重试时序在 send-retry.ts,不在这里——本模块只回答
// 「这次失败能不能安全重发」,不碰次数/退避/槽位。

import type { Turn } from "../types.ts";

/**
 * 一次 send 失败的分类结果:`retryable` 是执行体唯一消费的决策轴;`reason` 是开放词表的
 * 细分诊断,只进 activity 与耗尽摘要,不参与策略。内建兜底产出 reason `"rate_limit"` /
 * `"network"`;adapter 分类器可自造词。`retryable: true` 时 `reason` 必填——可重试的失败
 * 一定会出现在 activity 行与可能的耗尽摘要里,那里需要一个给人读的词。
 */
export type TurnErrorClass =
  | { readonly retryable: true; readonly reason: string }
  | { readonly retryable: false; readonly reason?: string };

/** 一次 send 失败的两种浮出形态:`send()` 抛出异常,或返回 `status: "failed"` 的 Turn。 */
export type TurnFailure =
  | { readonly type: "thrown"; readonly error: unknown }
  | { readonly type: "turn-failed"; readonly turn: Turn };

/**
 * adapter 可选分类器:返回 `undefined` 表示「不认识,交给保守兜底」。分类器必须快、纯、
 * 不抛错——执行体按「抛错等价于不可重试」处理,自身错误被吞掉,不会掩盖原始失败。
 */
export type TurnErrorClassifier = (failure: TurnFailure) => TurnErrorClass | undefined;

/**
 * 失败 Turn 的错误摘要:取 `events` 里最后一个 `type: "error"` 事件的 message。
 * 与 `context.turnFailed` 报错文案、保守兜底分类器读的同一段文本同源——不出现
 * 「报错说 A、分类看 B」。没有 error 事件(status: "failed" 但 adapter 没吐错误事件)时
 * 返回 `undefined`。
 */
export function turnErrorText(turn: Turn): string | undefined {
  for (let i = turn.events.length - 1; i >= 0; i--) {
    const e = turn.events[i];
    if (e.type === "error") return e.message;
  }
  return undefined;
}

/** `thrown` 形态的错误文本:沿错误链(含 `cause`)取 message,串接成一段供分类器与摘要读的文本。 */
function thrownErrorText(error: unknown): string {
  const parts: string[] = [];
  let current: unknown = error;
  for (let depth = 0; depth < 5 && current != null; depth++) {
    const message = current instanceof Error ? current.message : String(current);
    if (message) parts.push(message);
    current = current instanceof Error ? (current as { cause?: unknown }).cause : undefined;
  }
  return parts.join(" · ");
}

/** 两种 `TurnFailure` 形态统一取「给人读也给分类器看」的那段文本。 */
export function turnFailureText(failure: TurnFailure): string {
  return failure.type === "thrown" ? thrownErrorText(failure.error) : (turnErrorText(failure.turn) ?? "");
}

// 限流关键字 / 明示 retry later → rate_limit;正则形状对齐 sandbox IO 分类器
// (src/sandbox/errors.ts 的 classifySandboxIoError),各自实现、不共享模块。
const RATE_LIMIT_PATTERN = /too many requests|rate.?limit|\b429\b|retry later|concurrency limit/i;
// 连接建立层错误(DNS 解析失败 / 连接被拒 / TLS 握手失败)→ network。刻意不包含
// ECONNRESET / socket hang up 这类「连接中途断开」——那属于「无法证明未受理」的歧义类,
// 判据见 docs/feature/error-classification/README.md「分类」。
const NETWORK_CODE_PATTERN = /^(ECONNREFUSED|ENOTFOUND|EAI_AGAIN|ENETUNREACH|EHOSTUNREACH|CERT_|ERR_TLS)/i;
const NETWORK_MESSAGE_PATTERN = /getaddrinfo|connection refused|certificate|tls handshake|connect etimedout|connection timeout/i;

/**
 * 保守兜底分类器:三道分类链里的第二道。对失败文本做正则匹配,认不出的一律 `{ retryable: false }`
 * ——宁可判死一个 attempt,不产出不可信的 verdict(判据见 README「分类」)。
 */
export function classifyTurnError(failure: TurnFailure): TurnErrorClass {
  const text = turnFailureText(failure);
  if (RATE_LIMIT_PATTERN.test(text)) return { retryable: true, reason: "rate_limit" };
  const code = errorCode(failure);
  if ((code && NETWORK_CODE_PATTERN.test(code)) || NETWORK_MESSAGE_PATTERN.test(text)) {
    return { retryable: true, reason: "network" };
  }
  return { retryable: false };
}

function errorCode(failure: TurnFailure): string | undefined {
  if (failure.type !== "thrown") return undefined;
  const e = failure.error;
  if (e && typeof e === "object" && typeof (e as { code?: unknown }).code === "string") {
    return (e as { code: string }).code;
  }
  return undefined;
}

/** 失败 Turn 里被认作「agent 侧已产出」的事件类型——受理证据门查的就是这四种。 */
const AGENT_EVIDENCE_TYPES = new Set(["message", "thinking", "action.called", "action.result"]);

/** 受理证据门:失败 Turn 的 events 里已出现任何 agent 侧产出,即证明 agent 已受理并开始工作。 */
export function hasAgentEvidence(turn: Turn): boolean {
  return turn.events.some((e) => AGENT_EVIDENCE_TYPES.has(e.type));
}

/**
 * 三道分类链的完整决议:adapter 分类器(可选,抛错按不可重试处理并吞掉)→ 保守兜底 →
 * 受理证据门(否决权,失败 Turn 带 agent 产出事件时强制降级)。执行体只需要调这一个函数,
 * 不必自己拼三道链的顺序。
 */
export function resolveTurnErrorClass(failure: TurnFailure, adapterClassifier?: TurnErrorClassifier): TurnErrorClass {
  let cls: TurnErrorClass | undefined;
  if (adapterClassifier) {
    try {
      cls = adapterClassifier(failure);
    } catch {
      // 分类器抛错按不可重试处理:分类是旁路,不得用新错误掩盖原始失败,也不回落到兜底
      // (自造分类器都判断不了的形状,交给通用正则复判没有意义)。
      return { retryable: false };
    }
  }
  const resolved = cls ?? classifyTurnError(failure);
  if (resolved.retryable && failure.type === "turn-failed" && hasAgentEvidence(failure.turn)) {
    return { retryable: false };
  }
  return resolved;
}
