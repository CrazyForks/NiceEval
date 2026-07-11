// createResultsWriter:Results Format 的写入面(定稿见 docs/results-lib.md「写:createResultsWriter」)。
//
// writer 与 reader 是同一组类型的两半,而且是字面的两半:reader 的 attempt.result 由
// 「snapshot() 声明的快照级字段(experimentId / agent / model / startedAt / experiment)+
// writeAttempt 第一参」拼成,快照级字段不在 attempt 参数类型里(AttemptEntry 的 Omit),
// 不存在「谁的值为准」。布局知识(快照目录独占创建、attempt 路径清洗、大字段拆 artifact、
// has* 回填、空数据不落文件)全在这里;src/runner/reporters/artifacts.ts 是本文件的薄壳。

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { EvalResult, ExperimentRunInfo, LocalizedText } from "../types.ts";
import type { DiffData, O11ySummary, SourceArtifact, StreamEvent, TraceSpan } from "../types.ts";
import { RESULTS_FORMAT, RESULTS_SCHEMA_VERSION } from "../types.ts";
import { RESULT_FILE, SNAPSHOT_FILE, attemptDirOf, experimentDirOf } from "./format.ts";
import type { Producer, SnapshotMeta } from "./types.ts";

export interface ResultsWriterOptions {
  /** 谁在写这份结果:niceeval 自己,或第三方 harness(name 如实写,别冒充 "niceeval")。 */
  producer: Producer;
}

/** 快照级声明:一个 experiment 声明一次,这些字段不塞进每条 attempt。 */
export interface SnapshotDeclaration {
  experimentId: string;
  agent: string;
  model?: string;
  /** 必填:身份键与去重以它为锚,官方产出永不缺。 */
  startedAt: string;
  /** 转换历史数据时如实交代收尾时刻;省略则 finish() 用当前时刻。 */
  completedAt?: string;
  /** 实验运行配置(flags / runs / earlyExit / sandbox / timeoutMs / budget),快照内全部 attempt 共享。 */
  experiment?: ExperimentRunInfo;
  /** 该实验已知的 eval 并集(残缺检测的分母);转换只覆盖部分题目时如实交代全集。 */
  knownEvalIds?: string[];
  /** 项目名(来自 config.name),透传给 `niceeval view` 顶部 hero 显示。 */
  name?: LocalizedText;
}

/**
 * writeAttempt 的第一参 = attempt 级条目:reader 的 attempt.result 中,快照级字段
 * (experimentId / agent / model / startedAt / experiment)与引用字段(artifactBase / has*)
 * 以外的全部;引用字段由 writer 按实际写入的 artifact 回填。
 */
export type AttemptEntry = Omit<
  EvalResult,
  | "agent"
  | "model"
  | "startedAt"
  | "experimentId"
  | "experiment"
  | "events"
  | "sources"
  | "o11y"
  | "trace"
  | "diff"
  | "rawTranscript"
  | "artifactBase"
  | "hasTrace"
  | "hasEvents"
  | "hasSources"
>;

/** writeAttempt 的第二参:reader 懒加载能拿到的那几样 artifact,全部可选;缺哪样读取面就懒加载出 null。 */
export interface AttemptArtifacts {
  events?: StreamEvent[];
  trace?: TraceSpan[];
  o11y?: O11ySummary;
  diff?: DiffData;
  sources?: SourceArtifact[];
}

export interface SnapshotWriter {
  /** 本快照的目录(绝对路径)。 */
  readonly dir: string;
  /** 增量落盘一条 attempt:拆 artifact 文件、回填 has* 引用、写 result.json;空数据不落文件。 */
  writeAttempt(entry: AttemptEntry, artifacts?: AttemptArtifacts): Promise<void>;
}

export interface ResultsWriter {
  /**
   * 建快照目录(独占创建,撞名换随机后缀重试)+ 立即写 snapshot.json(不含 completedAt)。
   * 同一 writer 内同 experimentId 重复声明 → 返回同一个 SnapshotWriter(懒建语义;
   * knownEvalIds 取并集,completedAt / name 以最后一次声明为准,finish() 时才落盘)。
   */
  snapshot(decl: SnapshotDeclaration): Promise<SnapshotWriter>;
  /** 给每个已声明的快照补 completedAt(decl.completedAt ?? 当前时刻)与 name(参数优先,声明兜底)。 */
  finish(opts?: { name?: LocalizedText }): Promise<void>;
  /** @internal runner 薄壳入口:按 EvalResult 的 experimentId 懒建快照并落盘一条 attempt。 */
  writeAttemptFor(result: EvalResult): Promise<void>;
  /** @internal 已创建快照清单(CLI 收尾打印)。 */
  snapshotDirs(): { experimentId: string; dir: string }[];
}

