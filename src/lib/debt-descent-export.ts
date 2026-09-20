/*
 * "Download for Debt Descent" exports from the /debt-descent calculators.
 *
 * Two files, both generated in the browser from the numbers on the page:
 *
 *   debt-descent.json   The app's import format (Plan tab ▸ ••• ▸ Data
 *                       options ▸ Import JSON). Importing REPLACES the app's
 *                       store, which the copy under the button says.
 *   <calculator>.pdf    The same result on a page, with the JSON above
 *                       embedded as a document-level file attachment
 *                       (catalog /Names ▸ /EmbeddedFiles, which is what
 *                       pdf-lib's attach() writes) named debt-descent.json.
 *                       Debt Descent 1.18 reads that attachment; until then
 *                       the site does not promise it.
 *
 * Compatibility with the app is structural, not versioned: every key but
 * debts[].name / balance / apr is optional. APRs are percentages (22.99, not
 * 0.2299), dollars are plain numbers, dates are "yyyy-MM-dd".
 */

export type DebtKind =
  | 'creditCard'
  | 'personalLoan'
  | 'autoLoan'
  | 'studentLoan'
  | 'mortgage'
  | 'medicalDebt'
  | 'other';

export interface ExportPromo {
  label: string;
  amount: number;
  /** "yyyy-MM-dd" */
  expiresOn: string;
  deferredInterest: number;
}

export interface ExportDebt {
  name: string;
  kind?: DebtKind;
  balance: number;
  /** Percent, e.g. 22.99. */
  apr: number;
  /** A fixed dollar minimum. */
  minPayment?: number;
  dueDay?: number;
  /** "yyyy-MM-dd": when a promotional APR ends. */
  promoExpires?: string;
  /** The APR the balance reverts to when the promo ends. */
  revertApr?: number;
  promos?: ExportPromo[];
}

export interface ExportGroup {
  name: string;
  totalPayment: number;
  monthlyFee?: number;
  dueDay?: number;
  /** Debt names; the app resolves them. */
  members: string[];
}

export interface DebtDescentExport {
  extraMonthly?: number;
  debts: ExportDebt[];
  groups?: ExportGroup[];
}

export const JSON_FILENAME = 'debt-descent.json';

/** Two decimals, as a number (the engines keep integer cents; inputs may not). */
export const cents = (n: number): number => Math.round(n * 100) / 100;

/**
 * A best guess at the app's debt kind from the name a visitor typed. Omitted
 * (undefined) when nothing in the name says; the app assumes a default.
 */
export function guessKind(name: string): DebtKind | undefined {
  const n = name.toLowerCase();
  if (/\b(mortgage|home loan|heloc|home equity)\b/.test(n)) return 'mortgage';
  if (/\b(student|sallie|navient|nelnet|mohela)\b/.test(n)) return 'studentLoan';
  if (/\b(car|auto|truck|vehicle)\b/.test(n)) return 'autoLoan';
  if (/\b(medical|hospital|dental|doctor|clinic)\b/.test(n)) return 'medicalDebt';
  if (/\b(card|visa|mastercard|amex|discover|store)\b/.test(n)) return 'creditCard';
  if (/\b(personal|loan|financing|affirm|klarna|afterpay)\b/.test(n)) return 'personalLoan';
  return undefined;
}

/** Drops undefined keys so the file only carries what the calculator knows. */
function compact<T extends object>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}

