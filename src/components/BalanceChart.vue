<script setup lang="ts">
import { computed, ref } from 'vue';
import { usd } from '../lib/calc-format';
import { niceCeil, valueAt, type ChartMarker, type ChartSeries } from '../lib/chart';

const props = withDefaults(
  defineProps<{
    series: ChartSeries[];
    markers?: ChartMarker[];
    xLabel: string;
    monthLabel: (m: number) => string;
    ariaLabel: string;
    tableSummary?: string;
  }>(),
  { markers: () => [], tableSummary: 'Month-by-month balances (table)' },
);

const CHART = { w: 640, h: 280, x0: 52, x1: 628, y0: 20, y1: 244 };

const chart = computed(() => {
  const all = props.series.flatMap((s) => s.points);
  if (all.length < 2) return null;
  const maxX = Math.max(...all.map((p) => p.x));
  const maxY = Math.max(...all.map((p) => p.y));
  if (maxX < 1 || maxY <= 0) return null;

  const yMax = niceCeil(maxY);
  const x = (m: number) => CHART.x0 + (m / maxX) * (CHART.x1 - CHART.x0);
  const y = (v: number) => CHART.y1 - (v / yMax) * (CHART.y1 - CHART.y0);
  const paths = props.series.map((s) => ({
    key: s.key,
    color: s.color,
    d: s.points
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.x).toFixed(1)},${y(p.y).toFixed(1)}`)
      .join(''),
  }));

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    value: yMax * f,
    y: y(yMax * f),
    label: '$' + Math.round(yMax * f).toLocaleString('en-US'),
  }));
  const step = [1, 2, 3, 6, 12, 24, 36, 60, 120].find((s) => maxX / s <= 8) ?? 120;
  const xTicks: { m: number; x: number }[] = [];
  for (let m = 0; m <= maxX; m += step) xTicks.push({ m, x: x(m) });

  const markers = props.markers
    .filter((mk) => mk.x >= 0 && mk.x <= maxX)
    .map((mk) => ({ ...mk, px: x(mk.x) }));

  return { maxX, x, y, yTicks, xTicks, paths, markers };
});

const svgEl = ref<SVGSVGElement | null>(null);
const hoverMonth = ref<number | null>(null);

function onChartMove(event: PointerEvent) {
  const svg = svgEl.value;
  const c = chart.value;
  if (!svg || !c) return;
  const rect = svg.getBoundingClientRect();
  const vx = ((event.clientX - rect.left) / rect.width) * CHART.w;
  const m = Math.round(((vx - CHART.x0) / (CHART.x1 - CHART.x0)) * c.maxX);
  hoverMonth.value = Math.min(Math.max(m, 0), c.maxX);
}

const hover = computed(() => {
  const c = chart.value;
  const m = hoverMonth.value;
  if (!c || m === null) return null;
  return {
    m,
    x: c.x(m),
    label: props.monthLabel(m),
    values: props.series.map((s) => {
      const v = valueAt(s, m);
      return { key: s.key, label: s.label, color: s.color, value: v, y: c.y(v) };
    }),
    leftPct: Math.min(Math.max((c.x(m) / CHART.w) * 100, 14), 86),
  };
});

const tableRows = computed(() => {
  const c = chart.value;
  if (!c) return [];
  const out = [];
  for (let m = 0; m <= c.maxX; m++) {
    out.push({
      m,
      label: props.monthLabel(m),
      values: props.series.map((s) => usd(valueAt(s, m))),
    });
  }
  return out;
});
</script>

<template>
  <div v-if="chart">
    <div class="mt-1 flex flex-wrap items-center gap-4 text-xs text-slate-600">
      <span v-for="s in series" :key="s.key" class="inline-flex items-center gap-1.5">
        <span class="inline-block h-[3px] w-4 rounded-full" :style="{ backgroundColor: s.color }" aria-hidden="true"></span>
        {{ s.label }}
      </span>
    </div>
    <div class="relative mt-2">
      <svg
        ref="svgEl"
        :viewBox="`0 0 ${CHART.w} ${CHART.h}`"
        class="w-full touch-pan-y select-none"
        role="img"
        :aria-label="ariaLabel"
        @pointermove="onChartMove"
        @pointerleave="hoverMonth = null"
      >
        <g v-for="tick in chart.yTicks" :key="tick.y">
          <line :x1="CHART.x0" :x2="CHART.x1" :y1="tick.y" :y2="tick.y" stroke="#f1f5f9" stroke-width="1" />
          <text :x="CHART.x0 - 6" :y="tick.y + 3.5" text-anchor="end" class="fill-slate-400" font-size="10">{{ tick.label }}</text>
        </g>
        <g v-for="tick in chart.xTicks" :key="tick.m">
          <text :x="tick.x" :y="CHART.y1 + 16" text-anchor="middle" class="fill-slate-400" font-size="10">{{ tick.m }}</text>
        </g>
        <text :x="(CHART.x0 + CHART.x1) / 2" :y="CHART.h - 2" text-anchor="middle" class="fill-slate-500" font-size="10">{{ xLabel }}</text>
        <line :x1="CHART.x0" :x2="CHART.x1" :y1="CHART.y1" :y2="CHART.y1" stroke="#cbd5e1" stroke-width="1" />
        <g v-for="mk in chart.markers" :key="mk.label">
          <line :x1="mk.px" :x2="mk.px" :y1="CHART.y0 - 4" :y2="CHART.y1" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4 3" />
          <text :x="mk.px" :y="CHART.y0 - 8" text-anchor="middle" class="fill-slate-500" font-size="10" font-weight="600">{{ mk.label }}</text>
        </g>
        <path
          v-for="p in chart.paths"
          :key="p.key"
          :d="p.d"
          fill="none"
          :stroke="p.color"
          stroke-width="2"
          stroke-linejoin="round"
          stroke-linecap="round"
        />
        <g v-if="hover">
          <line :x1="hover.x" :x2="hover.x" :y1="CHART.y0" :y2="CHART.y1" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3 3" />
          <circle v-for="v in hover.values" :key="v.key" :cx="hover.x" :cy="v.y" r="4" :fill="v.color" stroke="#fff" stroke-width="2" />
        </g>
      </svg>
      <div
        v-if="hover"
        class="pointer-events-none absolute top-1 -translate-x-1/2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs shadow-md"
        :style="{ left: `${hover.leftPct}%` }"
      >
        <p class="font-semibold text-slate-900">{{ hover.label }}</p>
        <p v-for="v in hover.values" :key="v.key" class="mt-1 flex items-center gap-1.5 whitespace-nowrap text-slate-600">
          <span class="inline-block h-2 w-2 rounded-full" :style="{ backgroundColor: v.color }"></span>
          {{ v.label }} <span class="ml-auto pl-3 font-medium text-slate-900">{{ usd(v.value) }}</span>
        </p>
      </div>
    </div>

    <details class="mt-3">
      <summary class="cursor-pointer text-sm font-medium text-slate-600 transition-colors hover:text-accent-600">{{ tableSummary }}</summary>
      <div class="mt-2 max-h-80 overflow-auto rounded-lg border border-slate-200">
        <table class="w-full min-w-[26rem] text-left text-sm">
          <thead class="sticky top-0 bg-slate-50 text-xs text-slate-600">
            <tr>
              <th scope="col" class="px-3 py-2 font-medium">Month</th>
              <th v-for="s in series" :key="s.key" scope="col" class="px-3 py-2 font-medium">{{ s.label }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in tableRows" :key="row.m" class="border-t border-slate-100">
              <td class="px-3 py-1.5 text-slate-500">{{ row.label }}</td>
              <td v-for="(v, i) in row.values" :key="i" class="px-3 py-1.5 tabular-nums text-slate-900">{{ v }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>
  </div>
</template>
