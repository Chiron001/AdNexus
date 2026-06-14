import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { Plus, Eye, Edit, FileText } from 'lucide-react'

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const STATUS_STYLE: Record<string, string> = {
  published: 'bg-emerald-500/20 text-emerald-400',
  draft:     'bg-zinc-700 text-zinc-400',
  scheduled: 'bg-blue-500/20 text-blue-400',
}

const CARD_STYLE = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
}

export default async function AdminBlogPage() {
  const admin = createAdminClient()
  const { data: posts } = await admin
    .from('blog_posts')
    .select('id,title,slug,status,category,featured,published_at,updated_at,view_count,seo_title,seo_description,focus_keyword')
    .order('created_at', { ascending: false })

  const all       = posts ?? []
  const published = all.filter(p => p.status === 'published').length
  const drafts    = all.filter(p => p.status === 'draft').length
  const noSeoTitle= all.filter(p => !p.seo_title).length
  const noSeoDesc = all.filter(p => !p.seo_description).length

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Blog Posts</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{all.length} posts — {published} published, {drafts} drafts</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          style={{ background: 'rgba(37,99,235,0.85)' }}
        >
          <Plus className="w-4 h-4" /> New Post
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Posts',       value: all.length,  accent: 'text-zinc-300'   },
          { label: 'Published',         value: published,   accent: 'text-emerald-400' },
          { label: 'Missing SEO Title', value: noSeoTitle,  accent: noSeoTitle  > 0 ? 'text-orange-400' : 'text-zinc-600' },
          { label: 'Missing SEO Desc',  value: noSeoDesc,   accent: noSeoDesc   > 0 ? 'text-orange-400' : 'text-zinc-600' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4" style={CARD_STYLE}>
            <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.accent}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {all.length === 0 ? (
        <div className="rounded-xl p-16 text-center" style={CARD_STYLE}>
          <FileText className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-400 font-medium">No blog posts yet</p>
          <p className="text-sm text-zinc-600 mb-4">Create your first post to get started</p>
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-lg"
            style={{ background: 'rgba(37,99,235,0.85)' }}
          >
            <Plus className="w-3.5 h-3.5" /> Write first post
          </Link>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={CARD_STYLE}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}>
                {['Title', 'Category', 'Status', 'SEO', 'Published', 'Views', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {all.map(p => {
                const seoOk = !!p.seo_title && !!p.seo_description && !!p.focus_keyword
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-zinc-200 truncate max-w-xs">{p.title}</p>
                      <p className="text-xs text-zinc-600 truncate max-w-xs">/blog/{p.slug}</p>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-500 text-xs">{p.category || '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[p.status] ?? 'bg-zinc-700 text-zinc-400'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${seoOk ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
                        {seoOk ? 'Good' : 'Incomplete'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-500 text-xs">{fmtDate(p.published_at)}</td>
                    <td className="px-4 py-3.5 text-zinc-500 text-xs">{p.view_count ?? 0}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 justify-end">
                        {p.status === 'published' && (
                          <a
                            href={`https://adnexusone.com/blog/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 transition-colors"
                            style={{ background: 'rgba(255,255,255,0.06)' }}
                            title="View live"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <Link
                          href={`/admin/blog/${p.id}/edit`}
                          className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 transition-colors"
                          style={{ background: 'rgba(255,255,255,0.06)' }}
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
