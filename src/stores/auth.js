import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin, register as apiRegister, getProfile } from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(null)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => !!user.value?.isAdmin)

  async function login(email, password) {
    const { data } = await apiLogin({ email, password })
    token.value = data.access
    localStorage.setItem('token', data.access)
    await fetchUser()
  }

  async function register(username, email, password) {
    await apiRegister({ username, email, password })
  }

  async function fetchUser() {
    if (!token.value) return
    try {
      const { data } = await getProfile()
      user.value = data.user
    } catch {
      logout()
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  return { token, user, isLoggedIn, isAdmin, login, register, fetchUser, logout }
})
