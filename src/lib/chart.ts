/*
 * Types shared by BalanceChart.vue and the calculator islands that feed it.
 */
export interface ChartPoint {
  /** Month index on the x-axis. Two points may share an x to draw a jump. */
  x: number;
  /** Dollars. */
  y: number;
}

export interface ChartSeries {
  key: string;
  label: string;
  color: string;
  points: ChartPoint[];
}

export interface ChartMarker {
  x: number;
  label: string;
}

/** Series colors: CVD-safe on the white surface (the brand green fails chroma checks for lines). */
export const SERIES_COLORS = {
  green: '#2f6b38',
  blue: '#3b63e8',
  amber: '#b45309',
} as const;

/** Balance in a series at month `m`: the last point at that x (the post-jump value), 0 once it's paid off. */
export function valueAt(series: ChartSeries, m: number): number {
  let v: number | null = null;
  for (const p of series.points) {
    if (p.x === m) v = p.y;
    if (p.x > m) break;
  }
  if (v !== null) return v;
  const last = series.points[series.points.length - 1];
  return last && m > last.x ? 0 : (series.points[0]?.y ?? 0);
}

export function niceCeil(v: number): number {
  const power = 10 ** Math.floor(Math.log10(v));
  for (const m of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) {
    if (m * power >= v) return m * power;
  }
  return 10 * power;
}
