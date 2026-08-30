<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  compareMethods,
  minPaymentTooLow,
  type Comparison,
  type DebtInput,
  type Method,
  type PlanResult,
} from '../lib/debt-payoff';

interface DebtRow {
  id: number;
  name: string;
  balance: string;
  apr: string;
  minPayment: string;
}

let nextId = 0;
const blankRow = (): DebtRow => ({ id: nextId++, name: '', balance: '', apr: '', minPayment: '' });

const rows = ref<DebtRow[]>([blankRow(), blankRow()]);
const extra = ref('');
const method = ref<Method>('snowball');

// Fixed series identity for the chart and comparison — Snowball is always
// green, Avalanche always blue, regardless of which method is selected.
const SERIES = {
  snowball: { label: 'Snowball', color: '#2f6b38' },
  avalanche: { label: 'Avalanche', color: '#3b63e8' },
} as const;

function addRow() {
  rows.value.push(blankRow());
}

function removeRow(id: number) {
  if (rows.value.length > 1) rows.value = rows.value.filter((r) => r.id !== id);
}

function loadExample() {
  nextId = 0;
  rows.value = [
    { id: nextId++, name: 'Store card', balance: '650', apr: '26.99', minPayment: '35' },
    { id: nextId++, name: 'Visa', balance: '3200', apr: '22.99', minPayment: '80' },
    { id: nextId++, name: 'Mastercard', balance: '5400', apr: '24.99', minPayment: '135' },
    { id: nextId++, name: 'Medical bill', balance: '1100', apr: '0', minPayment: '50' },
    { id: nextId++, name: 'Personal loan', balance: '4000', apr: '11.5', minPayment: '120' },
    { id: nextId++, name: 'Car loan', balance: '9800', apr: '6.9', minPayment: '265' },
    { id: nextId++, name: 'Student loan', balance: '12500', apr: '5.5', minPayment: '140' },
    { id: nextId++, name: 'Furniture financing', balance: '1850', apr: '29.99', minPayment: '62' },
  ];
  extra.value = '250';
}

/** Lenient number parsing: tolerates "$", "%", commas, and spaces. */
function parseNumber(raw: string): number {
  const cleaned = raw.replace(/[$,%\s]/g, '');
  if (cleaned === '') return NaN;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

function rowDebt(row: DebtRow, index: number): DebtInput | null {
  const balance = parseNumber(row.balance);
  const apr = parseNumber(row.apr);
  const minPayment = parseNumber(row.minPayment);
  if (!(balance > 0) || !(apr >= 0) || !(minPayment >= 0)) return null;
  return { name: row.name.trim() || `Debt ${index + 1}`, balance, apr, minPayment };
}

const debts = computed<DebtInput[]>(() =>
  rows.value.map(rowDebt).filter((d): d is DebtInput => d !== null),
);

const hasIncompleteRows = computed(() =>
  rows.value.some(
    (row, i) => rowDebt(row, i) === null && (row.name || row.balance || row.apr || row.minPayment),
  ),
);

const extraPerMonth = computed(() => {
  const n = parseNumber(extra.value);
  return n >= 0 ? n : 0;
});

const comparison = computed<Comparison | null>(() =>
  debts.value.length > 0 ? compareMethods(debts.value, extraPerMonth.value) : null,
);

const primary = computed<PlanResult | null>(() =>
  comparison.value ? comparison.value[method.value] : null,
);

const rowWarnings = computed(() =>
  rows.value.map((row, i) => {
    const debt = rowDebt(row, i);
    if (!debt || debt.minPayment === 0 || !minPaymentTooLow(debt)) return null;
    const firstInterest = Math.round((debt.balance * debt.apr) / 12) / 100;
    return (
      `This minimum doesn't cover the ${usd(firstInterest)} of interest this debt adds ` +
      'each month — on its own, the balance grows.'
    );
  }),
);

// ————— formatting —————

const usdFormat = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const usd = (n: number) => usdFormat.format(n);

const monthShort = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' });
const monthLong = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });

/** Calendar month `m` months from now (month 1 = next month). */
function monthDate(m: number): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + m, 1);
}

const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'}`;

// ————— comparison copy —————

