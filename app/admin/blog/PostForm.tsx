'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { BlogEditor } from '@/components/admin/BlogEditor'
import { SeoScoreBar } from '@/components/admin/SeoScoreBar'
import { toast } from 'sonner'
import { Save, Trash2, Globe, Eye, ChevronDown, ChevronUp } from 'lucide-react'

const CATEGORIES = ['Performance Marketing', 'Meta Ads', 'Google Ads', 'Amazon Ads', 'D2C Growth', 'AI & Automation', 'Case Study', 'Platform Updates']
const SCHEMA_TYPES = ['BlogPosting', 'Article', 'HowTo', 'FAQPage', 'NewsArticle']

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function readingTime(html: string) {
  const words = html.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

interface Post {
  id?: string
  title: string; slug: string; excerpt: string; content: string
  cover_image_url: string; author_name: string; category: string
  tags: string[]; status: string; published_at: string | null; featured: boolean
  reading_time_minutes: number
  seo_title: string; seo_description: string; focus_keyword: string
  seo_keywords: string; og_title: string; og_description: string
  og_image_url: string; canonical_url: string
  robots_directive: string; schema_type: string
}

const BLANK: Post = {
  title: '', slug: '', excerpt: '', content: '', cover_image_url: '',
  author_name: 'AdNexus Team', category: '', tags: [], status: 'draft',
  published_at: null, featured: false, reading_time_minutes: 5,
  seo_title: '', seo_description: '', focus_keyword: '', seo_keywords: '',
  og_title: '', og_description: '', og_image_url: '', canonical_url: '',
  robots_directive: 'index,follow', schema_type: 'BlogPosting',
}

export function PostForm({ initial }: { initial?: Partial<Post> }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [post, setPost] = useState<Post>({ ...BLANK, ...initial })
  const [preview, setPreview] = useState(false)
  const [seoOpen, setSeoOpen] = useState(true)
  const [tagsInput, setTagsInput] = useState((initial?.tags ?? []).join(', '))

  const set = (k: keyof Post) => (v: string | boolean | number | string[]) =>
    setPost(p => ({ ...p, [k]: v }))

  function onTitleChange(title: string) {
    setPost(p => ({
      ...p, title,
      slug:      p.slug      || slugify(title),
      seo_title: p.seo_title || title,
      og_title:  p.og_title  || title,
    }))
  }

  async function save(status: string) {
    const payload = {
      ...post,
      status,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      reading_time_minutes: readingTime(post.content),
      published_at: status === 'published' ? (post.published_at ?? new Date().toISOString()) : post.published_at,
      seo_title:     post.seo_title     || post.title,
      og_title:      post.og_title      || post.seo_title || post.title,
      og_description: post.og_description || post.seo_description || post.excerpt,
      og_image_url:  post.og_image_url  || post.cover_image_url,
      canonical_url: post.canonical_url || `https://adnexusone.com/blog/${post.slug}`,
    }

    startTransition(async () => {
      try {
        const url = post.id ? `/api/admin/blog/${post.id}` : '/api/admin/blog'
        const res = await fetch(url, {
          method: post.id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
        toast.success(status === 'published' ? 'Post published!' : 'Draft saved')
        router.push('/admin/blog')
        router.refresh()
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Failed to save')
      }
    })
  }

  async function del() {
    if (!post.id || !confirm('Delete this post permanently?')) return
    startTransition(async () => {
      await fetch(`/api/admin/blog/${post.id}`, { method: 'DELETE' })
      toast.success('Post deleted')
      router.push('/admin/blog')
      router.refresh()
    })
  }

  const seoFields = [
    { label: 'SEO Title',       value: post.seo_title,       ideal: { min: 40, max: 60 } },
    { label: 'SEO Description', value: post.seo_description, ideal: { min: 120, max: 160 } },
    { label: 'Focus Keyword',   value: post.focus_keyword },
    { label: 'OG Title',        value: post.og_title,        ideal: { min: 40, max: 60 } },
    { label: 'OG Description',  value: post.og_description,  ideal: { min: 60, max: 160 } },
    { label: 'OG Image',        value: post.og_image_url },
  ]

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">{post.id ? 'Edit Post' : 'New Blog Post'}</h1>
        <div className="flex items-center gap-2">
          {post.id && (
            <button type="button" onClick={del} disabled={pending} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          )}
          {post.id && post.status === 'published' && (
            <a href={`https://adnexusone.com/blog/${post.slug}`} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-zinc-600 hover:bg-zinc-100 transition-colors border border-zinc-200">
              <Eye className="w-3.5 h-3.5" /> View live
            </a>
          )}
          <button type="button" onClick={() => save('draft')} disabled={pending}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors">
            <Save className="w-3.5 h-3.5" /> Save draft
          </button>
          <button type="button" onClick={() => save('published')} disabled={pending}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors">
            <Globe className="w-3.5 h-3.5" /> {post.status === 'published' ? 'Update' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* ── Main content area (2/3) ── */}
        <div className="col-span-2 space-y-5">
          {/* Title */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5">POST TITLE *</label>
              <input
                value={post.title}
                onChange={e => onTitleChange(e.target.value)}
                placeholder="Write a compelling, keyword-rich headline..."
                className="w-full text-xl font-bold text-zinc-900 placeholder-zinc-300 border-0 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5">SLUG (URL)</label>
              <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2">
                <span className="text-xs text-zinc-400">adnexusone.com/blog/</span>
                <input
                  value={post.slug}
                  onChange={e => set('slug')(slugify(e.target.value))}
                  className="flex-1 text-sm text-zinc-700 bg-transparent outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5">EXCERPT (shown on blog listing)</label>
              <textarea
                value={post.excerpt}
                onChange={e => set('excerpt')(e.target.value)}
                placeholder="A short, engaging summary of the post (2-3 sentences)..."
                rows={2}
                className="w-full text-sm text-zinc-700 border border-zinc-200 rounded-lg px-3 py-2 outline-none resize-none focus:border-blue-300"
              />
            </div>
          </div>

          {/* Content editor */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <label className="block text-xs font-semibold text-zinc-500 mb-2">CONTENT</label>
            <BlogEditor
              value={post.content}
              onChange={v => set('content')(v)}
              preview={preview}
              onTogglePreview={() => setPreview(p => !p)}
            />
          </div>

          {/* SEO section */}
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setSeoOpen(o => !o)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-50 transition-colors"
            >
              <span className="text-sm font-semibold text-zinc-800">SEO Settings</span>
              {seoOpen ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
            </button>

            {seoOpen && (
              <div className="border-t border-zinc-100 p-5 space-y-4">
                <SeoScoreBar fields={seoFields} />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">FOCUS KEYWORD</label>
                    <input value={post.focus_keyword} onChange={e => set('focus_keyword')(e.target.value)}
                      placeholder="e.g. meta ads diagnostics" className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:border-blue-300" />
                    <p className="text-[11px] text-zinc-400 mt-1">The primary keyword this post targets</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">ADDITIONAL KEYWORDS</label>
                    <input value={post.seo_keywords} onChange={e => set('seo_keywords')(e.target.value)}
                      placeholder="keyword1, keyword2, keyword3" className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:border-blue-300" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-zinc-500">META TITLE</label>
                    <span className={`text-[10px] ${(post.seo_title?.length ?? 0) > 60 ? 'text-red-500' : 'text-zinc-400'}`}>
                      {post.seo_title?.length ?? 0}/60 chars
                    </span>
                  </div>
                  <input value={post.seo_title} onChange={e => set('seo_title')(e.target.value)}
                    placeholder="Keyword-rich title · 40–60 characters ideal"
                    className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:border-blue-300" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-zinc-500">META DESCRIPTION</label>
                    <span className={`text-[10px] ${(post.seo_description?.length ?? 0) > 160 ? 'text-red-500' : 'text-zinc-400'}`}>
                      {post.seo_description?.length ?? 0}/160 chars
                    </span>
                  </div>
                  <textarea value={post.seo_description} onChange={e => set('seo_description')(e.target.value)}
                    placeholder="Compelling description shown in Google results · 120–160 characters"
                    rows={2} className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 outline-none resize-none focus:border-blue-300" />
                </div>

                {/* Google preview */}
                {(post.seo_title || post.slug) && (
                  <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
                    <p className="text-[10px] font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Google Search Preview</p>
                    <p className="text-blue-600 text-sm font-medium truncate">{post.seo_title || post.title}</p>
                    <p className="text-green-700 text-xs">adnexusone.com › blog › {post.slug}</p>
                    <p className="text-zinc-600 text-xs mt-1 line-clamp-2">{post.seo_description || post.excerpt || 'No description set yet.'}</p>
                  </div>
                )}

                <hr className="border-zinc-100" />
                <p className="text-xs font-semibold text-zinc-500">OPEN GRAPH (Social sharing)</p>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-zinc-400">OG TITLE</label>
                    <span className="text-[10px] text-zinc-400">{post.og_title?.length ?? 0}/60</span>
                  </div>
                  <input value={post.og_title} onChange={e => set('og_title')(e.target.value)}
                    placeholder="Falls back to SEO title if empty"
                    className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:border-blue-300" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-zinc-400">OG DESCRIPTION</label>
                    <span className="text-[10px] text-zinc-400">{post.og_description?.length ?? 0}/160</span>
                  </div>
                  <textarea value={post.og_description} onChange={e => set('og_description')(e.target.value)}
                    placeholder="Falls back to meta description if empty"
                    rows={2} className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 outline-none resize-none focus:border-blue-300" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">OG IMAGE URL (1200×630px recommended)</label>
                  <input value={post.og_image_url} onChange={e => set('og_image_url')(e.target.value)}
                    placeholder="https://... (falls back to cover image)"
                    className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:border-blue-300" />
                </div>

                <hr className="border-zinc-100" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">CANONICAL URL</label>
                    <input value={post.canonical_url} onChange={e => set('canonical_url')(e.target.value)}
                      placeholder={`https://adnexusone.com/blog/${post.slug || 'slug'}`}
                      className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:border-blue-300" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">ROBOTS DIRECTIVE</label>
                    <select value={post.robots_directive} onChange={e => set('robots_directive')(e.target.value)}
                      className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 outline-none bg-white focus:border-blue-300">
                      <option value="index,follow">index, follow (default)</option>
                      <option value="noindex,follow">noindex, follow (hide from Google)</option>
                      <option value="index,nofollow">index, nofollow (don't follow links)</option>
                      <option value="noindex,nofollow">noindex, nofollow (block everything)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">SCHEMA TYPE (Structured Data)</label>
                  <select value={post.schema_type} onChange={e => set('schema_type')(e.target.value)}
                    className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 outline-none bg-white focus:border-blue-300">
                    {SCHEMA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <p className="text-[11px] text-zinc-400 mt-1">BlogPosting is correct for most posts. Use Article for news/opinion pieces.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Sidebar (1/3) ── */}
        <div className="space-y-4">
          {/* Publish settings */}
          <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-zinc-500">PUBLISH SETTINGS</p>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Status</label>
              <select value={post.status} onChange={e => set('status')(e.target.value)}
                className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 outline-none bg-white">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Publish Date</label>
              <input type="datetime-local"
                value={post.published_at ? new Date(post.published_at).toISOString().slice(0, 16) : ''}
                onChange={e => set('published_at')(e.target.value ? new Date(e.target.value).toISOString() : '')}
                className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 outline-none" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={post.featured} onChange={e => set('featured')(e.target.checked)}
                className="rounded" />
              <span className="text-sm text-zinc-700">Featured post</span>
            </label>
          </div>

          {/* Post settings */}
          <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-zinc-500">POST SETTINGS</p>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Category</label>
              <select value={post.category} onChange={e => set('category')(e.target.value)}
                className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 outline-none bg-white">
                <option value="">Select category…</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Tags (comma-separated)</label>
              <input value={tagsInput} onChange={e => setTagsInput(e.target.value)}
                placeholder="ROAS, Meta Ads, D2C, India"
                className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:border-blue-300" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Author Name</label>
              <input value={post.author_name} onChange={e => set('author_name')(e.target.value)}
                className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:border-blue-300" />
            </div>
          </div>

          {/* Cover image */}
          <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-zinc-500">COVER IMAGE</p>
            <input value={post.cover_image_url} onChange={e => set('cover_image_url')(e.target.value)}
              placeholder="https://... (1200×630 or 1600×900)"
              className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:border-blue-300" />
            {post.cover_image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.cover_image_url} alt="Cover preview" className="w-full h-32 object-cover rounded-lg" />
            )}
            <p className="text-[11px] text-zinc-400">Paste a URL from Unsplash, Supabase Storage, or any CDN</p>
          </div>
        </div>
      </div>
    </div>
  )
}
