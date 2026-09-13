<script setup lang="ts">
import { computed, ref } from 'vue';
import BalanceChart from './BalanceChart.vue';
import { compareDmp, type DmpResult } from '../lib/dmp';
import { minPaymentTooLow, type DebtInput } from '../lib/debt-payoff';
import { SERIES_COLORS, type ChartSeries } from '../lib/chart';
import { monthDate, monthShort, parseNumber, pct, plural, usd } from '../lib/calc-format';

const inputClass =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-accent-600 focus:outline-none focus:ring-1 focus:ring-accent-600';

// ————— your debts —————

type DebtsMode = 'total' | 'each';
const debtsMode = ref<DebtsMode>('total');

// A realistic example so the page shows a result before anyone types.
const totalBalance = ref('18000');
const weightedApr = ref('24');
const totalMinimums = ref('450');

interface DebtRow {
  id: number;
  name: string;
  balance: string;
  apr: string;
  minPayment: string;
}
let nextId = 0;
const row = (name = '', balance = '', apr = '', minPayment = ''): DebtRow => ({ id: nextId++, name, balance, apr, minPayment });
const rows = ref<DebtRow[]>([
  row('Rewards card', '9000', '27', '225'),
  row('Store card', '6000', '22', '150'),
  row('Old card', '3000', '18', '75'),
]);
const MAX_ROWS = 8;

function addRow() {
  if (rows.value.length < MAX_ROWS) rows.value.push(row());
}
function removeRow(id: number) {
  if (rows.value.length > 1) rows.value = rows.value.filter((r) => r.id !== id);
}

function rowDebt(r: DebtRow, index: number): DebtInput | null {
  const balance = parseNumber(r.balance);
  const apr = parseNumber(r.apr);
  const minPayment = parseNumber(r.minPayment);
  if (!(balance > 0) || !(apr >= 0) || !(minPayment >= 0)) return null;
  return { name: r.name.trim() || `Debt ${index + 1}`, balance, apr, minPayment };
}

const debts = computed<DebtInput[]>(() => {
  if (debtsMode.value === 'total') {
    const balance = parseNumber(totalBalance.value);
    const apr = parseNumber(weightedApr.value);
    const minPayment = parseNumber(totalMinimums.value);
    if (!(balance > 0) || !(apr >= 0) || !(minPayment >= 0)) return [];
    return [{ name: 'All enrolled debts', balance, apr, minPayment }];
  }
  return rows.value.map(rowDebt).filter((d): d is DebtInput => d !== null);
});

const hasIncompleteRows = computed(
  () =>
    debtsMode.value === 'each' &&
    rows.value.some((r, i) => rowDebt(r, i) === null && (r.name || r.balance || r.apr || r.minPayment)),
);

const rowWarnings = computed(() =>
  rows.value.map((r, i) => {
    const d = rowDebt(r, i);
    if (!d || d.minPayment === 0 || !minPaymentTooLow(d)) return null;
    return `This minimum doesn’t cover the ${usd(Math.round((d.balance * d.apr) / 12) / 100)} of interest this debt adds each month.`;
  }),
);

// ————— the plan —————

const planApr = ref('8');
const monthlyFee = ref('35');
const setupFee = ref('0');
type PlanMode = 'term' | 'payment';
const planMode = ref<PlanMode>('term');
const termMonths = ref('48');
const planPayment = ref('');

const planAprValue = computed(() => parseNumber(planApr.value));
const monthlyFeeValue = computed(() => parseNumber(monthlyFee.value));
const setupFeeValue = computed(() => parseNumber(setupFee.value));
const termValue = computed(() => parseNumber(termMonths.value));
const planPaymentValue = computed(() => parseNumber(planPayment.value));

