<script setup>
import { computed } from 'vue'

const props = defineProps({
  post: { type: Object, required: true }
})

const authorName = computed(() => {
  const a = props.post.author
  if (!a) return 'Unknown'
  return a.username || a._id || 'Unknown'
})

const date = computed(() => {
  const d = props.post.createdAt
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { dateStyle: 'medium' })
})

const excerpt = computed(() => {
  const c = props.post.content || ''
  return c.length > 160 ? c.slice(0, 160) + '…' : c
})
</script>

<template>
  <article class="post-card card">
    <div class="post-card-link">
      <router-link :to="`/post/${post._id}`" class="post-card-title-link">
        <h2 class="post-card-title">{{ post.title }}</h2>
      </router-link>
      <p class="post-card-excerpt">{{ excerpt }}</p>
      <div class="post-card-meta">
        <router-link
          v-if="post.author"
          :to="`/author/${post.author._id || post.author}`"
          class="author-link"
        >
          {{ authorName }}
        </router-link>
        <span class="date">{{ date }}</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.post-card {
  margin-bottom: 1rem;
  transition: border-color 0.2s;
}

.post-card:hover {
  border-color: var(--accent);
}

.post-card-link {
  display: block;
  padding: 1.25rem 1.5rem;
}

.post-card-title-link {
  text-decoration: none;
}

.post-card-title-link:hover {
  text-decoration: none;
}

.post-card-title {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.post-card-excerpt {
  margin: 0 0 0.75rem;
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.5;
}

.post-card-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.author-link {
  font-weight: 500;
  color: var(--accent);
  text-decoration: none;
}

.author-link:hover {
  text-decoration: underline;
}
</style>
