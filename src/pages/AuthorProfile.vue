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
  <div class="container py-4" style="max-width: 900px;">
    <p v-if="error" class="error-msg">{{ error }}</p>
    <div v-else-if="loading" class="text-secondary">Loading author…</div>
    <div v-else>
      <div class="card border-secondary mb-4">
        <div class="card-body p-3">
          <h1 class="h4 mb-1 fw-semibold">
            {{ author.username }}
            <span v-if="isOwnProfile" class="badge bg-success ms-2 small">You</span>
          </h1>
          <p class="text-secondary mb-0 small">
            {{ isOwnProfile ? 'Your posts on AliDevHub' : 'Posts by this author on AliDevHub' }}
          </p>
        </div>
      </div>

      <div v-if="posts.length === 0" class="text-secondary">
        No posts from this author yet.
      </div>
      <div v-else>
        <PostCard v-for="post in posts" :key="post._id" :post="post" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.card{
  background-color: #1E1E24;
}

</style>