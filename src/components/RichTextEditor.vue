<script setup>
import { computed, watch } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'

const props = defineProps({
  modelValue: { type: String, default: '' },
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
      HTMLAttributes: { style: 'max-width:100%;height:auto;border-radius:10px;' },
    }),
    Placeholder.configure({ placeholder: 'Write your post…' }),
  ],
  content: props.modelValue || '',
  onUpdate({ editor }) {
    emit('update:modelValue', editor.getHTML())
  },
  editorProps: {
    attributes: { spellcheck: 'true' },
  },
})

watch(() => props.modelValue, (value) => setEditorContentIfNeeded(value))

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
  return (s || '').trim().replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/^['"\u201C\u201D\u2018\u2019]+|['"\u201C\u201D\u2018\u2019]+$/g, '').trim()
}

function normalizeHttpOrHttpsUrl(url) {
  if (!/^https?:\/\//i.test(url)) return ''
  try { const u = new URL(url); if (u.protocol !== 'http:' && u.protocol !== 'https:') return ''; return u.href } catch { /* fall through */ }
  try { const u = new URL(encodeURI(url)); if (u.protocol !== 'http:' && u.protocol !== 'https:') return ''; return u.href } catch { /* fall through */ }
  try { const u = new URL(url.replace(/\s/g, '%20')); if (u.protocol !== 'http:' && u.protocol !== 'https:') return ''; return u.href } catch { /* fall through */ }
  if (/^https?:\/\/[^\s"'<>]+$/i.test(url)) return url
  if (/^https?:\/\//i.test(url) && url.length <= 8192 && !/[<>\n\r]/.test(url)) return url
  return ''
}

function normalizeImageUrl(raw) {
  const url = stripPastedNoise(raw)
  if (!url) return ''
  const lower = url.toLowerCase()
  if (lower.startsWith('javascript:') || lower.startsWith('vbscript:')) return ''
  if (lower.startsWith('data:') && !lower.startsWith('data:image/')) return ''
  if (/^data:image\//i.test(url)) {
    if (/^data:image\/[\w+.+-]+(?:;[\w=+./-]*)*,/i.test(url)) return url
    return ''
  }
  try {
    if (url.startsWith('//')) {
      const abs = new URL(url, 'https://example.org')
      if (abs.protocol !== 'https:' && abs.protocol !== 'http:') return ''
      return abs.href
    }
    if (url.startsWith('/') && !url.startsWith('//')) {
      if (!/^\/[^\s"'<>]+$/i.test(url)) return ''
      return url
    }
    return normalizeHttpOrHttpsUrl(url)
  } catch { return '' }
}

function insertImageFromUrl() {
  const input = window.prompt('Paste an image URL (http/https, data:image/..., or a path starting with /)', '')
  const src = normalizeImageUrl(input)
  if (!src) {
    if (input != null && String(input).trim() !== '') {
      alert('Use a valid image URL: http(s)://..., //..., a path starting with /, or data:image/...')
    }
    return
  }
  editor.value?.chain().focus().setImage({ src, alt: '' }).run()
}
</script>

<template>
  <div class="rte">
    <div v-if="canRender" class="rte-toolbar" role="toolbar" aria-label="Formatting">
      <div class="toolbar-group">
        <button type="button" class="rte-btn" :class="{ active: isActive('bold') }"
          @click="run((ed) => ed.chain().focus().toggleBold())" title="Bold">
          <i class="bi bi-type-bold"></i>
        </button>
        <button type="button" class="rte-btn" :class="{ active: isActive('italic') }"
          @click="run((ed) => ed.chain().focus().toggleItalic())" title="Italic">
          <i class="bi bi-type-italic"></i>
        </button>
        <button type="button" class="rte-btn" :class="{ active: isActive('underline') }"
          @click="run((ed) => ed.chain().focus().toggleUnderline())" title="Underline">
          <i class="bi bi-type-underline"></i>
        </button>
      </div>

      <div class="toolbar-sep"></div>

      <div class="toolbar-group">
        <button type="button" class="rte-btn" :class="{ active: isActive('heading', { level: 1 }) }"
          @click="run((ed) => ed.chain().focus().toggleHeading({ level: 1 }))" title="Heading 1">
          H1
        </button>
        <button type="button" class="rte-btn" :class="{ active: isActive('heading', { level: 2 }) }"
          @click="run((ed) => ed.chain().focus().toggleHeading({ level: 2 }))" title="Heading 2">
          H2
        </button>
        <button type="button" class="rte-btn" :class="{ active: isActive('paragraph') }"
          @click="run((ed) => ed.chain().focus().setParagraph())" title="Paragraph">
          <i class="bi bi-paragraph"></i>
        </button>
      </div>

      <div class="toolbar-sep"></div>

      <div class="toolbar-group">
        <button type="button" class="rte-btn" :class="{ active: isActive('bulletList') }"
          @click="run((ed) => ed.chain().focus().toggleBulletList())" title="Bulleted list">
          <i class="bi bi-list-ul"></i>
        </button>
        <button type="button" class="rte-btn" :class="{ active: isActive('orderedList') }"
          @click="run((ed) => ed.chain().focus().toggleOrderedList())" title="Numbered list">
          <i class="bi bi-list-ol"></i>
        </button>
      </div>

      <div class="toolbar-sep"></div>

      <div class="toolbar-group">
        <button type="button" class="rte-btn" :class="{ active: isActive('blockquote') }"
          @click="run((ed) => ed.chain().focus().toggleBlockquote())" title="Blockquote">
          <i class="bi bi-quote"></i>
        </button>
        <button type="button" class="rte-btn" :class="{ active: isActive('codeBlock') }"
          @click="run((ed) => ed.chain().focus().toggleCodeBlock())" title="Code block">
          <i class="bi bi-code-slash"></i>
        </button>
      </div>

      <div class="toolbar-sep"></div>

      <div class="toolbar-group">
        <button type="button" class="rte-btn" @click="insertImageFromUrl" title="Insert image from URL">
          <i class="bi bi-image"></i>
        </button>
      </div>
    </div>

    <EditorContent :editor="editor" class="rte-editor" />
  </div>
</template>

<style scoped>
.rte-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  background-color: var(--bg-card);
  border: 1px solid var(--border);
  border-bottom: none;
  border-radius: var(--radius) var(--radius) 0 0;
  padding: 6px 8px;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 2px;
}

.toolbar-sep {
  width: 1px;
  height: 18px;
  background: var(--border);
  margin: 0 4px;
}

.rte-btn {
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-secondary);
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition);
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  height: 28px;
}

.rte-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  border-color: var(--border);
}

.rte-btn.active {
  background: var(--accent-dim);
  border-color: var(--border-accent);
  color: var(--accent);
}

.rte-editor :deep(.ProseMirror) {
  outline: none;
  min-height: 260px;
  padding: 1rem;
  color: var(--text-primary);
  background-color: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 0 0 var(--radius) var(--radius);
  font-size: 0.95rem;
  line-height: 1.7;
  transition: border-color var(--transition);
}

.rte-editor :deep(.ProseMirror:focus) {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.12);
}

.rte-editor :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 10px;
}

.rte-editor :deep(blockquote) {
  border-left: 3px solid var(--accent);
  padding-left: 1rem;
  color: var(--text-secondary);
  margin: 0.75rem 0;
}

.rte-editor :deep(code) {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0.1em 0.4em;
  font-size: 0.875em;
  color: var(--accent);
}

.rte-editor :deep(pre) {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 1rem;
  overflow-x: auto;
}

.rte-editor :deep(pre code) {
  background: none;
  border: none;
  padding: 0;
  color: var(--text-primary);
}

.rte-editor :deep(.is-editor-empty:first-child::before) {
  color: var(--text-muted);
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
</style>
