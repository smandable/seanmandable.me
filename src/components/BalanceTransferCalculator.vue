<script setup lang="ts">
import { computed, ref } from 'vue';
import BalanceChart from './BalanceChart.vue';
import { compareTransfer, type TransferResult } from '../lib/balance-transfer';
import { SERIES_COLORS, type ChartSeries } from '../lib/chart';
import { ceilCents, monthDate, monthShort, parseNumber, pct, plural, usd } from '../lib/calc-format';

const inputClass =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-accent-600 focus:outline-none focus:ring-1 focus:ring-accent-600';

// A realistic example so the page shows a result before anyone types.
const balance = ref('6000');
const apr = ref('24.99');
const feePct = ref('3');
const promoMonths = ref('15');

// Two fields track another value until the visitor edits them: the after-promo
// APR follows the current APR, and the payment follows the amount that clears
// the transferred balance inside the promo. Clearing a field hands it back.
const afterAprRaw = ref<string | null>(null);
const paymentRaw = ref<string | null>(null);

const afterApr = computed({
  get: () => afterAprRaw.value ?? apr.value,
  set: (v: string) => {
    afterAprRaw.value = v === '' ? null : v;
  },
});

const balanceValue = computed(() => parseNumber(balance.value));
const aprValue = computed(() => parseNumber(apr.value));
const feeValue = computed(() => parseNumber(feePct.value));
const promoValue = computed(() => parseNumber(promoMonths.value));
const afterAprValue = computed(() => parseNumber(afterApr.value));

const requiredMonthly = computed(() => {
  if (!(balanceValue.value > 0) || !(feeValue.value >= 0) || !(promoValue.value >= 1)) return 0;
  return ceilCents((balanceValue.value * (1 + feeValue.value / 100)) / Math.floor(promoValue.value));
});

const payment = computed({
  get: () => paymentRaw.value ?? requiredMonthly.value.toFixed(2),
  set: (v: string) => {
    paymentRaw.value = v === '' ? null : v;
  },
});
const paymentValue = computed(() => {
  const n = paymentRaw.value === null ? requiredMonthly.value : parseNumber(paymentRaw.value);
  return n >= 0 ? n : 0;
});

const error = computed(() => {
  if (!(balanceValue.value > 0)) return 'Enter the balance you’d transfer.';
  if (!(aprValue.value >= 0)) return 'Enter the APR you’re paying now.';
  if (!(feeValue.value >= 0)) return 'Enter the transfer fee.';
  if (!(promoValue.value >= 1)) return 'Enter the length of the 0% period in months.';
  if (!(afterAprValue.value >= 0)) return 'Enter the APR after the promo.';
  if (!(paymentValue.value > 0)) return 'Enter a monthly payment.';
  return null;
});

const result = computed<TransferResult | null>(() => {
  if (error.value) return null;
  return compareTransfer({
    balance: balanceValue.value,
    apr: aprValue.value,
    feePct: feeValue.value,
    promoMonths: promoValue.value,
    afterApr: afterAprValue.value,
    payment: paymentValue.value,
  });
});

const monthFromNow = (m: number) => monthShort.format(monthDate(m));

