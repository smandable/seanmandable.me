<script setup lang="ts">
import { computed, ref } from 'vue';
import BalanceChart from './BalanceChart.vue';
import { simulatePromo, type PromoResult } from '../lib/deferred-interest';
import { SERIES_COLORS, type ChartSeries } from '../lib/chart';
import {
  addMonths,
  ceilCents,
  dateLong,
  fromDateInput,
  monthShort,
  parseNumber,
  pct,
  plural,
  toDateInput,
  usd,
  wholeMonthsBetween,
} from '../lib/calc-format';

// Rendered client-only (the defaults hang off today's date), so `today` is
// the visitor's clock, never the build's.
const today = new Date();

const inputClass =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-accent-600 focus:outline-none focus:ring-1 focus:ring-accent-600';

// A realistic example so the page shows a result before anyone types: a
// $2,400 purchase three months ago on a 12-month promo, nothing paid yet.
const purchase = ref('2400');
const purchaseDate = ref(toDateInput(addMonths(today, -3)));
const apr = ref('29.99');

type PromoLength = '6' | '12' | '18' | '24' | 'custom';
const promoLength = ref<PromoLength>('12');

// Three fields track another value until the visitor edits them: the
// remaining balance follows the purchase amount, the end date follows the
// purchase date plus the promo length, and the payment follows the amount
// that clears the balance in time. Clearing a field hands it back.
const remainingRaw = ref<string | null>(null);
const endDateRaw = ref<string | null>(null);
const paymentRaw = ref<string | null>(null);

const remaining = computed({
  get: () => remainingRaw.value ?? purchase.value,
  set: (v: string) => {
    remainingRaw.value = v === '' ? null : v;
  },
});

const purchaseDateValue = computed(() => fromDateInput(purchaseDate.value));

const derivedEndDate = computed(() => {
  const start = purchaseDateValue.value;
  if (!start || promoLength.value === 'custom') return '';
  return toDateInput(addMonths(start, Number(promoLength.value)));
});

const endDate = computed({
  get: () => endDateRaw.value ?? derivedEndDate.value,
  set: (v: string) => {
    endDateRaw.value = v === '' ? null : v;
    if (v !== '') promoLength.value = 'custom';
  },
});

function onPromoLength(event: Event) {
  const value = (event.target as HTMLSelectElement).value as PromoLength;
  if (value === 'custom') {
    endDateRaw.value = endDate.value || null;
  } else {
    endDateRaw.value = null;
  }
  promoLength.value = value;
}

const endDateValue = computed(() => fromDateInput(endDate.value));

const purchaseAmount = computed(() => parseNumber(purchase.value));
const remainingAmount = computed(() => parseNumber(remaining.value));
const aprValue = computed(() => parseNumber(apr.value));

const monthsLeft = computed(() =>
  endDateValue.value ? wholeMonthsBetween(today, endDateValue.value) : 0,
);

const requiredMonthly = computed(() => {
  const r = remainingAmount.value;
  if (!(r > 0)) return 0;
  return ceilCents(r / Math.max(1, monthsLeft.value));
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
  if (!(purchaseAmount.value > 0)) return 'Enter the purchase amount.';
  if (!(remainingAmount.value >= 0)) return 'Enter what you still owe on the promo.';
  if (remainingAmount.value > purchaseAmount.value)
    return 'What you still owe can’t be more than the purchase amount.';
  if (!purchaseDateValue.value) return 'Enter the purchase date.';
  if (!endDateValue.value) return 'Enter the date the promo ends.';
  if (endDateValue.value <= purchaseDateValue.value)
    return 'The promo has to end after the purchase date.';
  if (!(aprValue.value >= 0)) return 'Enter the card’s standard purchase APR.';
  return null;
});

const result = computed<PromoResult | null>(() => {
  if (error.value || !purchaseDateValue.value || !endDateValue.value) return null;
  return simulatePromo({
    purchaseAmount: purchaseAmount.value,
    remaining: remainingAmount.value,
    purchaseDate: purchaseDateValue.value,
    endDate: endDateValue.value,
    apr: aprValue.value,
    payment: paymentValue.value,
    today,
  });
});

const deadlineText = computed(() => (endDateValue.value ? dateLong.format(endDateValue.value) : ''));

/** Calendar month `m` months from today. */
const monthFromNow = (m: number) => monthShort.format(addMonths(today, m));

