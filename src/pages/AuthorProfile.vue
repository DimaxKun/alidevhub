<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getPublicUser, getAuthorPosts } from '@/api'
import PostCard from '@/components/PostCard.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const auth = useAuthStore()

const author = ref(null)
const posts = ref([])
const loading = ref(true)
const error = ref('')

const authorId = computed(() => route.params.id)
const isOwnProfile = computed(() => auth.user && auth.user._id === authorId.value)
const authorInitial = computed(() => author.value?.username?.charAt(0).toUpperCase() || '?')

onMounted(async () => {
  loading.value = true
  try {
    const [userRes, postsRes] = await Promise.all([
      getPublicUser(authorId.value),
      getAuthorPosts(authorId.value),
    ])
    author.value = userRes.data.user
    posts.value = postsRes.data.posts || []
  } catch (e) {
    error.value = e.message || 'Failed to load author profile.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="container py-4" style="max-width: 900px;">
    <p v-if="error" class="error-msg">
      <i class="bi bi-exclamation-circle-fill"></i> {{ error }}
    </p>
    <div v-else-if="loading" class="text-secondary">Loading…</div>

    <div v-else>
      <!-- Author card -->
      <div class="author-card mb-5">
        <div class="author-avatar-lg">{{ authorInitial }}</div>
        <div class="author-info">
          <div class="author-name-row">
            <h1 class="author-name">{{ author.username }}</h1>
            <span v-if="isOwnProfile" class="own-badge">
              <i class="bi bi-person-check-fill"></i> You
            </span>
          </div>
          <p class="author-desc">
            {{ isOwnProfile ? 'Your posts on AliDevHub' : 'Posts by this author on AliDevHub' }}
          </p>
          <div class="author-stats">
            <span class="stat">
              <i class="bi bi-journal-text"></i>
              {{ posts.length }} post{{ posts.length !== 1 ? 's' : '' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Posts -->
      <div v-if="posts.length === 0" class="empty-state">
        <i class="bi bi-journal-text empty-icon"></i>
        <p>No posts from this author yet.</p>
      </div>
      <div v-else>
        <h2 class="section-title mb-3">Posts</h2>
        <div class="row g-4">
          <div v-for="post in posts" :key="post._id" class="col-12 col-md-6">
            <PostCard :post="post" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.author-card {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.75rem 2rem;
  box-shadow: var(--shadow);
}

.author-avatar-lg {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--accent-dim);
  border: 2px solid var(--border-accent);
  color: var(--accent);
  font-size: 1.75rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.author-info {
  flex: 1;
}

.author-name-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.25rem;
}

.author-name {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.own-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--accent);
  background: var(--accent-dim);
  border: 1px solid var(--border-accent);
  border-radius: 20px;
  padding: 0.2rem 0.6rem;
}

.author-desc {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.author-stats {
  display: flex;
  gap: 1rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.stat .bi {
  color: var(--accent);
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.75rem;
  opacity: 0.3;
}
</style>
