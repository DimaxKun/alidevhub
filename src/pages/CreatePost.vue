<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { addPost } from '@/api'

const router = useRouter()
const title = ref('')
const content = ref('')
const error = ref('')
const loading = ref(false)

async function onSubmit() {
  error.value = ''
  if (!title.value.trim() || !content.value.trim()) {
    error.value = 'Title and content are required.'
    return
  }
  loading.value = true
  try {
    const { data } = await addPost({ title: title.value.trim(), content: content.value.trim() })
    router.push(`/post/${data.result._id}`)
  } catch (e) {
    error.value = e.message || 'Failed to create post.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container">
    <h1 class="page-title">New Post</h1>
    <form @submit.prevent="onSubmit" class="card form-card">
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
        <router-link to="/" class="btn btn-ghost">Cancel</router-link>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Publishing…' : 'Publish' }}
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