const verdict = computed(() => {
  const r = result.value;
  if (!r) return null;
  if (r.netSaving === null) {
    if (r.stay.months === null && r.transfer.months !== null) {
      return {
        tone: 'good' as const,
        title: 'Transferring is the only way this clears.',
        body: `At ${usd(paymentValue.value)} a month the balance never clears at ${pct(aprValue.value)}: the interest each month is at least what you pay. On the new card it’s paid off in ${plural(r.transfer.months, 'month')} with ${usd(r.transfer.interest)} of interest, plus the ${usd(r.fee)} fee.`,
      };
    }
    if (r.transfer.months === null && r.stay.months !== null) {
      return {
        tone: 'bad' as const,
        title: 'The transfer never clears at this payment.',
        body: `Once the promo ends, ${usd(r.leftAtPromoEnd)} is left at ${pct(afterAprValue.value)}, and ${usd(paymentValue.value)} a month doesn’t cover its interest. Staying put clears in ${plural(r.stay.months, 'month')}. Raise the payment, or only transfer what you can clear inside the promo.`,
      };
    }
    return {
      tone: 'bad' as const,
      title: 'Neither path clears at this payment.',
      body: `${usd(paymentValue.value)} a month doesn’t cover the interest either way. The payment that clears the transferred balance inside the promo is ${usd(r.requiredMonthly)}.`,
    };
  }
  const saving = r.netSaving;
  const months = r.monthsSaved ?? 0;
  if (saving > 0) {
    const parts = [usd(saving)];
    if (months > 0) parts.push(plural(months, 'month'));
    return {
      tone: 'good' as const,
      title: `The transfer saves you ${parts.join(' and ')}.`,
      body: `You pay the ${usd(r.fee)} fee up front and avoid ${usd(r.stay.interest - r.transfer.interest)} of interest. The fee is recovered in month ${r.breakEvenMonth ?? '?'}${r.breakEvenMonth ? ` (${monthFromNow(r.breakEvenMonth)})` : ''}; after that, every month is money kept.`,
    };
  }
  if (saving < 0) {
    return {
      tone: 'bad' as const,
      title: `The transfer costs you ${usd(-saving)} more.`,
      body: `The ${usd(r.fee)} fee is bigger than the ${usd(r.stay.interest - r.transfer.interest)} of interest it avoids on these numbers. Staying put and paying ${usd(paymentValue.value)} a month is the cheaper path.`,
    };
  }
  return {
    tone: 'neutral' as const,
    title: 'The two paths cost the same.',
    body: 'The fee and the interest it avoids cancel out on these numbers.',
  };
});

// ————— chart —————

const chartSeries = computed<ChartSeries[]>(() => {
  const r = result.value;
  if (!r) return [];
  return [
    {
      key: 'stay',
      label: 'Stay put',
      color: SERIES_COLORS.blue,
      points: r.stay.balancesByMonth.map((y, x) => ({ x, y })),
    },
    {
      key: 'transfer',
      label: 'Transfer',
      color: SERIES_COLORS.green,
      points: r.transfer.balancesByMonth.map((y, x) => ({ x, y })),
    },
  ];
});

const chartMarkers = computed(() => {
  const r = result.value;
  if (!r) return [];
  const markers = [{ x: Math.floor(promoValue.value), label: 'Promo ends' }];
  if (r.breakEvenMonth !== null && r.breakEvenMonth !== Math.floor(promoValue.value)) {
    markers.push({ x: r.breakEvenMonth, label: 'Break-even' });
  }
  return markers;
});

function chartMonthLabel(m: number): string {
  return m === 0 ? 'Today' : `Month ${m} · ${monthFromNow(m)}`;
}
</script>