const savings = computed(() => {
  const c = comparison.value;
  if (!c) return null;
  if (c.snowball.months === null || c.avalanche.months === null) {
    return 'Neither ordering changes the outcome until the budget covers the interest — try adding a little extra per month.';
  }
  const interest = c.interestSaved;
  const months = c.monthsSaved ?? 0;
  if (interest === 0 && months === 0) {
    return 'On your numbers the two methods tie — pick whichever keeps you motivated.';
  }
  const winner = interest > 0 || (interest === 0 && months > 0) ? 'Avalanche' : 'Snowball';
  const absInterest = Math.abs(interest);
  const absMonths = Math.abs(months);
  const parts: string[] = [];
  if (absInterest > 0) parts.push(usd(absInterest));
  if (absMonths > 0) parts.push(plural(absMonths, 'month'));
  return `${winner} saves you ${parts.join(' and ')}.`;
});

// ————— chart —————

const CHART = { w: 640, h: 280, x0: 52, x1: 628, y0: 14, y1: 244 };

const chart = computed(() => {
  const c = comparison.value;
  if (!c) return null;
  const series = [c.snowball.balancesByMonth, c.avalanche.balancesByMonth];
  const maxMonths = Math.max(series[0].length, series[1].length) - 1;
  if (maxMonths < 1) return null;
  const maxBalance = Math.max(...series[0], ...series[1]);
  if (maxBalance <= 0) return null;

  const yMax = niceCeil(maxBalance);
  const x = (m: number) => CHART.x0 + (m / maxMonths) * (CHART.x1 - CHART.x0);
  const y = (v: number) => CHART.y1 - (v / yMax) * (CHART.y1 - CHART.y0);
  const path = (values: number[]) =>
    values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    value: yMax * f,
    y: y(yMax * f),
    label: '$' + Math.round(yMax * f).toLocaleString('en-US'),
  }));
  const step = [1, 2, 3, 6, 12, 24, 36, 60, 120].find((s) => maxMonths / s <= 8) ?? 120;
  const xTicks: { m: number; x: number }[] = [];
  for (let m = 0; m <= maxMonths; m += step) xTicks.push({ m, x: x(m) });

  return {
    maxMonths,
    x,
    y,
    yTicks,
    xTicks,
    snowballPath: path(series[0]),
    avalanchePath: path(series[1]),
    at: (m: number) => ({
      snowball: series[0][m] ?? 0,
      avalanche: series[1][m] ?? 0,
    }),
  };
});

function niceCeil(v: number): number {
  const power = 10 ** Math.floor(Math.log10(v));
  for (const m of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) {
    if (m * power >= v) return m * power;
  }
  return 10 * power;
}

const svgEl = ref<SVGSVGElement | null>(null);
const hoverMonth = ref<number | null>(null);

function onChartMove(event: PointerEvent) {
  const svg = svgEl.value;
  const c = chart.value;
  if (!svg || !c) return;
  const rect = svg.getBoundingClientRect();
  const vx = ((event.clientX - rect.left) / rect.width) * CHART.w;
  const m = Math.round(((vx - CHART.x0) / (CHART.x1 - CHART.x0)) * c.maxMonths);
  hoverMonth.value = Math.min(Math.max(m, 0), c.maxMonths);
}

const hover = computed(() => {
  const c = chart.value;
  const m = hoverMonth.value;
  if (!c || m === null) return null;
  const balances = c.at(m);
  return {
    m,
    x: c.x(m),
    label: m === 0 ? 'Today' : `Month ${m} · ${monthShort.format(monthDate(m))}`,
    snowball: balances.snowball,
    avalanche: balances.avalanche,
    ySnowball: c.y(balances.snowball),
    yAvalanche: c.y(balances.avalanche),
    leftPct: Math.min(Math.max((c.x(m) / CHART.w) * 100, 14), 86),
  };
});

// ————— month-by-month table —————

const tableRows = computed(() => {
  const c = chart.value;
  if (!c) return [];
  const out = [];
  for (let m = 0; m <= c.maxMonths; m++) {
    const balances = c.at(m);
    out.push({
      m,
      date: m === 0 ? 'Today' : monthShort.format(monthDate(m)),
      snowball: usd(balances.snowball),
      avalanche: usd(balances.avalanche),
    });
  }
  return out;
});
</script>

