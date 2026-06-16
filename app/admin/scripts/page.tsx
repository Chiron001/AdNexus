'use client'

import { useState, useEffect, useTransition } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, ToggleLeft, ToggleRight, Code2, ChevronDown, ChevronUp } from 'lucide-react'

const CARD = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }
const INPUT_STYLE = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }

const POSITION_LABELS: Record<string, { label: string; desc: string; color: string }> = {
  head:       { label: '<head>',      desc: 'Loads before page — for analytics & tag managers', color: '#a78bfa' },
  body_start: { label: '<body> top',  desc: 'Loads after body opens',                           color: '#60a5fa' },
  body_end:   { label: '<body> end',  desc: 'Loads after page content — for chat widgets',      color: '#34d399' },
}

const TEMPLATES = [
  {
    name: 'Google Tag Manager',
    description: 'GTM container — replace GTM-XXXXXXX with your container ID',
    position: 'head',
    script_html: `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
<!-- End Google Tag Manager -->`,
  },
  {
    name: 'Google Analytics 4',
    description: 'GA4 measurement ID — replace G-XXXXXXXXXX',
    position: 'head',
    script_html: `<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>`,
  },
  {
    name: 'Meta Pixel',
    description: 'Facebook / Instagram tracking pixel — replace YOUR_PIXEL_ID',
    position: 'head',
    script_html: `<!-- Meta Pixel -->
<script>
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'YOUR_PIXEL_ID');
  fbq('track', 'PageView');
</script>`,
  },
  {
    name: 'Custom Script',
    description: 'Paste any tracking or analytics script',
    position: 'head',
    script_html: `<script>
  // Your custom script here
</script>`,
  },
]

interface Script {
  id: string
  name: string
  description?: string
  script_html: string
  position: string
  is_active: boolean
  created_at: string
}

