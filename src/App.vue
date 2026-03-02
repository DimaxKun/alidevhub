<script setup>
import AppNavbar from '@/components/AppNavbar.vue'
import Footer from '@/components/Footer.vue'
</script>

<template>
  <div class="d-flex flex-column min-vh-100 text-light" style="background-color: #0F0F12;">
    <AppNavbar />
    <main class="flex-fill py-4">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <Footer />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
