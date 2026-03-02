<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)

async function onSubmit() {
  error.value = ''
  success.value = ''
  if (!username.value || !email.value || !password.value) {
    error.value = 'Username, email and password are required.'
    return
  }
  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters.'
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.'
    return
  }
  loading.value = true
  try {
    await auth.register(username.value, email.value, password.value)
    success.value = 'Account created. You can now log in.'
    setTimeout(() => router.push('/login'), 1500)
  } catch (e) {
    error.value = e.message || 'Registration failed.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container auth-page">
    <div class="card auth-card">
      <div class="auth-header">
        <h1 class="page-title">Register</h1>
        <p class="auth-subtitle">Create your AliDevHub account</p>
      </div>
      <form @submit.prevent="onSubmit" class="auth-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input id="username" v-model="username" type="text" placeholder="johndoe" required />
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" v-model="email" type="email" placeholder="you@example.com" required />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input id="password" v-model="password" type="password" placeholder="At least 8 characters" required />
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirm password</label>
          <input id="confirmPassword" v-model="confirmPassword" type="password" placeholder="••••••••" required />
        </div>
        <p v-if="error" class="error-msg">{{ error }}</p>
        <p v-if="success" class="success-msg">{{ success }}</p>
        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          {{ loading ? 'Creating account…' : 'Create account' }}
        </button>
        <p class="auth-footer">
          Already have an account? <router-link to="/login">Login</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  max-width: 420px;
}

.auth-card {
  padding: 2rem;
}

.auth-header {
  margin-bottom: 1.5rem;
}

.auth-subtitle {
  color: var(--text-secondary);
  margin: 0.25rem 0 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
}

.btn-block {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.75rem;
}

.auth-footer {
  text-align: center;
  margin-top: 1.25rem;
  color: var(--text-secondary);
}
</style>
