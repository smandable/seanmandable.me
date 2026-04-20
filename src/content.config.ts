import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const writing = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().optional(),
    draft: z.boolean().default(false),
    kind: z.enum(['essay', 'memoir-chapter']).default('essay'),
    order: z.number().optional(),
    // Chapter-series fields (used when kind === 'memoir-chapter')
    series: z.string().optional(),
    seriesTitle: z.string().optional(),
    chapter: z.number().optional(),
  }),
});

export const collections = { writing };
