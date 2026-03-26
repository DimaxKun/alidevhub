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

const API_BASE = import.meta.env.VITE_API_URL || ''

function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

const renderedContent = computed(() => {
  const raw = post.value?.content || ''
  if (!raw) return ''

  // If this is already HTML (new posts from the editor), sanitize and render.
  // If it's plain text (older posts), escape and preserve newlines.
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(raw)
  if (looksLikeHtml) {
    // Resolve old relative `/uploads/...` URLs so images load correctly.
    const uploadsPrefix = API_BASE ? `${API_BASE.replace(/\/$/, '')}/uploads/` : ''
    let resolved = raw
    if (uploadsPrefix) {
      resolved = resolved.replace(/src=(["'])\/uploads\//gi, (_m, quote) => `src=${quote}${uploadsPrefix}`)
    }
    // Use the first image as banner/cover, so remove it from the article body
    // to avoid showing it twice.
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
  if (/^https?:\/\//i.test(src)) return src

  // Backward compatibility for older stored relative URLs: prefix with API base.
  if (src.startsWith('/uploads/') && API_BASE) return `${API_BASE.replace(/\/$/, '')}${src}`
  if (src.startsWith('/uploads/')) return src

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
  <div class="container py-4" style="max-width: 900px;">
    <p v-if="error" class="error-msg">{{ error }}</p>
    <template v-else-if="post">
      <article class="card post-article mb-4">
        <div v-if="bannerImage" class="post-banner">
          <img :src="bannerImage" alt="Post banner" />
        </div>
        <div class="card-body p-4">
          <h1 class="h3 mb-2 fw-bold">{{ post.title }}</h1>
          <div class="d-flex gap-3 small text-muted mb-3">
            <router-link v-if="post?.author" :to="`/author/${post.author._id || post.author}`"
              class="text-decoration-none fw-semibold">
              {{ authorName }}
            </router-link>
            <span class="text-secondary">{{ date }}</span>
          </div>
          <div class="mb-3 d-flex gap-2">
            <router-link v-if="canEdit" :to="`/edit/${post._id}`" class="btn btn-outline-light btn-sm">
              Edit
            </router-link>
            <button v-if="canEdit" type="button" class="btn btn-danger btn-sm" :disabled="deletingPost"
              @click="onDeletePost">
              {{ deletingPost ? 'Deleting…' : 'Delete' }}
            </button>
            <router-link v-if="auth.isAdmin" to="/admin" class="btn btn-outline-secondary btn-sm">
              Admin
            </router-link>
          </div>
          <div class="post-content rte-content" v-html="renderedContent"></div>
        </div>
      </article>

      <section class="card border-secondary">
        <div class="card-body p-4">
          <CommentList :comments="comments" :is-admin="auth.isAdmin" @delete="onDeleteComment" />
          <p v-if="commentError" class="error-msg mt-2">{{ commentError }}</p>
          <CommentForm v-if="auth.isLoggedIn" @submit="onCommentSubmit" />
          <p v-else class="mt-3 text-secondary mb-0">
            <router-link to="/login">Log in</router-link> to comment.
          </p>
        </div>
      </section>
    </template>
    <div v-else-if="loading" class="text-secondary py-4">Loading…</div>
  </div>
</template>

<style scoped>
.card {
  background-color: #1E1E24;
}

.post-banner {
  width: 100%;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  overflow: hidden;
}

.post-banner img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
}

:deep(.rte-content) {
  line-height: 1.7;
  color: #e5e5e7;
}

:deep(.rte-content p) {
  margin: 0 0 0.9rem 0;
}

:deep(.rte-content ul),
:deep(.rte-content ol) {
  padding-left: 1.25rem;
}
</style>
