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
const isOwnProfile = computed(
  () => auth.user && auth.user._id === authorId.value
)

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
  <div class="container">
    <p v-if="error" class="error-msg">{{ error }}</p>
    <div v-else-if="loading" class="text-secondary">Loading author…</div>
    <div v-else>
      <div class="card">
        <div class="card-body">
          <h1 class="h4">
            {{ author.username }}
            <span v-if="isOwnProfile" class="badge">You</span>
          </h1>
          <p class="text-secondary">
            {{ isOwnProfile ? 'Your posts on AliDevHub' : 'Posts by this author on AliDevHub' }}
          </p>
        </div>
      </div>

      <div v-if="posts.length === 0" class="text-secondary">
        No posts from this author yet.
      </div>
      <div v-else class="flex-column">
        <PostCard v-for="post in posts" :key="post._id" :post="post" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-secondary {
  color: var(--text-muted);
}

.error-msg {
  color: var(--error);
  font-weight: 500;
  margin-bottom: 1rem;
}

.mb-0 {
  margin-bottom: 0;
}

.card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  box-shadow: var(--shadow);
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.card-body {
  padding: 1rem 1.25rem;
}

.h4 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 0.25rem;
  color: #fff;
  background-color: #28a745;
  margin-left: 0.5rem;
}

.flex-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>