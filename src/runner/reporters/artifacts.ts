// 默认本地工件报告器:给 `niceeval view` 提供稳定的离线输入。
//
// 本文件是 niceeval/results 写入面(createRunWriter)的薄壳:订阅 reporter 事件转手调 writer,
// 自己不持有任何布局知识(时间戳目录、attempt 路径、大字段拆分、瘦身、版本元数据都在库内)。
// 落盘格式见 docs/results-format.md;每 eval-attempt 一个文件夹,重数据分文件,
// summary.json 只留榜单元数据,view 展开某条 trace 时再按需 fetch 它的 trace.json。

import { readFile } from "node:fs/promises";
import type { Reporter } from "../../types.ts";
import { createRunWriter, type RunWriter } from "../../results/writer.ts";

/** niceeval 自身的 npm 版本,写进 producer.version;版本不匹配时读取器靠它拼 npx 提示。 */
let producerVersionPromise: Promise<string | undefined> | undefined;
function producerVersion(): Promise<string | undefined> {
  producerVersionPromise ??= readFile(new URL("../../../package.json", import.meta.url), "utf-8")
    .then((raw) => (JSON.parse(raw) as { version?: string }).version)
    .catch(() => undefined);
  return producerVersionPromise;
}

/** Artifacts 报告器额外暴露输出目录:CLI 在 run 结束时打出 summary.json 路径给 agent 直读。 */
export type ArtifactsReporter = Reporter & { outputDir(): string };

export function Artifacts(root = ".niceeval"): ArtifactsReporter {
  let writer: Promise<RunWriter> | undefined;
  let dir = "";
  const ensureWriter = (): Promise<RunWriter> => {
    writer ??= (async () => {
      const w = await createRunWriter(root, {
        producer: { name: "niceeval", version: await producerVersion() },
      });
      dir = w.dir;
      return w;
    })();
    return writer;
  };

  return {
    outputDir: () => dir,

    async onRunStart() {
      // 每次 run 开一个新的时间戳目录(同一个 reporter 实例可能被复用)。
      writer = undefined;
      await ensureWriter();
    },

    // 每条结果一出来就把它的重数据落到自己的文件夹(增量、互不影响)。
    // runner 的条目自带 agent / model / experimentId / startedAt(且存在无 experiment 的
    // 普通 run),不经 snapshot() 声明,走 writer 的内部增量入口。
    async onEvalComplete(result) {
      await (await ensureWriter()).writeAttemptArtifacts(result);
    },

    // run 结束写瘦身 summary.json:携带条目(--resume 合入)与最终排序只有调度器知道,
    // 权威 results 经 overrides 交给 writer,瘦身与版本元数据注入都在库内发生。
    async onRunComplete(summary) {
      await (await ensureWriter()).finish({
        ...(summary.name !== undefined ? { name: summary.name } : {}),
        agent: summary.agent,
        ...(summary.model !== undefined ? { model: summary.model } : {}),
        startedAt: summary.startedAt,
        completedAt: summary.completedAt,
        durationMs: summary.durationMs,
        ...(summary.usage !== undefined ? { usage: summary.usage } : {}),
        ...(summary.estimatedCostUSD !== undefined ? { estimatedCostUSD: summary.estimatedCostUSD } : {}),
        results: summary.results,
      });
    },
  };
}
