// 指纹缓存:用 (eval 源码 + 运行配置) 的稳定哈希标识一次 attempt 的输入。
// 上次 passed 且指纹未变的 (experimentId, evalId) 组合可以直接携入,不再重跑。

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { sandboxLabel } from "../sandbox/resolve.ts";
import type { DiscoveredEval } from "../types.ts";
import type { AgentRun } from "./types.ts";

export function cacheKey(run: AgentRun, evalId: string): string {
  return `${run.experimentId ?? ""}|${evalId}`;
}

export async function computeFingerprint(evalDef: DiscoveredEval, run: AgentRun): Promise<string> {
  const source = await readFile(evalDef.sourcePath, "utf-8");
  const payload = {
    source,
    eval: {
      id: evalDef.id,
      tags: evalDef.tags ?? [],
      metadata: evalDef.metadata ?? {},
      timeoutMs: evalDef.timeoutMs,
    },
    run: {
      experimentId: run.experimentId,
      agent: run.agent.name,
      model: run.model,
      flags: run.flags,
      sandbox: run.sandbox === undefined ? undefined : sandboxLabel(run.sandbox),
      timeoutMs: run.timeoutMs,
      strict: run.strict,
    },
  };
  return createHash("sha256").update(stableJson(payload)).digest("hex");
}

/** 键序稳定的 JSON 序列化(对象键排序),保证同一 payload 永远同一指纹。 */
function stableJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  const obj = value as Record<string, unknown>;
  return `{${Object.keys(obj)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableJson(obj[key])}`)
    .join(",")}}`;
}
