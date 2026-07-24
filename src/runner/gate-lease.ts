// 实验闸租约:把实验级 `maxConcurrency` 的 N 个名额做成跨 Invocation 共用的逐槽租约。
// 与 ./lock.ts 的用例锁同一套文件纪律(O_EXCL 独占创建、心跳续租、过期判据、rename 接管、
// 释放即删除),建在 ../shared/entry-file-store.ts 的原语之上,不复制第三份纪律。
// 契约见 docs/feature/experiments/architecture.md「并发 Invocation:用例锁」末条与
// docs/runner.md#调度有界并发。

import { join } from "node:path";
import { locksDirOf } from "./lock.ts";

/** 逐槽租约文件的 JSON 形状。身份的权威在内容,文件名只须无碰撞、不承载解析。 */
export interface GateLeaseRecord {
  experimentId: string;
  /** 槽位序号,取值 0..N-1。 */
  slot: number;
  /** 本持有者 resolved 的名额上限 N。用于 min-N:生效名额取在场声明的最小值。 */
  declaredN: number;
  pid: number;
  host: string;
  startedAt: string; // ISO
  heartbeatAt: string; // ISO
}

/** 持有者续租心跳的周期。与用例锁同参数。 */
export const GATE_LEASE_HEARTBEAT_INTERVAL_MS = 10_000;
/** `heartbeatAt` 落后当前时间超过这个阈值(三个心跳周期)即视为持有者已死。 */
export const GATE_LEASE_STALE_MS = 30_000;

export interface GateLeaseClaim {
  /** 实际取到的槽位序号。 */
  slot: number;
  /** 停止心跳定时器并删除租约文件。幂等——重复调用是 no-op。 */
  release(): Promise<void>;
}

export interface AcquireGateSlotResult {
  claim: GateLeaseClaim;
  /** true 当且仅当本次取位接管了一条过期租约,而不是全新创建。 */
  takenOver: boolean;
  /** 被接管的原持有者记录,仅在 `takenOver` 时有值——供 `lock-taken-over` 诊断报出。 */
  takenOverFrom?: GateLeaseRecord;
}

export function gateLeasesDirOf(niceevalRoot: string): string {
  return join(locksDirOf(niceevalRoot));
}

/** 读取该实验当前在场的全部租约记录,无副作用。`--dry` 与 min-N 扫描用它。 */
export async function readGateLeases(niceevalRoot: string, experimentId: string): Promise<GateLeaseRecord[]> {
  void niceevalRoot;
  void experimentId;
  throw new Error("gate-lease: not implemented");
}

/** 过期判据:只看心跳时间戳,不看 pid。落后严格大于阈值才算过期;无法解析一律视为过期。 */
export function isGateLeaseStale(record: GateLeaseRecord, nowMs: number): boolean {
  void record;
  void nowMs;
  throw new Error("gate-lease: not implemented");
}

/**
 * 一次非阻塞取位尝试:先按在场租约算生效名额(min-N——取自己的 `maxConcurrency` 与在场
 * 租约声明的 `declaredN` 的最小值),再对 `0..effectiveN-1` 中任一空槽 O_EXCL 独占创建;
 * 全满时若有过期槽则经 rename 接管,都不成功即 `{kind:"full"}`。
 */
export async function tryAcquireGateSlotOnce(
  niceevalRoot: string,
  experimentId: string,
  maxConcurrency: number,
  identity: { pid: number; host: string },
  nowMs: number,
): Promise<
  | { kind: "acquired"; slot: number; takenOver: boolean; takenOverFrom?: GateLeaseRecord }
  | { kind: "full"; holders: GateLeaseRecord[] }
> {
  void [niceevalRoot, experimentId, maxConcurrency, identity, nowMs];
  throw new Error("gate-lease: not implemented");
}

/**
 * 高层入口:立刻取位,或者每 `pollIntervalMs`(默认等于心跳周期)重试一次直到取到。没有
 * 超时——在场租约心跳新鲜就一直等。取位成功后启动心跳续租定时器,并把释放闭包登记进
 * 模块内的「本进程持有中」表(供 `drainHeldGateLeases` 强清兜底)。必须响应 `opts.signal`:
 * 等待期间被中断要立刻停止轮询、以 AbortError 形状的错误 reject,不留下悬挂的定时器。
 */
export async function acquireGateSlot(
  niceevalRoot: string,
  experimentId: string,
  maxConcurrency: number,
  identity: { pid: number; host: string },
  opts: {
    signal?: AbortSignal;
    pollIntervalMs?: number;
    heartbeatIntervalMs?: number;
    /** 只在第一次尝试就撞满时触发一次,取位成功不触发。 */
    onWaitStart?: (holders: GateLeaseRecord[]) => void;
  } = {},
): Promise<AcquireGateSlotResult> {
  void [niceevalRoot, experimentId, maxConcurrency, identity, opts];
  throw new Error("gate-lease: not implemented");
}

/** 强清兜底:释放当前进程持有的每一条租约(尽力而为、幂等)。返回本次排空的条数。 */
export async function drainHeldGateLeases(): Promise<number> {
  throw new Error("gate-lease: not implemented");
}

/** 测试探针,镜像 `pendingHeldCaseLockCount`。 */
export function pendingHeldGateLeaseCount(): number {
  throw new Error("gate-lease: not implemented");
}
