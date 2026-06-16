'use client'

import { useState, useEffect, useTransition } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, ToggleLeft, ToggleRight, ArrowRight, TrendingUp } from 'lucide-react'

const CARD = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }
const INPUT_STYLE = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }

interface Redirect {
  id: string
  source_path: string
  destination_path: string
  redirect_type: number
  is_active: boolean
  hits: number
  created_at: string
}

export default function RedirectsPage() {
  const [redirects, setRedirects] = useState<Redirect[]>([])
  const [loading, setLoading]   = useState(true)
  const [showAdd, setShowAdd]   = useState(false)
  const [pending, start]        = useTransition()

  const [form, setForm] = useState({
    source_path:      '',
    destination_path: '',
    redirect_type:    301,
  })

  useEffect(() => {
    loadRedirects()
  }, [])

  function loadRedirects() {
    setLoading(true)
    fetch('/api/admin/redirects')
      .then(r => r.json())
      .then(setRedirects)
      .catch(() => toast.error('Failed to load redirects'))
      .finally(() => setLoading(false))
  }

  function addRedirect() {
    if (!form.source_path || !form.destination_path) {
      toast.error('Both paths are required')
      return
    }
    start(async () => {
      try {
        const res = await fetch('/api/admin/redirects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) throw new Error((await res.json()).error)
        toast.success('Redirect added — live within 60 seconds')
        setForm({ source_path: '', destination_path: '', redirect_type: 301 })
        setShowAdd(false)
        loadRedirects()
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Failed to add redirect')
      }
    })
  }

  function toggleActive(r: Redirect) {
    start(async () => {
      try {
        const res = await fetch(`/api/admin/redirects/${r.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_active: !r.is_active }),
        })
        if (!res.ok) throw new Error((await res.json()).error)
        setRedirects(prev => prev.map(x => x.id === r.id ? { ...x, is_active: !r.is_active } : x))
        toast.success(r.is_active ? 'Redirect disabled' : 'Redirect enabled')
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Failed to update')
      }
    })
  }

  function deleteRedirect(id: string) {
    if (!confirm('Delete this redirect?')) return
    start(async () => {
      try {
        const res = await fetch(`/api/admin/redirects/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error((await res.json()).error)
        setRedirects(prev => prev.filter(x => x.id !== id))
        toast.success('Redirect deleted')
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Failed to delete')
      }
    })
  }

  const active   = redirects.filter(r => r.is_active).length
  const totalHits = redirects.reduce((s, r) => s + r.hits, 0)

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">URL Redirects</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Redirect old URLs to new ones. Applied at the CDN edge — no page load, no broken links.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(v => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
          style={{ background: showAdd ? 'rgba(255,255,255,0.08)' : 'rgba(124,58,237,0.85)' }}
        >
          <Plus className="w-4 h-4" /> Add Redirect
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="rounded-xl p-4" style={CARD}>
          <p className="text-xs text-zinc-500 mb-1">Total Rules</p>
          <p className="text-2xl font-bold text-zinc-300">{redirects.length}</p>
        </div>
        <div className="rounded-xl p-4" style={CARD}>
          <p className="text-xs text-zinc-500 mb-1">Active</p>
          <p className="text-2xl font-bold text-emerald-400">{active}</p>
        </div>
        <div className="rounded-xl p-4" style={CARD}>
          <p className="text-xs text-zinc-500 mb-1">Total Hits</p>
          <p className="text-2xl font-bold text-blue-400">{totalHits.toLocaleString()}</p>
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="rounded-xl p-5 mb-5" style={{ ...CARD, border: '1px solid rgba(124,58,237,0.3)' }}>
          <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4">New Redirect</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5">FROM (old URL path)</label>
              <input
                value={form.source_path}
                onChange={e => setForm(p => ({ ...p, source_path: e.target.value }))}
                placeholder="/platform/amazon"
                className="w-full text-sm rounded-lg px-3 py-2 text-white placeholder-zinc-600 outline-none font-mono"
                style={INPUT_STYLE}
              />
              <p className="text-[10px] text-zinc-600 mt-1">Start with /</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5">TO (new URL or full URL)</label>
              <input
                value={form.destination_path}
                onChange={e => setForm(p => ({ ...p, destination_path: e.target.value }))}
                placeholder="/platform/amazon-ads"
                className="w-full text-sm rounded-lg px-3 py-2 text-white placeholder-zinc-600 outline-none font-mono"
                style={INPUT_STYLE}
              />
              <p className="text-[10px] text-zinc-600 mt-1">Path or full https:// URL</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Redirect Type</label>
              <select
                value={form.redirect_type}
                onChange={e => setForm(p => ({ ...p, redirect_type: Number(e.target.value) }))}
                className="text-sm rounded-lg px-3 py-2 text-white outline-none"
                style={{ ...INPUT_STYLE, background: 'rgba(255,255,255,0.06)' }}
              >
                <option value={301} style={{ background: '#0f0f1a' }}>301 — Permanent (recommended)</option>
                <option value={302} style={{ background: '#0f0f1a' }}>302 — Temporary</option>
              </select>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={addRedirect}
                disabled={pending}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: 'rgba(124,58,237,0.85)' }}
              >
                {pending ? 'Adding…' : 'Add Redirect'}
              </button>
              <button
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={CARD}>
        {loading ? (
          <div className="flex items-center justify-center py-16 text-zinc-600 text-sm">Loading…</div>
        ) : redirects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ArrowRight className="w-8 h-8 text-zinc-700 mb-3" />
            <p className="text-zinc-500 text-sm font-medium">No redirects yet</p>
            <p className="text-zinc-700 text-xs mt-1">Add a redirect when you change a URL slug</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-600">FROM → TO</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-600 text-center">Type</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-600 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Hits
                  </div>
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-600 text-center">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {redirects.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className={r.is_active ? 'text-zinc-300' : 'text-zinc-600'}>{r.source_path}</span>
                      <ArrowRight className="w-3 h-3 text-zinc-600 shrink-0" />
                      <span className={r.is_active ? 'text-blue-400' : 'text-zinc-700'}>{r.destination_path}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: r.redirect_type === 301 ? 'rgba(139,92,246,0.15)' : 'rgba(59,130,246,0.15)', color: r.redirect_type === 301 ? '#a78bfa' : '#60a5fa' }}>
                      {r.redirect_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs text-zinc-400">{r.hits.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleActive(r)} disabled={pending} className="transition-colors">
                      {r.is_active
                        ? <ToggleRight className="w-5 h-5 text-emerald-400" />
                        : <ToggleLeft  className="w-5 h-5 text-zinc-600" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteRedirect(r.id)}
                      disabled={pending}
                      className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 transition-colors"
                      style={{ background: 'rgba(255,255,255,0.04)' }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4 rounded-xl p-4" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)' }}>
        <p className="text-xs text-blue-300 font-semibold mb-1">How URL Redirects Work</p>
        <p className="text-xs text-zinc-500 leading-relaxed">
          Redirects are applied at the server edge before the page loads — users and search engines never see the old URL.
          Use <strong className="text-zinc-400">301</strong> for permanent changes (Google transfers SEO authority to the new URL).
          Use <strong className="text-zinc-400">302</strong> for temporary changes (Google keeps the old URL indexed).
          Active redirects go live within ~60 seconds.
        </p>
      </div>
    </div>
  )
}
