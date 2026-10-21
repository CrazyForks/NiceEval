import type { NumericMaterial } from "./match.ts";

/** Preserve a missing observation instead of coercing null to zero. */
export function measured(value: number | null, options: { readonly unavailable: string }): NumericMaterial {
  if (typeof options?.unavailable !== "string" || options.unavailable.trim().length === 0) {
    throw new TypeError("measured() requires a non-empty unavailable reason.");
  }
  if (value === null) return Object.freeze({ state: "unavailable", reason: options.unavailable });
  if (typeof value !== "number") throw new TypeError("measured() requires a number or null.");
  return Number.isFinite(value)
    ? Object.freeze({ state: "exact", value })
    : Object.freeze({ state: "unavailable", reason: "non-finite-number" });
}

export type QuantileMethod = "linear" | "nearest-rank";
export type QuantileMaterial = NumericMaterial & {
  readonly statistics: {
    readonly sampleCount: number;
    readonly probability: number;
    readonly method: QuantileMethod;
  };
};

/** Compute a quantile without changing or retaining the samples. Empty or invalid samples remain unavailable. */
export function quantile(
  samples: readonly number[],
  p: number,
  options: { readonly method?: QuantileMethod } = {},
): QuantileMaterial {
  if (!Array.isArray(samples)) throw new TypeError("quantile() requires an array of samples.");
  if (!Number.isFinite(p) || p < 0 || p > 1) throw new TypeError("quantile() probability must be a finite number in [0, 1].");
  const method = options.method ?? "linear";
  if (method !== "linear" && method !== "nearest-rank") throw new TypeError("quantile() method must be linear or nearest-rank.");
  const statistics = Object.freeze({ sampleCount: samples.length, probability: p, method });
  if (samples.length === 0) return Object.freeze({ state: "unavailable", reason: "no-samples", statistics });
  for (const sample of samples) {
    if (!Number.isFinite(sample)) return Object.freeze({ state: "unavailable", reason: "non-finite-sample", statistics });
  }
  const sorted = [...samples].sort((a, b) => a - b);
  const position = (sorted.length - 1) * p;
  const lower = sorted[Math.floor(position)]!;
  const upper = sorted[Math.ceil(position)]!;
  const fraction = position - Math.floor(position);
  const delta = upper - lower;
  const value = method === "nearest-rank"
    ? sorted[Math.max(0, Math.ceil(sorted.length * p) - 1)]!
    : Number.isFinite(delta) ? lower + delta * fraction : lower * (1 - fraction) + upper * fraction;
  return Object.freeze({ state: "exact", value, statistics });
}
