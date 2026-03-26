<script setup>
import { ref, onMounted } from 'vue'
import { getPosts } from '@/api'
import PostCard from '@/components/PostCard.vue'

const posts = ref([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const { data } = await getPosts()
    posts.value = data.posts || []
  } catch (e) {
    error.value = e.message || 'Failed to load posts.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="container py-2">
    <img class="img rounded-4 mb-3" src="/images/header-img.png" alt="">
    <p class="text-center text-body-secondary mb-4">
      <em>
        Explore ideas, share your own posts, and enhance your full-stack skills with practical insights and modern development strategies on AliDevHub.
      </em>
    </p>

    <p v-if="error" class="error-msg">{{ error }}</p>
    <div v-else-if="loading" class="text-secondary py-4">Loading posts…</div>
    <div v-else-if="posts.length === 0" class="text-secondary py-4">
      No posts yet.
      <router-link to="/create">Create the first one</router-link> (login required).
    </div>
    <div v-else class="row g-3">
      <div v-for="post in posts" :key="post._id" class="col-12 col-md-6 col-lg-4">
        <PostCard :post="post" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.img {
  width: 100%;
  height: 20rem;
  object-fit: cover;
  object-position: right center;
}
</style>