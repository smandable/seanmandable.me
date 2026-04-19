export const profile = {
  name: 'Sean Mandable',
  credential: 'M.S.',
  title: 'Sr. Software Engineer',
  tagline: 'Software Engineering • Full-Stack Development',
  location: 'Greater Hartford Area, CT',
  phone: '475.231.5287',
  email: 'sean@seanmandable.me',
  linkedin: 'https://www.linkedin.com/in/sean-mandable',
  github: 'https://github.com/smandable',
  summary:
    "Full-stack developer with 15+ years of experience, a sharp eye for detail, and a genuine love for building things well. I work across Vue, React, Angular, and Node.js, and I care as much about clean, maintainable code as I do about the end-user experience. I've led complex platform migrations, boosted conversions by 25%+, and cut load times by 75%. I'm just as happy mentoring a teammate as I am debugging a tricky layout issue.",
} as const;

export const competencies: readonly string[] = [
  'Responsive Web Applications',
  'Software Design',
  'Service Oriented Architecture',
  'UI/UX Planning & Design',
  'Agile Methodologies',
  'Complex Problem-solving',
  'Strategic Planning',
  'Efficiency Optimization',
  'IT Operations Management',
  'New Business Development',
  'Team Development',
  'Coaching & Mentoring',
];

export const tools: readonly string[] = [
  'Vue', 'Astro', 'Angular', 'React', 'Node', 'JavaScript', 'Tailwind',
  'jQuery', 'PHP', 'Apache', 'MySQL', 'MariaDB', 'AWS', 'HTML', 'CSS',
  'SCSS', 'Drupal', 'Linux', 'CMS', 'Vite', 'Express', 'VS Code',
];

export type Role = {
  company: string;
  location: string;
  years: string;
  title: string;
  blurb?: string;
  quote?: { text: string; attribution: string };
  bullets: readonly string[];
};

export const roles: readonly Role[] = [
  {
    company: 'TriNet',
    location: 'Remote',
    years: '2021 – 2025',
    title: 'Senior Software Engineer',
    blurb: 'A provider of full-service HR solutions.',
    quote: {
      text: 'Sean was an essential part of our team during the homepage updates integrated with Contentstack. Despite constant scope changes and last-minute updates, he stayed focused, adaptable, and hardworking. Sean consistently went the extra mile, putting in additional hours during critical project migration phases. His technical skills and dedication were invaluable in a fast-paced marketing environment.',
      attribution: 'Natalia D., QA Tester — JavaScript and Front-end applications',
    },
    bullets: [
      "Led the in-house redesign and implementation of TriNet's corporate website, delivering significant gains in performance, accessibility, and scalability. Aligned architectural decisions, tech stack selection, and engineering processes with organizational objectives. Managed one direct report.",
      'Spearheaded the full development lifecycle of a complex content and platform migration, applying agile methodologies to keep delivery on track.',
      'Architected and executed a full codebase migration from Vue2/Nuxt to Vue3/Astro with a Node.js backend.',
      'Rebuilt and automated the codebase and test suite, enabling rapid feature delivery while elevating accessibility grades from D to A (WCAG standards).',
      'Recruited and managed external contractors to accelerate project timelines and ensure on-time delivery of key milestones.',
      'Streamlined content workflows for three departments, eliminating developer dependency for routine updates and empowering non-technical team members to publish independently.',
      'Engineered the front-end architecture and stack to maximize long-term maintainability and cross-device responsiveness.',
      'Boosted visitor conversion by 25%+ through a redesigned, user-friendly interface with improved visual hierarchy and navigation.',
      'Slashed image loading times by 75% by implementing compression pipelines and next-generation image formats.',
    ],
  },
  {
    company: 'Independent Consultant',
    location: 'Remote',
    years: '2018 – 2021',
    title: 'Senior Software Engineer',
    blurb: 'A private consultancy providing website design, software development, and engineering services.',
    bullets: [
      'Delivered end-to-end web design, full-stack development, and DevOps engineering for a portfolio of up to 10 clients, including Ann Taylor. Owned every phase from proposal through deployment, consistently shipping on time and within budget.',
      'Orchestrated all phases of solution delivery—design, development, testing, and deployment—with a focus on scalability, performance, and security.',
      'Maintained responsive client communication and accurate record-keeping.',
      'Developed detailed technical proposals and consistently delivered projects on time and within budget.',
    ],
  },
  {
    company: 'North American Power',
    location: 'Norwalk, CT',
    years: '2017',
    title: 'Drupal Web Developer',
    blurb: 'A complex network providing electricity to homes, businesses and industries across the continent.',
    bullets: [
      "Redesigned and rebuilt the company's website with a 3-person team, overhauling the enrollment system to enable seamless remote sign-up and improve user engagement.",
      'Integrated modern UI/UX principles into a scalable front-end architecture.',
      'Aligned the tech stack with business goals and brand standards, engineering clean, efficient code while eliminating redundancies.',
      'Delivered on time and within budget through cross-functional collaboration, agile workflow design, and weekly scrum facilitation.',
    ],
  },
  {
    company: 'DiscoverOrg',
    location: 'Vancouver, WA',
    years: '2014 – 2016',
    title: 'Senior Software Engineer',
    blurb: 'A business contact database and B2B sales lead provider.',
    bullets: [
      "Led the redesign and modernization of the company's website, transitioning the platform to Angular, Node.js, and Java-based systems while maintaining operational excellence through evolving requirements.",
      "Contributed to the company's growth trajectory from $30M to $1.2B in annual revenue by building a scalable, modern web platform.",
      'Improved system responsiveness by 50% through targeted UI/UX optimizations while seamlessly integrating evolving product features.',
    ],
  },
];

export const earlyCareer: readonly { company: string; title: string }[] = [
  { company: 'Blue World', title: 'Front-End Developer' },
  { company: 'Direct Wines', title: 'Front-End Developer' },
];

export const education: readonly { school: string; degree: string }[] = [
  { school: 'Quinnipiac University', degree: 'M.S., Interactive Media and Communications' },
  { school: 'Albertus Magnus College', degree: 'B.S., Management Information Systems' },
];
