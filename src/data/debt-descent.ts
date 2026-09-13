/*
 * Debt Descent's App Store link — the single place it's defined. If we later
 * want attribution on the calculator funnel, swap this (or add a second,
 * campaign-tokened constant) here rather than hunting through pages.
 */
export const appStoreUrl =
  'https://apps.apple.com/us/app/debt-descent-payoff-planner/id6785269702';

/**
 * The free tools under /debt-descent, in the order the landing page lists
 * them. Every tool page links the others through DebtDescentTools.astro.
 */
export const tools: { href: string; title: string; blurb: string }[] = [
  {
    href: '/debt-descent/calculator',
    title: 'Debt Snowball & Avalanche Calculator',
    blurb: 'your debt-free date and total interest, both methods side by side',
  },
  {
    href: '/debt-descent/deferred-interest-calculator',
    title: 'Deferred Interest Calculator',
    blurb: 'what a “no interest if paid in full” promo bills if you miss the deadline',
  },
  {
    href: '/debt-descent/balance-transfer-calculator',
    title: 'Balance Transfer Calculator',
    blurb: 'whether the transfer fee beats the interest you’d pay by staying put',
  },
];

/** Comparison write-ups under /debt-descent, listed on the landing page and the tool pages. */
export const comparisons: { href: string; title: string }[] = [];
