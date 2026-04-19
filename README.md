# seanmandable.me

Personal site for Sean Mandable. Astro + Vue 3 + Tailwind v4 + TypeScript.

## Stack

- **Astro 6** — pages, routing, static build
- **Vue 3** — interactive islands (`ContactForm.vue`)
- **Tailwind v4** — styling via `@tailwindcss/vite`
- **TypeScript** — strict mode

## Develop

```
npm install
cp .env.example .env   # then edit PUBLIC_FORMSPREE_ENDPOINT
npm run dev
```

Dev server runs at http://localhost:4321.

## Build & deploy

```
npm run build
```

Output goes to `dist/`. Upload the contents of `dist/` to Dreamhost via SFTP.

## Project structure

```
src/
  components/   # Astro and Vue components
  data/         # Typed content modules (resume, etc.)
  layouts/      # Page shells
  pages/        # Astro routes: /, /resume, /contact
  styles/       # Global Tailwind entry
public/         # Static assets served at site root
```

Content that changes often (resume bullets, tech list, etc.) lives in `src/data/resume.ts`.
