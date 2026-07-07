// unit 驱动的内置格式化(docs/reports.md「指标与聚合」):
//   "%" → 87%    "ms" → 1.2s    "$" → $0.31    其余 → 1.2k 缩写(带 unit 后缀)
// metric.display 可整体覆盖;这里只负责默认。

/** 一位小数、去掉无意义的 ".0" 尾巴。 */
function trimmed(n: number): string {
  const s = n.toFixed(1);
  return s.endsWith(".0") ? s.slice(0, -2) : s;
}

/** 1.2k / 3.4M / 5.6B 式缩写(输入为非负数)。 */
function abbreviate(abs: number): string {
  if (abs >= 1e9) return `${trimmed(abs / 1e9)}B`;
  if (abs >= 1e6) return `${trimmed(abs / 1e6)}M`;
  if (abs >= 1e3) return `${trimmed(abs / 1e3)}k`;
  return Number.isInteger(abs) ? String(abs) : trimmed(abs);
}

function formatDuration(absMs: number): string {
  if (absMs < 1000) return `${Math.round(absMs)}ms`;
  if (absMs < 60_000) return `${trimmed(absMs / 1000)}s`;
  const totalSeconds = Math.round(absMs / 1000);
  return `${Math.floor(totalSeconds / 60)}m ${totalSeconds % 60}s`;
}

function formatDollars(abs: number): string {
  if (abs >= 1000) return abbreviate(abs);
  if (abs >= 0.01 || abs === 0) return abs.toFixed(2);
  // 小额成本保留有效位,不四舍成 "$0.00" 假零
  return abs.toFixed(4);
}

export function formatMetricValue(value: number, unit?: string): string {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (unit === "%") return `${sign}${trimmed(Math.round(abs * 1000) / 10)}%`;
  if (unit === "ms") return sign + formatDuration(abs);
  if (unit === "$") return `${sign}$${formatDollars(abs)}`;
  const n = abbreviate(abs);
  return unit ? `${sign}${n} ${unit}` : `${sign}${n}`;
}

/** 无单位纯数字(scoreboard 总分等):一位小数,去尾零。 */
export function formatPlainNumber(value: number): string {
  const sign = value < 0 ? "-" : "";
  return sign + trimmed(Math.round(Math.abs(value) * 10) / 10);
}