const error = computed(() => {
  if (debts.value.length === 0) {
    return debtsMode.value === 'total'
      ? 'Enter your total balance, its APR, and what the minimums add up to.'
      : 'Add at least one debt with a balance, an APR, and a minimum payment.';
  }
  if (!(planAprValue.value >= 0)) return 'Enter the plan’s reduced APR.';
  if (!(monthlyFeeValue.value >= 0)) return 'Enter the monthly plan fee (0 if there isn’t one).';
  if (!(setupFeeValue.value >= 0)) return 'Enter the setup fee (0 if there isn’t one).';
  if (planMode.value === 'term' && !(termValue.value >= 1 && termValue.value <= 600)) return 'Enter the plan term in months.';
  if (planMode.value === 'payment' && !(planPaymentValue.value > monthlyFeeValue.value))
    return 'Enter a monthly plan payment that’s more than the fee.';
  return null;
});

const result = computed<DmpResult | null>(() => {
  if (error.value) return null;
  return compareDmp({
    debts: debts.value,
    planApr: planAprValue.value,
    monthlyFee: monthlyFeeValue.value,
    setupFee: setupFeeValue.value,
    mode: planMode.value,
    termMonths: Math.floor(termValue.value),
    planPayment: planPaymentValue.value,
  });
});

const monthFromNow = (m: number) => monthShort.format(monthDate(m));

const verdict = computed(() => {
  const r = result.value;
  if (!r) return null;
  if (r.saving === null) {
    if (r.dmp.months === null) {
      return {
        tone: 'bad' as const,
        title: 'The plan never clears at this payment.',
        body: `${usd(r.creditorPayment)} a month reaching creditors doesn’t cover the interest on ${usd(r.totalBalance)} even at ${pct(planAprValue.value)}. Raise the payment or shorten the term.`,
      };
    }
    return {
      tone: 'good' as const,
      title: 'On your own, this never clears. The plan does.',
      body: `At ${usd(r.diyOutlay)} a month, the interest at your current rates is at least what you pay. On the plan, ${usd(r.totalBalance)} is gone in ${plural(r.dmp.months, 'month')} for ${usd(r.dmp.interest)} of interest and ${usd(r.dmp.fees)} in fees.`,
    };
  }
  const months = r.monthsSaved ?? 0;
  if (r.saving > 0) {
    const parts = [usd(r.saving)];
    if (months > 0) parts.push(plural(months, 'month'));
    return {
      tone: 'good' as const,
      title: `The plan saves you ${parts.join(' and ')}.`,
      body: `That’s against paying ${usd(r.diyOutlay)} a month on your own at your current rates${r.diyAtMinimums ? ' (your minimums, since the plan’s payment is lower)' : ''}. The plan costs ${usd(r.dmp.interest)} of interest and ${usd(r.dmp.fees)} in fees; on your own it’s ${usd(r.diy.interest)} of interest${months > 0 ? ` and ${plural(months, 'month')} longer` : months < 0 ? `, ${plural(-months, 'month')} sooner` : ''}.`,
    };
  }
  if (r.saving < 0) {
    return {
      tone: 'bad' as const,
      title: `The plan costs you ${usd(-r.saving)} more.`,
      body: `Its fees (${usd(r.dmp.fees)}) outweigh the interest it saves on these numbers. Paying ${usd(r.diyOutlay)} a month on your own at your current rates comes out ahead${months < 0 ? `, and finishes ${plural(-months, 'month')} sooner` : ''}.`,
    };
  }
  return { tone: 'neutral' as const, title: 'The two paths cost the same.', body: 'The fees and the interest saved cancel out on these numbers.' };
});

const diyLabel = computed(() => {
  const r = result.value;
  if (!r) return '';
  return r.diyAtMinimums ? 'On your own, at your minimums' : 'On your own, same outlay';
});

const chartSeries = computed<ChartSeries[]>(() => {
  const r = result.value;
  if (!r) return [];
  const series: ChartSeries[] = [
    { key: 'dmp', label: 'Debt management plan', color: SERIES_COLORS.green, points: r.dmp.balancesByMonth.map((y, x) => ({ x, y })) },
    { key: 'diy', label: diyLabel.value, color: SERIES_COLORS.blue, points: r.diy.balancesByMonth.map((y, x) => ({ x, y })) },
  ];
  if (r.minimumsOnly) {
    series.push({ key: 'min', label: 'Your minimums only', color: SERIES_COLORS.amber, points: r.minimumsOnly.balancesByMonth.map((y, x) => ({ x, y })) });
  }
  return series;
});