export function toJson(payload: DebtDescentExport): string {
  const clean: DebtDescentExport = compact({
    ...payload,
    debts: payload.debts.map((d) => compact(d)),
    groups: payload.groups?.map((g) => compact(g)),
  });
  return JSON.stringify(clean, null, 2) + '\n';
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Give the click a tick before revoking, or Safari can lose the download.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadJson(payload: DebtDescentExport) {
  saveBlob(new Blob([toJson(payload)], { type: 'application/json' }), JSON_FILENAME);
}

// ————— PDF —————

export interface PdfSection {
  heading: string;
  /**
   * Column headers for a table. Omit for label/value rows: the first cell is
   * the label, the rest are right-aligned values.
   */
  columns?: string[];
  rows: string[][];
}

export interface PdfSpec {
  /** Big line at the top, e.g. "Debt payoff plan". */
  title: string;
  /** Under the title, e.g. "Snowball · 12 debts". */
  subtitle?: string;
  sections: PdfSection[];
  /** Small paragraphs after the sections: the verdict, caveats. */
  notes?: string[];
  /** The calculator's URL, printed in the footer. */
  sourceUrl: string;
  /** Filename for the download, e.g. "debt-payoff-plan.pdf". */
  filename: string;
}

// pdf-lib's standard fonts encode WinAnsi only; anything else throws. Keep
// ASCII plus Latin-1 and the few typographic marks the page copy uses.
const safe = (s: string): string =>
  s.replace(/[^\x20-\x7E -ÿ‘’“”–—•…]/g, '');

const GREEN = { r: 0x35 / 255, g: 0x5e / 255, b: 0x3b / 255 };
const INK = { r: 0x0f / 255, g: 0x17 / 255, b: 0x2a / 255 };
const MUTED = { r: 0x64 / 255, g: 0x74 / 255, b: 0x8b / 255 };
const RULE = { r: 0xe2 / 255, g: 0xe8 / 255, b: 0xf0 / 255 };

const PAGE = { w: 612, h: 792, margin: 54 };

export async function downloadPdf(spec: PdfSpec, payload: DebtDescentExport) {
  // Loaded on demand: pdf-lib is a few hundred KB nobody needs until they click.
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');

  const doc = await PDFDocument.create();
  doc.setTitle(safe(spec.title));
  doc.setAuthor('seanmandable.me');
  doc.setProducer('seanmandable.me');
  doc.setCreator('seanmandable.me');
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const green = rgb(GREEN.r, GREEN.g, GREEN.b);
  const ink = rgb(INK.r, INK.g, INK.b);
  const muted = rgb(MUTED.r, MUTED.g, MUTED.b);
  const rule = rgb(RULE.r, RULE.g, RULE.b);

  const x0 = PAGE.margin;
  const x1 = PAGE.w - PAGE.margin;
  const width = x1 - x0;
  const footerTop = PAGE.margin + 18;

  let page = doc.addPage([PAGE.w, PAGE.h]);
  let y = PAGE.h - PAGE.margin;

  const footer = () => {
    page.drawLine({ start: { x: x0, y: footerTop + 8 }, end: { x: x1, y: footerTop + 8 }, thickness: 0.5, color: rule });
    page.drawText(safe(`From the free calculator at ${spec.sourceUrl}`), { x: x0, y: footerTop - 4, size: 8, font: regular, color: muted });
    const right = safe(`Attached: ${JSON_FILENAME} for Debt Descent`);
    page.drawText(right, { x: x1 - regular.widthOfTextAtSize(right, 8), y: footerTop - 4, size: 8, font: regular, color: muted });
  };
  footer();

  const ensure = (needed: number) => {
    if (y - needed >= footerTop + 20) return;
    page = doc.addPage([PAGE.w, PAGE.h]);
    y = PAGE.h - PAGE.margin;
    footer();
  };

  const wrap = (text: string, size: number, font: typeof regular, maxWidth: number): string[] => {
    const words = safe(text).split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let line = '';
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth || !line) line = candidate;
      else {
        lines.push(line);
        line = word;
      }
    }
    if (line) lines.push(line);
    return lines;
  };

  const paragraph = (text: string, size: number, font: typeof regular, color = ink, maxWidth = width) => {
    const lines = wrap(text, size, font, maxWidth);
    const lead = size * 1.4;
    ensure(lines.length * lead);
    for (const line of lines) {
      y -= lead;
      page.drawText(line, { x: x0, y, size, font, color });
    }
  };

  // Title block.
  paragraph(spec.title, 20, bold, green);
  if (spec.subtitle) {
    y -= 2;
    paragraph(spec.subtitle, 10.5, regular, muted);
  }
  const stamp = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date());
  paragraph(`Run on ${stamp}. Estimates, from the numbers you entered.`, 9, regular, muted);

  // Sections.
  const SIZE = 10;
  const LEAD = 16;
  for (const section of spec.sections) {
    const cols = section.columns?.length ?? 2;
    const labelWidth = cols > 2 ? width * 0.34 : width * 0.55;
    const slot = (width - labelWidth) / (cols - 1);
    const cellX = (i: number, text: string, font: typeof regular, size: number) =>
      i === 0 ? x0 : x0 + labelWidth + slot * i - font.widthOfTextAtSize(text, size);

    ensure(LEAD * 3);
    y -= 22;
    page.drawText(safe(section.heading), { x: x0, y, size: 12, font: bold, color: ink });
    y -= 6;
    page.drawLine({ start: { x: x0, y }, end: { x: x1, y }, thickness: 0.75, color: green });

    if (section.columns) {
      ensure(LEAD);
      y -= LEAD;
      section.columns.forEach((c, i) => {
        const text = safe(c);
        page.drawText(text, { x: cellX(i, text, bold, 8.5), y, size: 8.5, font: bold, color: muted });
      });
    }

    for (const row of section.rows) {
      // Long labels wrap; values are short and sit on the first line.
      const labelLines = wrap(row[0] ?? '', SIZE, regular, labelWidth - 8);
      ensure(LEAD * labelLines.length);
      y -= LEAD;
      const top = y;
      labelLines.forEach((line, i) => {
        if (i > 0) y -= SIZE * 1.3;
        page.drawText(line, { x: x0, y, size: SIZE, font: regular, color: i === 0 ? ink : muted });
      });
      row.slice(1).forEach((cell, i) => {
        const text = safe(cell);
        page.drawText(text, { x: cellX(i + 1, text, regular, SIZE), y: top, size: SIZE, font: regular, color: ink });
      });
      page.drawLine({ start: { x: x0, y: y - 5 }, end: { x: x1, y: y - 5 }, thickness: 0.4, color: rule });
    }
  }

  // Notes.
  if (spec.notes?.length) {
    y -= 10;
    for (const note of spec.notes) {
      y -= 4;
      paragraph(note, 9, regular, muted);
    }
  }

  // The import file, as a document-level attachment (catalog /Names ▸ /EmbeddedFiles).
  const json = new TextEncoder().encode(toJson(payload));
  const now = new Date();
  await doc.attach(json, JSON_FILENAME, {
    mimeType: 'application/json',
    description: 'Debt Descent import',
    creationDate: now,
    modificationDate: now,
  });

  const bytes = await doc.save();
  saveBlob(new Blob([bytes as BlobPart], { type: 'application/pdf' }), spec.filename);
}
