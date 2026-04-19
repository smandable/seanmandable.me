# seanmandable.me

Personal site for Sean Mandable. Astro + Vue 3 + Tailwind v4 + TypeScript, with a PHP 8.3 contact endpoint served from Dreamhost.

## Stack

- **Astro 6** — pages, routing, static build
- **Vue 3** — interactive islands (`ContactForm.vue`)
- **Tailwind v4** — styling via `@tailwindcss/vite`
- **TypeScript** — strict mode
- **PHP 8.3** — `public/contact.php` handles contact-form submissions via Dreamhost's `mail()`

## Develop

```
npm install
npm run dev
```

Dev server runs at http://localhost:4321.

The contact form POSTs to `/contact.php` by default. `astro dev` doesn't run PHP, so to exercise the form locally, build first and serve `dist/` through MAMP (see **Testing the PHP endpoint** below).

## Build & deploy

```
npm run build
```

Output goes to `dist/`. SFTP the contents of `dist/` to Dreamhost's document root. `contact.php` travels with everything else because it lives in `public/`.

## Testing the PHP endpoint

Two options:

1. **Against MAMP** — point MAMP at `dist/` after `npm run build`, then override the endpoint in `.env`:
   ```
   PUBLIC_CONTACT_ENDPOINT=http://localhost:8888/your-mamp-path/contact.php
   ```
2. **Against Dreamhost directly** — upload `dist/` and submit the form on the live site.

## Project structure

```
src/
  components/       # Astro and Vue components
  data/             # Typed content modules (resume, etc.)
  layouts/          # Page shells
  pages/            # Astro routes: /, /resume, /contact
  styles/           # Global Tailwind entry
public/
  contact.php       # Contact-form mail handler (PHP 8.3)
  sean-mandable-resume.pdf
  profile.jpg, favicon.*
```

Content that changes often (resume bullets, tech list, etc.) lives in `src/data/resume.ts`.

## Mail notes

- `contact.php` uses `From: noreply@seanmandable.me` and `Reply-To: <sender>` so SPF/DKIM line up with Dreamhost's outgoing mail and replies still go to the visitor.
- If mail doesn't deliver, confirm `noreply@seanmandable.me` exists (or change `SENDER_FROM` in `contact.php` to a real mailbox on the domain).
