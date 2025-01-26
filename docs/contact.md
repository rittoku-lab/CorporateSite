---
title: お問い合わせ | 合同会社リットク
description: お問い合わせフォームページ。ご質問、ご相談などお気軽にお問い合わせください。
head:
  - - meta
    - name: keywords
      content: お問い合わせ, コンタクト, 問い合わせフォーム
---

<script setup lang="ts">
import { ref } from 'vue'

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

const name = ref('')
const email = ref('')
const message = ref('')
const errors = ref<FormErrors>({})
const isSubmitting = ref(false)
const isSuccess = ref(false)
const submitError = ref('')

const validateForm = (): boolean => {
  errors.value = {}

  if (!name.value.trim()) {
    errors.value.name = 'お名前を入力してください'
  }

  if (!email.value.trim()) {
    errors.value.email = 'メールアドレスを入力してください'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = '有効なメールアドレスを入力してください'
  }

  if (!message.value.trim()) {
    errors.value.message = 'お問い合わせ内容を入力してください'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async (): Promise<void> => {
  if (!validateForm()) return

  submitError.value = ''
  isSubmitting.value = true

  try {
    // Google Formの送信URLを設定
    const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSclLmnMPyF_1lQ9cLLJjpgeL6sIq3MLhucv9dw5-TDLePe47A/formResponse'

    // Google FormのフィールドIDを設定
    const formData = new FormData()
    formData.append('entry.482512025', name.value) // 名前のフィールドID
    formData.append('emailAddress', email.value) // メールアドレスのフィールドID
    formData.append('entry.406323743', message.value) // お問い合わせ内容のフィールドID

    // フォームの送信
    const response = await fetch(formUrl, {
      method: 'POST',
      mode: 'no-cors',
      body: formData
    })

    if (response.type === 'opaque') {
      isSuccess.value = true
    } else {
      submitError.value = 'エラーが発生しました。もう一度お試しください。'
    }

  } catch (error) {
    submitError.value = 'エラーが発生しました。もう一度お試しください。'
  } finally {
    isSubmitting.value = false
  }
}
</script>

# お問い合わせ

ご質問、ご相談などございましたら、下記フォームよりお気軽にお問い合わせください。

<div class="contact-form">
  <div v-if="isSuccess">
    <p>お問い合わせありがとうございます<br/>
    内容を確認次第、担当者よりご連絡させていただきます。</p>
  </div>

  <form v-else @submit.prevent="handleSubmit">
    <div v-if="submitError" class="error-message submit-error">
      {{ submitError }}
    </div>
    <div class="form-group">
      <label for="name">お名前 <span class="required">*</span></label>
      <input
        id="name"
        v-model="name"
        type="text"
        :class="{ 'error': errors.name }"
      >
      <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
    </div>
    <div class="form-group">
      <label for="email">メールアドレス <span class="required">*</span></label>
      <input
        id="email"
        v-model="email"
        type="email"
        :class="{ 'error': errors.email }"
      >
      <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
    </div>
    <div class="form-group">
      <label for="message">お問い合わせ内容 <span class="required">*</span></label>
      <textarea
        id="message"
        v-model="message"
        rows="5"
        :class="{ 'error': errors.message }"
      ></textarea>
      <span v-if="errors.message" class="error-message">{{ errors.message }}</span>
    </div>
    <div class="form-actions">
      <div class="privacy-notice">
        <p>送信することで、<a href="/privacy-policy">プライバシーポリシー</a>に同意したものとみなします。</p>
      </div>
      <button type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? '送信中...' : '送信する' }}
      </button>
    </div>
  </form>
</div>

<style>
.contact-form {
  max-width: 600px;
  margin: 2rem auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.required {
  color: #ff4444;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  font-size: 1rem;
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

input.error,
textarea.error {
  border-color: #ff4444;
}

.error-message {
  color: #ff4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.submit-error {
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: #fff5f5;
  border: 1px solid #ff4444;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.privacy-notice {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.form-actions button {
  background-color: var(--vp-c-brand);
  color: var(--vp-c-bg);
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.form-actions button:hover {
  background-color: var(--vp-c-brand-dark);
}

.form-actions button:disabled {
  background-color: var(--vp-c-gray);
  cursor: not-allowed;
}
</style>
