// @ts-check
import { defineConfig } from 'astro/config';

import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';
import rehypeExternalLinks from 'rehype-external-links';
import { unified } from '@astrojs/markdown-remark';

// https://astro.build/config
export default defineConfig({
  integrations: [vue()],

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