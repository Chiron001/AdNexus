import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { Plus, Eye, Edit, FileText } from 'lucide-react'

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const STATUS_STYLE: Record<string, string> = {
  published: 'bg-green-100 text-green-700',
  draft:     'bg-zinc-100 text-zinc-600',
  scheduled: 'bg-blue-100 text-blue-700',
}

export default async function AdminBlogPage() {
  const admin = createAdminClient()
  const { data: posts } = await admin
    .from('blog_posts')
    .select('id,title,slug,status,category,featured,published_at,updated_at,view_count,seo_title,seo_description,focus_keyword')
    .order('created_at', { ascending: false })

  const all        = posts ?? []
  const published  = all.filter(p => p.status === 'published').length
  const drafts     = all.filter(p => p.status === 'draft').length
  const noSeoTitle = all.filter(p => !p.seo_title).length
  const noSeoDesc  = all.filter(p => !p.seo_description).length

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Blog Posts</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{all.length} posts — {published} published, {drafts} drafts</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> New Post
        </Link>
      </div>

      {/* SEO health cards */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Posts',      value: all.length,    accent: 'text-zinc-700' },
          { label: 'Published',        value: published,     accent: 'text-green-600' },
          { label: 'Missing SEO Title',value: noSeoTitle,    accent: noSeoTitle  > 0 ? 'text-orange-600' : 'text-zinc-400' },
          { label: 'Missing SEO Desc', value: noSeoDesc,     accent: noSeoDesc   > 0 ? 'text-orange-600' : 'text-zinc-400' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-zinc-200 rounded-xl p-4">
            <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.accent}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {all.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-16 text-center">
          <FileText className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
          <p className="text-zinc-500 font-medium">No blog posts yet</p>
          <p className="text-sm text-zinc-400 mb-4">Create your first post to get started</p>
          <Link href="/admin/blog/new" className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Write first post
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">SEO</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Published</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Views</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {all.map(p => {
                const seoOk = !!p.seo_title && !!p.seo_description && !!p.focus_keyword
                return (
                  <tr key={p.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-zinc-800 truncate max-w-xs">{p.title}</p>
                      <p className="text-xs text-zinc-400 truncate max-w-xs">/blog/{p.slug}</p>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-500">{p.category || '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[p.status] ?? 'bg-zinc-100 text-zinc-600'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${seoOk ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {seoOk ? 'Good' : 'Incomplete'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-500 text-xs">{fmtDate(p.published_at)}</td>
                    <td className="px-4 py-3.5 text-zinc-500">{p.view_count ?? 0}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        {p.status === 'published' && (
                          <a
                            href={`https://adnexusone.com/blog/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 transition-colors"
                            title="View live"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <Link
                          href={`/admin/blog/${p.id}/edit`}
                          className="p-1.5 rounded hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 transition-colors"
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
