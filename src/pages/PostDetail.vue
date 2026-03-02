<script setup>
import { ref, computed, onMounted } from 'vue'
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
  <div class="container">
    <p v-if="error" class="error-msg">{{ error }}</p>
    <template v-else-if="post">
      <article class="post-detail card">
        <div class="post-detail-header">
          <h1 class="post-detail-title">{{ post.title }}</h1>
          <div class="post-detail-meta">
            <span class="author">{{ authorName }}</span>
            <span class="date">{{ date }}</span>
          </div>
          <div class="post-detail-actions">
            <router-link v-if="canEdit" :to="`/edit/${post._id}`" class="btn btn-ghost btn-sm">Edit</router-link>
            <button v-if="canEdit" type="button" class="btn btn-danger btn-sm" :disabled="deletingPost" @click="onDeletePost">
              {{ deletingPost ? 'Deleting…' : 'Delete' }}
            </button>
            <router-link v-if="auth.isAdmin" to="/admin" class="btn btn-ghost btn-sm">Admin</router-link>
          </div>
        </div>
        <div class="post-detail-content">{{ post.content }}</div>
      </article>

      <section class="comments-section card">
        <CommentList :comments="comments" :is-admin="auth.isAdmin" @delete="onDeleteComment" />
        <p v-if="commentError" class="error-msg">{{ commentError }}</p>
        <CommentForm v-if="auth.isLoggedIn" @submit="onCommentSubmit" />
        <p v-else class="comment-login">
          <router-link to="/login">Log in</router-link> to comment.
        </p>
      </section>
    </template>
    <div v-else-if="loading" class="loading">Loading…</div>
  </div>
</template>

<style scoped>
.post-detail {
  padding: 2rem 1.5rem;
  margin-bottom: 1.5rem;
}

.post-detail-header {
  margin-bottom: 1.5rem;
}

.post-detail-title {
  margin: 0 0 0.5rem;
  font-size: 1.75rem;
  font-weight: 700;
}

.post-detail-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.author {
  font-weight: 600;
  color: var(--accent);
}

.post-detail-actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
}

.post-detail-content {
  white-space: pre-wrap;
  line-height: 1.7;
  color: var(--text-primary);
}

.comments-section {
  padding: 1.5rem;
}

.comment-login {
  margin-top: 1rem;
  color: var(--text-secondary);
}

.loading {
  color: var(--text-secondary);
  padding: 2rem 0;
}
</style>
