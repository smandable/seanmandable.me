/*
 * Debt payoff simulation for the /debt-descent/calculator page.
 *
 * Pure functions, no DOM — all arithmetic in integer cents so results are
 * exact and reproducible. Semantics (must not drift; the page's published
 * example numbers depend on them):
 *
 *   1. Monthly budget = sum of ALL debts' minimums + extra, held constant for
 *      the whole simulation — when a debt closes, its minimum rolls into the
 *      attack payment. That rollover IS the Snowball/Avalanche method.
 *   2. Each month, in order: (a) every open debt accrues interest
 *      = balance × APR/12, rounded to cents; (b) every open debt receives its
 *      minimum, capped at its balance; (c) the remaining budget goes to the
 *      target debt, cascading to the next target within the same month if the
 *      target clears.
 *   3. Targeting — Snowball: smallest balance (tiebreak: higher APR);
 *      Avalanche: highest APR (tiebreak: larger balance).
 *   4. A debt is closed at balance ≤ $0.005 (exactly 0 in cents here). The
 *      simulation caps at 600 months; anything still open "never clears".
 */

export type Method = 'snowball' | 'avalanche';

export const MONTH_CAP = 600;

export interface DebtInput {
  name: string;
  balance: number; // dollars
  apr: number; // percent per year, e.g. 28 for 28%
  minPayment: number; // dollars per month
}

export interface DebtOutcome {
  name: string;
  /** 1-based month the debt reached zero, or null if it never clears. */
  paidOffMonth: number | null;
  /** Interest this debt accrued over the simulated months, in dollars. */
  interestPaid: number;
}

export interface PlanResult {
  method: Method;
  /** Months until every debt is cleared, or null if any never clears. */
  months: number | null;
  /** Interest accrued across all debts over the simulated months, in dollars. */
  totalInterest: number;
  /** One entry per debt, in the order they reached zero (never-clearing debts last). */
  payoffOrder: DebtOutcome[];
  /** Total remaining balance at the end of each month; index 0 = starting balance. */
  balancesByMonth: number[];
  /** The constant monthly budget (all minimums + extra), in dollars. */
  monthlyBudget: number;
}

const toCents = (dollars: number): number => Math.round(dollars * 100);
const toDollars = (cents: number): number => cents / 100;

/** One month of interest on a balance, in cents, rounded to the nearest cent. */
const monthlyInterest = (balanceCents: number, apr: number): number =>
  Math.round((balanceCents * apr) / 1200);

/**
 * True when the debt's minimum payment doesn't cover its first month's
 * interest — at its minimum alone, the balance grows instead of shrinking.
 */
export function minPaymentTooLow(debt: DebtInput): boolean {
  return toCents(debt.minPayment) < monthlyInterest(toCents(debt.balance), debt.apr);
}

function pickTarget(
  open: number[],
  balances: number[],
  debts: DebtInput[],
  method: Method,
): number {
  let target = -1;
  for (const i of open) {
    if (balances[i] <= 0) continue;
    if (target === -1) {
      target = i;
      continue;
    }
    if (method === 'snowball') {
      if (
        balances[i] < balances[target] ||
        (balances[i] === balances[target] && debts[i].apr > debts[target].apr)
      ) {
        target = i;
      }
    } else {
      if (
        debts[i].apr > debts[target].apr ||
        (debts[i].apr === debts[target].apr && balances[i] > balances[target])
      ) {
        target = i;
      }
    }
  }
  return target;
}

export function simulatePlan(debts: DebtInput[], method: Method, extraPerMonth: number): PlanResult {
  const balances = debts.map((d) => toCents(d.balance));
  const minimums = debts.map((d) => toCents(d.minPayment));
  const budget = minimums.reduce((sum, m) => sum + m, 0) + toCents(extraPerMonth);

  const interestPaid = debts.map(() => 0);
  const paidOffMonth: (number | null)[] = debts.map(() => null);
  const closeOrder: number[] = [];
  const balancesByMonth = [balances.reduce((sum, b) => sum + b, 0)];
  let totalInterest = 0;
  let month = 0;

  const close = (i: number) => {
    paidOffMonth[i] = month;
    closeOrder.push(i);
  };

  while (month < MONTH_CAP && balances.some((b) => b > 0)) {
    month++;
    const open = balances.flatMap((b, i) => (b > 0 ? [i] : []));

    // (a) Interest accrues on every open debt.
    for (const i of open) {
      const interest = monthlyInterest(balances[i], debts[i].apr);
      balances[i] += interest;
      interestPaid[i] += interest;
      totalInterest += interest;
    }

    // (b) Every open debt gets its minimum, capped at its balance. Whatever a
    // cap leaves unspent stays in the budget and joins the attack below.
    let remaining = budget;
    for (const i of open) {
      const payment = Math.min(minimums[i], balances[i]);
      balances[i] -= payment;
      remaining -= payment;
      if (balances[i] === 0) close(i);
    }

    // (c) The rest of the budget attacks the target debt, cascading to the
    // next target within the same month whenever the target clears.
    while (remaining > 0) {
      const target = pickTarget(open, balances, debts, method);
      if (target === -1) break;
      const payment = Math.min(remaining, balances[target]);
      balances[target] -= payment;
      remaining -= payment;
      if (balances[target] === 0) close(target);
    }

    balancesByMonth.push(balances.reduce((sum, b) => sum + b, 0));
  }

  const cleared = balances.every((b) => b <= 0);
  const stillOpen = debts.flatMap((_, i) => (paidOffMonth[i] === null ? [i] : []));

  return {
    method,
    months: cleared ? month : null,
    totalInterest: toDollars(totalInterest),
    payoffOrder: [...closeOrder, ...stillOpen].map((i) => ({
      name: debts[i].name,
      paidOffMonth: paidOffMonth[i],
      interestPaid: toDollars(interestPaid[i]),
    })),
    balancesByMonth: balancesByMonth.map(toDollars),
    monthlyBudget: toDollars(budget),
  };
}

export interface Comparison {
  snowball: PlanResult;
  avalanche: PlanResult;
  /** Positive when Avalanche pays less interest than Snowball, in dollars. */
  interestSaved: number;
  /** Positive when Avalanche finishes sooner, or null if either plan never clears. */
  monthsSaved: number | null;
}

export function compareMethods(debts: DebtInput[], extraPerMonth: number): Comparison {
  const snowball = simulatePlan(debts, 'snowball', extraPerMonth);
  const avalanche = simulatePlan(debts, 'avalanche', extraPerMonth);
  return {
    snowball,
    avalanche,
    interestSaved: Math.round((snowball.totalInterest - avalanche.totalInterest) * 100) / 100,
    monthsSaved:
      snowball.months !== null && avalanche.months !== null
        ? snowball.months - avalanche.months
        : null,
  };
}
