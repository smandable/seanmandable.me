---
title: Projects
description: Shipped and in-progress personal projects across iOS, macOS, and the web.
---

<h2 style="display:flex;align-items:center;gap:14px"><img src="/app-icons/brown-sign.png" alt="" width="48" height="48" style="margin:0;width:48px;height:48px;flex:none" />Brown Sign (iOS, 2025)</h2>

You know those brown signs on the highway — the ones that point to state parks, historical sites, scenic overlooks, the occasional mansion or covered bridge? I kept seeing them, wondering what they actually were, and not doing anything about it. Googling "that brown sign I just passed near Middletown" is not a real workflow. So most of the time I just drove on.

Brown Sign is the app I wanted to exist. Point your iPhone at the sign, tap the button, and a few seconds later you have the Wikipedia article, a map, a summary, and directions. Or skip the camera entirely and open the Nearby tab to see every geo-tagged Wikipedia landmark around you on a map — pan across a state, pins accumulate as you go.

### What's underneath

The user-facing promise is simple. What it takes to deliver it is not.

OCR runs on-device via Apple's Vision framework, sorting multi-line text top-to-bottom by bounding box so "Wadsworth Mansion / 2 MI" stays in the right order. The OCR output goes to Apple Intelligence (FoundationModels, iOS 26+) for normalization, stripping directions and distances, extracting just the landmark name. That cleaned-up name hits a four-source resolver: Wikipedia geosearch within 10 km, Wikipedia text search, NPS as a fallback for historic sites without Wikipedia coverage, and Wikidata for structured enrichment.

Candidates get filtered through three passes — a Wikidata P31 blocklist that drops bands, films, food, hoaxes, and people; a place-indicator whitelist; a default-reject for anything that doesn't earn its way through. Title-token overlap catches Wikipedia body-text matches that sneak past. Results sort exact-title-match first, then by distance — so "Wadsworth" near Middletown, Connecticut returns the mansion down the road instead of a city in Ohio. The top candidate gets a second enrichment pass: Apple Intelligence polishes the Wikipedia extract into a 2-3 sentence summary, scores the match confidence, Google Knowledge Graph adds an external confidence signal, and the article image downloads and resizes for offline browsing.

No third-party Swift packages. Stock Apple frameworks all the way: SwiftUI + UIKit where needed, SwiftData for history, AVFoundation for the camera, CoreLocation, MapKit, SafariServices. Every external call fails silently to nil. The app works end-to-end with no API keys, no location permission, and no Apple Intelligence.

### Privacy

No accounts. No analytics. No ads. No tracking. Camera images are processed on-device. Location is used only to rank nearby results. Search queries go to Wikipedia, Wikidata, NPS, and Google Knowledge Graph with no personal identifiers attached.

### Status

Shipped to the App Store (currently v1.9). Still actively developing — I keep thinking of new features.