const clearsEarlyBy = computed(() => {
  const r = result.value;
  if (!r || r.clearedInMonths === null) return 0;
  return Math.max(0, r.monthsLeft - r.clearedInMonths);
});

// ————— chart —————

const chartSeries = computed<ChartSeries[]>(() => {
  const r = result.value;
  if (!r) return [];
  return [{ key: 'promo', label: 'Promo balance', color: SERIES_COLORS.green, points: r.timeline }];
});

const chartMarkers = computed(() => {
  const r = result.value;
  if (!r) return [];
  const markers = [{ x: r.elapsedMonths, label: 'Today' }];
  if (!r.expired) markers.push({ x: r.deadlineX, label: 'Deadline' });
  return markers;
});

function chartMonthLabel(m: number): string {
  const r = result.value;
  const start = purchaseDateValue.value;
  if (!r || !start) return `Month ${m}`;
  const when = monthShort.format(addMonths(start, m));
  if (m === 0) return `Purchase · ${when}`;
  if (m === r.elapsedMonths) return `Today · ${when}`;
  if (!r.expired && m === r.deadlineX) return `Deadline · ${when}`;
  return `Month ${m} · ${when}`;
}
</script>

<template>
  <section aria-label="Deferred interest calculator">
    <h2 class="text-xl font-bold tracking-tight">Your promo</h2>
    <div class="mt-4 rounded-lg border border-slate-200 p-4 sm:p-5">
      <div class="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3">
        <div>
          <label for="promo-purchase" class="mb-1 block text-xs font-medium text-slate-600">Purchase amount</label>
          <input id="promo-purchase" v-model="purchase" type="text" inputmode="decimal" placeholder="$" :class="inputClass" />
        </div>
        <div>
          <label for="promo-remaining" class="mb-1 block text-xs font-medium text-slate-600">Still owed on it today</label>
          <input id="promo-remaining" v-model="remaining" type="text" inputmode="decimal" placeholder="$" :class="inputClass" />
        </div>
        <div class="col-span-2 sm:col-span-1">
          <label for="promo-apr" class="mb-1 block text-xs font-medium text-slate-600">Card’s standard purchase APR %</label>
          <input id="promo-apr" v-model="apr" type="text" inputmode="decimal" :class="inputClass" />
        </div>
        <div>
          <label for="promo-purchase-date" class="mb-1 block text-xs font-medium text-slate-600">Purchase date</label>
          <input id="promo-purchase-date" v-model="purchaseDate" type="date" :class="inputClass" />
        </div>
        <div>
          <label for="promo-length" class="mb-1 block text-xs font-medium text-slate-600">Promo length</label>
          <select id="promo-length" :value="promoLength" :class="inputClass" @change="onPromoLength">
            <option value="6">6 months</option>
            <option value="12">12 months</option>
            <option value="18">18 months</option>
            <option value="24">24 months</option>
            <option value="custom">Pick the end date</option>
          </select>
        </div>
        <div class="col-span-2 sm:col-span-1">
          <label for="promo-end" class="mb-1 block text-xs font-medium text-slate-600">Promo ends</label>
          <input id="promo-end" v-model="endDate" type="date" :class="inputClass" />
        </div>
      </div>
    </div>

    <div class="mt-6">
      <label for="promo-payment" class="mb-1 block text-sm font-medium text-slate-700">What you’ll pay toward it each month</label>
      <div class="flex flex-wrap items-center gap-3">
        <input id="promo-payment" v-model="payment" type="text" inputmode="decimal" placeholder="$" class="w-40 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-accent-600 focus:outline-none focus:ring-1 focus:ring-accent-600" />
        <button
          v-if="paymentRaw !== null && requiredMonthly > 0"
          type="button"
          class="text-sm font-medium text-accent-600 transition-colors hover:text-accent-700"
          @click="paymentRaw = null"
        >
          Use the amount that clears it in time ({{ usd(requiredMonthly) }})
        </button>
      </div>
      <p class="mt-1 text-xs text-slate-500">
        {{ paymentRaw === null ? 'Prefilled with the payment that clears the promo before the deadline. Change it to see what a smaller payment costs.' : 'Only the part of your payment that reaches the promo balance counts. See the note on two-balance cards below.' }}
      </p>
    </div>

    <p v-if="error" class="mt-8 rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
      {{ error }}
    </p>

    <div v-else-if="result" class="mt-10">
      <!-- Expired -->
      <div v-if="result.expired" class="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <svg class="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86l-8.02 13.9A2 2 0 004 21h16a2 2 0 001.73-3.24l-8.02-13.9a2 2 0 00-3.42 0z" /></svg>
        <span>
          <strong class="font-semibold">This promo ended on {{ deadlineText }}.</strong>
          If the balance wasn’t cleared by then, the card has already billed its deferred interest: on these
          numbers, about <strong class="font-semibold">{{ usd(result.accruedSoFar) }}</strong>. Check the statement
          for the exact figure. What’s left now accrues at {{ pct(aprValue) }} like any other balance.
        </span>
      </div>

      <template v-else>
        <h2 class="text-xl font-bold tracking-tight">What it takes to owe $0 interest</h2>
        <div class="mt-4 grid gap-3 sm:grid-cols-3">
          <div class="rounded-lg border border-slate-200 p-5">
            <p class="text-sm text-slate-500">Months left</p>
            <p class="mt-1 text-3xl font-bold tracking-tight text-slate-900">{{ result.monthsLeft === 0 ? 'Under 1' : result.monthsLeft }}</p>
            <p class="mt-1 text-sm text-slate-500">deadline {{ deadlineText }}</p>
          </div>
          <div class="rounded-lg border border-slate-200 p-5">
            <p class="text-sm text-slate-500">Pay this to owe $0 interest</p>
            <p class="mt-1 text-3xl font-bold tracking-tight text-accent-700">{{ usd(result.requiredMonthly) }}</p>
            <p class="mt-1 text-sm text-slate-500">{{ result.monthsLeft === 0 ? 'now, in one payment' : `a month, for ${plural(result.monthsLeft, 'month')}` }}</p>
          </div>
          <div class="rounded-lg border border-slate-200 p-5">
            <p class="text-sm text-slate-500">Interest deferred so far</p>
            <p class="mt-1 text-3xl font-bold tracking-tight text-slate-900">{{ usd(result.accruedSoFar) }}</p>
            <p class="mt-1 text-sm text-slate-500">accrued since the purchase, billed at once if you miss</p>
          </div>
        </div>

        <h2 class="mt-10 text-xl font-bold tracking-tight">At {{ usd(paymentValue) }} a month</h2>

        <div v-if="result.clearsInTime" class="mt-4 flex items-start gap-2 rounded-lg border border-accent-50 bg-accent-50/40 p-4 text-sm text-slate-800">
          <svg class="mt-0.5 h-4 w-4 shrink-0 text-accent-700" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>
            <strong class="font-semibold">You clear it in time.</strong>
            <template v-if="result.clearedInMonths === 0">Nothing is owed on the promo, so there’s nothing for the card to bill.</template>
            <template v-else>
              The promo balance reaches $0 in {{ plural(result.clearedInMonths!, 'month') }} ({{ monthFromNow(result.clearedInMonths!) }}){{ clearsEarlyBy > 0 ? `, ${plural(clearsEarlyBy, 'month')} before the deadline` : ', right at the deadline' }}.
              The card forgives the <strong class="font-semibold">{{ usd(result.interestWaived) }}</strong> of interest it accrued along the way.
              Total cost of the purchase: {{ usd(result.totalCost) }}, interest $0.00.
            </template>
          </span>
        </div>

        <div v-else class="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <svg class="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86l-8.02 13.9A2 2 0 004 21h16a2 2 0 001.73-3.24l-8.02-13.9a2 2 0 00-3.42 0z" /></svg>
          <span>
            <strong class="font-semibold">You’d miss the deadline.</strong>
            On {{ deadlineText }} you’d still owe {{ usd(result.balanceAtDeadline) }}, and the card would bill
            <strong class="font-semibold">{{ usd(result.lump) }}</strong> of deferred interest at once. From there,
            {{ usd(result.balanceAtDeadline + result.lump) }} keeps accruing at {{ pct(aprValue) }}.
            <template v-if="result.monthsAfterDeadline !== null">
              At this payment it’s paid off {{ plural(result.monthsAfterDeadline, 'month') }} after the deadline, with another
              {{ usd(result.interestAfterDeadline) }} of interest. Total interest: {{ usd(result.totalInterest) }}.
              Total cost of the purchase: {{ usd(result.totalCost) }}, against {{ usd(purchaseAmount) }} if you clear it in time.
            </template>
            <template v-else>
              At this payment it never clears: the interest each month is at least what you pay.
            </template>
          </span>
        </div>

        <!-- In time vs your payment -->
        <h3 class="mt-8 text-base font-semibold text-slate-900">Clearing it in time vs your payment</h3>
        <div class="mt-3 overflow-x-auto rounded-lg border border-slate-200">
          <table class="w-full min-w-[28rem] text-left text-sm">
            <thead class="bg-slate-50 text-xs text-slate-600">
              <tr>
                <th scope="col" class="px-3 py-2 font-medium"></th>
                <th scope="col" class="px-3 py-2 font-medium">Pay it off in time</th>
                <th scope="col" class="px-3 py-2 font-medium">At {{ usd(paymentValue) }} a month</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-t border-slate-100">
                <th scope="row" class="px-3 py-2 font-medium text-slate-600">Monthly payment</th>
                <td class="px-3 py-2 tabular-nums text-slate-900">{{ usd(result.requiredMonthly) }}</td>
                <td class="px-3 py-2 tabular-nums text-slate-900">{{ usd(paymentValue) }}</td>
              </tr>
              <tr class="border-t border-slate-100">
                <th scope="row" class="px-3 py-2 font-medium text-slate-600">Owed at the deadline</th>
                <td class="px-3 py-2 tabular-nums text-slate-900">$0.00</td>
                <td class="px-3 py-2 tabular-nums text-slate-900">{{ usd(result.balanceAtDeadline) }}</td>
              </tr>
              <tr class="border-t border-slate-100">
                <th scope="row" class="px-3 py-2 font-medium text-slate-600">Billed at the deadline</th>
                <td class="px-3 py-2 tabular-nums text-slate-900">$0.00</td>
                <td class="px-3 py-2 tabular-nums" :class="result.lump > 0 ? 'font-semibold text-amber-700' : 'text-slate-900'">{{ usd(result.lump) }}</td>
              </tr>
              <tr class="border-t border-slate-100">
                <th scope="row" class="px-3 py-2 font-medium text-slate-600">Interest after the deadline</th>
                <td class="px-3 py-2 tabular-nums text-slate-900">$0.00</td>
                <td class="px-3 py-2 tabular-nums text-slate-900">{{ result.clearsInTime || result.monthsAfterDeadline !== null ? usd(result.interestAfterDeadline) : 'never clears' }}</td>
              </tr>
              <tr class="border-t border-slate-100">
                <th scope="row" class="px-3 py-2 font-medium text-slate-600">Total interest</th>
                <td class="px-3 py-2 tabular-nums text-slate-900">$0.00</td>
                <td class="px-3 py-2 tabular-nums font-semibold text-slate-900">{{ result.clearsInTime || result.monthsAfterDeadline !== null ? usd(result.totalInterest) : 'never clears' }}</td>
              </tr>
              <tr class="border-t border-slate-100">
                <th scope="row" class="px-3 py-2 font-medium text-slate-600">Total cost of the purchase</th>
                <td class="px-3 py-2 tabular-nums font-semibold text-slate-900">{{ usd(purchaseAmount) }}</td>
                <td class="px-3 py-2 tabular-nums font-semibold text-slate-900">{{ result.clearsInTime || result.monthsAfterDeadline !== null ? usd(result.totalCost) : 'never clears' }}</td>
              </tr>
              <tr class="border-t border-slate-100">
                <th scope="row" class="px-3 py-2 font-medium text-slate-600">Paid off</th>
                <td class="px-3 py-2 text-slate-900">{{ result.monthsLeft === 0 ? 'now' : monthFromNow(result.monthsLeft) }}</td>
                <td class="px-3 py-2 text-slate-900">
                  <template v-if="result.clearsInTime">{{ monthFromNow(result.clearedInMonths!) }}</template>
                  <template v-else-if="result.monthsAfterDeadline !== null">{{ monthFromNow(Math.max(1, result.monthsLeft) + result.monthsAfterDeadline) }}</template>
                  <template v-else>never at this payment</template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="mt-2 text-xs text-slate-500">
          A close estimate. Issuers figure deferred interest on the average daily balance from the purchase date, and terms vary; your card agreement has the exact method.
        </p>
      </template>

      <!-- Chart -->
      <h3 class="mt-8 text-base font-semibold text-slate-900">Promo balance since the purchase</h3>
      <BalanceChart
        :series="chartSeries"
        :markers="chartMarkers"
        x-label="Months since the purchase"
        :month-label="chartMonthLabel"
        aria-label="Line chart of the promo balance by month since the purchase, with the deadline marked"
        table-summary="Month-by-month balance (table)"
      />
    </div>
  </section>
</template>
