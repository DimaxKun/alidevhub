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
  <div class="container">
    <h1 class="page-title">Admin Dashboard</h1>
    <p class="admin-desc">Delete any post. To remove comments, open the post and use the Remove button on each comment.</p>

    <p v-if="error" class="error-msg">{{ error }}</p>
    <div v-else-if="loading" class="loading">Loading…</div>
    <div v-else-if="posts.length === 0" class="empty">No posts.</div>
    <div v-else class="admin-list card">
      <div v-for="post in posts" :key="post._id" class="admin-row">
        <div class="admin-row-main">
          <router-link :to="`/post/${post._id}`" class="admin-row-title">{{ post.title }}</router-link>
          <span class="admin-row-meta">{{ authorName(post) }} · {{ dateStr(post) }}</span>
        </div>
        <button
          type="button"
          class="btn btn-danger btn-sm"
          :disabled="deletingId === post._id"
          @click="removePost(post._id)"
        >
          {{ deletingId === post._id ? 'Deleting…' : 'Delete' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-desc {
  color: var(--text-secondary);
  margin: -0.5rem 0 1.5rem;
  font-size: 0.95rem;
}

.loading, .empty {
  color: var(--text-secondary);
  padding: 2rem 0;
}

.admin-list {
  padding: 0;
  overflow: hidden;
}

.admin-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border);
}

.admin-row:last-child {
  border-bottom: none;
}

.admin-row-main {
  flex: 1;
  min-width: 0;
}

.admin-row-title {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.admin-row-title:hover {
  color: var(--accent);
}

.admin-row-meta {
  font-size: 0.85rem;
  color: var(--text-muted);
}
</style>