<template>
  <section aria-label="Balance transfer calculator">
    <h2 class="text-xl font-bold tracking-tight">The offer</h2>
    <div class="mt-4 rounded-lg border border-slate-200 p-4 sm:p-5">
      <div class="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3">
        <div>
          <label for="bt-balance" class="mb-1 block text-xs font-medium text-slate-600">Balance to transfer</label>
          <input id="bt-balance" v-model="balance" type="text" inputmode="decimal" placeholder="$" :class="inputClass" />
        </div>
        <div>
          <label for="bt-apr" class="mb-1 block text-xs font-medium text-slate-600">APR you pay now %</label>
          <input id="bt-apr" v-model="apr" type="text" inputmode="decimal" :class="inputClass" />
        </div>
        <div class="col-span-2 sm:col-span-1">
          <label for="bt-fee" class="mb-1 block text-xs font-medium text-slate-600">Transfer fee %</label>
          <select id="bt-fee" v-model="feePct" :class="inputClass">
            <option value="0">0%</option>
            <option value="3">3%</option>
            <option value="4">4%</option>
            <option value="5">5%</option>
          </select>
        </div>
        <div>
          <label for="bt-promo" class="mb-1 block text-xs font-medium text-slate-600">0% period</label>
          <select id="bt-promo" v-model="promoMonths" :class="inputClass">
            <option value="6">6 months</option>
            <option value="9">9 months</option>
            <option value="12">12 months</option>
            <option value="15">15 months</option>
            <option value="18">18 months</option>
            <option value="21">21 months</option>
            <option value="24">24 months</option>
          </select>
        </div>
        <div>
          <label for="bt-after" class="mb-1 block text-xs font-medium text-slate-600">APR after the promo %</label>
          <input id="bt-after" v-model="afterApr" type="text" inputmode="decimal" :class="inputClass" />
        </div>
        <div class="col-span-2 sm:col-span-1">
          <label for="bt-payment" class="mb-1 block text-xs font-medium text-slate-600">Your monthly payment</label>
          <input id="bt-payment" v-model="payment" type="text" inputmode="decimal" placeholder="$" :class="inputClass" />
        </div>
      </div>
      <p class="mt-3 text-xs text-slate-500">
        <template v-if="paymentRaw === null">
          The payment is prefilled with the amount that clears the transferred balance inside the promo. The same payment is applied to both paths.
        </template>
        <template v-else>
          The same payment is applied to both paths.
          <button
            v-if="requiredMonthly > 0"
            type="button"
            class="font-medium text-accent-600 transition-colors hover:text-accent-700"
            @click="paymentRaw = null"
          >
            Use the amount that clears it inside the promo ({{ usd(requiredMonthly) }})
          </button>
        </template>
      </p>
    </div>

    <p v-if="error" class="mt-8 rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
      {{ error }}
    </p>

    <div v-else-if="result && verdict" class="mt-10">
      <h2 class="text-xl font-bold tracking-tight">Transfer or stay put</h2>

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
          <p class="text-sm text-slate-500">Transfer fee</p>
          <p class="mt-1 text-3xl font-bold tracking-tight text-slate-900">{{ usd(result.fee) }}</p>
          <p class="mt-1 text-sm text-slate-500">{{ pct(feeValue) }} of {{ usd(balanceValue) }}, added to the new balance</p>
        </div>
        <div class="rounded-lg border border-slate-200 p-5">
          <p class="text-sm text-slate-500">Break-even</p>
          <p class="mt-1 text-3xl font-bold tracking-tight text-slate-900">{{ result.breakEvenMonth === null ? 'Never' : `Month ${result.breakEvenMonth}` }}</p>
          <p class="mt-1 text-sm text-slate-500">{{ result.breakEvenMonth === null ? 'the interest avoided never tops the fee' : `${monthFromNow(result.breakEvenMonth)}: interest avoided passes the fee` }}</p>
        </div>
        <div class="rounded-lg border border-slate-200 p-5">
          <p class="text-sm text-slate-500">To clear it inside the promo</p>
          <p class="mt-1 text-3xl font-bold tracking-tight text-accent-700">{{ usd(result.requiredMonthly) }}</p>
          <p class="mt-1 text-sm text-slate-500">a month for {{ plural(Math.floor(promoValue), 'month') }}, then nothing</p>
        </div>
      </div>

      <!-- Warnings -->
      <ul v-if="result.paymentTooLow || !result.clearsInPromo" class="mt-4 space-y-2">
        <li v-if="result.paymentTooLow" class="flex items-start gap-1.5 text-sm text-amber-700">
          <svg class="mt-0.5 h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86l-8.02 13.9A2 2 0 004 21h16a2 2 0 001.73-3.24l-8.02-13.9a2 2 0 00-3.42 0z" /></svg>
          <span><strong class="font-semibold">That payment is under 1% of the balance.</strong> Most cards set the minimum around 1% of the balance plus interest, so the card will ask for more than this.</span>
        </li>
        <li v-if="!result.clearsInPromo" class="flex items-start gap-1.5 text-sm text-amber-700">
          <svg class="mt-0.5 h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86l-8.02 13.9A2 2 0 004 21h16a2 2 0 001.73-3.24l-8.02-13.9a2 2 0 00-3.42 0z" /></svg>
          <span>
            <strong class="font-semibold">This payment doesn’t clear it inside the promo.</strong>
            When the 0% period ends, {{ usd(result.leftAtPromoEnd) }} is left and starts accruing at {{ pct(afterAprValue) }}.
            <template v-if="result.transfer.months !== null">That tail costs {{ usd(result.transfer.interest) }} of interest before it’s gone.</template>
            <template v-else>At this payment that tail never clears.</template>
          </span>
        </li>
      </ul>

      <!-- Side by side -->
      <h3 class="mt-8 text-base font-semibold text-slate-900">The two paths on your numbers</h3>
      <div class="mt-3 grid gap-3 sm:grid-cols-2">
        <div class="rounded-lg border border-slate-200 p-4">
          <p class="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: SERIES_COLORS.blue }" aria-hidden="true"></span>
            Stay put at {{ pct(aprValue) }}
          </p>
          <dl class="mt-3 space-y-1.5 text-sm">
            <div class="flex justify-between gap-4"><dt class="text-slate-500">Starting balance</dt><dd class="font-medium text-slate-900">{{ usd(balanceValue) }}</dd></div>
            <div class="flex justify-between gap-4"><dt class="text-slate-500">Fee</dt><dd class="font-medium text-slate-900">$0.00</dd></div>
            <div class="flex justify-between gap-4"><dt class="text-slate-500">Interest</dt><dd class="font-medium text-slate-900">{{ usd(result.stay.interest) }}{{ result.stay.months === null ? ' and counting' : '' }}</dd></div>
            <div class="flex justify-between gap-4"><dt class="text-slate-500">Paid off</dt><dd class="font-medium text-slate-900">{{ result.stay.months === null ? 'never at this payment' : `${monthFromNow(result.stay.months)} · ${plural(result.stay.months, 'month')}` }}</dd></div>
            <div class="flex justify-between gap-4 border-t border-slate-100 pt-1.5"><dt class="text-slate-500">Total paid</dt><dd class="font-semibold text-slate-900">{{ result.stay.totalPaid === null ? '—' : usd(result.stay.totalPaid) }}</dd></div>
          </dl>
        </div>
        <div class="rounded-lg border border-slate-200 p-4">
          <p class="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: SERIES_COLORS.green }" aria-hidden="true"></span>
            Transfer: 0% for {{ plural(Math.floor(promoValue), 'month') }}, then {{ pct(afterAprValue) }}
          </p>
          <dl class="mt-3 space-y-1.5 text-sm">
            <div class="flex justify-between gap-4"><dt class="text-slate-500">Starting balance</dt><dd class="font-medium text-slate-900">{{ usd(result.transferred) }}</dd></div>
            <div class="flex justify-between gap-4"><dt class="text-slate-500">Fee</dt><dd class="font-medium text-slate-900">{{ usd(result.fee) }}</dd></div>
            <div class="flex justify-between gap-4"><dt class="text-slate-500">Interest</dt><dd class="font-medium text-slate-900">{{ usd(result.transfer.interest) }}{{ result.transfer.months === null ? ' and counting' : '' }}</dd></div>
            <div class="flex justify-between gap-4"><dt class="text-slate-500">Paid off</dt><dd class="font-medium text-slate-900">{{ result.transfer.months === null ? 'never at this payment' : `${monthFromNow(result.transfer.months)} · ${plural(result.transfer.months, 'month')}` }}</dd></div>
            <div class="flex justify-between gap-4 border-t border-slate-100 pt-1.5"><dt class="text-slate-500">Total paid</dt><dd class="font-semibold text-slate-900">{{ result.transfer.totalPaid === null ? '—' : usd(result.transfer.totalPaid) }}</dd></div>
          </dl>
        </div>
      </div>
      <p class="mt-2 text-xs text-slate-500">
        Total paid is the balance plus the fee plus the interest. Both paths get {{ usd(paymentValue) }} a month until the balance is gone.
      </p>

      <!-- Chart -->
      <h3 class="mt-8 text-base font-semibold text-slate-900">Balance over time</h3>
      <BalanceChart
        :series="chartSeries"
        :markers="chartMarkers"
        x-label="Months from today"
        :month-label="chartMonthLabel"
        aria-label="Line chart of the remaining balance by month for staying put and for transferring"
      />
    </div>
  </section>
</template>
