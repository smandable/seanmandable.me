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

Automatic via GitHub Actions — every push to `main` runs the
[`Deploy to Dreamhost`](.github/workflows/deploy.yml) workflow, which
builds the site and rsyncs `dist/` to Dreamhost over SSH. Manual
trigger is available from the Actions tab (**Run workflow**) for
redeploys without a code change.

To deploy by hand if needed:

```
npm run build
# then SFTP the contents of dist/ to the Dreamhost doc root
```

### One-time deploy setup

The workflow needs four repo secrets (Settings → Secrets and variables
→ Actions):

| Secret | Value |
|---|---|
| `DREAMHOST_SSH_HOST` | Dreamhost SSH hostname (e.g. `iad1-shared-xyz.dreamhost.com` or your domain) |
| `DREAMHOST_SSH_USER` | Dreamhost shell-enabled user |
| `DREAMHOST_SSH_KEY` | Private key (ed25519 recommended), no passphrase |
| `DREAMHOST_DEPLOY_PATH` | Absolute path to the site's doc root on Dreamhost (e.g. `/home/sean/seanmandable.me`) |

Steps:

1. In the Dreamhost panel, enable shell access on the user and note
   the hostname.
2. Generate a deploy keypair locally:
   ```
   ssh-keygen -t ed25519 -f ~/.ssh/dreamhost_deploy -N ""
   ```
3. Copy the public key to Dreamhost:
   ```
   ssh-copy-id -i ~/.ssh/dreamhost_deploy.pub <user>@<host>
   ```
4. Paste the private key (`~/.ssh/dreamhost_deploy`) into the
   `DREAMHOST_SSH_KEY` secret and fill in the other three.
5. Push to `main` or click **Run workflow** to verify.

The workflow uses `rsync --delete`, so the deploy path is overwritten
to match `dist/` exactly — keep it pointed at a directory that holds
only the built site.

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

- `contact.php` sends `To: sean@seanmandable.me` (a forward-only alias pointing at `smandable@gmail.com`) with `From: sean@seanmandable.me` and `Reply-To: <visitor>`. On-domain From keeps SPF/DKIM aligned with Dreamhost's outgoing mail, and Reply-To means hitting reply in Gmail goes straight to the visitor.
- To change the recipient or sender, edit the constants at the top of `public/contact.php`.
