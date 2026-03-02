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
  <div class="container py-4" style="max-width: 900px;">
    <h1 class="h3 mb-3 fw-bold">New Post</h1>
    <div class="card border-secondary">
      <div class="card-body p-4">
        <form @submit.prevent="onSubmit">
          <div class="mb-3">
            <label for="title" class="form-label fw-medium">Title</label>
            <input id="title" v-model="title" type="text" class="form-control" placeholder="Post title" required />
          </div>
          <div class="mb-3">
            <label for="content" class="form-label fw-medium">Content</label>
            <textarea id="content" v-model="content" class="form-control" rows="6" placeholder="Write your post…"
              required></textarea>
          </div>
          <p v-if="error" class="error-msg mb-2">{{ error }}</p>
          <div class="d-flex gap-2">
            <router-link to="/" class="btn btn-outline-danger">
              Cancel
            </router-link>
            <button type="submit" class="btn btn-success" :disabled="loading">
              {{ loading ? 'Publishing…' : 'Publish' }}
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
