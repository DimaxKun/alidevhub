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
  <div class="container py-4 d-flex justify-content-center">
    <div class="card" style="max-width: 420px; width: 100%;">
      <div class="card-body p-4">
        <h1 class="h4 mb-1 fw-bold">Login</h1>
        <p class="text-secondary mb-3">Sign in to AliDevHub</p>
        <form @submit.prevent="onSubmit">
          <div class="mb-3">
            <label for="email" class="form-label fw-medium">Email</label>
            <input id="email" v-model="email" type="email" class="form-control" placeholder="you@example.com"
              required />
          </div>
          <div class="mb-3">
            <label for="password" class="form-label fw-medium">Password</label>
            <input id="password" v-model="password" type="password" class="form-control" placeholder="••••••••"
              required />
          </div>
          <p v-if="error" class="error-msg mb-2">{{ error }}</p>
          <button type="submit" class="btn btn-success w-100" :disabled="loading">
            {{ loading ? 'Signing in…' : 'Sign in' }}
          </button>
          <p class="text-center text-secondary mt-3 mb-0">
            Don't have an account?
            <router-link to="/register">Register</router-link>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background-color: #1E1E24;
}

.form-control {
  background-color: #25252D;
}

.form-control::placeholder {
  color: #71717a;
}
</style>
