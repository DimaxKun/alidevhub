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
    <h3 class="comment-list-title">Comments ({{ comments.length }})</h3>
    <div v-if="sortedComments.length === 0" class="comment-empty">No comments yet.</div>
    <div v-else class="comment-items">
      <div v-for="c in sortedComments" :key="c._id" class="comment-item card">
        <div class="comment-header">
          <span class="comment-author">{{ authorName(c) }}</span>
          <button
            v-if="isAdmin"
            type="button"
            class="btn btn-ghost btn-sm btn-danger-inline"
            title="Remove comment"
            @click="emit('delete', c._id)"
          >
            Remove
          </button>
        </div>
        <p class="comment-body">{{ c.comment }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.comment-list-title {
  font-size: 1.1rem;
  margin: 0 0 1rem;
  color: var(--text-secondary);
}

.comment-empty {
  color: var(--text-muted);
  padding: 1rem 0;
}

.comment-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.comment-item {
  padding: 1rem 1.25rem;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.comment-author {
  font-weight: 600;
  color: var(--accent);
  font-size: 0.9rem;
}

.btn-danger-inline {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  color: var(--danger);
  border-color: transparent;
}

.btn-danger-inline:hover {
  background: rgba(239, 68, 68, 0.15);
  color: var(--danger);
}

.comment-body {
  margin: 0;
  color: var(--text-primary);
  font-size: 0.95rem;
  white-space: pre-wrap;
}
</style>
