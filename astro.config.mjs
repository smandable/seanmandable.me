// @ts-check
import { defineConfig } from 'astro/config';

import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import rehypeExternalLinks from 'rehype-external-links';
import { unified } from '@astrojs/markdown-remark';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

// Each sitemap URL's <lastmod> is the date of the last commit that touched the
// files behind that page: the page itself, the markdown it renders, and for
// /apps/ the app list. Bing leans on lastmod to decide what to recrawl, so it
// has to be the real date of the content, not the build date. (The deploy job
// checks out full history so these dates are right in CI too.)
function lastModified(url) {
  const path = new URL(url).pathname.replace(/^\/|\/$/g, '');
  const candidates = [
    `src/pages/${path || 'index'}.astro`,
    `src/pages/${path}/index.astro`,
    `src/${path.replaceAll('/', '-')}.md`,
    `src/content/${path}.md`,
  ];
  if (path === 'apps') candidates.push('src/data/apps.ts');
  const files = candidates.filter((f) => existsSync(f));
  if (files.length === 0) return undefined;
  const date = execFileSync('git', ['log', '-1', '--format=%cI', '--', ...files], { encoding: 'utf8' }).trim();
  return date || undefined;
}

// https://astro.build/config
export default defineConfig({
  site: 'https://www.seanmandable.me',
  integrations: [
    vue(),
    // The 404 page isn't a destination; keep it out of the sitemap.
    sitemap({
      filter: (page) => !page.includes('/404'),
      serialize: (item) => ({ ...item, lastmod: lastModified(item.url) }),
    }),
  ],

  // Open external links (http/https to other sites) in a new tab. Internal
  // links and other protocols (mailto:, tel:) are left untouched. The plugin
  // appends a visually-hidden "(opens in new tab)" so screen-reader users are
  // warned (WCAG G201) — `content` is wrapped in a <span>, and
  // `contentProperties` makes that span Tailwind's sr-only (visually hidden).
  //
  // Rehype plugins only run on the classic unified processor — Astro 7's
  // default Sätteri processor ignores them — so `@astrojs/markdown-remark`
  // is a direct dependency and the processor is set explicitly.
  markdown: {
    processor: unified({
      rehypePlugins: [
        [
          rehypeExternalLinks,
          {
            target: '_blank',
            rel: ['noopener', 'noreferrer'],
            content: { type: 'text', value: ' (opens in new tab)' },
            contentProperties: { className: ['sr-only'] },
          },
        ],
      ],
    }),
  },

  vite: {
    plugins: [tailwindcss()]
  }
});