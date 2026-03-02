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
  <article class="card border-secondary h-100">
    <div class="card-body d-flex flex-column">
      <router-link :to="`/post/${post._id}`" class="text-decoration-none">
        <h2 class="h5 mb-2 text-light fw-bold">{{ post.title }}</h2>
      </router-link>
      <p class="card-text text-secondary mb-2 flex-grow-1" style="font-size: 0.95rem;">{{ excerpt }}</p>
      <div class="d-flex gap-3 small text-muted mt-auto">
        <router-link
          v-if="post.author"
          :to="`/author/${post.author._id || post.author}`"
          class="text-decoration-none fw-medium"
        >
          {{ authorName }}
        </router-link>
        <span class="text-body-tertiary">{{ date }}</span>
      </div>
    </div>
  </article>
</template>

<style scoped>

.card{
  background-color: #1E1E24;
}

.card:hover {
  border-color: #20BB5E !important;
}
</style>

