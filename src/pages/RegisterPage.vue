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
  <div class="container py-4 d-flex justify-content-center">
    <div class="card" style="max-width: 420px; width: 100%;">
      <div class="card-body p-4">
        <h1 class="h4 mb-1 fw-bold">Register</h1>
        <p class="text-secondary mb-3">Create your AliDevHub account</p>
        <form @submit.prevent="onSubmit">
          <div class="mb-3">
            <label for="username" class="form-label fw-medium">Username</label>
            <input id="username" v-model="username" type="text" class="form-control" placeholder="johndoe" required />
          </div>
          <div class="mb-3">
            <label for="email" class="form-label fw-medium">Email</label>
            <input id="email" v-model="email" type="email" class="form-control" placeholder="you@example.com"
              required />
          </div>
          <div class="mb-3">
            <label for="password" class="form-label fw-medium">Password</label>
            <input id="password" v-model="password" type="password" class="form-control"
              placeholder="At least 8 characters" required />
          </div>
          <div class="mb-3">
            <label for="confirmPassword" class="form-label fw-medium">Confirm password</label>
            <input id="confirmPassword" v-model="confirmPassword" type="password" class="form-control"
              placeholder="••••••••" required />
          </div>
          <p v-if="error" class="error-msg mb-1">{{ error }}</p>
          <p v-if="success" class="success-msg mb-1">{{ success }}</p>
          <button type="submit" class="btn btn-success w-100" :disabled="loading">
            {{ loading ? 'Creating account…' : 'Create account' }}
          </button>
          <p class="text-center text-secondary mt-3 mb-0">
            Already have an account?
            <router-link to="/login">Login</router-link>
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
