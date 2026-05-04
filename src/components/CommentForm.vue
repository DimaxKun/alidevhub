<script setup>
import { ref } from 'vue'

const emit = defineEmits(['submit'])

const comment = ref('')
const loading = ref(false)

async function onSubmit() {
  const text = comment.value.trim()
  if (!text) return
  loading.value = true
  try {
    await emit('submit', text)
    comment.value = ''
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form @submit.prevent="onSubmit" class="comment-form">
    <div class="divider"></div>
    <label for="comment" class="form-label">
      <i class="bi bi-pencil-square"></i> Leave a comment
    </label>
    <textarea
      id="comment"
      v-model="comment"
      class="form-control"
      rows="3"
      placeholder="Share your thoughts…"
      required
    ></textarea>
    <div class="form-actions">
      <button type="submit" class="btn btn-success btn-sm" :disabled="loading">
        <i class="bi bi-send-fill me-1"></i>
        {{ loading ? 'Posting…' : 'Post comment' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.comment-form {
  margin-top: 0.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.form-label .bi {
  color: var(--accent);
}

.form-control {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.6rem;
}
</style>
