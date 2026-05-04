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
  <nav class="navbar navbar-expand-lg sticky-top">
    <div class="container">
      <router-link to="/" class="navbar-brand">
        <i class="bi bi-pen-fill brand-icon"></i>
        AliDevHub
      </router-link>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav"
        aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation">
        <i class="bi bi-list"></i>
      </button>

      <div class="collapse navbar-collapse" id="mainNav">
        <ul class="navbar-nav ms-auto align-items-lg-center gap-1">
          <li v-for="link in navLinks" :key="link.path" class="nav-item">
            <router-link :to="link.path" class="nav-link">{{ link.name }}</router-link>
          </li>
        </ul>

        <div class="nav-divider d-none d-lg-block"></div>

        <ul class="navbar-nav align-items-lg-center gap-2">
          <li v-if="auth.isLoggedIn && auth.user" class="nav-item">
            <router-link :to="`/author/${auth.user._id}`" class="nav-link user-link">
              <span class="user-avatar">{{ auth.user.username?.charAt(0).toUpperCase() }}</span>
              {{ auth.user.username }}
            </router-link>
          </li>
          <li v-if="auth.isLoggedIn" class="nav-item">
            <button type="button" class="btn btn-sm logout-btn" @click="logout">
              <i class="bi bi-box-arrow-right"></i> Logout
            </button>
          </li>
          <template v-else>
            <li class="nav-item">
              <router-link to="/login" class="btn btn-sm btn-ghost">Login</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/register" class="btn btn-sm btn-success">Register</router-link>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background-color: rgba(15, 15, 18, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  padding: 0.65rem 0;
}

.navbar-brand {
  font-weight: 700;
  font-size: 1.15rem;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.45rem;
  text-decoration: none;
  transition: color var(--transition);
}

.navbar-brand:hover {
  color: var(--accent);
}

.brand-icon {
  color: var(--accent);
  font-size: 1rem;
}

.navbar-toggler {
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0.35rem 0.6rem;
  color: var(--text-secondary);
  background: transparent;
}

.navbar-toggler:focus {
  box-shadow: 0 0 0 2px var(--accent-dim);
}

.nav-link {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.9rem;
  padding: 0.4rem 0.75rem;
  border-radius: var(--radius-sm);
  transition: color var(--transition), background var(--transition);
}

.nav-link:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.nav-link.router-link-active {
  color: var(--accent);
  background: var(--accent-dim);
}

.nav-divider {
  width: 1px;
  height: 20px;
  background: var(--border);
  margin: 0 0.5rem;
}

.user-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.user-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--accent-dim);
  border: 1px solid var(--border-accent);
  color: var(--accent);
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.btn-ghost {
  color: var(--text-secondary);
  border: 1px solid var(--border);
  background: transparent;
  font-weight: 500;
}

.btn-ghost:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
  border-color: rgba(255,255,255,0.15);
}

.logout-btn {
  color: #f87171;
  border: 1px solid rgba(248, 113, 113, 0.25);
  background: transparent;
  font-weight: 500;
}

.logout-btn:hover {
  background: rgba(248, 113, 113, 0.1);
  border-color: rgba(248, 113, 113, 0.4);
  color: #f87171;
}
</style>
