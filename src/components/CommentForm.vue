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
    <div class="form-group">
      <label for="comment">Add a comment</label>
      <textarea id="comment" v-model="comment" placeholder="Write your comment…" rows="3" required></textarea>
    </div>
    <button type="submit" class="btn btn-primary" :disabled="loading">
      {{ loading ? 'Posting…' : 'Post comment' }}
    </button>
  </form>
</template>

<style scoped>
.comment-form {
  margin-top: 1rem;
}

.comment-form .form-group {
  margin-bottom: 0.75rem;
}
</style>
