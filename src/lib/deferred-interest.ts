/*
 * Deferred-interest promo math for /debt-descent/deferred-interest-calculator.
 *
 * Mirrors the app's PromoMath for the deadline arithmetic (whole calendar
 * months, floored; required monthly = remaining ÷ max(1, months left); under a
 * month left means "pay it all now") and adds the month-step accrual the app
 * leaves to the statement:
 *
 *   1. Interest accrues on each month's opening promo balance at APR/12 and is
 *      held back, not billed.
 *   2. The months already elapsed use a straight line from the purchase amount
 *      to today's remaining balance. The months ahead apply the payment.
 *   3. Any balance left at the deadline triggers the lump: every cent accrued
 *      since the purchase is billed at once, and the leftover plus the lump
 *      keeps accruing at the standard APR (that tail runs through the payoff
 *      engine, so it shares its exact month-step semantics).
 *
 * Pure functions, integer cents throughout.
 */
import { simulatePlan } from './debt-payoff';
import { noon, wholeMonthsBetween } from './calc-format';

export interface PromoInput {
  purchaseAmount: number; // dollars
  remaining: number; // dollars still owed on the promo today
  purchaseDate: Date;
  endDate: Date; // the deferred-interest deadline
  apr: number; // the card's standard purchase APR, percent
  payment: number; // dollars per month from now on
  today?: Date;
}

export interface TimelinePoint {
  /** Months since the purchase. Two points share an x where the lump posts. */
  x: number;
  /** Balance in dollars at the end of that month. */
  y: number;
}

export interface PromoResult {
  /** Whole months from today to the deadline, floored (0 = under a month left). */
  monthsLeft: number;
  /** Whole months from the purchase to today. */
  elapsedMonths: number;
  /** True once the deadline is behind us. */
  expired: boolean;
  /** Monthly payment that clears the remaining balance in time (dollars, rounded up to the cent). */
  requiredMonthly: number;
  /** Deferred interest accrued from the purchase through today (dollars). */
  accruedSoFar: number;
  /** Whether the entered payment clears the promo balance by the deadline. */
  clearsInTime: boolean;
  /** Months from today when the entered payment clears it (only when it does). */
  clearedInMonths: number | null;
  /** Interest the card forgives when the balance clears in time (dollars). */
  interestWaived: number;
  /** Promo balance still owed at the deadline on the entered payment (0 when cleared). */
  balanceAtDeadline: number;
  /** Deferred interest billed at once at the deadline (0 when cleared). */
  lump: number;
  /** Months past the deadline until the leftover plus lump is paid off; null = never at this payment. */
  monthsAfterDeadline: number | null;
  /** Interest at the standard APR after the deadline (dollars). */
  interestAfterDeadline: number;
  /** lump + interestAfterDeadline. */
  totalInterest: number;
  /** purchaseAmount + totalInterest. */
  totalCost: number;
  /** Index into the timeline where the deadline falls. */
  deadlineX: number;
  /** Month-by-month balance from the purchase for the chart. */
  timeline: TimelinePoint[];
}

const toCents = (dollars: number): number => Math.round(dollars * 100);
const toDollars = (cents: number): number => cents / 100;
const monthlyInterest = (balanceCents: number, apr: number): number =>
  Math.round((balanceCents * apr) / 1200);

/** Months of the after-deadline tail drawn on the chart (the engine itself runs to 600). */
const TAIL_CHART_MONTHS = 120;

export function simulatePromo(input: PromoInput): PromoResult {
  const today = noon(input.today ?? new Date());
  const purchase = toCents(Math.max(0, input.purchaseAmount));
  const remaining = toCents(Math.max(0, input.remaining));
  const pay = toCents(Math.max(0, input.payment));
  const apr = Math.max(0, input.apr);

  const elapsedMonths = wholeMonthsBetween(input.purchaseDate, today);
  const monthsLeft = wholeMonthsBetween(today, input.endDate);
  const expired = noon(input.endDate) < today;
  const requiredMonthly =
    remaining > 0 && !expired ? Math.ceil(remaining / Math.max(1, monthsLeft)) : 0;

  // (2) Elapsed months: straight line from the purchase amount to today's balance.
  const timeline: TimelinePoint[] = [];
  let accrued = 0;
  for (let k = 0; k < elapsedMonths; k++) {
    const balance = Math.round(purchase - ((purchase - remaining) * k) / elapsedMonths);
    accrued += monthlyInterest(balance, apr);
    timeline.push({ x: k, y: toDollars(balance) });
  }
  timeline.push({ x: elapsedMonths, y: toDollars(remaining) });
  const accruedSoFar = accrued;

  // Months ahead: at least one payment window unless the deadline has passed.
  const windows = expired ? 0 : Math.max(1, monthsLeft);
  let balance = remaining;
  let clearedInMonths: number | null = remaining === 0 && !expired ? 0 : null;
  for (let m = 1; m <= windows && balance > 0; m++) {
    accrued += monthlyInterest(balance, apr);
    balance -= Math.min(pay, balance);
    timeline.push({ x: elapsedMonths + m, y: toDollars(balance) });
    if (balance === 0) clearedInMonths = m;
  }
  const deadlineX = elapsedMonths + windows;

  const base = {
    monthsLeft,
    elapsedMonths,
    expired,
    requiredMonthly: toDollars(requiredMonthly),
    accruedSoFar: toDollars(accruedSoFar),
    deadlineX,
  };

  if (clearedInMonths !== null) {
    return {
      ...base,
      clearsInTime: true,
      clearedInMonths,
      interestWaived: toDollars(accrued),
      balanceAtDeadline: 0,
      lump: 0,
      monthsAfterDeadline: null,
      interestAfterDeadline: 0,
      totalInterest: 0,
      totalCost: toDollars(purchase),
      timeline,
    };
  }

  // (3) The lump posts, then the leftover plus lump runs on at the standard APR.
  const lump = accrued;
  const owed = balance + lump;
  timeline.push({ x: deadlineX, y: toDollars(owed) });
  const tail = simulatePlan(
    [{ name: 'promo', balance: toDollars(owed), apr, minPayment: toDollars(pay) }],
    'avalanche',
    0,
  );
  tail.balancesByMonth.slice(1, TAIL_CHART_MONTHS + 1).forEach((b, i) => {
    timeline.push({ x: deadlineX + i + 1, y: b });
  });
  const interestAfter = toCents(tail.totalInterest);

  return {
    ...base,
    clearsInTime: false,
    clearedInMonths: null,
    interestWaived: 0,
    balanceAtDeadline: toDollars(balance),
    lump: toDollars(lump),
    monthsAfterDeadline: tail.months,
    interestAfterDeadline: toDollars(interestAfter),
    totalInterest: toDollars(lump + interestAfter),
    totalCost: toDollars(purchase + lump + interestAfter),
    timeline,
  };
}
