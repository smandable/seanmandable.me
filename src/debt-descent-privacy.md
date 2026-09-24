---
title: Debt Descent Privacy Policy
description: Debt Descent collects nothing. Your data stays on your device and in your own private iCloud.
---

_Last updated: September 24, 2026_

**Debt Descent does not collect any of your data, and has no servers of its own.** There are no accounts, no sign-ups, and no analytics or tracking. I can't see your data, on your device or in your iCloud.

### Where your data lives

Everything you enter is stored on your device, and (if you're signed in to iCloud) in your own private iCloud, so it stays in sync across your iPhone, iPad, and Mac. That covers your debts, balances, APRs, payments, payment groups, planned windfalls, income and bills, and your plan settings. It also covers any payment you skip or defer, and the short record the app keeps when you clear older payments from History.

### iCloud sync

Sync uses Apple's CloudKit private database, a part of your personal iCloud account that only you can access. Apple encrypts it in transit and at rest, and I have no ability to read, query, or receive anything in it. Sync is automatic and free for everyone. If you've never signed in to iCloud, Debt Descent keeps everything on the device and works fully offline.

Some of your plan syncs through iCloud's key-value storage instead, which is also part of your own iCloud account. That's your extra each month, your income and how often you're paid, your payoff method, any payment you've skipped or deferred, and the record of payments you've cleared from History. The skip and clear records hold amounts, months, and dates. They point to a debt by an internal ID, not its name, and they hold no notes. As with the rest of your iCloud data, I can't see any of it.

If you stop syncing later, by signing out of iCloud or turning it off for this app in your device's iCloud settings, the system removes the synced copy from that device. Your data isn't lost: it stays in your own private iCloud, still unreadable to me, and reappears when you sign back in. If you want a copy that lives only on your device, use the free **Export to JSON** before signing out.

### Statement import & scanning

A statement you import is read on your device using Apple frameworks (PDFKit, VisionKit, Vision, and Apple Intelligence). It can be a PDF, a photo, or a paper statement scanned with the camera on iPhone and iPad. A paystub you read in **Income & bills** is handled the same way. Camera access is used only for the statement or paystub you're scanning. The capture is processed on your device, nothing is saved until you confirm the fields it read, and the app never asks for access to your photo library. The document and its contents are never uploaded anywhere.

### Opening plan files

You can open a Debt Descent plan file (a JSON backup, or a PDF that carries a plan) with **Import plan (JSON or PDF)…** in the app. You can also open one from Files, Mail, Messages, or Finder. The file is read on your device.

- **iPhone and iPad:** the system hands Debt Descent a copy, and the app deletes that copy once it's read it.
- **Mac:** the app reads your original file and never changes it.

A PDF that doesn't carry a plan goes to the statement reader above, which also runs on your device. Nothing from the file is sent to me.

### Exports you initiate

PDF, calendar (.ics), JSON, and CSV exports, and the shareable progress-card image, are created on your device and saved wherever you choose (a file, a share sheet). I am not involved in and have no access to what you do with an exported file.

Some of these files hold more than they show on the page. This is what each one carries:

- **The plan PDF** always carries your whole plan inside it as an attached file, so Debt Descent can import it back. That's your debts, payments and their notes, payment groups, windfalls, extra, income, and bills. The PDF says so on its page. Anyone you send it to can open the attachment, in Debt Descent or in a PDF reader like Adobe Acrobat.
- **The payment history PDF** lists your payments. Each time you export one, you choose **Just the payments** or **Include my plan**. It only carries your whole plan if you pick Include my plan, and then the page says so.
- **The payment history CSV** lists each payment's date, debt, amount, whether it was extra, its note, and its payment group. When you clear older payments, the option to save them as a CSV first writes the same kind of file for just those payments.
- **The JSON backup** is your whole plan in one file.

### Notifications

If you turn on due-date reminders or the statement-day balance check, they are scheduled as local notifications on your device. That includes the reminder that follows a skipped or deferred payment. No reminder data is sent anywhere.

### Widgets, Siri, and Spotlight

The widgets read a small snapshot the app saves on your device. Siri and Shortcuts actions, and your debts in Spotlight, work from the data on your device too. Debt Descent sends me nothing through any of them.

### Purchases

The optional one-time "Debt Descent Pro" upgrade is handled by Apple via the App Store. Apple processes the payment, and I never receive or store your payment information. The app only receives Apple's signed confirmation that the purchase exists, so it can unlock Pro features. If you redeem an offer code, that goes through Apple too.

### Third parties

Debt Descent includes no third-party advertising, analytics, or tracking SDKs.

### Children

Debt Descent is rated 4+ and collects no data from anyone, including children.

### Changes

If this policy ever changes, the updated version will be posted here with a new date.

### Contact

Questions about privacy? Email **[support@seanmandable.me](mailto:support@seanmandable.me)**.