<template>
  <section aria-label="Debt payoff calculator">
    <!-- Debts -->
    <h2 class="text-xl font-bold tracking-tight">Your debts</h2>
    <div class="mt-4 space-y-3">
      <div
        v-for="(row, i) in rows"
        :key="row.id"
        class="relative rounded-lg border border-slate-200 p-4"
      >
        <button
          v-if="rows.length > 1"
          type="button"
          class="absolute right-2 top-2 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
          :aria-label="`Remove ${row.name.trim() || `debt ${i + 1}`}`"
          @click="removeRow(row.id)"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div class="grid grid-cols-2 gap-3 sm:grid-cols-[2fr_1.2fr_1fr_1.4fr] sm:pr-6">
          <div class="col-span-2 sm:col-span-1">
            <label :for="`debt-${row.id}-name`" class="mb-1 block text-xs font-medium text-slate-600">
              Name <span class="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              :id="`debt-${row.id}-name`"
              v-model="row.name"
              type="text"
              :placeholder="`Debt ${i + 1}`"
              class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-accent-600 focus:outline-none focus:ring-1 focus:ring-accent-600"
            />
          </div>
          <div>
            <label :for="`debt-${row.id}-balance`" class="mb-1 block text-xs font-medium text-slate-600">Balance</label>
            <input
              :id="`debt-${row.id}-balance`"
              v-model="row.balance"
              type="text"
              inputmode="decimal"
              placeholder="$4,500"
              class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-accent-600 focus:outline-none focus:ring-1 focus:ring-accent-600"
            />
          </div>
          <div>
            <label :for="`debt-${row.id}-apr`" class="mb-1 block text-xs font-medium text-slate-600">APR %</label>
            <input
              :id="`debt-${row.id}-apr`"
              v-model="row.apr"
              type="text"
              inputmode="decimal"
              placeholder="19.99"
              class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-accent-600 focus:outline-none focus:ring-1 focus:ring-accent-600"
            />
          </div>
          <div class="col-span-2 sm:col-span-1">
            <label :for="`debt-${row.id}-min`" class="mb-1 block text-xs font-medium text-slate-600">Min. payment / mo</label>
            <input
              :id="`debt-${row.id}-min`"
              v-model="row.minPayment"
              type="text"
              inputmode="decimal"
              placeholder="$110"
              class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-accent-600 focus:outline-none focus:ring-1 focus:ring-accent-600"
            />
          </div>
        </div>

        <p v-if="rowWarnings[i]" class="mt-2 flex items-start gap-1.5 text-xs text-amber-700">
          <svg class="mt-0.5 h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86l-8.02 13.9A2 2 0 004 21h16a2 2 0 001.73-3.24l-8.02-13.9a2 2 0 00-3.42 0z" /></svg>
          <span><strong class="font-semibold">Minimum too low.</strong> {{ rowWarnings[i] }}</span>
        </p>
      </div>
    </div>

    <div class="mt-3 flex flex-wrap items-center gap-4">
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-accent-600 hover:text-accent-600"
        @click="addRow"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14m-7-7h14" /></svg>
        Add a debt
      </button>
      <button
        type="button"
        class="text-sm font-medium text-accent-600 transition-colors hover:text-accent-700"
        @click="loadExample"
      >
        Load example numbers
      </button>
    </div>
    <p v-if="hasIncompleteRows" class="mt-2 text-xs text-slate-500">
      Debts missing a balance, APR, or minimum payment aren't counted yet.
    </p>

    <!-- Extra + method -->
    <div class="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <label for="extra-per-month" class="mb-1 block text-sm font-medium text-slate-700">Extra per month</label>
        <input
          id="extra-per-month"
          v-model="extra"
          type="text"
          inputmode="decimal"
          placeholder="$100"
          class="w-40 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-accent-600 focus:outline-none focus:ring-1 focus:ring-accent-600"
        />
        <p class="mt-1 text-xs text-slate-500">Anything you can put in on top of the minimums.</p>
      </div>
      <div>
        <span id="method-label" class="mb-1 block text-sm font-medium text-slate-700">Payoff method</span>
        <div role="group" aria-labelledby="method-label" class="inline-flex rounded-lg bg-slate-100 p-1">
          <button
            v-for="key in (['snowball', 'avalanche'] as const)"
            :key="key"
            type="button"
            :aria-pressed="method === key"
            class="rounded-md px-4 py-1.5 text-sm transition-colors"
            :class="method === key ? 'bg-white font-semibold text-accent-700 shadow-sm' : 'font-medium text-slate-600 hover:text-slate-900'"
            @click="method = key"
          >
            {{ SERIES[key].label }}
          </button>
        </div>
      </div>
    </div>

    <p v-if="comparison" class="mt-4 text-sm text-slate-600">
      Monthly budget: <strong class="font-semibold text-slate-900">{{ usd(comparison[method].monthlyBudget) }}</strong>
      — every minimum plus your extra. When a debt is paid off, its minimum payment rolls
      into attacking the next one, so the full budget works for you until you're debt-free.
    </p>

    <!-- Results -->
    <div v-if="primary && comparison" class="mt-10">
      <h2 class="text-xl font-bold tracking-tight">Your {{ SERIES[method].label }} plan</h2>

      <div v-if="primary.months !== null" class="mt-4 grid gap-3 sm:grid-cols-2">
        <div class="rounded-lg border border-slate-200 p-5">
          <p class="text-sm text-slate-500">Debt-free</p>
          <p class="mt-1 text-3xl font-bold tracking-tight text-accent-700">{{ monthLong.format(monthDate(primary.months)) }}</p>
          <p class="mt-1 text-sm text-slate-500">in {{ plural(primary.months, 'month') }}</p>
        </div>
        <div class="rounded-lg border border-slate-200 p-5">
          <p class="text-sm text-slate-500">Total interest</p>
          <p class="mt-1 text-3xl font-bold tracking-tight text-slate-900">{{ usd(primary.totalInterest) }}</p>
          <p class="mt-1 text-sm text-slate-500">at {{ usd(primary.monthlyBudget) }}/month</p>
        </div>
      </div>

      <div v-else class="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <svg class="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86l-8.02 13.9A2 2 0 004 21h16a2 2 0 001.73-3.24l-8.02-13.9a2 2 0 00-3.42 0z" /></svg>
        <span>
          <strong class="font-semibold">This plan never clears at the current payment.</strong>
          Interest is growing at least one balance faster than the budget pays it down.
          Adding even a small amount extra per month can turn it around.
        </span>
      </div>

      <!-- Payoff order -->
      <h3 class="mt-8 text-base font-semibold text-slate-900">Payoff order</h3>
      <ol class="mt-3 space-y-2">
        <li
          v-for="(debt, i) in primary.payoffOrder"
          :key="`${debt.name}-${i}`"
          class="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm"
        >
          <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-50 text-xs font-semibold text-accent-700">{{ i + 1 }}</span>
          <span class="min-w-0 flex-1 truncate font-medium text-slate-900">{{ debt.name }}</span>
          <span v-if="debt.paidOffMonth !== null" class="shrink-0 text-slate-500">
            {{ monthShort.format(monthDate(debt.paidOffMonth)) }}
            <span class="text-slate-400">· month {{ debt.paidOffMonth }}</span>
          </span>
          <span v-else class="shrink-0 font-medium text-amber-700">never clears at this payment</span>
        </li>
      </ol>

      <!-- Side-by-side comparison -->
      <h3 class="mt-8 text-base font-semibold text-slate-900">Snowball vs Avalanche on your numbers</h3>
      <div class="mt-3 grid gap-3 sm:grid-cols-2">
        <div
          v-for="key in (['snowball', 'avalanche'] as const)"
          :key="key"
          role="button"
          tabindex="0"
          :aria-pressed="method === key"
          class="cursor-pointer rounded-lg border p-4"
          :class="method === key ? 'border-accent-600 ring-1 ring-accent-600' : 'border-slate-200'"
          @click="method = key"
          @keydown.enter.prevent="method = key"
          @keydown.space.prevent="method = key"
        >
          <p class="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: SERIES[key].color }" aria-hidden="true"></span>
            {{ SERIES[key].label }}
            <span v-if="method === key" class="ml-auto rounded-full bg-accent-50 px-2 py-0.5 text-xs font-medium text-accent-700">your pick</span>
          </p>
          <dl class="mt-3 space-y-1.5 text-sm">
            <div class="flex justify-between gap-4">
              <dt class="text-slate-500">Debt-free</dt>
              <dd class="font-medium text-slate-900">
                {{ comparison[key].months !== null ? `${monthShort.format(monthDate(comparison[key].months!))} · ${plural(comparison[key].months!, 'month')}` : 'never at this payment' }}
              </dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-slate-500">Total interest</dt>
              <dd class="font-medium text-slate-900">{{ usd(comparison[key].totalInterest) }}</dd>
            </div>
          </dl>
        </div>
      </div>
      <p v-if="savings" class="mt-3 text-sm font-medium text-slate-900">{{ savings }}</p>

      <!-- Chart -->
      <div v-if="chart">
        <h3 class="mt-8 text-base font-semibold text-slate-900">Balance over time</h3>
        <div class="mt-1 flex items-center gap-4 text-xs text-slate-600">
          <span v-for="key in (['snowball', 'avalanche'] as const)" :key="key" class="inline-flex items-center gap-1.5">
            <span class="inline-block h-[3px] w-4 rounded-full" :style="{ backgroundColor: SERIES[key].color }" aria-hidden="true"></span>
            {{ SERIES[key].label }}
          </span>
        </div>
        <div class="relative mt-2">
          <svg
            ref="svgEl"
            :viewBox="`0 0 ${CHART.w} ${CHART.h}`"
            class="w-full touch-pan-y select-none"
            role="img"
            aria-label="Line chart of total remaining balance by month for Snowball and Avalanche"
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
            <text :x="(CHART.x0 + CHART.x1) / 2" :y="CHART.h - 2" text-anchor="middle" class="fill-slate-500" font-size="10">Months from today</text>
            <line :x1="CHART.x0" :x2="CHART.x1" :y1="CHART.y1" :y2="CHART.y1" stroke="#cbd5e1" stroke-width="1" />
            <path :d="chart.snowballPath" fill="none" :stroke="SERIES.snowball.color" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" :opacity="method === 'snowball' ? 1 : 0.45" />
            <path :d="chart.avalanchePath" fill="none" :stroke="SERIES.avalanche.color" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" :opacity="method === 'avalanche' ? 1 : 0.45" />
            <g v-if="hover">
              <line :x1="hover.x" :x2="hover.x" :y1="CHART.y0" :y2="CHART.y1" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3 3" />
              <circle :cx="hover.x" :cy="hover.ySnowball" r="4" :fill="SERIES.snowball.color" stroke="#fff" stroke-width="2" />
              <circle :cx="hover.x" :cy="hover.yAvalanche" r="4" :fill="SERIES.avalanche.color" stroke="#fff" stroke-width="2" />
            </g>
          </svg>
          <div
            v-if="hover"
            class="pointer-events-none absolute top-1 -translate-x-1/2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs shadow-md"
            :style="{ left: `${hover.leftPct}%` }"
          >
            <p class="font-semibold text-slate-900">{{ hover.label }}</p>
            <p class="mt-1 flex items-center gap-1.5 text-slate-600">
              <span class="inline-block h-2 w-2 rounded-full" :style="{ backgroundColor: SERIES.snowball.color }"></span>
              Snowball <span class="ml-auto pl-3 font-medium text-slate-900">{{ usd(hover.snowball) }}</span>
            </p>
            <p class="mt-0.5 flex items-center gap-1.5 text-slate-600">
              <span class="inline-block h-2 w-2 rounded-full" :style="{ backgroundColor: SERIES.avalanche.color }"></span>
              Avalanche <span class="ml-auto pl-3 font-medium text-slate-900">{{ usd(hover.avalanche) }}</span>
            </p>
          </div>
        </div>

        <details class="mt-3">
          <summary class="cursor-pointer text-sm font-medium text-slate-600 transition-colors hover:text-accent-600">Month-by-month balances (table)</summary>
          <div class="mt-2 max-h-80 overflow-auto rounded-lg border border-slate-200">
            <table class="w-full min-w-[26rem] text-left text-sm">
              <thead class="sticky top-0 bg-slate-50 text-xs text-slate-600">
                <tr>
                  <th scope="col" class="px-3 py-2 font-medium">Month</th>
                  <th scope="col" class="px-3 py-2 font-medium">Date</th>
                  <th scope="col" class="px-3 py-2 font-medium">Snowball balance</th>
                  <th scope="col" class="px-3 py-2 font-medium">Avalanche balance</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in tableRows" :key="row.m" class="border-t border-slate-100">
                  <td class="px-3 py-1.5 text-slate-500">{{ row.m }}</td>
                  <td class="px-3 py-1.5 text-slate-500">{{ row.date }}</td>
                  <td class="px-3 py-1.5 tabular-nums text-slate-900">{{ row.snowball }}</td>
                  <td class="px-3 py-1.5 tabular-nums text-slate-900">{{ row.avalanche }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </div>

    <p v-else class="mt-10 rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
      Add at least one debt — balance, APR, and minimum payment — and your plan appears here.
    </p>
  </section>
</template>
