<script setup>
import { computed, watch } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

function setEditorContentIfNeeded(value) {
  if (!editor.value) return
  const next = value || ''
  const current = editor.value.getHTML()
  if (next !== current) editor.value.commands.setContent(next, false)
}

const editor = useEditor({
  extensions: [
    StarterKit,
    Underline,
    Image.configure({
      allowBase64: true,
      HTMLAttributes: {
        style: 'max-width:100%;height:auto;border-radius:10px;',
      },
    }),
    Placeholder.configure({
      placeholder: 'Write your post...',
    }),
  ],
  content: props.modelValue || '',
  onUpdate({ editor }) {
    emit('update:modelValue', editor.getHTML())
  },
  editorProps: {
    attributes: {
      spellcheck: 'true',
    },
  },
})

watch(
  () => props.modelValue,
  (value) => {
    setEditorContentIfNeeded(value)
  }
)

const canRender = computed(() => Boolean(editor.value))

function isActive(name, attrs) {
  if (!editor.value) return false
  return editor.value.isActive(name, attrs)
}

function run(command) {
  if (!editor.value) return
  command(editor.value).run()
}

function stripPastedNoise(s) {
  return (s || '')
    .trim()
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/^['"\u201C\u201D\u2018\u2019]+|['"\u201C\u201D\u2018\u2019]+$/g, '')
    .trim()
}

function normalizeHttpOrHttpsUrl(url) {
  if (!/^https?:\/\//i.test(url)) return ''
  try {
    const u = new URL(url)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return ''
    return u.href
  } catch {
    /* fall through */
  }
  try {
    const u = new URL(encodeURI(url))
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return ''
    return u.href
  } catch {
    /* fall through */
  }
  try {
    const u = new URL(url.replace(/\s/g, '%20'))
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return ''
    return u.href
  } catch {
    /* fall through */
  }
  if (/^https?:\/\/[^\s"'<>]+$/i.test(url)) return url
  // Last resort: accept trimmed http(s) like a plain string field (some CDNs / signed URLs fail `new URL()`).
  if (
    /^https?:\/\//i.test(url) &&
    url.length <= 8192 &&
    !/[<>\n\r]/.test(url)
  ) {
    return url
  }
  return ''
}

function normalizeImageUrl(raw) {
  const url = stripPastedNoise(raw)
  if (!url) return ''
  const lower = url.toLowerCase()
  if (lower.startsWith('javascript:') || lower.startsWith('vbscript:')) return ''
  if (lower.startsWith('data:') && !lower.startsWith('data:image/')) return ''

  // data:image/* (any subtype). Require comma before payload (base64 or comma-delimited).
  if (/^data:image\//i.test(url)) {
    if (/^data:image\/[\w+.+-]+(?:;[\w=+./-]*)*,/i.test(url)) return url
    return ''
  }

  try {
    // Protocol-relative → resolve against a dummy https base
    if (url.startsWith('//')) {
      const abs = new URL(url, 'https://example.org')
      if (abs.protocol !== 'https:' && abs.protocol !== 'http:') return ''
      return abs.href
    }

    // Root-relative path (same-origin when rendered)
    if (url.startsWith('/') && !url.startsWith('//')) {
      if (!/^\/[^\s"'<>]+$/i.test(url)) return ''
      return url
    }

    return normalizeHttpOrHttpsUrl(url)
  } catch {
    return ''
  }
}

function insertImageFromUrl() {
  const input = window.prompt(
    'Paste an image URL (any format: .jpg, .webp, .gif, .svg, no file extension, etc.). Stored in your post content in MongoDB.',
    ''
  )
  const src = normalizeImageUrl(input)
  if (!src) {
    if (input != null && String(input).trim() !== '') {
      alert(
        'Use a valid image URL: http(s)://... (any extension or none), //..., a path starting with /, or data:image/...'
      )
    }
    return
  }

  editor.value?.chain().focus().setImage({ src, alt: '' }).run()
}
</script>

<template>
  <div class="rte">
    <div v-if="canRender" class="rte-toolbar btn-group" role="toolbar" aria-label="Formatting">
      <button
        type="button"
        class="rte-btn btn btn-sm btn-outline-light"
        :class="{ active: isActive('bold') }"
        @click="run((ed) => ed.chain().focus().toggleBold())"
        title="Bold"
      >
        B
      </button>
      <button
        type="button"
        class="rte-btn btn btn-sm btn-outline-light"
        :class="{ active: isActive('italic') }"
        @click="run((ed) => ed.chain().focus().toggleItalic())"
        title="Italic"
      >
        I
      </button>
      <button
        type="button"
        class="rte-btn btn btn-sm btn-outline-light"
        :class="{ active: isActive('underline') }"
        @click="run((ed) => ed.chain().focus().toggleUnderline())"
        title="Underline"
      >
        U
      </button>

      <div class="rte-sep" aria-hidden="true" />

      <button
        type="button"
        class="rte-btn btn btn-sm btn-outline-light"
        :class="{ active: isActive('heading', { level: 1 }) }"
        @click="run((ed) => ed.chain().focus().toggleHeading({ level: 1 }))"
        title="Heading 1"
      >
        H1
      </button>
      <button
        type="button"
        class="rte-btn btn btn-sm btn-outline-light"
        :class="{ active: isActive('heading', { level: 2 }) }"
        @click="run((ed) => ed.chain().focus().toggleHeading({ level: 2 }))"
        title="Heading 2"
      >
        H2
      </button>
      <button
        type="button"
        class="rte-btn btn btn-sm btn-outline-light"
        :class="{ active: isActive('paragraph') }"
        @click="run((ed) => ed.chain().focus().setParagraph())"
        title="Paragraph"
      >
        P
      </button>

      <div class="rte-sep" aria-hidden="true" />

      <button
        type="button"
        class="rte-btn btn btn-sm btn-outline-light"
        :class="{ active: isActive('bulletList') }"
        @click="run((ed) => ed.chain().focus().toggleBulletList())"
        title="Bulleted list"
      >
        • List
      </button>
      <button
        type="button"
        class="rte-btn btn btn-sm btn-outline-light"
        :class="{ active: isActive('orderedList') }"
        @click="run((ed) => ed.chain().focus().toggleOrderedList())"
        title="Numbered list"
      >
        1. List
      </button>

      <div class="rte-sep" aria-hidden="true" />

      <button
        type="button"
        class="rte-btn btn btn-sm btn-outline-light"
        :class="{ active: isActive('blockquote') }"
        @click="run((ed) => ed.chain().focus().toggleBlockquote())"
        title="Quote"
      >
        Quote
      </button>
      <button
        type="button"
        class="rte-btn btn btn-sm btn-outline-light"
        :class="{ active: isActive('codeBlock') }"
        @click="run((ed) => ed.chain().focus().toggleCodeBlock())"
        title="Code block"
      >
        Code
      </button>

      <div class="rte-sep" aria-hidden="true" />

      <button
        type="button"
        class="rte-btn btn btn-sm btn-outline-light"
        @click="insertImageFromUrl"
        title="Insert image from URL (saved in post content)"
      >
        Image URL
      </button>
    </div>

    <EditorContent :editor="editor" class="rte-editor" />
  </div>
</template>

<style scoped>
.rte-editor :deep(.ProseMirror) {
  outline: none;
  min-height: 240px;
  padding: 2px 6px;
  color: #e5e5e7;
  background-color: #25252d;
  border-radius: 10px;
}

.rte-editor :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 10px;
}

.rte-toolbar {
  margin-bottom: 10px;
  width: 100%;
  background-color: #1e1e24;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 6px;
  flex-wrap: wrap;
  gap: 6px;
  display: flex;
}

.rte-sep {
  width: 1px;
  background: rgba(255, 255, 255, 0.16);
  margin: 0 6px;
}

.rte-btn {
  border-radius: 10px !important;
}

.rte-btn.active {
  border-color: #22c55e !important;
  color: #22c55e !important;
}

.rte-editor :deep(.is-editor-empty:first-child::before) {
  color: #71717a;
}
</style>
