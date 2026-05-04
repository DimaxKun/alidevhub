<script setup>
import { ref, computed, onMounted } from 'vue'
import DOMPurify from 'dompurify'
import { useRoute, useRouter } from 'vue-router'
import { getPost, addComment, deleteComment, deletePost } from '@/api'
import { useAuthStore } from '@/stores/auth'
import CommentForm from '@/components/CommentForm.vue'
import CommentList from '@/components/CommentList.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const post = ref(null)
const loading = ref(true)
const error = ref('')
const commentError = ref('')

const postId = computed(() => route.params.id)
const authorName = computed(() => {
  const a = post.value?.author
  if (!a) return 'Unknown'
  return a.username || a._id || 'Unknown'
})
const authorInitial = computed(() => authorName.value.charAt(0).toUpperCase())
const date = computed(() => {
  const d = post.value?.createdAt
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { dateStyle: 'long' })
})
const canEdit = computed(() => {
  if (!post.value || !auth.user) return false
  return auth.isAdmin || (post.value.author && (post.value.author._id || post.value.author) === auth.user._id)
})
const comments = computed(() => post.value?.comments || [])

const readingTime = computed(() => {
  const raw = post.value?.content || ''
  const text = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const words = text.split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.round(words / 200))} min read`
})

const API_BASE = import.meta.env.VITE_API_URL || ''

function escapeHtml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const renderedContent = computed(() => {
  const raw = post.value?.content || ''
  if (!raw) return ''
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(raw)
  if (looksLikeHtml) {
    const uploadsPrefix = API_BASE ? `${API_BASE.replace(/\/$/, '')}/uploads/` : ''
    let resolved = raw
    if (uploadsPrefix) resolved = resolved.replace(/src=(["'])\/uploads\//gi, (_m, quote) => `src=${quote}${uploadsPrefix}`)
    if (API_BASE.startsWith('https://')) resolved = resolved.replace(/src=(["'])http:\/\//gi, (_m, quote) => `src=${quote}https://`)
    if (API_BASE) {
      const apiBaseNoSlash = API_BASE.replace(/\/$/, '')
      resolved = resolved.replace(/src=(["'])https?:\/\/[^"']*?(\/uploads\/[^"']*)\1/gi, (_m, quote, uploadsPath) => `src=${quote}${apiBaseNoSlash}${uploadsPath}${quote}`)
    }
    const withoutFirstImg = resolved.replace(/<img[^>]*>/i, '')
    return DOMPurify.sanitize(withoutFirstImg)
  }
  return escapeHtml(raw).replace(/\n/g, '<br/>')
})

const bannerImage = computed(() => {
  const raw = post.value?.content || ''
  if (!raw) return ''
  const match = raw.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i)
  const src = match?.[1]
  if (!src) return ''
  if (/^data:image\//i.test(src)) return src
  if (/^https?:\/\//i.test(src)) {
    if (API_BASE.startsWith('https://') && src.startsWith('http://')) {
      const rewritten = API_BASE && src.includes('/uploads/') ? `${API_BASE.replace(/\/$/, '')}${src.slice(src.indexOf('/uploads/'))}` : src.replace(/^http:\/\//i, 'https://')
      return rewritten
    }
    if (API_BASE && src.includes('/uploads/')) return `${API_BASE.replace(/\/$/, '')}${src.slice(src.indexOf('/uploads/'))}`
    return src
  }
  if (src.startsWith('/') && !src.startsWith('//')) {
    if (src.startsWith('/uploads/') && API_BASE) return `${API_BASE.replace(/\/$/, '')}${src}`
    return src
  }
  return ''
})

async function loadPost() {
  try {
    const { data } = await getPost(postId.value)
    post.value = data
  } catch (e) {
    error.value = e.message || 'Failed to load post.'
  } finally {
    loading.value = false
  }
}

async function onCommentSubmit(text) {
  commentError.value = ''
  try {
    const { data } = await addComment(postId.value, text)
    post.value = data.updatedPost || data
  } catch (e) {
    commentError.value = e.message || 'Failed to add comment.'
    throw e
  }
}

async function onDeleteComment(commentId) {
  if (!confirm('Remove this comment?')) return
  try {
    await deleteComment(postId.value, commentId)
    await loadPost()
  } catch (e) {
    commentError.value = e.message || 'Failed to remove comment.'
  }
}

const deletingPost = ref(false)
async function onDeletePost() {
  if (!confirm('Delete this post? This cannot be undone.')) return
  deletingPost.value = true
  try {
    await deletePost(postId.value)
    router.push('/')
  } catch (e) {
    error.value = e.message || 'Failed to delete post.'
  } finally {
    deletingPost.value = false
  }
}

onMounted(loadPost)
</script>

<template>
  <div class="container py-4" style="max-width: 860px;">
    <p v-if="error" class="error-msg">
      <i class="bi bi-exclamation-circle-fill"></i> {{ error }}
    </p>

    <div v-else-if="loading" class="loading-state">
      <div class="skeleton-banner"></div>
      <div class="skeleton-line w-75 mt-3"></div>
      <div class="skeleton-line w-50 mt-2"></div>
    </div>

    <template v-else-if="post">
      <article class="post-article mb-4">
        <!-- Banner -->
        <div v-if="bannerImage" class="post-banner">
          <img :src="bannerImage" alt="Post banner" />
        </div>

        <div class="post-body">
          <!-- Back link -->
          <router-link to="/" class="back-link">
            <i class="bi bi-arrow-left"></i> All posts
          </router-link>

          <h1 class="post-title">{{ post.title }}</h1>

          <!-- Meta row -->
          <div class="post-meta">
            <router-link v-if="post?.author" :to="`/author/${post.author._id || post.author}`" class="author-link">
              <span class="author-avatar">{{ authorInitial }}</span>
              {{ authorName }}
            </router-link>
            <span class="meta-sep">·</span>
            <span class="meta-item">{{ date }}</span>
            <span class="meta-sep">·</span>
            <span class="meta-item">
              <i class="bi bi-clock"></i> {{ readingTime }}
            </span>

            <div class="post-actions ms-auto" v-if="canEdit">
              <router-link :to="`/edit/${post._id}`" class="btn btn-sm btn-outline-light">
                <i class="bi bi-pencil me-1"></i> Edit
              </router-link>
              <button type="button" class="btn btn-sm btn-danger" :disabled="deletingPost" @click="onDeletePost">
                <i class="bi bi-trash3 me-1"></i>
                {{ deletingPost ? 'Deleting…' : 'Delete' }}
              </button>
              <router-link v-if="auth.isAdmin" to="/admin" class="btn btn-sm btn-outline-light">
                <i class="bi bi-shield-check me-1"></i> Admin
              </router-link>
            </div>
          </div>

          <!-- Content -->
          <div class="post-content rte-content" v-html="renderedContent"></div>
        </div>
      </article>

      <!-- Comments -->
      <section class="comments-section">
        <CommentList :comments="comments" :is-admin="auth.isAdmin" @delete="onDeleteComment" />
        <p v-if="commentError" class="error-msg mt-2">
          <i class="bi bi-exclamation-circle-fill"></i> {{ commentError }}
        </p>
        <CommentForm v-if="auth.isLoggedIn" @submit="onCommentSubmit" />
        <p v-else class="login-prompt">
          <i class="bi bi-lock"></i>
          <router-link to="/login">Log in</router-link> to leave a comment.
        </p>
      </section>
    </template>
  </div>
</template>

<style scoped>
/* Article */
.post-article {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow);
}

