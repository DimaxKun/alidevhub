<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function onSubmit() {
  error.value = ''
  if (!email.value || !password.value) {
    error.value = 'Email and password are required.'
    return
  }
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (e) {
    error.value = e.message || 'Login failed.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container auth-page">
    <div class="card auth-card">
      <div class="auth-header">
        <h1 class="page-title">Login</h1>
        <p class="auth-subtitle">Sign in to AliDevHub</p>
      </div>
      <form @submit.prevent="onSubmit" class="auth-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" v-model="email" type="email" placeholder="you@example.com" required />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input id="password" v-model="password" type="password" placeholder="••••••••" required />
        </div>
        <p v-if="error" class="error-msg">{{ error }}</p>
        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          {{ loading ? 'Signing in…' : 'Sign in' }}
        </button>
        <p class="auth-footer">
          Don't have an account? <router-link to="/register">Register</router-link>
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
