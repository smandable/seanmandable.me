---
title: Saddle Privacy Policy
description: Saddle collects nothing. Its only network request is an update check with GitHub.
---

_Last updated: October 16, 2026_

I'm Sean Mandable, and I make Saddle, a menu bar app for managing external drives on macOS. **Saddle collects no personal data, has no user accounts, and contains no analytics, telemetry, advertising, or tracking of any kind.**

## What Saddle does on your Mac

- Saddle reads each external drive's name, size, format, and mount status from macOS so it can list the drive in the menu. It never opens or reads the files on your drives.
- Your settings (drive groups, aliases, excluded drives, and your launch and wake choices) are saved in one file, `config.json`, in `~/Library/Application Support/Saddle/`. Settings ▸ General shows where it is, with a **Reveal in Finder** button.
- Mounting and unmounting go through SaddleHelper, a small helper inside the app. It accepts requests only from Saddle, signed by me, and it makes no network connections.

## The only data that leaves your Mac

Saddle goes online for one thing, checking for a newer version. It asks GitHub's releases API for the latest version number of Saddle and compares it with yours. Like any web request, it reaches GitHub with your IP address and a standard user agent that names Saddle and your system version. It sends nothing about you or your drives. If there's a newer version, Saddle shows an alert, and **Download** opens the release page in your browser.

The check runs only when you choose **Check for Updates…** in the menu or **Check Now** in Settings, or at launch if you turn on **Check for updates automatically** in Settings ▸ General (off by default). GitHub's handling of the request is covered by [GitHub's privacy statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).

## Third-party code

Saddle includes no third-party code or SDKs. The update check is its only contact with an outside service.

## Contact

Questions about privacy? Open an issue on [GitHub](https://github.com/smandable/Saddle/issues) or email me at **[support@seanmandable.me](mailto:support@seanmandable.me)**.
