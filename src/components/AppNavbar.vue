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
  <header class="navbar">
    <div class="navbar-inner">
      <router-link to="/" class="brand">AliDevHub</router-link>
      <nav class="nav-links">
        <router-link v-for="link in navLinks" :key="link.path" :to="link.path" class="nav-link">
          {{ link.name }}
        </router-link>
        <template v-if="auth.isLoggedIn">
          <span class="user-name">{{ auth.user?.username }}</span>
          <button type="button" class="btn btn-ghost btn-sm" @click="logout">Logout</button>
        </template>
        <template v-else>
          <router-link to="/login" class="btn btn-ghost btn-sm">Login</router-link>
          <router-link to="/register" class="btn btn-primary btn-sm">Register</router-link>
        </template>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0.75rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-primary);
  text-decoration: none;
}

.brand:hover {
  text-decoration: none;
  color: var(--accent);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  color: var(--text-secondary);
  font-weight: 500;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--accent);
}

.user-name {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
}
</style>
