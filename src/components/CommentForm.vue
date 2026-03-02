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
  <form @submit.prevent="onSubmit" class="mt-3">
    <div class="mb-3">
      <label for="comment" class="form-label fw-medium">Add a comment</label>
      <textarea
        id="comment"
        v-model="comment"
        class="form-control"
        rows="3"
        placeholder="Write your comment…"
        required
      ></textarea>
    </div>
    <button type="submit" class="btn btn-success" :disabled="loading">
      {{ loading ? 'Posting…' : 'Post comment' }}
    </button>
  </form>
</template>

<style scoped>
.form-control {
  background-color: #25252D;
  color: #e4e4e7;
}

.form-control::placeholder {
  color: #71717a;
}

</style>
