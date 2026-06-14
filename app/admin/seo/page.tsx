import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { Edit, CheckCircle, AlertCircle } from 'lucide-react'

const SECTION_ORDER = ['Core', 'Platform', 'Industries', 'Tools', 'Resources', 'Company', 'Legal']

function seoHealth(row: { meta_title?: string | null; meta_description?: string | null; focus_keyword?: string | null; og_image_url?: string | null }) {
  const checks = [
    !!row.meta_title      && row.meta_title.length >= 40 && row.meta_title.length <= 60,
    !!row.meta_description && row.meta_description.length >= 100 && row.meta_description.length <= 160,
    !!row.focus_keyword,
    !!row.og_image_url,
  ]
  const score = checks.filter(Boolean).length
  return { score, total: checks.length, ok: score === checks.length }
}

export default async function SeoManagerPage() {
  const admin = createAdminClient()
  const { data: pages } = await admin.from('page_seo').select('*').order('section').order('page_name')
  const all = pages ?? []

  const grouped = SECTION_ORDER.reduce<Record<string, typeof all>>((acc, s) => {
    acc[s] = all.filter(p => p.section === s)
    return acc
  }, {})

  const totalOk   = all.filter(p => seoHealth(p).ok).length
  const totalMiss = all.length - totalOk

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">SEO Manager</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Edit meta titles, descriptions, OG images, and structured data for every page</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-zinc-200 rounded-xl p-4">
          <p className="text-xs text-zinc-500 mb-1">Total Pages</p>
          <p className="text-2xl font-bold text-zinc-700">{all.length}</p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-4">
          <p className="text-xs text-zinc-500 mb-1">SEO Complete</p>
          <p className="text-2xl font-bold text-green-600">{totalOk}</p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-4">
          <p className="text-xs text-zinc-500 mb-1">Needs Attention</p>
          <p className={`text-2xl font-bold ${totalMiss > 0 ? 'text-orange-600' : 'text-zinc-400'}`}>{totalMiss}</p>
        </div>
      </div>

      <div className="space-y-5">
        {SECTION_ORDER.map(section => {
          const rows = grouped[section]
          if (!rows?.length) return null
          return (
            <div key={section} className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-100 bg-zinc-50">
                <h2 className="text-sm font-semibold text-zinc-700">{section}</h2>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100">
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-zinc-400">Page</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Meta Title</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-zinc-400">Meta Description</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-zinc-400 text-center">Score</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {rows.map(p => {
                    const { score, total, ok } = seoHealth(p)
                    return (
                      <tr key={p.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-5 py-3">
                          <p className="font-medium text-zinc-700">{p.page_name}</p>
                          <p className="text-xs text-zinc-400">{p.page_path}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className={`text-xs truncate max-w-[220px] ${p.meta_title ? 'text-zinc-600' : 'text-orange-500 italic'}`}>
                            {p.meta_title || 'Not set'}
                          </p>
                          {p.meta_title && (
                            <p className={`text-[10px] ${p.meta_title.length > 60 ? 'text-red-500' : 'text-zinc-400'}`}>
                              {p.meta_title.length}/60
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className={`text-xs truncate max-w-[200px] ${p.meta_description ? 'text-zinc-600' : 'text-orange-500 italic'}`}>
                            {p.meta_description || 'Not set'}
                          </p>
                          {p.meta_description && (
                            <p className={`text-[10px] ${p.meta_description.length > 160 ? 'text-red-500' : 'text-zinc-400'}`}>
                              {p.meta_description.length}/160
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {ok
                              ? <CheckCircle className="w-4 h-4 text-green-500" />
                              : <AlertCircle className="w-4 h-4 text-orange-400" />}
                            <span className={`text-xs font-semibold ${ok ? 'text-green-600' : 'text-orange-600'}`}>
                              {score}/{total}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/seo/${p.id}`}
                            className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Edit className="w-3 h-3" /> Edit
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        })}
      </div>
    </div>
  )
}
