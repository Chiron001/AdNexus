'use client'

import { useRef } from 'react'
import { Bold, Italic, Heading2, Heading3, Link, List, ListOrdered, Image, Quote, Code, Minus, Eye, Edit3 } from 'lucide-react'

interface Props {
  value: string
  onChange: (v: string) => void
  preview: boolean
  onTogglePreview: () => void
}

function wrap(textarea: HTMLTextAreaElement, open: string, close: string, placeholder = '') {
  const start = textarea.selectionStart
  const end   = textarea.selectionEnd
  const sel   = textarea.value.slice(start, end) || placeholder
  const before = textarea.value.slice(0, start)
  const after  = textarea.value.slice(end)
  return { value: `${before}${open}${sel}${close}${after}`, cursor: start + open.length + sel.length + close.length }
}

function wrapLine(textarea: HTMLTextAreaElement, prefix: string) {
  const start  = textarea.value.lastIndexOf('\n', textarea.selectionStart - 1) + 1
  const before = textarea.value.slice(0, start)
  const after  = textarea.value.slice(start)
  return { value: `${before}${prefix}${after}`, cursor: start + prefix.length }
}

const TOOLBAR = [
  { icon: Bold,         title: 'Bold',           action: (t: HTMLTextAreaElement) => wrap(t, '<strong>', '</strong>', 'bold text') },
  { icon: Italic,       title: 'Italic',         action: (t: HTMLTextAreaElement) => wrap(t, '<em>', '</em>', 'italic text') },
  { icon: Heading2,     title: 'Heading 2',      action: (t: HTMLTextAreaElement) => wrap(t, '<h2>', '</h2>', 'Heading') },
  { icon: Heading3,     title: 'Heading 3',      action: (t: HTMLTextAreaElement) => wrap(t, '<h3>', '</h3>', 'Heading') },
  { icon: Quote,        title: 'Blockquote',     action: (t: HTMLTextAreaElement) => wrap(t, '<blockquote>', '</blockquote>', 'Quote text') },
  { icon: List,         title: 'Bullet list',    action: (t: HTMLTextAreaElement) => wrap(t, '<ul>\n  <li>', '</li>\n</ul>', 'list item') },
  { icon: ListOrdered,  title: 'Ordered list',   action: (t: HTMLTextAreaElement) => wrap(t, '<ol>\n  <li>', '</li>\n</ol>', 'list item') },
  { icon: Link,         title: 'Link',           action: (t: HTMLTextAreaElement) => wrap(t, '<a href="URL">', '</a>', 'link text') },
  { icon: Image,        title: 'Image',          action: (t: HTMLTextAreaElement) => wrap(t, '<img src="', '" alt="description" class="w-full rounded-xl my-6" />', 'IMAGE_URL') },
  { icon: Code,         title: 'Code block',     action: (t: HTMLTextAreaElement) => wrap(t, '<pre><code>', '</code></pre>', 'code here') },
  { icon: Minus,        title: 'Divider',        action: (t: HTMLTextAreaElement) => ({ value: textarea_insert(t, '\n<hr />\n'), cursor: t.selectionEnd + 8 }) },
]

function textarea_insert(t: HTMLTextAreaElement, text: string) {
  const p = t.selectionStart
  return t.value.slice(0, p) + text + t.value.slice(p)
}

export function BlogEditor({ value, onChange, preview, onTogglePreview }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)

  function apply(action: (t: HTMLTextAreaElement) => { value: string; cursor: number }) {
    const t = ref.current
    if (!t) return
    const { value: next, cursor } = action(t)
    onChange(next)
    requestAnimationFrame(() => { t.focus(); t.setSelectionRange(cursor, cursor) })
  }

  return (
    <div className="border border-zinc-200 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-zinc-200 bg-zinc-50 flex-wrap">
        {TOOLBAR.map(({ icon: Icon, title, action }) => (
          <button
            key={title}
            type="button"
            title={title}
            onClick={() => apply(action)}
            className="p-1.5 rounded hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1 border-l border-zinc-200 pl-2">
          <button
            type="button"
            onClick={onTogglePreview}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
              preview ? 'bg-blue-600 text-white' : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'
            }`}
          >
            {preview ? <><Edit3 className="w-3 h-3" /> Edit</> : <><Eye className="w-3 h-3" /> Preview</>}
          </button>
        </div>
      </div>

      {preview ? (
        <div
          className="prose prose-zinc max-w-none p-5 min-h-[400px] text-sm"
          dangerouslySetInnerHTML={{ __html: value || '<p class="text-zinc-400">Nothing to preview yet.</p>' }}
        />
      ) : (
        <textarea
          ref={ref}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Write your blog post in HTML. Use the toolbar above or type tags directly..."
          className="w-full min-h-[400px] p-4 text-sm font-mono text-zinc-800 bg-white resize-y outline-none leading-relaxed"
          spellCheck={false}
        />
      )}
    </div>
  )
}
