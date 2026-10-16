// The shipped apps, in the order the site lists them. The Apps page renders
// these as cards, and the nav marks Apps active on any page under an app's href.
export interface App {
  name: string;
  href: string;
  projectsAnchor: string;
  icon: string;
  platforms: string;
  summary: string;
}

export const apps: App[] = [
  {
    name: 'Debt Descent',
    href: '/debt-descent/',
    projectsAnchor: 'debt-descent',
    icon: '/app-icons/debt-descent.png?v=2',
    platforms: 'iPhone, iPad, and Mac',
    summary: 'A private debt-payoff planner for comparing Snowball, Avalanche, and other payoff plans.',
  },
  {
    name: 'ModernPAR',
    href: '/modern-par/',
    projectsAnchor: 'modern-par',
    icon: '/app-icons/modernpar.png',
    platforms: 'Mac',
    summary: 'A free, arm64-native replacement for MacPAR deLuxe. It repairs PAR2 and PAR1 sets and extracts RAR and zip archives.',
  },
  {
    name: 'Brown Sign',
    href: '/brown-sign/',
    projectsAnchor: 'brown-sign',
    icon: '/app-icons/brown-sign.png',
    platforms: 'iPhone',
    summary: 'Tells you what those brown highway signs point to. Photograph one to get the Wikipedia article, a map, and directions.',
  },
  {
    name: 'ReKey',
    href: '/rekey/',
    projectsAnchor: 'rekey',
    icon: '/app-icons/rekey.png?v=2',
    platforms: 'Mac',
    summary: 'A local password health auditor that finds the reused and breached passwords across every browser’s exports.',
  },
  {
    name: 'Saddle',
    href: '/saddle/',
    projectsAnchor: 'saddle',
    icon: '/app-icons/saddle.png',
    platforms: 'Mac',
    summary: 'A menu bar app for external drives, with one-click mount and unmount, drive groups, and launch and wake rules.',
  },
];
