---
title: ReKey — Support
description: Help and answers for ReKey, the local password health auditor for macOS.
---

Need a hand? Open an issue at [github.com/smandable/ReKey](https://github.com/smandable/ReKey/issues) or email **[smandable@gmail.com](mailto:smandable@gmail.com)** and I'll get back to you.

ReKey is a local password health auditor for macOS. Export a CSV from each browser you've used, drop them in, and it finds the reused and breached passwords, generates strong replacements, and walks you to each site's change page — with no account, no sign-up, and nothing uploaded.

### Frequently asked questions

**Is my data private?**
Yes — completely. Imported passwords are held in memory only: never written to disk, never logged, never sent anywhere. The only network calls ReKey makes are the Have I Been Pwned breach check — which sends just the first five characters of a SHA-1 hash, the standard k-anonymity model — and an on-demand lookup of the change-password page for the one site you're fixing. See the [Privacy Policy](/rekey/privacy).

**What's the difference between the App Store version and the GitHub build?**
They differ on purpose. The App Store version is the auditor, with the fix queue behind a one-time **Unlock Fixing** purchase and the destructive cleanup tooling left out entirely. The GitHub build is the whole app — fix queue included, plus the separate `rekey-cleanup` command-line tool — as a signed, notarized `.dmg` from [GitHub Releases](https://github.com/smandable/ReKey/releases/latest). Both are universal binaries for macOS 15 or later.

**Does ReKey change my passwords for me?**
No — you approve every change, and ReKey never changes a password itself. It generates the new password, puts it on the clipboard marked concealed (it clears itself about ninety seconds later), and opens the site's change page; you make the change, and your browser's own save prompt stores it. ReKey never writes to any browser store or Apple Passwords.

**I fixed or deleted a password, but the browser still warns about it.**
That's the browser's own bookkeeping, not the fix failing — sync behavior, each store only warning about itself, and leftover duplicate entries all play a part. The full explanation is in the repo's [Help & FAQ](https://github.com/smandable/ReKey/blob/master/docs/HELP.md).

**Why does ReKey ask for access to a folder?**
Only if you turn on the optional auto-import watcher. ReKey stores a security-scoped bookmark to the single folder you pick (Downloads, say) so it can spot new password exports across launches. It's used only to read recognized password CSVs you place there.
