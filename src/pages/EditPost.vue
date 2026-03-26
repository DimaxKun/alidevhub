<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getPost, updatePost } from '@/api'
import { useAuthStore } from '@/stores/auth'
import RichTextEditor from '@/components/RichTextEditor.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const title = ref('')
const content = ref('')
const error = ref('')
const loading = ref(false)
const fetchError = ref('')
const postId = computed(() => route.params.id)

function hasMeaningfulContent(html) {
  if (/<img[^>]+>/i.test(html || '')) return true
  const text = (html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > 0
}

onMounted(async () => {
  try {
    const { data } = await getPost(postId.value)
    if (!data) throw new Error('Post not found')
    const authorId = data.author?._id || data.author
    const canEdit = auth.isAdmin || (authorId && authorId === auth.user?._id)
    if (!canEdit) {
      fetchError.value = 'You are not authorized to edit this post.'
      return
    }
    title.value = data.title || ''
    content.value = data.content || ''
  } catch (e) {
    fetchError.value = e.message || 'Failed to load post.'
  }
})

async function onSubmit() {
  error.value = ''
  if (!title.value.trim() || !hasMeaningfulContent(content.value)) {
    error.value = 'Title and content are required.'
    return
  }
  loading.value = true
  try {
    await updatePost(postId.value, { title: title.value.trim(), content: content.value })
    router.push(`/post/${postId.value}`)
  } catch (e) {
    error.value = e.message || 'Failed to update post.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container py-4" style="max-width: 900px;">
    <h1 class="h3 mb-3 fw-bold">Edit Post</h1>
    <p v-if="fetchError" class="error-msg">{{ fetchError }}</p>
    <div v-else class="card border-secondary">
      <div class="card-body p-4">
        <form @submit.prevent="onSubmit">
          <div class="mb-3">
            <label for="title" class="form-label fw-medium">Title</label>
            <input id="title" v-model="title" type="text" class="form-control" placeholder="Post title" required />
          </div>
          <div class="mb-3">
            <label for="content" class="form-label fw-medium">Content</label>
            <RichTextEditor id="content" v-model="content" />
          </div>
          <p v-if="error" class="error-msg mb-2">{{ error }}</p>
          <div class="d-flex gap-2">
            <router-link :to="`/post/${postId}`" class="btn btn-outline-light">
              Cancel
            </router-link>
            <button type="submit" class="btn btn-success" :disabled="loading">
              {{ loading ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background-color: #1E1E24;
}

.form-control {
  background-color: #25252D;
}

.form-control::placeholder {
  color: #71717a;
}
</style>
