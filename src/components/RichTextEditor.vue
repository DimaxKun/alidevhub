<script setup>
import { computed, ref, watch } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import { uploadPostImage } from '@/api'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const uploading = ref(false)

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
      // Allow block images and render them responsively.
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

async function onPickImage(event) {
  const file = event.target?.files?.[0]
  // Reset input so selecting the same file again triggers `change`.
  if (fileInput.value) fileInput.value.value = ''
  if (!file) return
  if (file.type !== 'image/png') {
    alert('Only PNG images are allowed.')
    return
  }

  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('image', file)
    const { data } = await uploadPostImage(formData)

    editor.value
      ?.chain()
      .focus()
      .insertContent({
        type: 'image',
        attrs: { src: data.url, alt: file.name },
      })
      .run()
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <div class="rte">
    <input
      ref="fileInput"
      type="file"
      accept="image/png"
      class="d-none"
      @change="onPickImage"
    />
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
        :disabled="uploading"
        @click="fileInput?.click()"
        title="Insert image"
      >
        {{ uploading ? 'Uploading…' : 'Image' }}
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

/* Placeholder extension styling (class name used by TipTap) */
.rte-editor :deep(.is-editor-empty:first-child::before) {
  color: #71717a;
}
</style>