function chartMonthLabel(m: number): string {
  return m === 0 ? 'Today' : `Month ${m} · ${monthFromNow(m)}`;
}

const monthsText = (months: number | null) =>
  months === null ? 'never clears' : `${plural(months, 'month')} · ${monthFromNow(months)}`;
</script>

<template>
  <section aria-label="Debt management plan calculator">
    <!-- Debts -->
    <div class="flex flex-wrap items-end justify-between gap-4">
      <h2 class="text-xl font-bold tracking-tight">Your debts</h2>
      <div role="group" aria-label="How to enter your debts" class="inline-flex rounded-lg bg-slate-100 p-1">
        <button
          v-for="opt in ([['total', 'One total'], ['each', 'Debt by debt']] as const)"
          :key="opt[0]"
          type="button"
          :aria-pressed="debtsMode === opt[0]"
          class="rounded-md px-4 py-1.5 text-sm transition-colors"
          :class="debtsMode === opt[0] ? 'bg-white font-semibold text-accent-700 shadow-sm' : 'font-medium text-slate-600 hover:text-slate-900'"
          @click="debtsMode = opt[0]"
        >
          {{ opt[1] }}
        </button>
      </div>
    </div>

    <div v-if="debtsMode === 'total'" class="mt-4 rounded-lg border border-slate-200 p-4 sm:p-5">
      <div class="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3">
        <div>
          <label for="dmp-total" class="mb-1 block text-xs font-medium text-slate-600">Total unsecured balance</label>
          <input id="dmp-total" v-model="totalBalance" type="text" inputmode="decimal" placeholder="$" :class="inputClass" />
        </div>
        <div>
          <label for="dmp-apr" class="mb-1 block text-xs font-medium text-slate-600">Weighted APR %</label>
          <input id="dmp-apr" v-model="weightedApr" type="text" inputmode="decimal" :class="inputClass" />
        </div>
        <div class="col-span-2 sm:col-span-1">
          <label for="dmp-minimums" class="mb-1 block text-xs font-medium text-slate-600">Current minimums, added up / mo</label>
          <input id="dmp-minimums" v-model="totalMinimums" type="text" inputmode="decimal" placeholder="$" :class="inputClass" />
        </div>
      </div>
      <p class="mt-3 text-xs text-slate-500">
        Cards and other unsecured debts you’d enroll. Weight the APR by balance, or switch to debt by debt and let the page do it.
      </p>
    </div>

    <div v-else class="mt-4 space-y-3">
      <div v-for="(r, i) in rows" :key="r.id" class="relative rounded-lg border border-slate-200 p-4">
        <button
          v-if="rows.length > 1"
          type="button"
          class="absolute right-2 top-2 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
          :aria-label="`Remove ${r.name.trim() || `debt ${i + 1}`}`"
          @click="removeRow(r.id)"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-[2fr_1.2fr_1fr_1.4fr] sm:pr-6">
          <div class="col-span-2 sm:col-span-1">
            <label :for="`dmp-debt-${r.id}-name`" class="mb-1 block text-xs font-medium text-slate-600">Name <span class="font-normal text-slate-400">(optional)</span></label>
            <input :id="`dmp-debt-${r.id}-name`" v-model="r.name" type="text" :placeholder="`Debt ${i + 1}`" :class="inputClass" />
          </div>
          <div>
            <label :for="`dmp-debt-${r.id}-balance`" class="mb-1 block text-xs font-medium text-slate-600">Balance</label>
            <input :id="`dmp-debt-${r.id}-balance`" v-model="r.balance" type="text" inputmode="decimal" placeholder="$" :class="inputClass" />
          </div>
          <div>
            <label :for="`dmp-debt-${r.id}-apr`" class="mb-1 block text-xs font-medium text-slate-600">APR %</label>
            <input :id="`dmp-debt-${r.id}-apr`" v-model="r.apr" type="text" inputmode="decimal" :class="inputClass" />
          </div>
          <div class="col-span-2 sm:col-span-1">
            <label :for="`dmp-debt-${r.id}-min`" class="mb-1 block text-xs font-medium text-slate-600">Min. payment / mo</label>
            <input :id="`dmp-debt-${r.id}-min`" v-model="r.minPayment" type="text" inputmode="decimal" placeholder="$" :class="inputClass" />
          </div>
        </div>
        <p v-if="rowWarnings[i]" class="mt-2 flex items-start gap-1.5 text-xs text-amber-700">
          <svg class="mt-0.5 h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86l-8.02 13.9A2 2 0 004 21h16a2 2 0 001.73-3.24l-8.02-13.9a2 2 0 00-3.42 0z" /></svg>
          <span><strong class="font-semibold">Minimum too low.</strong> {{ rowWarnings[i] }}</span>
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-4">
        <button
          v-if="rows.length < MAX_ROWS"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-accent-600 hover:text-accent-600"
          @click="addRow"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14m-7-7h14" /></svg>
          Add a debt
        </button>
        <p v-if="hasIncompleteRows" class="text-xs text-slate-500">Debts missing a balance, APR, or minimum payment aren’t counted yet.</p>
      </div>
    </div>

    <!-- Plan -->
    <h2 class="mt-8 text-xl font-bold tracking-tight">The plan you’ve been offered</h2>
    <div class="mt-4 rounded-lg border border-slate-200 p-4 sm:p-5">
      <div class="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3">
        <div>
          <label for="dmp-plan-apr" class="mb-1 block text-xs font-medium text-slate-600">Plan’s reduced APR %</label>
          <input id="dmp-plan-apr" v-model="planApr" type="text" inputmode="decimal" :class="inputClass" />
          <p class="mt-1 text-xs text-slate-500">Concessions run about 0% to 11% and vary by creditor.</p>
        </div>
        <div>
          <label for="dmp-fee" class="mb-1 block text-xs font-medium text-slate-600">Monthly plan fee</label>
          <input id="dmp-fee" v-model="monthlyFee" type="text" inputmode="decimal" placeholder="$" :class="inputClass" />
          <p class="mt-1 text-xs text-slate-500">Typically $25 to $50, capped by state law, often waived for hardship.</p>
        </div>
        <div class="col-span-2 sm:col-span-1">
          <label for="dmp-setup" class="mb-1 block text-xs font-medium text-slate-600">One-time setup fee</label>
          <input id="dmp-setup" v-model="setupFee" type="text" inputmode="decimal" placeholder="$" :class="inputClass" />
          <p class="mt-1 text-xs text-slate-500">Some agencies charge one; many don’t.</p>
        </div>
      </div>

      <div class="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div>
          <span id="dmp-plan-mode" class="mb-1 block text-xs font-medium text-slate-600">The plan is quoted as</span>
          <div role="group" aria-labelledby="dmp-plan-mode" class="inline-flex rounded-lg bg-slate-100 p-1">
            <button
              v-for="opt in ([['term', 'A term'], ['payment', 'A monthly payment']] as const)"
              :key="opt[0]"
              type="button"
              :aria-pressed="planMode === opt[0]"
              class="rounded-md px-4 py-1.5 text-sm transition-colors"
              :class="planMode === opt[0] ? 'bg-white font-semibold text-accent-700 shadow-sm' : 'font-medium text-slate-600 hover:text-slate-900'"
              @click="planMode = opt[0]"
            >
              {{ opt[1] }}
            </button>
          </div>
        </div>
        <div v-if="planMode === 'term'">
          <label for="dmp-term" class="mb-1 block text-xs font-medium text-slate-600">Plan term, months</label>
          <input id="dmp-term" v-model="termMonths" type="text" inputmode="numeric" class="w-40 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-accent-600 focus:outline-none focus:ring-1 focus:ring-accent-600" />
          <p class="mt-1 text-xs text-slate-500">Plans usually run 36 to 60 months.</p>
        </div>
        <div v-else>
          <label for="dmp-payment" class="mb-1 block text-xs font-medium text-slate-600">Monthly plan payment, fee included</label>
          <input id="dmp-payment" v-model="planPayment" type="text" inputmode="decimal" placeholder="$" class="w-40 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-accent-600 focus:outline-none focus:ring-1 focus:ring-accent-600" />
          <p class="mt-1 text-xs text-slate-500">What leaves your bank each month.</p>
        </div>
      </div>
    </div>

    <p v-if="error" class="mt-8 rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
      {{ error }}
    </p>

    <div v-else-if="result && verdict" class="mt-10">
      <p class="text-sm leading-relaxed text-slate-500">
        Disclosure: I’m a current client of Consolidated Credit’s debt management plan, and I built Debt Descent to track it. Nobody pays me to recommend a DMP, and this calculator doesn’t sell one.
      </p>

      <h2 class="mt-6 text-xl font-bold tracking-tight">The plan vs paying on your own</h2>

      <div
        class="mt-4 flex items-start gap-2 rounded-lg border p-4 text-sm"
        :class="verdict.tone === 'good' ? 'border-accent-50 bg-accent-50/40 text-slate-800' : verdict.tone === 'bad' ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-slate-200 text-slate-800'"
      >
        <svg v-if="verdict.tone === 'good'" class="mt-0.5 h-4 w-4 shrink-0 text-accent-700" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <svg v-else class="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86l-8.02 13.9A2 2 0 004 21h16a2 2 0 001.73-3.24l-8.02-13.9a2 2 0 00-3.42 0z" /></svg>
        <span><strong class="font-semibold">{{ verdict.title }}</strong> {{ verdict.body }}</span>
      </div>

      <div class="mt-4 grid gap-3 sm:grid-cols-3">
        <div class="rounded-lg border border-slate-200 p-5">
          <p class="text-sm text-slate-500">Leaves your bank each month</p>
          <p class="mt-1 text-3xl font-bold tracking-tight text-slate-900">{{ usd(result.draft) }}</p>
          <p class="mt-1 text-sm text-slate-500">{{ usd(result.creditorPayment) }} to creditors, {{ usd(monthlyFeeValue) }} fee</p>
        </div>
        <div class="rounded-lg border border-slate-200 p-5">
          <p class="text-sm text-slate-500">Plan pays off</p>
          <p class="mt-1 text-3xl font-bold tracking-tight text-accent-700">{{ result.dmp.months === null ? 'Never' : monthFromNow(result.dmp.months) }}</p>
          <p class="mt-1 text-sm text-slate-500">{{ result.dmp.months === null ? 'at this payment' : `in ${plural(result.dmp.months, 'month')}` }}</p>
        </div>
        <div class="rounded-lg border border-slate-200 p-5">
          <p class="text-sm text-slate-500">Plan fees over its life</p>
          <p class="mt-1 text-3xl font-bold tracking-tight text-slate-900">{{ usd(result.dmp.fees) }}</p>
          <p class="mt-1 text-sm text-slate-500">{{ setupFeeValue > 0 ? `${usd(setupFeeValue)} setup plus ${usd(monthlyFeeValue)} a month` : `${usd(monthlyFeeValue)} a month, paid to the agency` }}</p>
        </div>
      </div>

      <p v-if="result.diyAtMinimums" class="mt-4 flex items-start gap-1.5 text-sm text-slate-600">
        <svg class="mt-0.5 h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>The plan’s {{ usd(result.draft) }} is less than your minimums add up to ({{ usd(result.totalMinimums) }}). On your own you can’t pay less than the minimums, so the do-it-yourself column runs at {{ usd(result.totalMinimums) }} a month.</span>
      </p>

      <!-- Table -->
      <h3 class="mt-8 text-base font-semibold text-slate-900">Side by side</h3>
      <div class="mt-3 overflow-x-auto rounded-lg border border-slate-200">
        <table class="w-full min-w-[32rem] text-left text-sm">
          <thead class="bg-slate-50 text-xs text-slate-600">
            <tr>
              <th scope="col" class="px-3 py-2 font-medium"></th>
              <th scope="col" class="px-3 py-2 font-semibold text-slate-900">Debt management plan</th>
              <th scope="col" class="px-3 py-2 font-semibold text-slate-900">{{ diyLabel }}</th>
              <th v-if="result.minimumsOnly" scope="col" class="px-3 py-2 font-semibold text-slate-900">Your minimums only</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-t border-slate-100">
              <th scope="row" class="px-3 py-2 font-medium text-slate-600">Each month</th>
              <td class="px-3 py-2 tabular-nums text-slate-900">{{ usd(result.draft) }}</td>
              <td class="px-3 py-2 tabular-nums text-slate-900">{{ usd(result.diyOutlay) }}</td>
              <td v-if="result.minimumsOnly" class="px-3 py-2 tabular-nums text-slate-900">{{ usd(result.totalMinimums) }}</td>
            </tr>
            <tr class="border-t border-slate-100">
              <th scope="row" class="px-3 py-2 font-medium text-slate-600">Interest rate</th>
              <td class="px-3 py-2 tabular-nums text-slate-900">{{ pct(planAprValue) }}</td>
              <td class="px-3 py-2 tabular-nums text-slate-900">your current rates</td>
              <td v-if="result.minimumsOnly" class="px-3 py-2 tabular-nums text-slate-900">your current rates</td>
            </tr>
            <tr class="border-t border-slate-100">
              <th scope="row" class="px-3 py-2 font-medium text-slate-600">Paid off in</th>
              <td class="px-3 py-2 text-slate-900">{{ monthsText(result.dmp.months) }}</td>
              <td class="px-3 py-2 text-slate-900">{{ monthsText(result.diy.months) }}</td>
              <td v-if="result.minimumsOnly" class="px-3 py-2 text-slate-900">{{ monthsText(result.minimumsOnly.months) }}</td>
            </tr>
            <tr class="border-t border-slate-100">
              <th scope="row" class="px-3 py-2 font-medium text-slate-600">Interest</th>
              <td class="px-3 py-2 tabular-nums text-slate-900">{{ usd(result.dmp.interest) }}{{ result.dmp.months === null ? ' and counting' : '' }}</td>
              <td class="px-3 py-2 tabular-nums text-slate-900">{{ usd(result.diy.interest) }}{{ result.diy.months === null ? ' and counting' : '' }}</td>
              <td v-if="result.minimumsOnly" class="px-3 py-2 tabular-nums text-slate-900">{{ usd(result.minimumsOnly.interest) }}{{ result.minimumsOnly.months === null ? ' and counting' : '' }}</td>
            </tr>
            <tr class="border-t border-slate-100">
              <th scope="row" class="px-3 py-2 font-medium text-slate-600">Fees</th>
              <td class="px-3 py-2 tabular-nums text-slate-900">{{ usd(result.dmp.fees) }}</td>
              <td class="px-3 py-2 tabular-nums text-slate-900">$0.00</td>
              <td v-if="result.minimumsOnly" class="px-3 py-2 tabular-nums text-slate-900">$0.00</td>
            </tr>
            <tr class="border-t border-slate-100">
              <th scope="row" class="px-3 py-2 font-medium text-slate-600">Total paid</th>
              <td class="px-3 py-2 tabular-nums font-semibold text-slate-900">{{ result.dmp.totalPaid === null ? 'never clears' : usd(result.dmp.totalPaid) }}</td>
              <td class="px-3 py-2 tabular-nums font-semibold text-slate-900">{{ result.diy.totalPaid === null ? 'never clears' : usd(result.diy.totalPaid) }}</td>
              <td v-if="result.minimumsOnly" class="px-3 py-2 tabular-nums font-semibold text-slate-900">{{ result.minimumsOnly.totalPaid === null ? 'never clears' : usd(result.minimumsOnly.totalPaid) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="mt-2 text-xs text-slate-500">
        Total paid is the {{ usd(result.totalBalance) }} you owe plus interest and fees. On your own, the payment runs as an Avalanche (highest rate first) and stays constant as debts clear, which is what payoff calculators assume; real card minimums shrink as balances fall, so paying only minimums takes longer than the table shows.
      </p>

      <!-- Chart -->
      <h3 class="mt-8 text-base font-semibold text-slate-900">Balance over time</h3>
      <BalanceChart
        :series="chartSeries"
        x-label="Months from today"
        :month-label="chartMonthLabel"
        aria-label="Line chart of the remaining balance by month on the plan and on your own"
      />
    </div>
  </section>
</template>