interface SnapshotState {
  /** 快照的权威 meta(不含 completedAt;knownEvalIds 随重复声明累加)。 */
  meta: SnapshotMeta;
  dir: string;
  writer: SnapshotWriter;
  declCompletedAt?: string;
  declName?: LocalizedText;
}

/** 同步:不建目录、不碰磁盘。目录创建发生在第一次 snapshot() 调用里。 */
export function createResultsWriter(root: string, opts: ResultsWriterOptions): ResultsWriter {
  const pending = new Map<string, Promise<SnapshotState>>();
  const created: { experimentId: string; dir: string }[] = [];
  let finished = false;

  async function buildSnapshot(decl: SnapshotDeclaration): Promise<SnapshotState> {
    const meta: SnapshotMeta = {
      format: RESULTS_FORMAT,
      schemaVersion: RESULTS_SCHEMA_VERSION,
      producer: opts.producer,
      experimentId: decl.experimentId,
      // 运行配置不带 id:身份的家是顶层 experimentId,重复一份只会引出「以谁为准」。
      ...(decl.experiment !== undefined ? { experiment: stripInfoId(decl.experiment) } : {}),
      agent: decl.agent,
      ...(decl.model !== undefined ? { model: decl.model } : {}),
      startedAt: decl.startedAt,
      ...(decl.knownEvalIds?.length ? { knownEvalIds: [...new Set(decl.knownEvalIds)] } : {}),
      ...(decl.name !== undefined ? { name: decl.name } : {}),
    };
    const dir = await createSnapshotDir(root, decl.experimentId);
    await writeFile(join(dir, SNAPSHOT_FILE), JSON.stringify(meta, null, 2), "utf-8");
    created.push({ experimentId: decl.experimentId, dir });
    const writer: SnapshotWriter = {
      dir,
      async writeAttempt(entry: AttemptEntry, artifacts?: AttemptArtifacts): Promise<void> {
        await writeAttemptFiles(dir, entry, artifacts);
      },
    };
    return { meta, dir, writer, declCompletedAt: decl.completedAt, declName: decl.name };
  }

  async function snapshotImpl(decl: SnapshotDeclaration): Promise<SnapshotWriter> {
    if (!decl.experimentId || !decl.agent || !decl.startedAt) {
      throw new Error(
        "writer.snapshot() requires experimentId, agent and startedAt. They are snapshot-level identity: declare them once here instead of on each attempt.",
      );
    }
    const existing = pending.get(decl.experimentId);
    const statePromise: Promise<SnapshotState> = existing
      ? existing.then((state) => {
          if (decl.knownEvalIds?.length) {
            state.meta.knownEvalIds = [...new Set([...(state.meta.knownEvalIds ?? []), ...decl.knownEvalIds!])];
          }
          if (decl.completedAt !== undefined) state.declCompletedAt = decl.completedAt;
          if (decl.name !== undefined) state.declName = decl.name;
          return state;
        })
      : buildSnapshot(decl);
    pending.set(decl.experimentId, statePromise);
    const state = await statePromise;
    return state.writer;
  }

  async function writeAttemptForImpl(result: EvalResult): Promise<void> {
    if (!result.experimentId) {
      throw new Error(
        `writeAttemptFor() requires EvalResult.experimentId (results schemaVersion ${RESULTS_SCHEMA_VERSION} lays out one directory per experiment); eval "${result.id}" has none.`,
      );
    }
    const snap = await snapshotImpl({
      experimentId: result.experimentId,
      agent: result.agent,
      model: result.model,
      // 快照 startedAt 以该实验首条落盘结果的 attempt 时刻为锚(首条 ≈ 实验开跑)。
      startedAt: result.startedAt ?? new Date().toISOString(),
      experiment: result.experiment,
    });

    if (result.artifactBase) {
      // 携带条目(--resume 合入):本轮没有任何新数据,不写 artifact、不重算 has*,
      // startedAt(身份锚)与 artifactBase 原样保留。
      const { agent, model, experimentId, experiment, events, sources, o11y, trace, diff, rawTranscript, ...rest } = result;
      void agent;
      void model;
      void experimentId;
      void experiment;
      void events;
      void sources;
      void o11y;
      void trace;
      void diff;
      void rawTranscript;
      const attemptDir = join(snap.dir, attemptDirOf(result));
      await mkdir(attemptDir, { recursive: true });
      await writeFile(join(attemptDir, RESULT_FILE), JSON.stringify(rest, null, 2), "utf-8");
      return;
    }

    const {
      agent,
      model,
      startedAt,
      experimentId,
      experiment,
      events,
      sources,
      o11y,
      trace,
      diff,
      rawTranscript,
      artifactBase,
      hasTrace,
      hasEvents,
      hasSources,
      ...entry
    } = result;
    void agent;
    void model;
    void experimentId;
    void experiment;
    void artifactBase;
    void hasTrace;
    void hasEvents;
    void hasSources;
    // startedAt 是 attempt 级事实(每条各异,view 靠它显示「何时跑的」),原样落盘;
    // 读取面只在记录缺失时才回退快照的 startedAt。
    const record = { ...entry, ...(startedAt !== undefined ? { startedAt } : {}) };
    await snap.writeAttempt(record as AttemptEntry, { events, sources, o11y, trace, diff });
  }

  return {
    snapshot: snapshotImpl,
    writeAttemptFor: writeAttemptForImpl,
    snapshotDirs(): { experimentId: string; dir: string }[] {
      return [...created];
    },

    async finish(finishOpts?: { name?: LocalizedText }): Promise<void> {
      if (finished) throw new Error("writer.finish() was already called.");
      finished = true;
      const states = await Promise.all([...pending.values()]);
      await Promise.all(
        states.map(async (state) => {
          const completedAt = state.declCompletedAt ?? new Date().toISOString();
          const name = finishOpts?.name ?? state.declName;
          const finalMeta: SnapshotMeta = {
            format: state.meta.format,
            schemaVersion: state.meta.schemaVersion,
            producer: state.meta.producer,
            experimentId: state.meta.experimentId,
            ...(state.meta.experiment !== undefined ? { experiment: state.meta.experiment } : {}),
            agent: state.meta.agent,
            ...(state.meta.model !== undefined ? { model: state.meta.model } : {}),
            startedAt: state.meta.startedAt,
            completedAt,
            ...(state.meta.knownEvalIds?.length ? { knownEvalIds: state.meta.knownEvalIds } : {}),
            ...(name !== undefined ? { name } : {}),
          };
          state.meta = finalMeta;
          await writeFile(join(state.dir, SNAPSHOT_FILE), JSON.stringify(finalMeta, null, 2), "utf-8");
        }),
      );
    },
  };
}

