<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{ endpoint: string }>();

type Status = 'idle' | 'sending' | 'success' | 'error';

const name = ref('');
const email = ref('');
const message = ref('');
const botField = ref(''); // honeypot
const status = ref<Status>('idle');
const errorMessage = ref('');

const disabled = computed(() => status.value === 'sending');

async function onSubmit(event: Event) {
  event.preventDefault();
  if (botField.value) return; // bot
  if (!props.endpoint) {
    status.value = 'error';
    errorMessage.value = 'Contact endpoint is not configured.';
    return;
  }

  status.value = 'sending';
  errorMessage.value = '';

  try {
    const res = await fetch(props.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        message: message.value,
      }),
    });

    if (!res.ok) throw new Error(`Request failed (${res.status})`);

    status.value = 'success';
    name.value = '';
    email.value = '';
    message.value = '';
  } catch (err) {
    status.value = 'error';
    errorMessage.value = err instanceof Error ? err.message : 'Something went wrong.';
  }
}
</script>

<template>
  <form class="space-y-4" @submit="onSubmit" novalidate>
    <div>
      <label for="name" class="mb-1 block text-sm font-medium text-slate-700">Name</label>
      <input
        id="name"
        v-model="name"
        type="text"
        required
        autocomplete="name"
        class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
      />
    </div>

    <div>
      <label for="email" class="mb-1 block text-sm font-medium text-slate-700">Email</label>
      <input
        id="email"
        v-model="email"
        type="email"
        required
        autocomplete="email"
        class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
      />
    </div>

    <div>
      <label for="message" class="mb-1 block text-sm font-medium text-slate-700">Message</label>
      <textarea
        id="message"
        v-model="message"
        rows="6"
        required
        class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
      />
    </div>

    <!-- Honeypot: visible to bots, hidden from humans -->
    <div class="sr-only" aria-hidden="true">
      <label for="website">Website</label>
      <input id="website" v-model="botField" type="text" tabindex="-1" autocomplete="off" />
    </div>

    <button
      type="submit"
      :disabled="disabled"
      class="inline-flex items-center rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {{ status === 'sending' ? 'Sending…' : 'Send Message' }}
    </button>

    <p v-if="status === 'success'" class="text-sm text-emerald-600" role="status">
      Thanks — your message is on its way.
    </p>
    <p v-if="status === 'error'" class="text-sm text-red-600" role="alert">
      {{ errorMessage }}
    </p>
  </form>
</template>
