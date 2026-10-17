---
title: Saddle Support
description: Help and answers for Saddle, the menu bar app for external drives on macOS.
---

Need a hand? Open an issue at [github.com/smandable/Saddle](https://github.com/smandable/Saddle/issues) or email **[support@seanmandable.me](mailto:support@seanmandable.me)** and I'll get back to you.

Saddle lists your external drives in the menu bar and mounts or unmounts one, or a whole group, in one click. It's free, and it runs on macOS 13.5 (Ventura) or later.

## Frequently asked questions

**Is my data private?**
Yes. Saddle collects nothing, and its only network request is the update check, which asks GitHub for the latest version number. See the [Privacy Policy](/saddle/privacy/).

**How do I install Saddle?**
Download the `.dmg` from [GitHub Releases](https://github.com/smandable/Saddle/releases/latest), open it, and drag Saddle to Applications. Or install it with Homebrew: `brew tap smandable/tap && brew install --cask saddle`.

**How do I mount or unmount a group of drives?**
In Settings ▸ Groups, create a group and check the drives that belong to it. The group then gets its own submenu in the menu bar, with **Mount All** and **Unmount All** for just those drives.

**Can Saddle mount or unmount drives on its own?**
Yes, at launch and when your Mac wakes. Each group has a launch action (mount, unmount, or none) in Settings ▸ Groups. It runs at launch while **Run group actions automatically at launch** is on (on by default), and on wake if you turn on **Run group actions automatically on wake** (off by default). In Settings ▸ General you can also turn on **Mount all drives automatically at launch** or **Unmount all drives automatically at launch**, and the same pair for wake (all off by default). To start Saddle when you log in, turn on **Start Saddle at login** (off by default).

**What does Preserve manual mount state do?**
When it's on, the automatic Mount all and Unmount all at launch and on wake skip any drive you mounted or unmounted yourself in Saddle. In Settings ▸ General, turn on **Preserve manual mount state** (off by default).

**How do I keep Saddle away from a drive?**
In Settings ▸ Drives, check **Excluded** next to the drive. Saddle moves it to the **Excluded Drives** submenu and leaves it out of every Mount All and Unmount All. To bring it back, choose **Re-include** for it in that submenu.

**Can I rename a drive?**
Yes. Type an alias next to the drive in Settings ▸ Drives, and the menu shows the alias. The drive's own name doesn't change.

**A drive won't unmount.**
A file on it is probably still open in another app. Close the file or the app and try again. You can also turn on **Force unmount (eject even if files are in use)** in Settings ▸ General (off by default), but an app that still has a file open on the drive can lose unsaved changes.

**The menu says Helper not responding.**
Choose **Reconnect Helper** in the menu. Saddle mounts and unmounts drives through SaddleHelper, a small helper inside the app, and Reconnect Helper restarts it. If it keeps happening, [open an issue](https://github.com/smandable/Saddle/issues).

**How do I update Saddle?**
Choose **Check for Updates…** in the menu. If there's a newer version, **Download** opens its release page. To check each time Saddle starts, turn on **Check for updates automatically** in Settings ▸ General (off by default). With Homebrew, run `brew upgrade --cask saddle`.

**How do I uninstall Saddle?**
Quit Saddle and drag it from Applications to the Trash. Your settings stay in `~/Library/Application Support/Saddle/` until you delete that folder. With Homebrew, run `brew uninstall --cask saddle`.
