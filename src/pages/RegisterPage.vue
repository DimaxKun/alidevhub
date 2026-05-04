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
    success.value = 'Account created. Redirecting to login…'
    setTimeout(() => router.push('/login'), 1500)
  } catch (e) {
    error.value = e.message || 'Registration failed.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-brand">
        <i class="bi bi-pen-fill"></i>
        AliDevHub
      </div>
      <h1 class="auth-title">Create an account</h1>
      <p class="auth-sub">Join the community and start writing</p>

      <form @submit.prevent="onSubmit" class="auth-form">
        <div class="mb-3">
          <label for="username" class="form-label">Username</label>
          <input id="username" v-model="username" type="text" class="form-control" placeholder="johndoe" required />
        </div>
        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input id="email" v-model="email" type="email" class="form-control" placeholder="you@example.com" required />
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">Password</label>
          <input id="password" v-model="password" type="password" class="form-control" placeholder="At least 8 characters" required />
        </div>
        <div class="mb-3">
          <label for="confirmPassword" class="form-label">Confirm password</label>
          <input id="confirmPassword" v-model="confirmPassword" type="password" class="form-control" placeholder="••••••••" required />
        </div>

        <p v-if="error" class="error-msg mb-3">
          <i class="bi bi-exclamation-circle-fill"></i> {{ error }}
        </p>
        <p v-if="success" class="success-msg mb-3">
          <i class="bi bi-check-circle-fill"></i> {{ success }}
        </p>

        <button type="submit" class="btn btn-success w-100" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {{ loading ? 'Creating account…' : 'Create account' }}
        </button>
      </form>

      <p class="auth-footer">
        Already have an account? <router-link to="/login">Login</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem 1rem;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 2rem;
  box-shadow: var(--shadow);
}

.auth-brand {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 1rem;
  font-weight: 700;
  color: var(--accent);
  margin-bottom: 1.5rem;
}

.auth-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.auth-sub {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-bottom: 1.5rem;
}

.auth-form {
  margin-bottom: 1.25rem;
}

.auth-footer {
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
}
</style>