.post-banner {
  width: 100%;
  max-height: 340px;
  overflow: hidden;
}

.post-banner img {
  width: 100%;
  height: 340px;
  object-fit: cover;
  display: block;
}

.post-body {
  padding: 1.75rem 2rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: var(--text-muted);
  text-decoration: none;
  margin-bottom: 1.25rem;
  transition: color var(--transition);
}

.back-link:hover {
  color: var(--accent);
}

.post-title {
  font-size: clamp(1.4rem, 3vw, 2rem);
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.3;
  margin-bottom: 1rem;
}

.post-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-bottom: 1.25rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border);
}

.author-link {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 600;
  transition: color var(--transition);
}

.author-link:hover {
  color: var(--accent);
}

.author-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--accent-dim);
  border: 1px solid var(--border-accent);
  color: var(--accent);
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.meta-sep {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.meta-item {
  font-size: 0.8rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.post-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* Content */
:deep(.rte-content) {
  line-height: 1.8;
  color: #d4d4d8;
  font-size: 1rem;
}

:deep(.rte-content p) { margin: 0 0 1rem 0; }
:deep(.rte-content h1),
:deep(.rte-content h2),
:deep(.rte-content h3) {
  color: var(--text-primary);
  font-weight: 700;
  margin: 1.5rem 0 0.75rem;
}
:deep(.rte-content ul),
:deep(.rte-content ol) { padding-left: 1.5rem; margin-bottom: 1rem; }
:deep(.rte-content blockquote) {
  border-left: 3px solid var(--accent);
  padding-left: 1rem;
  color: var(--text-secondary);
  margin: 1rem 0;
}
:deep(.rte-content code) {
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0.1em 0.4em;
  font-size: 0.875em;
  color: var(--accent);
}
:deep(.rte-content pre) {
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 1rem;
  overflow-x: auto;
  margin-bottom: 1rem;
}
:deep(.rte-content pre code) {
  background: none;
  border: none;
  padding: 0;
  color: var(--text-primary);
}
:deep(.rte-content img) {
  max-width: 100%;
  border-radius: var(--radius-sm);
  margin: 0.5rem 0;
}

/* Comments section */
.comments-section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.5rem 2rem;
  box-shadow: var(--shadow);
}

.login-prompt {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

/* Loading skeleton */
.loading-state { padding: 0.5rem 0; }
.skeleton-banner {
  height: 280px;
  background: linear-gradient(90deg, var(--bg-card) 25%, var(--bg-hover) 50%, var(--bg-card) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: var(--radius);
}
.skeleton-line {
  height: 18px;
  background: linear-gradient(90deg, var(--bg-card) 25%, var(--bg-hover) 50%, var(--bg-card) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 4px;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
