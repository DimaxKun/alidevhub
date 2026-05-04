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
  if (/^data:image\//i.test(src)) return src
  if (/^https?:\/\//i.test(src)) {
    if (API_BASE.startsWith('https://') && src.startsWith('http://')) {
      if (API_BASE && src.includes('/uploads/')) return `${API_BASE.replace(/\/$/, '')}${src.slice(src.indexOf('/uploads/'))}`
      return src.replace(/^http:\/\//i, 'https://')
    }
    if (API_BASE && src.includes('/uploads/')) return `${API_BASE.replace(/\/$/, '')}${src.slice(src.indexOf('/uploads/'))}`
    return src
  }
  if (src.startsWith('/') && !src.startsWith('//')) {
    if (src.startsWith('/uploads/') && API_BASE) return `${API_BASE.replace(/\/$/, '')}${src}`
    return src
  }
  return ''
})

const authorName = computed(() => {
  const a = props.post.author
  if (!a) return 'Unknown'
  return a.username || a._id || 'Unknown'
})

const authorInitial = computed(() => authorName.value.charAt(0).toUpperCase())

const date = computed(() => {
  const d = props.post.createdAt
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
})

const excerpt = computed(() => {
  const text = stripHtml(props.post.content || '')
  return text.length > 140 ? text.slice(0, 140) + '…' : text
})

const readingTime = computed(() => {
  const text = stripHtml(props.post.content || '')
  const words = text.split(/\s+/).filter(Boolean).length
  const mins = Math.max(1, Math.round(words / 200))
  return `${mins} min read`
})
</script>

<template>
  <article class="post-card h-100">
    <router-link :to="`/post/${post._id}`" class="card-image-link" v-if="bannerImage">
      <div class="post-card-banner">
        <img :src="bannerImage" alt="Post cover" loading="lazy" />
      </div>
    </router-link>
    <div class="card-body d-flex flex-column">
      <router-link :to="`/post/${post._id}`" class="post-title-link">
        <h2 class="post-title">{{ post.title }}</h2>
      </router-link>
      <p class="post-excerpt flex-grow-1">{{ excerpt }}</p>
      <div class="post-meta">
        <router-link
          v-if="post.author"
          :to="`/author/${post.author._id || post.author}`"
          class="author-link"
        >
          <span class="author-avatar">{{ authorInitial }}</span>
          {{ authorName }}
        </router-link>
        <div class="meta-right">
          <span class="meta-item">{{ date }}</span>
          <span class="meta-dot">·</span>
          <span class="meta-item">{{ readingTime }}</span>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.post-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: border-color var(--transition), transform var(--transition), box-shadow var(--transition);
}

.post-card:hover {
  border-color: var(--border-accent);
  transform: translateY(-3px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.card-image-link {
  display: block;
  text-decoration: none;
}

.post-card-banner {
  width: 100%;
  height: 168px;
  overflow: hidden;
}

.post-card-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.post-card:hover .post-card-banner img {
  transform: scale(1.04);
}

.card-body {
  padding: 1.1rem 1.25rem 1.25rem;
}

.post-title-link {
  text-decoration: none;
}

.post-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  line-height: 1.45;
  transition: color var(--transition);
}

.post-title-link:hover .post-title {
  color: var(--accent);
}

.post-excerpt {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.post-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
}

.author-link {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 500;
  transition: color var(--transition);
}

.author-link:hover {
  color: var(--accent);
}

.author-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--accent-dim);
  border: 1px solid var(--border-accent);
  color: var(--accent);
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.meta-right {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.meta-item {
  font-size: 0.775rem;
  color: var(--text-muted);
}

.meta-dot {
  color: var(--text-muted);
  font-size: 0.775rem;
}
</style>
