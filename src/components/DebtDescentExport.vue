<script setup lang="ts">
import { ref } from 'vue';
import { downloadJson, downloadPdf, type DebtDescentExport, type PdfSpec } from '../lib/debt-descent-export';

/*
 * The "Download for Debt Descent" block at the end of a calculator's results.
 * The JSON is the app's import format; the PDF is the same result on a page
 * with that JSON attached inside it (see src/lib/debt-descent-export.ts).
 */
const props = defineProps<{
  payload: DebtDescentExport;
  pdf: PdfSpec;
  /** What the file holds, finishing "a debt-descent.json with …": "the debts above". */
  describes: string;
  /** Umami event prefix, one per calculator; "-json" and "-pdf" are appended. */
  event: string;
}>();

const pdfBusy = ref(false);
const pdfError = ref(false);

function onJson() {
  downloadJson(props.payload);
}

async function onPdf() {
  pdfBusy.value = true;
  pdfError.value = false;
  try {
    await downloadPdf(props.pdf, props.payload);
  } catch {
    pdfError.value = true;
  } finally {
    pdfBusy.value = false;
  }
}
</script>

<template>
  <div class="mt-8 rounded-lg border border-slate-200 p-4 sm:p-5">
    <h3 class="text-base font-semibold text-slate-900">Take these numbers into Debt Descent</h3>
    <div class="mt-3 flex flex-wrap items-center gap-3">
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-md bg-accent-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-700"
        :data-umami-event="`${event}-json`"
        @click="onJson"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M5 20h14" /></svg>
        Download for Debt Descent
      </button>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-accent-600 hover:text-accent-600 disabled:opacity-60"
        :disabled="pdfBusy"
        :data-umami-event="`${event}-pdf`"
        @click="onPdf"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M7 3h7l5 5v13H7zM14 3v5h5M9 13h6M9 17h6" /></svg>
        {{ pdfBusy ? 'Making the PDF…' : 'Save as PDF' }}
      </button>
    </div>
    <p class="mt-3 text-sm leading-relaxed text-slate-600">
      The download is a small <code class="rounded bg-slate-100 px-1 py-0.5 text-[0.85em]">debt-descent.json</code> with {{ describes }},
      in the format the app imports. Importing replaces what’s already in Debt Descent, so it’s best on a
      fresh install (or export the app’s own data first). Each file is a whole plan, so import the one that fits
      your situation and add anything else in the app afterwards. In the app: Plan tab ▸ ••• ▸ Data options ▸ Import JSON.
      The PDF is the same result on a page, with that file tucked inside it as an attachment.
    </p>
    <p v-if="pdfError" class="mt-2 text-sm text-amber-700">The PDF didn’t build. Try again, or use the JSON download.</p>
  </div>
</template>