/** 一条 attempt 的落盘:拆 artifact 文件、算 has*、写 result.json;空数据不落文件。 */
async function writeAttemptFiles(snapDir: string, entry: AttemptEntry, artifacts?: AttemptArtifacts): Promise<void> {
  const attemptDir = join(snapDir, attemptDirOf(entry));
  await mkdir(attemptDir, { recursive: true });

  const hasEvents = !!(artifacts?.events && artifacts.events.length);
  const hasSources = !!(artifacts?.sources && artifacts.sources.length);
  const hasTrace = !!(artifacts?.trace && artifacts.trace.length);

  const writes: Promise<unknown>[] = [];
  if (hasEvents) writes.push(writeFile(join(attemptDir, "events.json"), JSON.stringify(artifacts!.events), "utf-8"));
  if (hasSources) writes.push(writeFile(join(attemptDir, "sources.json"), JSON.stringify(artifacts!.sources), "utf-8"));
  if (hasTrace) writes.push(writeFile(join(attemptDir, "trace.json"), JSON.stringify(artifacts!.trace), "utf-8"));
  if (artifacts?.o11y) writes.push(writeFile(join(attemptDir, "o11y.json"), JSON.stringify(artifacts.o11y), "utf-8"));
  if (artifacts?.diff) writes.push(writeFile(join(attemptDir, "diff.json"), JSON.stringify(artifacts.diff), "utf-8"));
  await Promise.all(writes);

  const record = { ...entry, hasEvents, hasTrace, hasSources };
  await writeFile(join(attemptDir, RESULT_FILE), JSON.stringify(record, null, 2), "utf-8");
}

/** 快照目录:独占创建(EEXIST 换随机后缀重试,≤5 次)。 */
async function createSnapshotDir(root: string, experimentId: string): Promise<string> {
  const parent = join(root, experimentDirOf(experimentId));
  await mkdir(parent, { recursive: true });
  let lastError: unknown;
  for (let i = 0; i < 5; i++) {
    const dir = join(parent, `${safeTimestamp(new Date())}-${randomSuffix()}`);
    try {
      await mkdir(dir);
      return dir;
    } catch (e) {
      if ((e as NodeJS.ErrnoException)?.code !== "EEXIST") throw e;
      lastError = e;
    }
  }
  throw new Error(`Could not create a unique snapshot directory under "${parent}" after 5 attempts (${String(lastError)}).`);
}

/** 运行配置落盘前剥掉 id:experimentId 的家在 snapshot.json 顶层。 */
function stripInfoId(info: ExperimentRunInfo): ExperimentRunInfo {
  const { id, ...rest } = info;
  void id;
  return rest;
}

/** 快照目录名的时间戳段:Date#toISOString 把 : 与 . 换成 -(与 docs/results-format.md 一致)。 */
function safeTimestamp(d: Date): string {
  return d.toISOString().replace(/[:.]/g, "-");
}

/** 快照目录名的随机后缀:4 位 [a-z0-9]。 */
function randomSuffix(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < 4; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}