**[App Store](https://apps.apple.com/us/app/brown-sign/id6762070205)** · **[GitHub](https://github.com/smandable/brown-sign)**

---

<h2 style="display:flex;align-items:center;gap:14px"><img src="/app-icons/rekey.png?v=2" alt="" width="48" height="48" style="margin:0;width:48px;height:48px;flex:none" />ReKey (macOS, 2026)</h2>

Every browser has a "check your passwords" feature now, and so does Apple Passwords. The catch is that each one only looks at its own store. I've used Chrome, then Firefox, and now Arc, so the passwords I'd quietly reused for years were spread across four or five different exports, and no single checkup could see across them. The other option is to hand the whole list to a password manager's cloud and let it confirm what I already suspected. I wanted to find the reused and breached ones myself, on my own machine, without uploading anything.

ReKey is a local password health auditor for macOS. You export a CSV from each browser you've used (Chrome, Arc, Firefox, Apple Passwords), drop them in, and it finds the reused and compromised passwords, groups them by site worst-first, generates strong replacements, and walks you to each site's change page. You approve every change, and ReKey never changes a password itself. It generates the new one and opens the change page; you make the change, and your browser's own save prompt stores it.

### What's underneath

The whole thing is built so your plaintext passwords never leave the machine. They live in memory only, never written to disk, never logged, never sent anywhere. Each one is held in a small wrapper type whose debug and log output is redacted, so a password can't be printed or interpolated into a log by accident. The single exception is the breach check, which uses Have I Been Pwned's k-anonymity API: ReKey hashes the password with SHA-1 and sends only the first five characters of that hash. The server returns every breached hash sharing those five characters, and the comparison happens locally. The password, the full hash, and the account it belongs to never leave the device.

Import detects each browser's format by its column headers rather than their position, and parses with a real RFC 4180 parser that handles quoted fields, embedded commas and newlines, escaped quotes, and the byte-order mark some exports include. URLs are canonicalized to their registrable domain through a vendored Public Suffix List, so accounts.google.com and mail.google.com group under google.com, and bbc.co.uk resolves correctly instead of collapsing to co.uk. Reuse is found across every imported browser at once, so a password you used in Chrome and again in Firefox shows up as a single cluster.

Replacement passwords come from the system CSPRNG (SecRandomCopyBytes), with rejection sampling so there's no modulo bias and at least one character from each class you've enabled. Length, character classes, an avoid-look-alikes option, and a letters-and-digits-only mode for picky sites are all adjustable, and there's a diceware passphrase mode built on the EFF wordlist.

Getting you to the right change page is its own problem. ReKey tries the site's /.well-known/change-password path, the same convention Safari and Chrome use, but plenty of servers answer 200 to every URL, so a 200 there proves nothing. To catch that, it also requests a random path that cannot exist, and trusts the change page only if the real path succeeds while the nonsense path returns a not-found. If that fails it falls back to a small curated map, and last of all to the site's home page with a note to find the setting yourself. It resolves one site at a time, and only when you choose to fix that one, so importing your accounts never pings every domain on your list. No URL is ever guessed by an LLM, because a confident wrong guess is worse than no guess.

When you approve a fix, the new password goes to the clipboard marked concealed, using the convention that clipboard-history managers like Maccy and Raycast honor, so it stays out of their history. It clears itself about ninety seconds later, and it does that by checking the clipboard's change count instead of reading the contents back, so it neither keeps the plaintext alive for the wait nor trips the macOS prompt for reading the clipboard. If you've copied something else in the meantime, it leaves it alone.

The app is sandboxed and never writes to any browser store, Apple Passwords, or the keychain. Changing a password usually updates the saved login in place, but sometimes the browser saves a second copy and leaves the old one behind with the dead password. Clearing that out is a separate, opt-in command-line tool called rekey-cleanup, kept deliberately outside the sandboxed app. It matches and deletes purely on the plaintext index fields, so it never reads the encrypted password blob or needs any decryption key. It dry-runs by default, refuses to run while the browser is open, backs up the store before touching it, and does its deletes inside a transaction. The app shows and copies the exact command for a site you've fixed, and you run it yourself in Terminal.

Every piece of logic (the parser, the audit, the generator, the breach client, the reset router) is free of SwiftUI and unit-tested on its own. The network clients sit behind protocols, so the engines test with no network and the live clients are wired in only at the app layer. There are 224 tests, including the ones that keep the privacy guarantees honest.

### Privacy

No accounts, no analytics, no telemetry, and no crash reporting. The only network calls ReKey makes are the Have I Been Pwned prefix query and the on-demand lookup of a single change-password URL when you decide to fix that account. App Sandbox is on, with a short list of entitlements: outgoing network, read-write access to the files you pick (so it can securely overwrite and delete the source CSV after import), and a single folder bookmark used only if you turn on the optional auto-import watcher.

### Status

ReKey 1.0 is available as a signed, notarized `.dmg` from GitHub Releases, and a Mac App Store version is awaiting review. It targets Apple Silicon on macOS 15 or later, is written in Swift 6, and also builds from source with Xcode or a one-command signing script. I built it for my own password cleanup and kept going on it.

**[GitHub](https://github.com/smandable/ReKey)** · **[Download](https://github.com/smandable/ReKey/releases/latest)**

---

<h2 style="display:flex;align-items:center;gap:14px"><img src="/app-icons/modernpar.png" alt="" width="48" height="48" style="margin:0;width:48px;height:48px;flex:none" />ModernPAR (macOS, 2026)</h2>

MacPAR deLuxe is the Mac app for PAR files. It has held that spot for a long time, mostly because nobody else bothered. PAR files add recovery data to a set of files, so when a piece goes missing or arrives corrupted you can rebuild it instead of starting over. I've used MacPAR deLuxe to verify and repair file sets for years. It's Intel-only, it hasn't shipped an update in a long while, and it stops working once Apple retires Rosetta 2.

ModernPAR is that rebuild. It verifies and repairs PAR2 and PAR1 sets, creates new recovery sets, and extracts RAR and zip archives. Drop a `.par2` file or its folder on the window and it verifies, repairs any damage, then extracts the archive inside, with per-file status and the "need N more recovery blocks" math along the way. Drag-and-drop, open-with, and completion notifications that jump you to the file in Finder. It's arm64 native, built in Swift 6 and SwiftUI.

### What's underneath

The PAR2 work runs on par2cmdline-turbo, the fast fork of the standard PAR2 engine. It's C++, and instead of shipping it as a separate binary and shelling out, I embedded it in-process as a C++ SwiftPM target behind an exception-catching `extern "C"` shim. Swift consumes it as a plain C module, so none of the C++ leaks into the rest of the app. RAR extraction uses RARLAB's UnRAR 7.2.4 the same way, and zip goes through the system libarchive. All three are wrapped as plain C modules, which means no target in the project uses C++ interop at all. A subprocess engine sits behind the same protocol as a designed-in fallback.

PAR1 is a different story. There's no modern library for it, so the PAR1 encoder and the read-only parser are pure Swift, including the GF(2⁸) Reed-Solomon math. The output is byte-identical to the original Intel helper, and that helper reads my output back as valid. That comparison is one of the tests, so if the output ever drifts from the reference, the build goes red.

Licensing drove a few of the structural calls. par2cmdline-turbo is GPL, which is fine because ModernPAR is itself GPL-2.0. UnRAR carries a field-of-use restriction that makes it GPL-incompatible, so it lives in its own separately-licensed component and never merges into the GPL engine's link unit. Every Mach-O in the bundle is arm64-only, including the embedded Sparkle 2 framework, and CI fails the build if anything Intel sneaks in. 342 tests, counting the byte-for-byte oracle checks and the license-compliance gates.

On the app side, every engine (verify, repair, create, RAR, zip) streams the same event type through an AsyncStream into one coalesced model on the main actor, so a single window renders all of them. The scene is a WindowGroup keyed on a folder-scoped session instead of a DocumentGroup, because the thing on screen is a long-running session, not a document.

### Licensing

ModernPAR is free software under GPL-2.0-or-later. That's the license that lets it embed the GPL PAR2 engine in-process. The full third-party breakdown is in the repo.

### Installing

v1.0.0 is available as a signed, notarized `.dmg` from GitHub Releases. It updates itself through Sparkle. Still actively developed.

**[GitHub](https://github.com/smandable/ModernPAR)** · **[Download](https://github.com/smandable/ModernPAR/releases/latest)**

---

<h2 style="display:flex;align-items:center;gap:14px"><img src="/app-icons/saddle.png" alt="" width="48" height="48" style="margin:0;width:48px;height:48px;flex:none" />Saddle (macOS, 2025)</h2>

My external drives kept making noises. Spinning up for no reason, chattering to themselves in the background, asking for attention they didn't need. Most of the time they just sat there doing nothing — I'd go days without actually reading or writing anything to them — but there they were, audible, occasionally waking from sleep for reasons known only to macOS.

The Finder's answer to this is that you can eject a drive, but you can't mount one. To remount you open Disk Utility, find the drive in the sidebar, click Mount. Every time. For every drive. And if you have four external drives you want to manage as a group — which I do — it's four round-trips through two apps for something that should be a single click.

Saddle is a macOS menu bar app that fixes this. One icon, real-time mount status for every external drive, click to mount or unmount. Group drives together and batch-mount or batch-unmount the whole group. Configure launch actions so drives auto-mount or auto-unmount when the app starts. Exclude drives you don't want managed. Give drives friendly aliases because "Untitled 3" is not a name.

### What's underneath

Native SwiftUI, no dependencies. DiskArbitration callbacks detect connect/disconnect events in real time — no polling, no lag between plugging a drive in and seeing it in the menu. Login item registration goes through macOS ServiceManagement rather than the older LaunchAgent approach, which means no stray plist files cluttering the user's library. Notarized by Apple. Runs on macOS 13 (Ventura) or later.

The settings window is a proper GUI — not a pile of defaults-write commands or a JSON config file. Groups, aliases, launch actions, and exclusions all live in a real preferences surface with tabs and forms. If someone's going to trust an app to mount and unmount their drives on demand, the app should look like it was built by someone who'd use it themselves. Which I do.

### Installing

Current release is 1.4.1. Available as a signed, notarized `.dmg` from GitHub, or via Homebrew:

```bash
brew tap smandable/tap && brew install --cask saddle
```

**[GitHub](https://github.com/smandable/Saddle)** · **[Download](https://github.com/smandable/Saddle/releases/latest)**

---

<h2 style="display:flex;align-items:center;gap:14px"><img src="/app-icons/kelvin-caliper.png?v=2" alt="" width="48" height="48" style="margin:0;width:48px;height:48px;flex:none" />Kelvin Caliper (in development, planned commercial release)</h2>

Hardware colorimeters cost $170-300 and most people never buy one. Modern iPhone cameras have surprisingly good sensors and shoot RAW DNG, which exposes enough linear color information to do useful display calibration. Kelvin Caliper is a Mac + iOS app pair built on that observation: use the iPhone you already own as the measurement device, match the white point and gamma across your monitors, and apply the corrections directly.

The headline feature is multi-monitor matching. Pick one display as the reference, match the others to it. The most valuable real-world use isn't absolute calibration accuracy. It's making your second and third monitors actually look like your main one.

### What's underneath

On the Mac: SwiftUI for the UI, ColorSync for ICC vcgt LUT generation and assignment (the fallback path for displays that don't cooperate), and `IOAVService` for DDC/CI control on Apple Silicon — the same approach used by `m1ddc`, BetterDisplay, and Lunar after Apple broke the public `IOI2CInterface` on M-series Macs. VCP codes 0x10, 0x16/0x18/0x1A for brightness, red, green, blue gain.

On the iPhone: SwiftUI for the UI, AVFoundation for RAW DNG capture with fully locked exposure, white balance, and focus, and the Vision framework for AR-style capture guidance (`VNDetectRectanglesRequest` rather than full ARKit — lighter weight for this specific use case).

Pairing happens over Multipeer Connectivity. No cloud, no account, no network round-trip. The iPhone captures, sends the measurement to the Mac over the local peer connection, and the Mac does the math: per-iPhone-model sensor characterization matrices, sensor RGB → CIE XYZ, corrections applied as DDC writes or ICC vcgt LUT assignments depending on what the display supports.

### Current state

I'm in a validation spike: three deliberately throwaway pieces that answer one question: are iPhone-based measurements repeatable and consistent enough to actually be useful for this? A SwiftUI Mac app that displays full-screen color patches in sequence. A SwiftUI iPhone app that captures RAW DNGs with locked camera settings. And a Python analysis script (`rawpy` + `numpy` + `exifread`) that reads the DNGs, extracts linear sensor RGB, applies the embedded `ColorMatrix1`/`ColorMatrix2` tags, and computes white point and gamma.

A factory-calibrated Dell U3224KB serves as the ground-truth reference display for sanity-checking the math. Cross-device consistency gets validated by running the same captures on both an iPhone 16 Pro and an iPad mini and comparing relative results.

Early signal: the iPhone 16 Pro's RAW sensor is surprisingly well-behaved.

### Status

In active development. Planned for commercial release on the Mac App Store. The source code is published for transparency and portfolio purposes; please don't fork for commercial use.

**[GitHub](https://github.com/smandable/kelvin-caliper)**

---

## Also

**[MovieDB](https://github.com/smandable/moviedb)** — a local movie library cataloging app I built for myself. Angular 22 + TypeScript front end on AG Grid, PHP/MySQL backend, FFprobe for metadata extraction, duplicate detection across mounted volumes, batch filename normalization. Useful, not a showcase piece. Included because it's the thing I actually use to keep my movie collection from slowly devolving into chaos.

**CLI utilities.** A handful of small PHP command-line tools I wrote to solve specific file-management problems and kept around because they're still useful: **[consolidate_movies](https://github.com/smandable/consolidate_movies)** (groups episodic video files across multiple drives and consolidates each title onto a single drive, with space balancing), **[convert_to_mp4](https://github.com/smandable/convert_to_mp4)** (batch video conversion with corruption detection, junk/static detection via entropy analysis, and post-convert validation), **[de-obfuscate](https://github.com/smandable/de-obfuscate)** (renames obfuscated files using their parent directory name), and **[delete_low_res](https://github.com/smandable/delete_low_res)** (finds and removes video files below a width threshold). All of them dry-run-by-default, because I've learned that lesson.
