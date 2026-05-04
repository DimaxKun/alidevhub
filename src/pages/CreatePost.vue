<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { addPost } from '@/api'
import RichTextEditor from '@/components/RichTextEditor.vue'

const router = useRouter()
const title = ref('')
const content = ref('')
const error = ref('')
const loading = ref(false)

function hasMeaningfulContent(html) {
  if (/<img[^>]+>/i.test(html || '')) return true
  const text = (html || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
  return text.length > 0
}

async function onSubmit() {
  error.value = ''
  if (!title.value.trim() || !hasMeaningfulContent(content.value)) {
    error.value = 'Title and content are required.'
    return
  }
  loading.value = true
  try {
    const { data } = await addPost({ title: title.value.trim(), content: content.value })
    router.push(`/post/${data.result._id}`)
  } catch (e) {
    error.value = e.message || 'Failed to create post.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container py-4" style="max-width: 860px;">
    <div class="page-header mb-4">
      <h1 class="page-title">
        <i class="bi bi-pencil-square"></i> New Post
      </h1>
      <p class="page-sub">Share your ideas with the community</p>
    </div>

    <div class="editor-card">
      <form @submit.prevent="onSubmit">
        <div class="mb-4">
          <input
            id="title"
            v-model="title"
            type="text"
            class="form-control title-input"
            placeholder="Post title…"
            required
          />
        </div>
        <div class="mb-4">
          <RichTextEditor id="content" v-model="content" />
        </div>

        <p v-if="error" class="error-msg mb-3">
          <i class="bi bi-exclamation-circle-fill"></i> {{ error }}
        </p>

        <div class="form-actions">
          <router-link to="/" class="btn btn-outline-light">
            <i class="bi bi-x-lg me-1"></i> Cancel
          </router-link>
          <button type="submit" class="btn btn-success" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            <i v-else class="bi bi-send-fill me-1"></i>
            {{ loading ? 'Publishing…' : 'Publish' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.page-header {
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

.editor-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.5rem;
  box-shadow: var(--shadow);
}

.title-input {
  font-size: 1.1rem;
  font-weight: 600;
  padding: 0.75rem 1rem;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border);
}
</style>
