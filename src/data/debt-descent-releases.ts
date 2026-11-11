/*
 * Every Debt Descent release, newest first, for /debt-descent/release-notes/.
 * A new release adds one entry at the top of `releases`.
 *
 * - `date` is the day the version went live on iPhone and iPad, in Eastern
 *   time, as YYYY-MM-DD. YYYY-MM alone means only the month is on record,
 *   and '' means the iPhone and iPad day isn't on record (the page then
 *   gives the Mac's day).
 * - `macDate` is set only when the Mac got the version on another day.
 * - `mac: false` marks a version that shipped on iPhone and iPad alone, and
 *   `note` says in a sentence where that leaves the Mac.
 * - `notes` is the version's own What's New from the App Store, lightly
 *   edited (the early versions' em dashes are commas, colons and periods):
 *   one line per bullet (starting "• "), and any other line as it stood (a
 *   headline, a sub-heading, a closing line). The store's "New in X" line
 *   for the version itself, its recap of the version before, and the
 *   closing thank-you are left out, because the page already has them.
 * - `macNotes` is for a version whose Mac text was different.
 *
 * Dates come from the App Store's version history; the text comes from the
 * app repo's docs/app-store-text.md (current) and docs/version-notes.md.
 */
export interface Release {
  version: string;
  date: string;
  macDate?: string;
  mac?: false;
  note?: string;
  notes: string;
  macNotes?: string;
}

