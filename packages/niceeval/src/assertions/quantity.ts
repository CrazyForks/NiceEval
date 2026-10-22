/** A runtime-visible unit, with no implicit conversion or arithmetic. */
export type Unit = "ms" | "seconds" | "tokens" | "usd" | "ratio" | "count" | "bytes";
declare const quantityBrand: unique symbol;
export type Quantity<U extends Unit = Unit> = {
  readonly value: number;
  readonly unit: U;
  readonly [quantityBrand]: U;
};

const units: ReadonlySet<string> = new Set(["ms", "seconds", "tokens", "usd", "ratio", "count", "bytes"]);
export function isQuantity(value: unknown): value is Quantity {
  if (value === null || typeof value !== "object") return false;
  const candidate = value as { value?: unknown; unit?: unknown };
  return typeof candidate.unit === "string" && units.has(candidate.unit) &&
    typeof candidate.value === "number" && Number.isFinite(candidate.value);
}
function quantity<U extends Unit>(value: number, unit: U): Quantity<U> {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new RangeError(`${unit}() requires a finite number.`);
  if (unit === "ratio" && (value < 0 || value > 1)) throw new RangeError("ratio() requires a value in [0, 1].");
  return Object.freeze({ value, unit }) as Quantity<U>;
}
export const ms = (value: number): Quantity<"ms"> => quantity(value, "ms");
export const seconds = (value: number): Quantity<"seconds"> => quantity(value, "seconds");
export const tokens = (value: number): Quantity<"tokens"> => quantity(value, "tokens");
export const usd = (value: number): Quantity<"usd"> => quantity(value, "usd");
export const ratio = (value: number): Quantity<"ratio"> => quantity(value, "ratio");
export const count = (value: number): Quantity<"count"> => quantity(value, "count");
export const bytes = (value: number): Quantity<"bytes"> => quantity(value, "bytes");

export function formatNumericUnit(value: number, unit?: string): string {
  if (unit === "ratio") return `${Number((value * 100).toPrecision(12))}%`;
  if (unit === "usd") return `$${value}`;
  return unit === undefined ? String(value) : `${value} ${unit}`;
}
