<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const navLinks = computed(() => {
  const links = [{ name: 'Home', path: '/' }]
  if (auth.isLoggedIn) {
    links.push({ name: 'New Post', path: '/create' })
    if (auth.isAdmin) links.push({ name: 'Admin', path: '/admin' })
  }
  return links
})

function logout() {
  auth.logout()
  router.push('/')
}
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark sticky-top">
    <div class="container">
      <router-link to="/" class="navbar-brand fw-bold fs-5">AliDevHub</router-link>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav"
        aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse gap-3" id="mainNav">

        <ul class="navbar-nav ms-auto gap-3">
          <li v-for="link in navLinks" :key="link.path" class="nav-item">
            <router-link :to="link.path" class="nav-link fw-medium">
              {{ link.name }}
            </router-link>
          </li>
        </ul>

        <ul class="navbar-nav gap-3">
          <li v-if="auth.isLoggedIn && auth.user" class="nav-item">
            <router-link :to="`/author/${auth.user._id}`" class="nav-link text-muted small">
              {{ auth.user.username }}
            </router-link>
          </li>
          <li v-if="auth.isLoggedIn" class="nav-item">
            <button type="button" class="btn btn-outline-danger btn-sm mt-1" @click="logout">
              Logout
            </button>
          </li>
          <template v-else>
            <li class="nav-item">
              <router-link to="/login" class="btn btn-outline-light btn-sm">
                Login
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/register" class="btn btn-success btn-sm">
                Register
              </router-link>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>

.navbar{
  background-color: #1E1E24;
}

.navbar-brand:hover {
  color: #20BB5E !important;
}

.nav-link.router-link-active {
  color: #20BB5E !important;
}

.nav-link:hover {
  color: #20BB5E !important;
}
</style>
