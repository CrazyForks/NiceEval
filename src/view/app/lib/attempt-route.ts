// attempt 级 hash 深链:`#/attempt/<snapshot>/<attempt>`(docs/view.md「用 Reports 积木重建 view」)。
// 路由参数就是 AttemptRef(快照的根相对路径 + attempt 的快照相对路径),由 loader 注入到每条
// result 上;这里只做纯解析 / 格式化 / 匹配,不碰 location / history,方便单测。
// hash 目前只有这一种路由:tab 切换是纯组件 state,旧版 modal 深链走 ?modal= 查询参数,互不占用。

import type { AttemptRef, ViewResult, ViewSnapshot } from "../types.ts";

export const ATTEMPT_HASH_PREFIX = "#/attempt/";

/** attempt 段的形状:`a<n>`。 */
const ATTEMPT_TAIL = /^a\d+$/;

function encodeSegments(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}

/** AttemptRef → 可分享的 hash。snapshot 与 attempt 各自按 "/" 切段、逐段编码,再首尾相接。 */
export function formatAttemptHash(ref: AttemptRef): string {
  return `${ATTEMPT_HASH_PREFIX}${encodeSegments(ref.snapshot)}/${encodeSegments(ref.attempt)}`;
}

/**
 * hash → AttemptRef;不是本路由 / 形状不对返回 null(由调用方决定 warn 与否)。
 * 去前缀、按 "/" 切段逐段解码;段数 < 3 或末段不匹配 `a<n>` 视为畸形。snapshot 恒占前两段
 * (与 niceeval/results 的约定一致),其余段拼回 attempt(evalId 本身可能带 "/")。
 */
export function parseAttemptHash(hash: string): AttemptRef | null {
  if (!hash.startsWith(ATTEMPT_HASH_PREFIX)) return null;
  const rest = hash.slice(ATTEMPT_HASH_PREFIX.length);
  if (!rest) return null;
  let segments: string[];
  try {
    segments = rest.split("/").map((segment) => decodeURIComponent(segment));
  } catch {
    return null; // 非法 % 转义
  }
  if (segments.length < 3 || segments.some((segment) => segment.length === 0)) return null;
  if (!ATTEMPT_TAIL.test(segments.at(-1)!)) return null;
  const snapshot = segments.slice(0, 2).join("/");
  const attempt = segments.slice(2).join("/");
  return { snapshot, attempt };
}

/** 在全部快照(含历史)里找 AttemptRef 指向的 attempt;旧格式烘焙的数据没有 attemptRef,自然找不到。 */
export function resolveAttemptRef(snapshots: ViewSnapshot[], ref: AttemptRef): ViewResult | null {
  for (const snapshot of snapshots) {
    for (const result of snapshot.results ?? []) {
      if (result.attemptRef?.snapshot === ref.snapshot && result.attemptRef.attempt === ref.attempt) return result;
    }
  }
  return null;
}

/** 深链定位不到时的提示(console.warn 用,英文);页面照常渲染,不开空 modal。 */
export function unresolvedAttemptWarning(hash: string): string {
  return (
    `[niceeval view] Ignoring attempt link "${hash}": no matching attempt in this view ` +
    `(snapshot not loaded, attempt not found, or the data was baked without attempt refs).`
  );
}
