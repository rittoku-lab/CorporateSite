<script setup lang="ts">
import { ref, computed } from 'vue';

type ServiceId = 'booking' | 'soan' | 'tsuzuri';
type FormState = 'idle' | 'submitting' | 'success' | 'error';

const props = defineProps<{ service: ServiceId }>();

const message = ref('');
const website = ref(''); // honeypot
const state = ref<FormState>('idle');
const errorText = ref('');

const MAX_LEN = 2000;
const remaining = computed(() => MAX_LEN - message.value.length);
const tooLong = computed(() => remaining.value < 0);
const canSubmit = computed(
  () => state.value === 'idle' && message.value.trim().length > 0 && !tooLong.value,
);

async function handleSubmit(): Promise<void> {
  if (!canSubmit.value) return;

  const gasUrl = import.meta.env.VITE_FEEDBACK_GAS_URL;
  const token = import.meta.env.VITE_FEEDBACK_SHARED_TOKEN;
  if (!gasUrl || !token) {
    state.value = 'error';
    errorText.value = '送信先が未設定です。サイト管理者にご連絡ください。';
    return;
  }

  state.value = 'submitting';
  errorText.value = '';

  try {
    const res = await fetch(`${gasUrl}?t=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        service: props.service,
        message: message.value,
        website: website.value,
        submittedAt: new Date().toISOString(),
      }),
    });
    const data = await res.json();
    if (data.ok) {
      state.value = 'success';
    } else {
      state.value = 'error';
      errorText.value = '送信に失敗しました。時間をおいて再度お試しください。';
    }
  } catch (_) {
    state.value = 'error';
    errorText.value = '送信に失敗しました。ネットワークをご確認のうえ、再度お試しください。';
  }
}

function reset(): void {
  state.value = 'idle';
  errorText.value = '';
}
</script>

<template>
  <div class="feedback-form">
    <div v-if="state === 'success'" class="feedback-success">
      <p>お送りいただきありがとうございました。</p>
      <p class="feedback-note">
        個別のご返信はいたしかねますが、内容は担当者で確認します。
        返信が必要なご相談は <a href="/contact">お問い合わせ</a> をご利用ください。
      </p>
    </div>

    <form v-else @submit.prevent="handleSubmit">
      <label for="feedback-message" class="feedback-label">
        不具合のご報告・ご要望などお寄せください
      </label>
      <textarea
        id="feedback-message"
        v-model="message"
        rows="5"
        :maxlength="MAX_LEN"
        :disabled="state === 'submitting'"
        placeholder="例) Markdown プレビューでテーブルが崩れます"
      />

      <input
        v-model="website"
        type="text"
        name="website"
        tabindex="-1"
        autocomplete="off"
        aria-hidden="true"
        class="feedback-honeypot"
      />

      <p v-if="errorText" class="feedback-error">{{ errorText }}</p>

      <div class="feedback-actions">
        <p class="feedback-note">
          送信内容と送信日時、サービス名がスタッフに共有されます。<br />
          個別返信はできません。返信が必要なご相談は <a href="/contact">お問い合わせ</a> をご利用ください。
        </p>
        <button
          type="submit"
          :disabled="!canSubmit"
        >
          {{ state === 'submitting' ? '送信中…' : '送信する' }}
        </button>
      </div>
    </form>

    <button v-if="state === 'error'" type="button" class="feedback-retry" @click="reset">
      フォームに戻る
    </button>
  </div>
</template>

<style scoped>
.feedback-form {
  margin: 24px 0 8px;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background-color: var(--vp-c-bg-soft);
}

.feedback-label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
}

.feedback-form textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  font-size: 1rem;
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  resize: vertical;
}

.feedback-honeypot {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.feedback-actions {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-top: 12px;
}

.feedback-note {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  margin: 0;
}

.feedback-actions button {
  background-color: var(--vp-c-brand);
  color: #fff;
  padding: 0.6rem 1.4rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  white-space: nowrap;
}

.feedback-actions button:hover:not(:disabled) {
  opacity: 0.85;
}

.feedback-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.feedback-error {
  margin: 8px 0 0;
  padding: 8px;
  background-color: rgba(255, 68, 68, 0.08);
  border: 1px solid rgba(255, 68, 68, 0.4);
  border-radius: 4px;
  color: #c00;
  font-size: 0.9rem;
}

.feedback-success p:first-child {
  font-weight: 600;
  margin-top: 0;
}

.feedback-retry {
  margin-top: 12px;
  background: transparent;
  color: var(--vp-c-brand);
  border: 1px solid var(--vp-c-brand);
  padding: 0.4rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}
</style>
