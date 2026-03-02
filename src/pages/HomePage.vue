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
  <div class="container">
    <img class="img-fluid" src="/images/header-img.avif" alt="">
    <p class="tagline"> <em> Discover, build smarter, and level up your full-stack skills with practical insights and modern development strategies on AliDevHub.</em></p>

    <p v-if="error" class="error-msg">{{ error }}</p>
    <div v-else-if="loading" class="loading">Loading posts…</div>
    <div v-else-if="posts.length === 0" class="empty">
      No posts yet. <router-link to="/create">Create the first one</router-link> (login required).
    </div>
    <div v-else class="post-list">
      <PostCard v-for="post in posts" :key="post._id" :post="post" />
    </div>
  </div>
</template>

<style scoped>
.tagline {
  text-align: center;
  color: var(--text-secondary);
  margin: 1rem 0 1.5rem;
}

.loading, .empty {
  color: var(--text-secondary);
  padding: 2rem 0;
}

.post-list {
  display: flex;
  flex-direction: column;
}

img{
  border-radius: 1rem;
  width: 100%;
  height: auto;
  display: block;
}


</style>
