/*
 * Formatting, parsing, and calendar helpers shared by the Debt Descent
 * calculator islands (deferred interest, balance transfer, DMP).
 * DebtCalculator.vue predates this file and keeps its own copies.
 */

const usdFormat = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

/** Dollars, always with cents: "$1,234.50". */
export const usd = (n: number): string => usdFormat.format(n);

/** Percent as typed by a person: 29.99 → "29.99%", 8 → "8%". */
export const pct = (n: number): string => `${Number(n.toFixed(2))}%`;

/** Lenient number parsing: tolerates "$", "%", commas, and spaces. */
export function parseNumber(raw: string): number {
  const cleaned = raw.replace(/[$,%\s]/g, '');
  if (cleaned === '') return NaN;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

export const plural = (n: number, unit: string): string => `${n} ${unit}${n === 1 ? '' : 's'}`;

export const monthShort = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' });
export const monthLong = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
export const dateLong = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

/** The first of the calendar month `m` months from now (month 1 = next month). */
export function monthDate(m: number): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + m, 1);
}

/** Round up to the cent, so a payment "that clears it" clears it. */
export function ceilCents(n: number): number {
  return Math.ceil(n * 100 - 1e-7) / 100;
}

/** Round to the cent. */
export function roundCents(n: number): number {
  return Math.round(n * 100) / 100;
}

// ————— calendar days (noon-anchored, like the app's PromoMath) —————

/** Noon of the given calendar day, so DST never shortens a day or month. */
export function noon(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);
}

/** `n` calendar months from `d`, clamped to the last day of the target month. */
export function addMonths(d: Date, n: number): Date {
  const year = d.getFullYear();
  const month = d.getMonth() + n;
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(d.getDate(), lastDay), 12);
}

/** Whole calendar months from `from` to `to`, floored; 0 when `to` isn't after `from`. */
export function wholeMonthsBetween(from: Date, to: Date): number {
  const a = noon(from);
  const b = noon(to);
  if (b <= a) return 0;
  let months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (addMonths(a, months) > b) months -= 1;
  return Math.max(0, months);
}

/** Whole days from `from` to `to` (negative when `to` is earlier). */
export function daysBetween(from: Date, to: Date): number {
  return Math.round((noon(to).getTime() - noon(from).getTime()) / 86_400_000);
}

/** "YYYY-MM-DD" for an <input type="date">, in local time. */
export function toDateInput(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Parse an <input type="date"> value as a local date at noon; null if blank or malformed. */
export function fromDateInput(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12);
  return Number.isNaN(d.getTime()) ? null : d;
}
