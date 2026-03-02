<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getPost, updatePost } from '@/api'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const title = ref('')
const content = ref('')
const error = ref('')
const loading = ref(false)
const fetchError = ref('')
const postId = computed(() => route.params.id)

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
  if (!title.value.trim() || !content.value.trim()) {
    error.value = 'Title and content are required.'
    return
  }
  loading.value = true
  try {
    await updatePost(postId.value, { title: title.value.trim(), content: content.value.trim() })
    router.push(`/post/${postId.value}`)
  } catch (e) {
    error.value = e.message || 'Failed to update post.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container">
    <h1 class="page-title">Edit Post</h1>
    <p v-if="fetchError" class="error-msg">{{ fetchError }}</p>
    <form v-else @submit.prevent="onSubmit" class="card form-card">
      <div class="form-group">
        <label for="title">Title</label>
        <input id="title" v-model="title" type="text" placeholder="Post title" required />
      </div>
      <div class="form-group">
        <label for="content">Content</label>
        <textarea id="content" v-model="content" placeholder="Write your post…" required></textarea>
      </div>
      <p v-if="error" class="error-msg">{{ error }}</p>
      <div class="form-actions">
        <router-link :to="`/post/${postId}`" class="btn btn-ghost">Cancel</router-link>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Saving…' : 'Save' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.form-card {
  padding: 1.5rem;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}
</style>
