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
  <div class="container py-3">
    <!-- Hero -->
    <div class="hero mb-5">
      <div class="hero-image-wrap">
        <img src="/images/header-img.png" alt="AliDevHub hero" class="hero-img" />
        <div class="hero-overlay">
          <div class="hero-content">
            <p class="hero-eyebrow">
              <i class="bi bi-pen-fill"></i> Developer Blog
            </p>
            <h1 class="hero-title">Ideas worth sharing</h1>
            <p class="hero-sub">
              Explore full-stack insights, modern dev strategies, and practical tutorials on AliDevHub.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Posts -->
    <p v-if="error" class="error-msg">{{ error }}</p>

    <div v-else-if="loading" class="posts-skeleton">
      <div v-for="n in 6" :key="n" class="skeleton-card"></div>
    </div>

    <div v-else-if="posts.length === 0" class="empty-state">
      <i class="bi bi-journal-text empty-icon"></i>
      <p class="empty-title">No posts yet</p>
      <p class="empty-sub">
        <router-link to="/create">Create the first one</router-link> — login required.
      </p>
    </div>

    <template v-else>
      <div class="section-header mb-3">
        <h2 class="section-title">Latest Posts</h2>
        <span class="post-count">{{ posts.length }} post{{ posts.length !== 1 ? 's' : '' }}</span>
      </div>
      <div class="row g-4">
        <div v-for="post in posts" :key="post._id" class="col-12 col-md-6 col-lg-4">
          <PostCard :post="post" />
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.hero-image-wrap {
  position: relative;
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow);
}

.hero-img {
  width: 100%;
  height: 22rem;
  object-fit: cover;
  object-position: right center;
  display: block;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgba(10, 10, 14, 0.88) 40%, rgba(10, 10, 14, 0.2) 100%);
  display: flex;
  align-items: center;
  padding: 2rem 2.5rem;
}

.hero-content {
  max-width: 480px;
}

.hero-eyebrow {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.6rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.hero-title {
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.2;
  margin-bottom: 0.75rem;
}

.hero-sub {
  font-size: 0.95rem;
  color: rgba(240, 240, 242, 0.7);
  line-height: 1.6;
  margin: 0;
}

.section-header {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.post-count {
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* Skeleton loader */
.posts-skeleton {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.skeleton-card {
  height: 260px;
  background: linear-gradient(90deg, var(--bg-card) 25%, var(--bg-hover) 50%, var(--bg-card) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: var(--radius);
  border: 1px solid var(--border);
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 4rem 1rem;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
  opacity: 0.3;
}

.empty-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.4rem;
}

.empty-sub {
  font-size: 0.875rem;
  margin: 0;
}
</style>
