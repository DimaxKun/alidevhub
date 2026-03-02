<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPosts, deletePost } from '@/api'

const router = useRouter()
const posts = ref([])
const loading = ref(true)
const error = ref('')
const deletingId = ref(null)

onMounted(loadPosts)

async function loadPosts() {
  try {
    const { data } = await getPosts()
    posts.value = data.posts || []
  } catch (e) {
    error.value = e.message || 'Failed to load posts.'
  } finally {
    loading.value = false
  }
}

async function removePost(id) {
  if (!confirm('Delete this post? This cannot be undone.')) return
  deletingId.value = id
  try {
    await deletePost(id)
    posts.value = posts.value.filter((p) => p._id !== id)
  } catch (e) {
    error.value = e.message || 'Failed to delete post.'
  } finally {
    deletingId.value = null
  }
}

function authorName(post) {
  const a = post.author
  if (!a) return 'Unknown'
  return a.username || a._id || 'Unknown'
}

function dateStr(post) {
  const d = post.createdAt
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { dateStyle: 'short' })
}
</script>

<template>
  <div class="container py-4" style="max-width: 900px;">
    <h1 class="h3 mb-2 fw-bold">Admin Dashboard</h1>
    <p class="text-secondary mb-3 small">
      Delete any post. To remove comments, open the post and use the Remove button on each comment.
    </p>

    <p v-if="error" class="error-msg">{{ error }}</p>
    <div v-else-if="loading" class="text-secondary py-4">Loading…</div>
    <div v-else-if="posts.length === 0" class="text-secondary py-4">No posts.</div>
    <div v-else class="card">
      <ul class="list-group list-group-flush">
        <li v-for="post in posts" :key="post._id"
          class="list-group-item text-light d-flex justify-content-between align-items-center py-3">
          <div class="me-3 flex-grow-1" style="min-width: 0;">
            <router-link :to="`/post/${post._id}`" class="fw-semibold text-decoration-none text-light d-block">
              {{ post.title }}
            </router-link>
            <div class="small text-body-tertiary">
              {{ authorName(post) }} · {{ dateStr(post) }}
            </div>
          </div>
          <button type="button" class="btn btn-danger btn-sm" :disabled="deletingId === post._id"
            @click="removePost(post._id)">
            {{ deletingId === post._id ? 'Deleting…' : 'Delete' }}
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.list-group-item{
  background-color: #1E1E24;
}
</style>
