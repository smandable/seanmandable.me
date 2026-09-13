<script setup lang="ts">
import { computed, ref } from 'vue';

/*
 * One-field list signup. There is no list provider yet, so this posts to the
 * site's contact endpoint with a fixed "name" that tags the subject line
 * ("Contact form: Calculator list"); each signup arrives as an email.
 */
const props = defineProps<{
  endpoint: string;
  /** Where the signup came from, for the message body. */
  source: string;
  /** Umami event fired on a successful submit. */
  event: string;
}>();

type Status = 'idle' | 'sending' | 'success' | 'error';

const email = ref('');
const botField = ref(''); // honeypot
const status = ref<Status>('idle');
const errorMessage = ref('');

const disabled = computed(() => status.value === 'sending');

async function onSubmit(event: Event) {
  event.preventDefault();
  if (botField.value) return; // bot
  const address = email.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
    status.value = 'error';
    errorMessage.value = 'That doesn’t look like an email address.';
    return;
  }
  if (!props.endpoint) {
    status.value = 'error';
    errorMessage.value = 'The signup endpoint is not configured.';
    return;
  }

  status.value = 'sending';
  errorMessage.value = '';

  try {
    const res = await fetch(props.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name: 'Calculator list',
        email: address,
        message: `Please add me to the Debt Descent calculator list. Signed up on ${props.source}.`,
      }),
    });
    if (!res.ok) throw new Error(`Request failed (${res.status})`);

    status.value = 'success';
    email.value = '';

    // Fire-and-forget Umami custom event. Guarded because Umami is only
    // loaded in production builds.
    if (typeof window !== 'undefined' && (window as any).umami?.track) {
      (window as any).umami.track(props.event);
    }
  } catch (err) {
    status.value = 'error';
    errorMessage.value = err instanceof Error ? err.message : 'Something went wrong.';
  }
}
</script>

<template>
  <form class="mt-4" @submit="onSubmit" novalidate>
    <label for="list-email" class="sr-only">Email</label>
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        id="list-email"
        v-model="email"
        type="email"
        required
        autocomplete="email"
        placeholder="you@example.com"
        :disabled="status === 'success'"
        class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-accent-600 focus:outline-none focus:ring-1 focus:ring-accent-600 disabled:bg-slate-50 sm:max-w-xs"
      />
      <button
        type="submit"
        :disabled="disabled || status === 'success'"
        class="inline-flex shrink-0 items-center justify-center rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {{ status === 'sending' ? 'Sending…' : status === 'success' ? 'Signed up' : 'Sign up' }}
      </button>
    </div>

    <!-- Honeypot: visible to bots, hidden from humans -->
    <div class="sr-only" aria-hidden="true">
      <label for="list-website">Website</label>
      <input id="list-website" v-model="botField" type="text" tabindex="-1" autocomplete="off" />
    </div>

    <p v-if="status === 'success'" class="mt-2 text-sm text-emerald-600" role="status">
      Thanks. You’re on the list.
    </p>
    <p v-if="status === 'error'" class="mt-2 text-sm text-red-600" role="alert">
      {{ errorMessage }}
    </p>
  </form>
</template>
