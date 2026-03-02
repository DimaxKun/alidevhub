<script setup>
import { computed } from 'vue'

const props = defineProps({
  comments: { type: Array, default: () => [] },
  isAdmin: { type: Boolean, default: false }
})

const emit = defineEmits(['delete'])

const sortedComments = computed(() => {
  const list = [...(props.comments || [])]
  list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
  return list
})

function authorName(c) {
  const u = c.userId
  if (!u) return 'Unknown'
  return u.username || u._id || 'Unknown'
}
</script>

<template>
  <div class="comment-list">
    <h3 class="h6 mb-3">Comments ({{ comments.length }})</h3>
    <div v-if="sortedComments.length === 0" class="text-muted py-2">No comments yet.</div>
    <div v-else class="d-flex flex-column gap-2">
      <div v-for="c in sortedComments" :key="c._id" class="card ">
        <div class="card-body py-2 px-3">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="fw-semibold small span-text">{{ authorName(c) }}</span>
            <button
              v-if="isAdmin"
              type="button"
              class="btn btn-outline-danger btn-sm py-0 px-2"
              style="font-size: 0.8rem;"
              title="Remove comment"
              @click="emit('delete', c._id)"
            >
              Remove
            </button>
          </div>
          <p class="mb-0 small" style="white-space: pre-wrap;">{{ c.comment }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background-color: #25252D;
}

.span-text{
  color: #22c55e;
}

</style>
