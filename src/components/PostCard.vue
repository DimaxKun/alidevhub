<script setup>
import { computed } from 'vue'

const props = defineProps({
  post: { type: Object, required: true }
})

const API_BASE = import.meta.env.VITE_API_URL || ''

function stripHtml(html) {
  return (html || '')
    .replace(/<[/!a-zA-Z][^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const bannerImage = computed(() => {
  const raw = props.post?.content || ''
  const match = raw.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i)
  const src = match?.[1]
  if (!src) return ''
  if (/^https?:\/\//i.test(src)) return src
  if (src.startsWith('/uploads/') && API_BASE) return `${API_BASE.replace(/\/$/, '')}${src}`
  if (src.startsWith('/uploads/')) return src
  return ''
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
  const text = stripHtml(props.post.content || '')
  return text.length > 160 ? text.slice(0, 160) + '…' : text
})
</script>

<template>
  <article class="card border-secondary h-100">
    <div v-if="bannerImage" class="post-card-banner">
      <img :src="bannerImage" alt="Post cover" />
    </div>
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

.post-card-banner{
  width: 100%;
  height: 160px;
  overflow: hidden;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

.post-card-banner img{
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card:hover {
  border-color: #20BB5E !important;
}
</style>

