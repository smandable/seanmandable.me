/*
 * "Will a DMP save me money?" math for /debt-descent/dmp-calculator.
 *
 * Three paths, all through the payoff engine (src/lib/debt-payoff.ts) so they
 * share its exact month-step semantics:
 *
 *   DMP:       every enrolled balance at the plan's reduced APR, paid with the
 *              plan's creditor payment (amortized over the term, or what is
 *              left of the payment you enter after the monthly fee), plus the
 *              fee each month and any one-time setup fee.
 *   DIY:       the same monthly outlay as the plan's draft, run as an
 *              Avalanche at the current APRs. When the draft is below what
 *              the minimums add up to, the DIY path runs at the minimums,
 *              since you can't pay less than those on your own.
 *   Minimums:  the current minimums only (held constant with rollover, the
 *              way payoff calculators assume; real card minimums shrink as
 *              balances fall, which takes longer). Omitted when identical to DIY.
 *
 * Pure functions; dollars in, dollars out.
 */
import { simulatePlan, type DebtInput } from './debt-payoff';
import { ceilCents, roundCents } from './calc-format';

export interface DmpInput {
  /** One row for the totals mode (weighted APR, total minimums) or up to eight debts. */
  debts: DebtInput[];
  /** The plan's reduced APR, percent, applied to every enrolled balance. */
  planApr: number;
  /** Monthly plan fee, dollars. */
  monthlyFee: number;
  /** One-time setup fee, dollars. */
  setupFee: number;
  /** 'term': amortize over termMonths. 'payment': planPayment is the monthly draft, fee included. */
  mode: 'term' | 'payment';
  termMonths: number;
  planPayment: number;
}

export interface PathSummary {
  months: number | null;
  interest: number;
  fees: number;
  /** balance + interest + fees; null if it never clears. */
  totalPaid: number | null;
  balancesByMonth: number[];
}

export interface DmpResult {
  totalBalance: number;
  totalMinimums: number;
  /** What reaches creditors each month on the plan. */
  creditorPayment: number;
  /** What leaves your bank each month: creditorPayment + monthlyFee. */
  draft: number;
  dmp: PathSummary;
  diy: PathSummary;
  /** Monthly outlay the DIY path ran at (the draft, or the minimums when the draft is lower). */
  diyOutlay: number;
  /** True when the draft is below the minimums, so DIY ran at the minimums instead. */
  diyAtMinimums: boolean;
  /** The minimums-only line; null when it would duplicate the DIY path. */
  minimumsOnly: PathSummary | null;
  /** diy.totalPaid − dmp.totalPaid: positive when the plan costs less; null if either never clears. */
  saving: number | null;
  /** diy.months − dmp.months: positive when the plan finishes sooner; null if either never clears. */
  monthsSaved: number | null;
}

/** Level monthly payment that amortizes `principal` at `apr` over `months`, rounded up to the cent. */
export function amortizedPayment(principal: number, apr: number, months: number): number {
  const n = Math.max(1, Math.floor(months));
  const r = apr / 1200;
  if (r === 0) return ceilCents(principal / n);
  return ceilCents((principal * r) / (1 - (1 + r) ** -n));
}

function summarize(debts: DebtInput[], extra: number, monthlyFee = 0, setupFee = 0): PathSummary {
  const plan = simulatePlan(debts, 'avalanche', extra);
  const balance = debts.reduce((sum, d) => sum + d.balance, 0);
  const fees = plan.months === null ? 0 : roundCents(monthlyFee * plan.months + setupFee);
  return {
    months: plan.months,
    interest: plan.totalInterest,
    fees,
    totalPaid: plan.months === null ? null : roundCents(balance + plan.totalInterest + fees),
    balancesByMonth: plan.balancesByMonth,
  };
}

export function compareDmp(input: DmpInput): DmpResult {
  const debts = input.debts.filter((d) => d.balance > 0);
  const totalBalance = roundCents(debts.reduce((sum, d) => sum + d.balance, 0));
  const totalMinimums = roundCents(debts.reduce((sum, d) => sum + d.minPayment, 0));
  const planApr = Math.max(0, input.planApr);
  const monthlyFee = Math.max(0, input.monthlyFee);
  const setupFee = Math.max(0, input.setupFee);

  const creditorPayment =
    input.mode === 'term'
      ? amortizedPayment(totalBalance, planApr, input.termMonths)
      : roundCents(Math.max(0, input.planPayment - monthlyFee));
  const draft = roundCents(creditorPayment + monthlyFee);

  const dmp = summarize(
    [{ name: 'plan', balance: totalBalance, apr: planApr, minPayment: creditorPayment }],
    0,
    monthlyFee,
    setupFee,
  );

  const diyAtMinimums = draft < totalMinimums;
  const diyOutlay = diyAtMinimums ? totalMinimums : draft;
  const diy = summarize(debts, roundCents(diyOutlay - totalMinimums));
  const minimumsOnly = diyAtMinimums ? null : summarize(debts, 0);

  const both = dmp.totalPaid !== null && diy.totalPaid !== null;
  return {
    totalBalance,
    totalMinimums,
    creditorPayment,
    draft,
    dmp,
    diy,
    diyOutlay,
    diyAtMinimums,
    minimumsOnly,
    saving: both ? roundCents(diy.totalPaid! - dmp.totalPaid!) : null,
    monthsSaved: both ? diy.months! - dmp.months! : null,
  };
}
