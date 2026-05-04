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

function authorInitial(c) {
  return authorName(c).charAt(0).toUpperCase()
}

function formatDate(c) {
  if (!c.createdAt) return ''
  return new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div class="comment-list">
    <div class="comment-header">
      <h3 class="comment-title">
        <i class="bi bi-chat-dots"></i>
        Comments
        <span class="comment-count">{{ comments.length }}</span>
      </h3>
    </div>

    <div v-if="sortedComments.length === 0" class="empty-comments">
      <i class="bi bi-chat-square-text empty-icon"></i>
      <p>No comments yet. Be the first to share your thoughts.</p>
    </div>

    <div v-else class="comments-stack">
      <div v-for="c in sortedComments" :key="c._id" class="comment-item">
        <div class="comment-avatar">{{ authorInitial(c) }}</div>
        <div class="comment-body">
          <div class="comment-meta">
            <span class="comment-author">{{ authorName(c) }}</span>
            <span class="comment-date">{{ formatDate(c) }}</span>
            <button
              v-if="isAdmin"
              type="button"
              class="btn-remove"
              title="Remove comment"
              @click="emit('delete', c._id)"
            >
              <i class="bi bi-trash3"></i>
            </button>
          </div>
          <p class="comment-text">{{ c.comment }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.comment-header {
  margin-bottom: 1.25rem;
}

.comment-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}

.comment-title .bi {
  color: var(--accent);
}

.comment-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  background: var(--accent-dim);
  border: 1px solid var(--border-accent);
  color: var(--accent);
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 20px;
}

.empty-comments {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.5rem;
  opacity: 0.4;
}

.empty-comments p {
  font-size: 0.875rem;
  margin: 0;
}

.comments-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent-dim);
  border: 1px solid var(--border-accent);
  color: var(--accent);
  font-size: 0.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.comment-body {
  flex: 1;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0.75rem 1rem;
  border-left: 3px solid var(--border-accent);
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.4rem;
  flex-wrap: wrap;
}

.comment-author {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--accent);
}

.comment-date {
  font-size: 0.775rem;
  color: var(--text-muted);
}

.btn-remove {
  margin-left: auto;
  background: transparent;
  border: none;
  color: #f87171;
  font-size: 0.8rem;
  padding: 0.15rem 0.35rem;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity var(--transition), background var(--transition);
}

.btn-remove:hover {
  opacity: 1;
  background: rgba(248, 113, 113, 0.1);
}

.comment-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
