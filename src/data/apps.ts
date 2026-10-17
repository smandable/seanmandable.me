// The shipped apps, in the order the site lists them. The Apps page renders
// these as cards, and the nav marks Apps active on any page under an app's href.
export interface AppLink {
  label: string;
  href: string;
  /** Picks the icon shown before the label. */
  kind: 'appstore' | 'download' | 'github';
  /** Umami event name, shared with the app's own landing page. */
  event?: string;
}

export interface App {
  name: string;
  href: string;
  projectsAnchor: string;
  icon: string;
  platforms: string;
  /** Minimum OS versions and schema.org category, for the landing page's structured data. */
  operatingSystem: string;
  applicationCategory: string;
  description: string;
  /** Store and download links, shown after the app's own page in the card's link row. */
  links: AppLink[];
}

export const apps: App[] = [
  {
    name: 'Debt Descent',
    href: '/debt-descent/',
    projectsAnchor: 'debt-descent',
    icon: '/app-icons/debt-descent.webp',
    platforms: 'iPhone, iPad, and Mac',
    operatingSystem: 'iOS 26, iPadOS 26, macOS 26',
    applicationCategory: 'FinanceApplication',
    description:
      'A debt-payoff planner that keeps your numbers on your devices and in your own iCloud. Add your debts, or point it at a statement PDF or scan the paper one with the camera and let it read them. Set what extra you can put toward them each month and it runs Snowball (the fast, motivating wins) and Avalanche (the least interest) side by side. Pro adds five more ordering methods.',
    links: [{ kind: 'appstore', label: 'App Store', href: 'https://apps.apple.com/us/app/debt-descent-payoff-planner/id6785269702', event: 'debt-descent-app-store' }],
  },
  {
    name: 'ModernPAR',
    href: '/modern-par/',
    projectsAnchor: 'modern-par',
    icon: '/app-icons/modernpar.webp',
    platforms: 'Mac',
    operatingSystem: 'macOS 14 (Apple Silicon)',
    applicationCategory: 'UtilitiesApplication',
    description:
      'A free, arm64-native replacement for MacPAR deLuxe. It verifies and repairs PAR2 and PAR1 sets, creates new recovery sets, and extracts RAR and zip archives, including multi-volume, password-protected, and self-extracting RAR sets. Drop a .par2 file or its folder on the window and it verifies, repairs any damage, then extracts the archive inside.',
    links: [
      { kind: 'download', label: 'Download', href: 'https://github.com/smandable/ModernPAR/releases/latest', event: 'modernpar-github-download' },
      { kind: 'github', label: 'GitHub', href: 'https://github.com/smandable/ModernPAR' },
    ],
  },
  {
    name: 'Brown Sign',
    href: '/brown-sign/',
    projectsAnchor: 'brown-sign',
    icon: '/app-icons/brown-sign.webp?v=2',
    platforms: 'iPhone and CarPlay',
    operatingSystem: 'iOS 26',
    applicationCategory: 'TravelApplication',
    description:
      'Point your iPhone at one of those brown highway signs, tap the button, and a few seconds later you have the Wikipedia article, a map, a summary, a Look Around street-level view, and directions. Or skip the signs and open the Nearby tab to see the landmarks around you on a map. It also reads landmark stories aloud as you drive, on the iPhone or in CarPlay.',
    links: [
      { kind: 'appstore', label: 'App Store', href: 'https://apps.apple.com/us/app/brown-sign/id6762070205', event: 'brown-sign-app-store' },
      { kind: 'github', label: 'GitHub', href: 'https://github.com/smandable/brown-sign' },
    ],
  },
  {
    name: 'ReKey',
    href: '/rekey/',
    projectsAnchor: 'rekey',
    icon: '/app-icons/rekey.webp',
    platforms: 'Mac',
    operatingSystem: 'macOS 15',
    applicationCategory: 'SecurityApplication',
    description:
      'A local password health auditor. You export a CSV from each browser you’ve used (Chrome, Arc, Firefox, or Apple Passwords for Safari), drop them in, and it finds the reused and compromised passwords, groups them by site worst-first, generates strong replacements, and walks you to each site’s change page. You approve every change, and ReKey never changes a password itself.',
    links: [
      { kind: 'appstore', label: 'Mac App Store', href: 'https://apps.apple.com/us/app/rekey-website-password-audit/id6783031023', event: 'rekey-app-store' },
      { kind: 'github', label: 'GitHub', href: 'https://github.com/smandable/ReKey' },
    ],
  },
  {
    name: 'Saddle',
    href: '/saddle/',
    projectsAnchor: 'saddle',
    icon: '/app-icons/saddle.webp',
    platforms: 'Mac',
    operatingSystem: 'macOS 13.5',
    applicationCategory: 'UtilitiesApplication',
    description:
      'A menu bar app that shows the mount status of every external drive and mounts or unmounts one with a click. Group drives together and batch-mount or batch-unmount the whole group. Drives you unmounted stay unmounted: when macOS remounts one on its own after a USB disconnect, Saddle unmounts it again.',
    links: [
      { kind: 'download', label: 'Download', href: 'https://github.com/smandable/Saddle/releases/latest', event: 'saddle-github-download' },
      { kind: 'github', label: 'GitHub', href: 'https://github.com/smandable/Saddle' },
    ],
  },
];
