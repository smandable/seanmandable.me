/*
 * Balance-transfer break-even math for /debt-descent/balance-transfer-calculator.
 *
 * Both paths run through the payoff engine (src/lib/debt-payoff.ts) with the
 * same monthly payment, so they share its exact month-step semantics:
 *
 *   Stay:     the balance at its current APR until paid off.
 *   Transfer: the balance plus the fee at 0% for the promo months, then
 *             whatever is left at the after-promo APR until paid off.
 *
 * Pure functions; dollars in, dollars out (the engine keeps integer cents).
 */
import { simulatePlan } from './debt-payoff';
import { ceilCents, roundCents } from './calc-format';

export interface TransferInput {
  balance: number; // dollars to move
  apr: number; // current APR, percent
  feePct: number; // transfer fee, percent of the balance
  promoMonths: number; // 0% intro period
  afterApr: number; // APR once the promo ends, percent
  payment: number; // dollars per month, applied to both paths
}

export interface PathResult {
  /** Months to pay off, or null if it never clears at this payment. */
  months: number | null;
  /** Total interest, dollars. */
  interest: number;
  /** Principal (plus fee on the transfer path) plus interest, dollars; null if it never clears. */
  totalPaid: number | null;
  /** Remaining balance at the end of each month; index 0 = start. */
  balancesByMonth: number[];
  /** Cumulative interest through the end of each month; index 0 = 0. */
  interestByMonth: number[];
}

export interface TransferResult {
  /** The fee in dollars. */
  fee: number;
  /** balance + fee: what the new card starts at. */
  transferred: number;
  stay: PathResult;
  transfer: PathResult;
  /** stay.totalPaid − transfer.totalPaid: positive when the transfer saves money; null if either never clears. */
  netSaving: number | null;
  /** stay.months − transfer.months: positive when the transfer finishes sooner; null if either never clears. */
  monthsSaved: number | null;
  /** First month the interest avoided exceeds the fee; null if it never does. */
  breakEvenMonth: number | null;
  /** Whether the payment clears the transferred balance inside the promo. */
  clearsInPromo: boolean;
  /** What is left when the promo ends (0 when cleared inside it). */
  leftAtPromoEnd: number;
  /** The payment that clears the transferred balance inside the promo, rounded up to the cent. */
  requiredMonthly: number;
  /** Payment is below about 1% of the balance, i.e. under a typical minimum. */
  paymentTooLow: boolean;
}

function runPath(balance: number, apr: number, payment: number): PathResult {
  const plan = simulatePlan([{ name: 'balance', balance, apr, minPayment: payment }], 'avalanche', 0);
  return {
    months: plan.months,
    interest: plan.totalInterest,
    totalPaid: plan.months === null ? null : roundCents(balance + plan.totalInterest),
    balancesByMonth: plan.balancesByMonth,
    interestByMonth: plan.interestByMonth,
  };
}

export function compareTransfer(input: TransferInput): TransferResult {
  const balance = Math.max(0, input.balance);
  const payment = Math.max(0, input.payment);
  const promoMonths = Math.max(0, Math.floor(input.promoMonths));
  const fee = roundCents((balance * Math.max(0, input.feePct)) / 100);
  const transferred = roundCents(balance + fee);

  const stay = runPath(balance, Math.max(0, input.apr), payment);

  // Transfer, phase 1: 0% for the promo months.
  const promo = runPath(transferred, 0, payment);
  const clearsInPromo = promo.months !== null && promo.months <= promoMonths;
  let transfer: PathResult;
  let leftAtPromoEnd = 0;
  if (clearsInPromo) {
    transfer = promo;
  } else {
    // Phase 2: whatever is left reverts to the after-promo APR.
    leftAtPromoEnd = promo.balancesByMonth[promoMonths] ?? transferred;
    const tail = runPath(leftAtPromoEnd, Math.max(0, input.afterApr), payment);
    transfer = {
      months: tail.months === null ? null : promoMonths + tail.months,
      interest: tail.interest,
      totalPaid: tail.months === null ? null : roundCents(transferred + tail.interest),
      balancesByMonth: [...promo.balancesByMonth.slice(0, promoMonths + 1), ...tail.balancesByMonth.slice(1)],
      interestByMonth: [
        ...promo.interestByMonth.slice(0, promoMonths + 1),
        ...tail.interestByMonth.slice(1),
      ],
    };
  }

  // Break-even: the first month the stay path's interest outruns the transfer
  // path's interest by more than the fee.
  let breakEvenMonth: number | null = null;
  const horizon = Math.max(stay.interestByMonth.length, transfer.interestByMonth.length);
  for (let m = 1; m < horizon; m++) {
    const stayInterest = stay.interestByMonth[Math.min(m, stay.interestByMonth.length - 1)];
    const transferInterest = transfer.interestByMonth[Math.min(m, transfer.interestByMonth.length - 1)];
    if (stayInterest - transferInterest > fee) {
      breakEvenMonth = m;
      break;
    }
  }

  const both = stay.totalPaid !== null && transfer.totalPaid !== null;
  return {
    fee,
    transferred,
    stay,
    transfer,
    netSaving: both ? roundCents(stay.totalPaid! - transfer.totalPaid!) : null,
    monthsSaved: both ? stay.months! - transfer.months! : null,
    breakEvenMonth,
    clearsInPromo,
    leftAtPromoEnd,
    requiredMonthly: promoMonths > 0 ? ceilCents(transferred / promoMonths) : transferred,
    paymentTooLow: balance > 0 && payment < balance * 0.01,
  };
}
