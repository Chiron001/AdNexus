'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { SeoScoreBar } from '@/components/admin/SeoScoreBar'
import { toast } from 'sonner'
import { Save, ArrowLeft, ExternalLink } from 'lucide-react'

interface PageSeo {
  id: string; page_path: string; page_name: string; section: string
  meta_title: string; meta_description: string; focus_keyword: string
  og_title: string; og_description: string; og_image_url: string
  canonical_url: string; robots_directive: string; schema_json: string
}

export function PageSeoForm({ initial }: { initial: PageSeo }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [p, setP] = useState<PageSeo>(initial)

  const set = (k: keyof PageSeo) => (v: string) => setP(prev => ({ ...prev, [k]: v }))

  const seoFields = [
    { label: 'Meta Title',       value: p.meta_title,       ideal: { min: 40, max: 60 } },
    { label: 'Meta Description', value: p.meta_description, ideal: { min: 100, max: 160 } },
    { label: 'Focus Keyword',    value: p.focus_keyword },
    { label: 'OG Title',         value: p.og_title,         ideal: { min: 40, max: 60 } },
    { label: 'OG Description',   value: p.og_description,   ideal: { min: 60, max: 160 } },
    { label: 'OG Image',         value: p.og_image_url },
  ]

  async function save() {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/seo/pages/${p.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            meta_title:       p.meta_title,
            meta_description: p.meta_description,
            focus_keyword:    p.focus_keyword,
            og_title:         p.og_title      || p.meta_title,
            og_description:   p.og_description || p.meta_description,
            og_image_url:     p.og_image_url,
            canonical_url:    p.canonical_url || `https://adnexusone.com${p.page_path}`,
            robots_directive: p.robots_directive,
            schema_json:      p.schema_json,
          }),
        })
        if (!res.ok) throw new Error((await res.json()).error)
        toast.success('SEO settings saved')
        router.push('/admin/seo')
        router.refresh()
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Save failed')
      }
    })
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/admin/seo')} className="p-1.5 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-zinc-900">{p.page_name}</h1>
            <p className="text-sm text-zinc-400">{p.page_path}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href={`https://adnexusone.com${p.page_path}`} target="_blank" rel="noopener noreferrer"
             className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-zinc-600 hover:bg-zinc-100 border border-zinc-200 transition-colors">
            <ExternalLink className="w-3.5 h-3.5" /> View page
          </a>
          <button type="button" onClick={save} disabled={pending}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-60">
            <Save className="w-3.5 h-3.5" /> {pending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-5">
          {/* Core SEO */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Core SEO</p>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1">FOCUS KEYWORD</label>
              <input value={p.focus_keyword} onChange={e => set('focus_keyword')(e.target.value)}
                placeholder="e.g. meta ads diagnostics India" className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:border-blue-300" />
              <p className="text-[11px] text-zinc-400 mt-1">The primary keyword this page should rank for</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-zinc-500">META TITLE</label>
                <span className={`text-[10px] ${(p.meta_title?.length ?? 0) > 60 ? 'text-red-500' : 'text-zinc-400'}`}>
                  {p.meta_title?.length ?? 0}/60 chars
                </span>
              </div>
              <input value={p.meta_title} onChange={e => set('meta_title')(e.target.value)}
                placeholder="Keyword-rich title shown in Google · 40–60 characters"
                className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:border-blue-300" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-zinc-500">META DESCRIPTION</label>
                <span className={`text-[10px] ${(p.meta_description?.length ?? 0) > 160 ? 'text-red-500' : 'text-zinc-400'}`}>
                  {p.meta_description?.length ?? 0}/160 chars
                </span>
              </div>
              <textarea value={p.meta_description} onChange={e => set('meta_description')(e.target.value)}
                placeholder="What this page is about — shown in Google results · 100–160 chars"
                rows={3} className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 outline-none resize-none focus:border-blue-300" />
            </div>

            {/* Google Preview */}
            {(p.meta_title || p.page_path) && (
              <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
                <p className="text-[10px] font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Google Search Preview</p>
                <p className="text-blue-600 text-sm font-medium truncate">{p.meta_title || p.page_name}</p>
                <p className="text-green-700 text-xs">adnexusone.com{p.page_path}</p>
                <p className="text-zinc-600 text-xs mt-1 line-clamp-2">{p.meta_description || 'No description set.'}</p>
              </div>
            )}
          </div>

          {/* Open Graph */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Open Graph — Social Sharing</p>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-zinc-400">OG TITLE</label>
                <span className="text-[10px] text-zinc-400">{p.og_title?.length ?? 0}/60</span>
              </div>
              <input value={p.og_title} onChange={e => set('og_title')(e.target.value)}
                placeholder="Falls back to Meta Title"
                className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:border-blue-300" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-zinc-400">OG DESCRIPTION</label>
                <span className="text-[10px] text-zinc-400">{p.og_description?.length ?? 0}/160</span>
              </div>
              <textarea value={p.og_description} onChange={e => set('og_description')(e.target.value)}
                placeholder="Falls back to Meta Description"
                rows={2} className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 outline-none resize-none focus:border-blue-300" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">OG IMAGE (1200×630px)</label>
              <input value={p.og_image_url} onChange={e => set('og_image_url')(e.target.value)}
                placeholder="https://..."
                className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:border-blue-300" />
              {p.og_image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.og_image_url} alt="OG preview" className="mt-2 w-full h-32 object-cover rounded-lg" />
              )}
            </div>
          </div>

          {/* Advanced */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Advanced</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">CANONICAL URL</label>
                <input value={p.canonical_url} onChange={e => set('canonical_url')(e.target.value)}
                  placeholder={`https://adnexusone.com${p.page_path}`}
                  className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:border-blue-300" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">ROBOTS</label>
                <select value={p.robots_directive} onChange={e => set('robots_directive')(e.target.value)}
                  className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 outline-none bg-white">
                  <option value="index,follow">index, follow</option>
                  <option value="noindex,follow">noindex, follow</option>
                  <option value="index,nofollow">index, nofollow</option>
                  <option value="noindex,nofollow">noindex, nofollow</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">SCHEMA JSON-LD (optional)</label>
              <textarea value={p.schema_json} onChange={e => set('schema_json')(e.target.value)}
                placeholder={'{\n  "@context": "https://schema.org",\n  "@type": "WebPage",\n  "name": "..."\n}'}
                rows={6} className="w-full text-xs font-mono border border-zinc-200 rounded-lg px-3 py-2 outline-none resize-y focus:border-blue-300" />
              <p className="text-[11px] text-zinc-400 mt-1">Paste valid JSON-LD structured data. Leave empty to skip.</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <SeoScoreBar fields={seoFields} />
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-zinc-500 mb-2">SEO CHECKLIST</p>
            <ul className="space-y-2 text-xs text-zinc-600">
              {[
                { ok: (p.meta_title?.length ?? 0) >= 40 && (p.meta_title?.length ?? 0) <= 60, text: 'Meta title 40–60 chars' },
                { ok: (p.meta_description?.length ?? 0) >= 100 && (p.meta_description?.length ?? 0) <= 160, text: 'Description 100–160 chars' },
                { ok: !!p.focus_keyword, text: 'Focus keyword set' },
                { ok: !!p.og_title,     text: 'OG title set' },
                { ok: !!p.og_image_url, text: 'OG image (1200×630)' },
                { ok: !!p.canonical_url, text: 'Canonical URL set' },
              ].map(({ ok, text }) => (
                <li key={text} className="flex items-center gap-2">
                  <span className={ok ? 'text-green-500' : 'text-zinc-300'}>
                    {ok ? '✓' : '○'}
                  </span>
                  <span className={ok ? 'text-zinc-700' : 'text-zinc-400'}>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