export const releases: Release[] = [
  {
    version: '1.21.5',
    date: '2026-10-28',
    mac: false,
    note: 'This fix is for the on-screen keyboard, so there’s no Mac version.',
    notes: `
• When you tap a balance or amount just above the keyboard, the screen now scrolls it a little higher, so you can press and hold to move the cursor within the number instead of retyping it.
`,
  },
  {
    version: '1.21.4',
    date: '2026-10-26',
    macDate: '2026-10-28',
    notes: `
• From the payday that covers next month's due date, a debt's row on the Plan tab asks for next month's payment instead of what's left of this month's. Before, it still asked for the rest of this month's, though a payment made then counted toward next month's.
• A debt's last payment, logged with a later date, no longer moves its minimum onto another debt a month early.
• Skip and Defer are no longer offered for a month that a payment with a later date already counts toward, and a Defer made over such a payment before this update is undone, so that month's payment isn't paid twice.
• A payment logged toward a later month's bill, like December's in October, now counts once in your payoff dates too, and Full schedule (Pro) marks that month "Paid" once it's paid in full.
`,
  },
  {
    version: '1.21.3',
    date: '2026-10-25',
    macDate: '2026-10-27',
    notes: `
• A payment you log with a later date, like the 1st of next month, now counts once in your debt-free date and payoff dates. Before, it came off the balance right away and the plan still counted that month's payment as due, so the dates looked earlier than they were.
`,
  },
  {
    version: '1.21.2',
    date: '2026-10-24',
    mac: false,
    note: 'The Mac got this change in 1.21.3.',
    notes: `
• Full schedule (Pro) now marks a month you've paid ahead as "Paid", and shows under it what you paid, when, and toward which due date. Before, paying early, like November's payment on an October payday, left that month at $0.00 in the schedule, so it looked skipped.
`,
  },
  {
    version: '1.21.1',
    date: '2026-10-23',
    macDate: '2026-10-24',
    notes: `
• With paydays set in Income & bills, Upcoming lists each payment under the paycheck that covers it, and a payment you log on that payday now counts toward its due date. Before, a card due November 4, listed under the October 23 payday and paid that day, stayed in Upcoming and its due-date notification was still set to come, because the payment counted toward October's due date.
• If last month's payment for that debt has nothing logged, a payment made on that payday still counts toward last month's due date, and the Log a payment sheet tells you so.
`,
  },
  {
    version: '1.21',
    date: '2026-10-21',
    macDate: '2026-10-22',
    notes: `
• Made for iPhone Duo. Closed, open or beside another app, every screen fits: the tabs and Settings sit along the side while the phone is closed, the open display gets the wider layout, and there's nothing to set up.
• On the Mac, the app's file in Applications is now called "Debt Descent.app".
• Small fixes for narrow screens: the labels in the Debt payments table shrink before they wrap, and a deferred debt's line shows the short month.
`,
  },
  {
    version: '1.20.3',
    date: '2026-10-15',
    notes: `
• Lock with Face ID: turn it on in Settings ▸ Privacy, and Debt Descent asks for Face ID, Touch ID or your passcode (your password on the Mac) before it shows your plan. On iPhone and iPad, the app switcher shows a cover instead of your numbers.
• Hide amounts, also in Settings ▸ Privacy: every dollar figure is blurred until you tap it (click it on the Mac), for a shared screen or a screen share. On the Mac, View ▸ Hide Amounts turns it on and off.
• A backup every week: Debt Descent saves a copy of your plan in its folder in iCloud Drive once a week and keeps the last eight. To put one back, open it with Import Plan. It's on unless you turn it off in Settings ▸ Backups.
• A notification before a promo ends (Pro): two months and again two weeks before a promo rate or a deferred-interest promo ends, with what's left and how much a month clears it in time. You can turn it off in Settings ▸ Notifications.
• Other bills on the Left over card opens to list each bill.
• Payoff method is in Settings ▸ Plan now, and tapping a method card on the Plan tab still changes it.
• The method you're using shows a checkmark on its card, the chart starts at "Now", and the Progress chart shows your whole plan when it fits.
• Upcoming can leave out paydays with nothing due: Settings ▸ Plan.
• When your plan never clears with Roll payments forward off, it now names the debt whose own minimum can't keep up, and what to change.
• Smaller touches: sheets keep their title in view as you scroll, each History row on iPhone has one ••• menu, and fold arrows turn as fast as the card opens.
• On iPad, sheets open in the middle of the screen, and Full schedule and Refinance show every column.
• On the Mac, Esc closes Settings, Income & bills, Payoff methods and Full schedule.
`,
  },
  {
    version: '1.20.2',
    date: '2026-10-08',
    notes: `
• Pay a debt weekly, every 2 weeks or twice a month: open the debt's ••• menu, choose Edit details, and set how it's paid. Each date gets its own row in Upcoming, and the months with an extra payment date pay the debt down sooner.
• A "1% plus interest" minimum for cards, the way most card companies work it out. New cards start on it. Cards already in the app keep their rule unless you change it in Edit details.
• Paydays: add your next payday in Income & bills, and Upcoming lists each payment under the paycheck that covers it, with what that paycheck still has to pay. Add what's in the bank, if you like, and it shows whether that covers what's due before your next payday.
• Bills with due dates: give a bill a due date in Income & bills and it's listed in Upcoming with your payments, where a check marks it paid.
• Autopay: turn on "On autopay" for a debt, a payment group or a bill, and Debt Descent logs each payment on its due date, the next time you open the app.
• Keep a debt at its own payment: tick "Takes only its payment" in Edit details, with an end date if you want one, and your extra goes to your other debts.
• Add a loan's original amount and start date in Edit details to see how much of it you've paid off and how far ahead of its original term you are.
• A loan in deferment: in Edit details, choose whether its payment is added to your monthly total when payments start, or comes out of it.
• Notifications (Pro): due-date notifications have a Log button that logs the payment without opening the app, and a new payday notification tells you what each paycheck has to cover. Turn it on in Settings.
• The Extra card folds like the cards around it, and "Pick a debt-free date" opens only when you want it.
• Fixes for a loan whose deferment ends before that month's due date, and for payments made in a month's last days toward a debt due on the 1st or 2nd.
`,
  },
  {
    version: '1.20.1',
    date: '2026-10-03',
    notes: `
• Your debt-free date and payoff dates now count this month's payments before you log them. Before, a payment due later this month that you hadn't logged yet counted as next month's, so those dates ran a month late until you logged it.
• Full schedule (Pro) now starts with what's still due this month.
• When your plan never clears and the app suggests a method that needs Pro, it now says so.
`,
  },
  {
    version: '1.20',
    date: '2026-10-02',
    notes: `
• Save up for something without putting it on a card. On the Plan tab's Left over card (once your income or bills are in), choose "Save up for something", say what it costs and what you'll set aside each week or paycheck, and Debt Descent shows the day it's yours. Beside it: what charging it to your highest-rate card would cost in interest, and how much sooner the same money would make you debt-free.
• Your year so far: the share sheet has a new card for the year, with what you've paid, the debts you've cleared, the interest you've saved and your debt-free month.
• Log your next payment from the medium widget without opening the app. Its button names the payment ("Log $120.35 to Visa"), and Undo is right there.
• Keep notes on each debt, like a promo's fine print or who you spoke to and when: open the debt's ••• menu, then Edit details.
• Reading a statement now sets up a card's intro rate (like 0% until a date) as a promo, matches the minimum the statement printed, and names the card the way the statement does.
• The Progress tab shows your plan from today next to the plan you started with.
• History still marks what was extra, but now works it out from the amounts: whatever goes beyond a month's minimum is extra, so there's no box to tick when you log a payment. A skipped or deferred month stays in History too.
• Add the day each statement closes, and the statement notification arrives when the statement is actually out.
• If a loan is in deferment, its payment now joins your monthly total when the deferment ends. Before, the plan could run years longer than it really will.
• Amounts show your own currency everywhere, pounds and euros included.
• "Log" everywhere you log a payment, a refinance no longer counts as paying a debt off, and hundreds of smaller fixes from three full reviews of the app.
Updating more than one device? A device still on 1.19 keeps working, but a payment you skip or defer on 1.20 won't show there until that device updates too.
`,
  },
  {
    version: '1.19',
    date: '2026-09-25',
    notes: `
• Choose what happens to a paid-off debt's payment, with the new Roll payments forward switch in Settings ▸ Plan. On, the payment moves on to your next debt, which is how Snowball and Avalanche finish sooner. Off, you keep that money each month: each debt pays its own minimum, a paid-off debt's payment leaves your plan, and only your extra (if you've set any) moves between debts. The switch starts on, so your plan works just as it did before, and the setting syncs to your other devices.
• The interest tile on the Plan tab now shows what your debts cost in interest per day as its big figure, with today's running total beside it. Before, the big figure was the running total, which started over at $0 every midnight. To show the tile, turn on Settings ▸ Plan ▸ Interest per day tile.
`,
  },
  {
    version: '1.18.1',
    date: '2026-09-24',
    notes: `
• Press and hold a payment in Upcoming payments (or right-click it on the Mac) to record it, or to skip or defer this month's payment, just like on the Plan tab.
• Once you use the amount "Debt-free by" suggests, the line under the date names your extra, like "Your $787 extra a month gets you there."
`,
  },
  {
    version: '1.18',
    date: '2026-09-24',
    macDate: '2026-09-23',
    notes: `
Skip or defer a payment
• On the Plan tab, a debt's ••• menu now has "Skip this month's payment" and "Defer to next month." Before you confirm, it tells you what that costs, like "Skipping costs about $38 in interest and moves debt-free to March 2029," and reminds you to call your lender or card issuer first, since many will waive one late fee if you ask.
• Skipping means nothing is paid to that debt this month. Its interest still adds up, and the plan picks back up next month. Deferring adds this month's minimum to next month's payment, on top of your budget.
• The debt's row, Upcoming payments, Left over, and Debt payments all show it, so the numbers match what's really going out. With reminders on, a skipped month's reminder waits for next month, and a deferred payment's reminder includes what you deferred.
• To take it back, choose Undo skip or Undo defer from the same ••• menu. Skipping and deferring aren't offered for debts in a payment group, since one payment covers them all.
Debt-free by a date you pick (Pro)
• On the Plan tab, in the "Extra toward debt each month" card, pick a month and a year next to "Debt-free by," and Debt Descent tells you how much extra it takes, like "$240 extra a month gets you there with Avalanche." "Use $240" puts that amount in your plan. If the date is out of reach, it tells you the earliest your plan can clear.
On the Payments tab
• Upcoming payments works like a calendar now. If a debt comes due again before the last date in the list, it's listed again. You see the next six, with a line at the bottom saying how many more come after.
• Export your payment history from History's ••• menu or the Plan tab's ••• menu: a CSV for any spreadsheet (free), or a PDF with every payment and the totals (Pro). For the PDF, you choose each time between "Just the payments" and "Include my plan," which lets it import back.
• "Clear older than…" in History's ••• menu clears payments from before a date you pick, and you can save them as a CSV first. Your balances don't change, History keeps a line for what you cleared, and the Progress chart keeps its shape.
• Payments from another year now show the year, like "Nov 12, 2025."
Importing a plan
• If you already have debts, importing a plan now asks: "Add to my plan" or "Replace everything." Adding keeps your monthly extra, income, and bills as they are.
• Every plan PDF you export now carries your plan inside it, so Debt Descent can import it back. "Import plan (JSON or PDF)" in the Plan tab's ••• menu takes either one, including the PDFs from the debt calculators on my website. Just keep in mind that anyone you send a plan PDF to can open your plan too.
• Open a plan file straight from Files, Mail, or Messages on iPhone and iPad. On the Mac, use Open With in Finder, or drag it onto the Dock icon.
Also in this version
• Widgets follow your text size on iPhone and iPad, and on a tinted Home Screen the figures take the tint and the Log payment button no longer goes blank.
• Larger text sizes hold up better: amounts in Record, Income & bills, and the other sheets are no longer cut off, and the buttons stack when they need the room. On the Mac, the menu bar view now follows Settings ▸ Appearance ▸ Text size too.
• A card name that ends in digits is now shortened in the middle, so its last four digits still show.
Plus about a hundred smaller fixes, including how statements and paystubs are read.
`,
  },
  {
    version: '1.17.2',
    date: '2026-09-21',
    notes: `
Where your payments went
• Under Total paid in the Payments history, a new line: what went to interest rather than coming off your balances. It's the difference between what you've logged and how far your balances have dropped, so the two cards on the tab now add up on screen.
`,
  },
  {
    version: '1.17.1',
    date: '2026-09-20',
    notes: `
Clearer wording for debts you keep out of the plan
• "Track only" now reads "Track only (leave out of plan)," with "Put back in plan" as its partner, so it's clear the debt stays tracked.
• The row for such a debt shows a crossed-out flag instead of a crossed-out eye. It isn't hidden, it just has no payoff date in the plan.
• The line under the Where it's owed rings now says how many of those debts are in the total, like "$12,345 owed across 8 debts (1 not in the plan)," instead of "tracked-only included."
Thank you to the reader who wrote in about this!
`,
  },
  {
    version: '1.17',
    date: '2026-09-19',
    notes: `
Bigger text, VoiceOver, and where it's owed
• Text is a little bigger at the default size, and every screen now follows your Dynamic Type setting, all the way up to the accessibility sizes. On the Mac, Settings ▸ Appearance has its own Text size slider.
• VoiceOver: every field says what it's for, and each debt, payment, and balance reads as one sentence.
• Where it's owed: two rings on the Progress tab, by kind and by debt. Tap a slice (or hover on the Mac) to see which debt it is and its share.
• A Plan summary card with the next 30 days of interest and what the whole plan costs. It's off until you turn it on in Settings.
• A statement-day check: one quiet reminder a few days after each due day, when the new statement is in. Off by default, in Settings ▸ Notifications.
• Debt rows show when a payment steps up and by how much, and the descent chart draws a minimums-only line next to your plan.
• The widget can count down in days instead of months. Long-press it, choose Edit Widget, and pick Days.
• The share card now shows what your balances cost in interest every day.
• Settings has a gear on every tab. Debt payments, Left over, and Planned windfalls fold away, and so do paid-off debts under Balances.
• The Progress chart's actual line no longer jumps at the end.
`,
  },
  {
    version: '1.16',
    date: '2026-09-14',
    macDate: '2026-09-13',
    notes: `
Siri, a widget, and a better first day
• Siri and Shortcuts: ask "When am I debt-free in Debt Descent" or "How much interest am I saving in Debt Descent", or say "Log a payment to [debt name] in Debt Descent". The same actions show up in the Shortcuts app and, on the Mac, in Spotlight.
• A widget for your home screen, lock screen, and Mac desktop: your debt-free date, what's left, and a Log payment button.
• Your debts are in Spotlight: type a card's name and the result shows its balance and opens it in the app.
• A welcome on first open, with an example plan to try before you enter your own numbers, and a card that walks you through your first debt.
• Milestone cards on the Plan tab: your first payment, 25/50/75% cleared, a debt paid off, and debt-free, each with Share one tap away.
• Read a paystub into Income & bills: scan it or open a photo or PDF, and net pay and pay frequency fill in.
• Mortgage and medical debt kinds, a "Track only" option for balances you want to watch without putting them in the plan, and card utilization in your totals.
• An interest clock for the Plan tab, off until you turn it on in Settings: what today's interest costs, ticking to the cent.
• On the Mac, your debt-free date lives in the menu bar. On iPhone, a Control Center control and Home Screen quick actions jump straight to logging a payment.
• Record now opens on your next payment due, and the Progress chart scrolls sideways to the month your plan reaches zero.
• Amounts show in your region's currency, and you can redeem an offer code from Settings.
`,
  },
  {
    version: '1.15',
    date: '2026-09-06',
    macDate: '2026-09-07',
    notes: `
Loans in deferment
• Student loans in deferment: mark a loan "In deferment" with the date it ends. Nothing is due until then, the plan leaves it out and picks up its payment after, and a switch covers subsidized loans that don't accrue interest while deferred.
• Upcoming payments: a payment group with a plan fee now shows what leaves your bank and the fee, beside the amount that goes to your creditors.
• A design pass: one type scale, one look for every picker, and cards and rows that line up across the app. The method picker on the Plan tab is roomier, and Refinance & consolidation now sits at the end of the tab.
• Every ••• menu opens as a sheet on iPhone.
• The Plan tab's side-by-side savings tiles keep their figures the same size as you move the slider.
`,
  },
  {
    version: '1.14',
    date: '2026-09-04',
    mac: false,
    note: 'The Mac got this fix in 1.15.',
    notes: `
A small fix
• Upcoming payments: a payment group's name now wraps onto a second line instead of being cut short.
`,
  },
  {
    version: '1.13',
    date: '2026-09-03',
    notes: `
A cleaner, clearer app
• Input fields have a stronger outline and every button is blue, so what you can type into and what you can tap is obvious at a glance.
• Each debt now leads with its payoff date, and this month's payment shows its breakdown right beneath it.
• Recording a payment, adding a windfall, and logging a group payment share one layout: amount and date on one line.
• The Payments and Progress tabs use one consistent type size throughout.
Plus small spacing and alignment fixes everywhere.
`,
  },
  {
    version: '1.12',
    date: '2026-09-02',
    notes: `
New: enter pay and bills the way you actually get them
• Paid weekly, every 2 weeks, or twice a month? Pick the cadence right beside the income field and Debt Descent converts it to a true monthly average: 52 paychecks a year, never 48.
• Bills too: set each one weekly through yearly, and the Left over card stays correct in every view.
• Paid-off debts now tuck into their own collapsible section at the bottom of the list.
Plus a roomier payoff tester on iPhone, a cleaner Plan tab, and small fixes.
`,
  },
  {
    version: '1.11',
    date: '2026-08-31',
    notes: `
New: see what's really left over
• Enter your take-home pay and the monthly bills the plan doesn't track (rent or mortgage, insurance, utilities), and the new Left over card shows what's left after your debt payments, by week, month, or year.
• It uses your real plan: minimums, extra, rolled-forward minimums, and any fee a debt-management plan keeps.
• Free for everyone. It's on the Plan tab, in the ••• menu, or on a Mac, File ▸ Income & Bills…
Plus small fixes.
`,
  },
  {
    version: '1.10',
    date: '2026-08-29',
    notes: `
New: a shareable progress card
• It turns your paydown into a dark image with your percent paid off, the descent line, and your debt-free date. Post it, or send it to whoever is cheering you on.
• Three sizes: feed post, square, and story. A switch lets you show dollar amounts or keep it to percentages and dates.
• Share it from the new share button on the Progress tab, the ••• menu, or on a Mac, File ▸ Share Progress…
Plus small fixes.
`,
  },
  {
    version: '1.9',
    date: '2026-08-28',
    notes: `
The list holds still while you type, and Upcoming quotes your real plan:
• Type a balance and the list stays put: rows no longer leap to the top mid-edit while a half-typed number briefly reads as almost paid off; the list re-sorts, smoothly, when you leave the field
• On a Mac, Esc backs out of a balance edit and puts back the figure you started with
• Upcoming now asks for the same amount as your plan (your minimum, your extra, and the minimums rolling forward from debts you've paid down, itemized) instead of quoting only the bare minimum, so the two screens finally agree
• When your plan directs extra to a debt paid through a payment group, the group's row now says so: how much, to which debt, and that it goes straight to the creditor rather than through the group's payment
Plus small fixes.
`,
  },
  {
    version: '1.8',
    date: '2026-08-05',
    notes: `
Photograph a paper statement, and the app finally notices when you've paid:
• Scan a statement with your camera: point it at a paper statement and Debt Descent reads the balance, APR, minimum payment and due date off it, then shows you every figure to confirm before anything is saved (iPhone and iPad)
• Everything stays on your device: the page is read by Apple's on-device text recognition and Apple Intelligence, and nothing is uploaded
• Statement import now finds the rate: on a multi-page statement the APR often sits on the last page, behind pages of transactions, and it was being missed
• On a Mac, Import statement now takes a photo as well as a PDF
• Your debts stop asking to be paid twice: a debt you've paid this month says so, and drops out of Upcoming until next month
• Log a payment straight from the Upcoming list, including a grouped payment
• Payment plans can record the fee the plan keeps: enter the amount that reaches your creditors and the fee separately, and the app shows the total your bank will actually draft, without pretending the fee pays down debt
• A debt paid through a plan now shows the plan's payment date, not the date its own statement asks for
• History adds up: total, minimum payments, and tagged extra, so the three reconcile on screen
• Deadline warnings for 0% store promos appear when they matter: a deadline a year out that your plan already clears no longer sits at the top of the app, and comes back on its own if your plan stops clearing it in time
• Deferred-interest promos read correctly on the debt list, instead of quoting a couple of dollars of interest beside a warning about hundreds
• Load sample data is offered only on an empty app, so it can't replace real debts by accident
`,
  },
  {
    version: '1.7',
    date: '',
    macDate: '2026-07-31',
    notes: `
One payment covering several debts, and a refinance you can act on:
• Payment groups: when one monthly payment covers several of your debts, group them and log it once; Debt Descent splits the payment across the group to the cent
• The split follows the schedule you're on: when every debt in the group has its own fixed payment, the shares match those payments instead of the balances
• Upcoming shows the group as one row, with one reminder and one calendar event instead of four, and History keeps it as the single payment it was, expandable to each debt's share
• Grouping changes only how you record and see that payment: each debt keeps its own balance, rate, and place in your payoff order
• Apply a refinance you've modeled: the new account is created, the balances it absorbs are closed out with their history kept, and their old payments stop rolling forward
• "New rates," a third kind of refinance for a hardship or debt-management plan: your accounts survive, each at its own new rate
• For an account in a 0% promo, choose whether the new rate starts now or after the promo runs out
• The monthly budget breakdown now shows cents, so its rows add up to the printed total exactly
• The Payments tab opens on Upcoming, with Balances and History tucked behind their headings, and it remembers however you leave it
• A loan's payoff quote is editable at last, shown beside its balance with the gap between them
• Two 0% promos on one card no longer share one warning: each gets its own deadline and required-monthly figure
• Dates hold up wherever you are: promo deadlines and day counts no longer land a day off in time zones whose clocks change at midnight
Plus sharper statement reading and small fixes.
`,
  },
  {
    version: '1.6',
    date: '2026-07-28',
    notes: `
An accuracy fix worth updating for:
• Your payoff plan no longer depends on the order your debts are listed in: reordering the list leaves your debt-free date and interest total exactly as they were
• The plan now always covers your minimum payments in full, and tells you plainly when interest has pushed them above the budget you set, with the difference shown on its own line
• The savings tile and the recommendation under it now measure against the same method, so the two figures always agree at a glance
• Reopening or editing a cleared debt no longer stops its freed minimum rolling onto your next target
• A debt with no monthly payment can't be saved by mistake, so nothing sits in your plan never being paid down
Plus small fixes.
`,
  },
  {
    version: '1.5',
    date: '2026-07-25',
    macDate: '2026-07-23',
    notes: `
A tidier Payments tab, and matching numbers throughout:
• Payments folds away: Upcoming, Balances, and History each tuck behind their heading, so you see only the section you want
• The Plan and Progress screens now match exactly: the same typeface, spacing, and sizing, so your figures line up wherever they appear
• Numbers read cleaner everywhere, with aligned digits that no longer clip or shift as they change
Plus small fixes.
`,
  },
  {
    version: '1.4',
    date: '2026-07-23',
    macDate: '2026-07-15',
    notes: `
A round of visual polish:
• The Plan screen reads cleanly on iPhone: the monthly-payment tile, the payoff-date line, and the savings figures no longer clip or render at mismatched sizes on smaller screens
• The ••• data menu is tidier, with even spacing and more room around its edges
Plus small fixes.
`,
  },
  {
    version: '1.3',
    date: '2026-07-14',
    notes: `
See what your work has already earned:
• "You've already saved $X in interest": the Payments tab now shows how much interest your paydown has permanently knocked out, beside what staying the course still saves
• Balances now follow your plan's attack order, matching the Plan tab. Paid-off debts drop to the bottom
• Payment history shows its total, plus a subtotal of payments you tagged EXTRA
• Fix a logged payment without deleting it: edit the date, amount, note, or even which debt it went to
• History stays tidy: the last 30 days in view, everything earlier one tap away
• Cents stay put: a balance entered as 723.80 now shows 723.80, never 723.8, and wider fields so figures never clip
• The plan's third tile now says "Monthly payment," the number that actually leaves your pocket each month
• "Stop rolling minimum payment forward": the roll-forward control now says exactly what it does
• The amortization schedule lists only debts you still owe on
• What-if tests now announce themselves above your debts, so a test can never recolor the numbers without saying so
• Pay off a debt and Debt Descent reminds you a month later to glance at the final statement. Trailing interest hides there (with reminders on)
• A new Settings screen: turn due-date reminders and the payoff follow-up on or off, per device (also ⌘, on Mac)
• Statement import double-checks every number the on-device AI reads against the document itself: a rate or balance that isn't printed on your statement can never be imported
• The method-comparison tile now says what your method saves, what it costs, or "same either way," instead of going quiet
Plus engine hardening and small fixes.
`,
  },
  {
    version: '1.2',
    date: '2026-07',
    notes: `
Your plan, on every device:
• iCloud sync: your debts, payments, and plan now stay up to date automatically across your iPhone, iPad, and Mac
• No setup and no account needed: just be signed in to iCloud with the same Apple Account on each device
• Everything lives in your own private iCloud, we never see it, and sync is free for everyone
Your method, front and center:
• The recommendation now follows the payoff method you're viewing: see what your pick saves, or exactly what the cheapest method would save you instead
• The savings tile matches your selected method, so every figure on the screen tells one story
• If a 0% promo makes Snowball your cheapest path, Debt Descent now says so
• Each debt row now itemizes its payment: your minimum, your extra, and the minimums rolling forward from debts you've already paid down
• Select and copy any figure: payoff dates, the budget breakdown, the full schedule (on Mac, click anywhere else to deselect)
• A clearer methods guide: the Cash-flow index explanation now matches how your committed budget really works
Plus small fixes and polish.
`,
  },
  {
    version: '1.1',
    date: '2026-07-09',
    notes: `
The Plan screen gets a big refresh:
• A bold “debt-free by” headline up top, with a one-tap switcher to change your payoff method right there
• Type your extra payment, or drag the what-if slider, and watch your debt-free date and total interest update live
• See exactly what a planned windfall (a bonus or tax refund) saves you, and how much sooner it gets you debt-free
• A clearer monthly budget breakdown, smoother charts, and lots of polish
Plus performance and reliability improvements.
`,
  },
  {
    version: '1.0',
    date: '2026-07-02',
    notes: `
First release. Plan your debt payoff with the Snowball and Avalanche methods, see your exact debt-free date and interest saved, import a statement on-device, and track your progress. Built natively for iPhone and iPad.
`,
    macNotes: `
First release for Mac. Plan your debt payoff with the Snowball and Avalanche methods, see your debt-free date and interest saved, model refinances and snowflakes, and export your plan to PDF.
`,
  },
];