export default function ScriptsPage() {
  const [scripts, setScripts] = useState<Script[]>([])
  const [loading, setLoading]   = useState(true)
  const [showAdd, setShowAdd]   = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [pending, start]        = useTransition()

  const [form, setForm] = useState({
    name:        '',
    description: '',
    script_html: '',
    position:    'head',
  })

  useEffect(() => { loadScripts() }, [])

  function loadScripts() {
    setLoading(true)
    fetch('/api/admin/scripts')
      .then(r => r.json())
      .then(setScripts)
      .catch(() => toast.error('Failed to load scripts'))
      .finally(() => setLoading(false))
  }

  function applyTemplate(t: typeof TEMPLATES[0]) {
    setForm({ name: t.name, description: t.description, script_html: t.script_html, position: t.position })
  }

  function addScript() {
    if (!form.name || !form.script_html) {
      toast.error('Name and script are required')
      return
    }
    start(async () => {
      try {
        const res = await fetch('/api/admin/scripts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) throw new Error((await res.json()).error)
        toast.success('Script added — injected into all pages within 60 seconds')
        setForm({ name: '', description: '', script_html: '', position: 'head' })
        setShowAdd(false)
        loadScripts()
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Failed to add script')
      }
    })
  }

  function toggleActive(s: Script) {
    start(async () => {
      try {
        const res = await fetch(`/api/admin/scripts/${s.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_active: !s.is_active }),
        })
        if (!res.ok) throw new Error((await res.json()).error)
        setScripts(prev => prev.map(x => x.id === s.id ? { ...x, is_active: !s.is_active } : x))
        toast.success(s.is_active ? 'Script disabled' : 'Script enabled — live within 60 seconds')
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Failed to update')
      }
    })
  }

  function deleteScript(id: string) {
    if (!confirm('Delete this script? It will be removed from all pages.')) return
    start(async () => {
      try {
        const res = await fetch(`/api/admin/scripts/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error((await res.json()).error)
        setScripts(prev => prev.filter(x => x.id !== id))
        toast.success('Script deleted')
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Failed to delete')
      }
    })
  }

  const activeCount = scripts.filter(s => s.is_active).length

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Script Manager</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Add tracking scripts, analytics, and tag managers — injected into every page automatically
          </p>
        </div>
        <button
          onClick={() => setShowAdd(v => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: showAdd ? 'rgba(255,255,255,0.08)' : 'rgba(124,58,237,0.85)' }}
        >
          <Plus className="w-4 h-4" /> Add Script
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="rounded-xl p-4" style={CARD}>
          <p className="text-xs text-zinc-500 mb-1">Total Scripts</p>
          <p className="text-2xl font-bold text-zinc-300">{scripts.length}</p>
        </div>
        <div className="rounded-xl p-4" style={CARD}>
          <p className="text-xs text-zinc-500 mb-1">Active</p>
          <p className="text-2xl font-bold text-emerald-400">{activeCount}</p>
        </div>
        <div className="rounded-xl p-4" style={CARD}>
          <p className="text-xs text-zinc-500 mb-1">Disabled</p>
          <p className="text-2xl font-bold text-zinc-600">{scripts.length - activeCount}</p>
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="rounded-xl p-5 mb-5" style={{ ...CARD, border: '1px solid rgba(124,58,237,0.3)' }}>
          <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4">New Script</p>

          {/* Templates */}
          <div className="mb-4">
            <p className="text-xs text-zinc-500 mb-2">Quick templates:</p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map(t => (
                <button
                  key={t.name}
                  onClick={() => applyTemplate(t)}
                  className="text-xs px-3 py-1.5 rounded-lg text-zinc-300 hover:text-white transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5">SCRIPT NAME</label>
              <input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Google Analytics"
                className="w-full text-sm rounded-lg px-3 py-2 text-white placeholder-zinc-600 outline-none"
                style={INPUT_STYLE}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5">INJECT POSITION</label>
              <select
                value={form.position}
                onChange={e => setForm(p => ({ ...p, position: e.target.value }))}
                className="w-full text-sm rounded-lg px-3 py-2 text-white outline-none"
                style={{ ...INPUT_STYLE, background: 'rgba(255,255,255,0.06)' }}
              >
                {Object.entries(POSITION_LABELS).map(([val, { label, desc }]) => (
                  <option key={val} value={val} style={{ background: '#0f0f1a' }}>
                    {label} — {desc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-xs font-semibold text-zinc-500 mb-1.5">DESCRIPTION (optional)</label>
            <input
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="What this script does"
              className="w-full text-sm rounded-lg px-3 py-2 text-white placeholder-zinc-600 outline-none"
              style={INPUT_STYLE}
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-zinc-500 mb-1.5">SCRIPT CODE</label>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-center gap-2 px-3 py-2" style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <Code2 className="w-3 h-3 text-zinc-600" />
                <span className="text-[11px] text-zinc-600 font-mono">Paste full {`<script>...</script>`} tag or raw JS</span>
              </div>
              <textarea
                value={form.script_html}
                onChange={e => setForm(p => ({ ...p, script_html: e.target.value }))}
                placeholder={`<script>\n  // your tracking code here\n</script>`}
                rows={8}
                spellCheck={false}
                className="w-full font-mono text-xs text-zinc-300 resize-y outline-none p-3"
                style={{ background: 'rgba(0,0,0,0.2)', minHeight: '140px' }}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={addScript}
              disabled={pending}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: 'rgba(124,58,237,0.85)' }}
            >
              {pending ? 'Adding…' : 'Add Script'}
            </button>
            <button
              onClick={() => { setShowAdd(false); setForm({ name: '', description: '', script_html: '', position: 'head' }) }}
              className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Scripts list */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-zinc-600 text-sm">Loading…</div>
      ) : scripts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl text-center" style={CARD}>
          <Code2 className="w-8 h-8 text-zinc-700 mb-3" />
          <p className="text-zinc-500 text-sm font-medium">No scripts added yet</p>
          <p className="text-zinc-700 text-xs mt-1">Add Google Analytics, Meta Pixel, or any tracking script</p>
        </div>
      ) : (
        <div className="space-y-2">
          {scripts.map(s => {
            const pos = POSITION_LABELS[s.position] ?? POSITION_LABELS.head
            const isExpanded = expanded === s.id
            return (
              <div key={s.id} className="rounded-xl overflow-hidden" style={CARD}>
                <div className="flex items-center gap-3 px-5 py-3.5">
                  <button
                    onClick={() => setExpanded(isExpanded ? null : s.id)}
                    className="flex-1 flex items-center gap-3 text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-semibold truncate ${s.is_active ? 'text-zinc-200' : 'text-zinc-600'}`}>{s.name}</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                          style={{ background: `${pos.color}18`, color: pos.color, border: `1px solid ${pos.color}30` }}>
                          {pos.label}
                        </span>
                        {!s.is_active && (
                          <span className="text-[10px] text-zinc-600 font-medium">disabled</span>
                        )}
                      </div>
                      {s.description && (
                        <p className="text-xs text-zinc-600 truncate mt-0.5">{s.description}</p>
                      )}
                    </div>
                    {isExpanded
                      ? <ChevronUp  className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                      : <ChevronDown className="w-3.5 h-3.5 text-zinc-600 shrink-0" />}
                  </button>

                  <button onClick={() => toggleActive(s)} disabled={pending} className="transition-colors shrink-0">
                    {s.is_active
                      ? <ToggleRight className="w-5 h-5 text-emerald-400" />
                      : <ToggleLeft  className="w-5 h-5 text-zinc-600" />}
                  </button>
                  <button
                    onClick={() => deleteScript(s.id)}
                    disabled={pending}
                    className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {isExpanded && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}>
                    <pre className="px-5 py-4 text-xs text-zinc-400 font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap">
                      {s.script_html}
                    </pre>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-5 rounded-xl p-4" style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)' }}>
        <p className="text-xs text-purple-300 font-semibold mb-1">How Script Injection Works</p>
        <p className="text-xs text-zinc-500 leading-relaxed">
          Active scripts are fetched from the database and injected into the HTML of <strong className="text-zinc-400">every page</strong> on the site.
          Scripts in <code className="text-purple-400">&lt;head&gt;</code> load before the page renders — use this for analytics and tag managers.
          Scripts at <code className="text-purple-400">&lt;body&gt; end</code> load after content — use this for chat widgets and non-critical tools.
          Changes go live within ~60 seconds (ISR cache).
        </p>
      </div>
    </div>
  )
}
