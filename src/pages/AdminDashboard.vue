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
  return new Date(d).toLocaleDateString('en-US', { dateStyle: 'medium' })
}
</script>

<template>
  <div class="container py-4" style="max-width: 900px;">
    <!-- Header -->
    <div class="page-header mb-4">
      <div>
        <h1 class="page-title">
          <i class="bi bi-shield-check"></i> Admin Dashboard
        </h1>
        <p class="page-sub">Manage all posts. To remove comments, open the post and use the Remove button.</p>
      </div>
      <div class="stats-badge" v-if="!loading && !error">
        <i class="bi bi-journal-text"></i>
        {{ posts.length }} post{{ posts.length !== 1 ? 's' : '' }}
      </div>
    </div>

    <p v-if="error" class="error-msg mb-3">
      <i class="bi bi-exclamation-circle-fill"></i> {{ error }}
    </p>

    <!-- Loading -->
    <div v-if="loading" class="posts-skeleton">
      <div v-for="n in 5" :key="n" class="skeleton-row"></div>
    </div>

    <!-- Empty -->
    <div v-else-if="posts.length === 0" class="empty-state">
      <i class="bi bi-journal-text empty-icon"></i>
      <p>No posts yet.</p>
    </div>

    <!-- Posts list -->
    <div v-else class="posts-table">
      <div
        v-for="post in posts"
        :key="post._id"
        class="post-row"
      >
        <div class="post-row-info">
          <router-link :to="`/post/${post._id}`" class="post-row-title">
            {{ post.title }}
          </router-link>
          <div class="post-row-meta">
            <span class="meta-author">
              <i class="bi bi-person"></i> {{ authorName(post) }}
            </span>
            <span class="meta-sep">·</span>
            <span class="meta-date">{{ dateStr(post) }}</span>
            <span class="meta-sep">·</span>
            <span class="meta-comments">
              <i class="bi bi-chat-dots"></i> {{ post.comments?.length || 0 }}
            </span>
          </div>
        </div>
        <button
          type="button"
          class="btn btn-sm btn-danger-soft"
          :disabled="deletingId === post._id"
          @click="removePost(post._id)"
        >
          <span v-if="deletingId === post._id" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          <i v-else class="bi bi-trash3"></i>
          {{ deletingId === post._id ? 'Deleting…' : 'Delete' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--border);
  padding-bottom: 1rem;
}

.page-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.page-title .bi {
  color: var(--accent);
}

.page-sub {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
}

.stats-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--accent);
  background: var(--accent-dim);
  border: 1px solid var(--border-accent);
  border-radius: 20px;
  padding: 0.35rem 0.85rem;
  white-space: nowrap;
}

/* Posts table */
.posts-table {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow);
}

.post-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1.25rem;
  border-bottom: 1px solid var(--border);
  transition: background var(--transition);
}

.post-row:last-child {
  border-bottom: none;
}

.post-row:hover {
  background: var(--bg-hover);
}

.post-row-info {
  flex: 1;
  min-width: 0;
}

.post-row-title {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.2rem;
  transition: color var(--transition);
}

.post-row-title:hover {
  color: var(--accent);
}

.post-row-meta {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.meta-author,
.meta-date,
.meta-comments {
  font-size: 0.775rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.meta-sep {
  color: var(--text-muted);
  font-size: 0.775rem;
}

.btn-danger-soft {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #f87171;
  background: transparent;
  border: 1px solid rgba(248, 113, 113, 0.25);
  border-radius: var(--radius-sm);
  padding: 0.3rem 0.7rem;
  white-space: nowrap;
  transition: all var(--transition);
}

.btn-danger-soft:hover:not(:disabled) {
  background: rgba(248, 113, 113, 0.1);
  border-color: rgba(248, 113, 113, 0.5);
}

.btn-danger-soft:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Skeleton */
.posts-skeleton {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.skeleton-row {
  height: 58px;
  background: linear-gradient(90deg, var(--bg-card) 25%, var(--bg-hover) 50%, var(--bg-card) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-bottom: 1px solid var(--border);
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Empty */
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
