'use client'

import { useState, useEffect } from 'react'
import { Bell, Plus, Trash2, AlertCircle, CheckCircle, Info, Zap } from 'lucide-react'

interface Issue { id: string; title: string; platform: string; severity: string; description: string | null; status: string; estimated_impact_inr: number | null; detected_at: string }
interface Rec   { id: string; title: string; explanation: string | null; estimated_impact: string | null; status: string; created_at: string }
interface Rule  { id: string; name: string; metric: string; threshold: string; direction: 'above' | 'below'; channel: string; active: boolean }

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'text-red-400 bg-red-400/10 border-red-400/20',
  high:     'text-orange-400 bg-orange-400/10 border-orange-400/20',
  medium:   'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  low:      'text-zinc-400 bg-zinc-800 border-zinc-700',
}

const TEMPLATES = [
  { name: 'ROAS drops below 2x',      metric: 'ROAS',        threshold: '2',      direction: 'below' as const },
  { name: 'Daily spend > ₹50k',       metric: 'Daily Spend', threshold: '50000',  direction: 'above' as const },
  { name: 'CTR drops below 1%',       metric: 'CTR',         threshold: '1',      direction: 'below' as const },
  { name: 'CPA exceeds ₹300',         metric: 'CPA',         threshold: '300',    direction: 'above' as const },
  { name: 'Zero conversions in 48h',  metric: 'Conversions', threshold: '0',      direction: 'below' as const },
]

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60)   return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)    return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function AlertsClient({ issues, recommendations, accountCount }: {
  issues: Issue[]
  recommendations: Rec[]
  accountCount: number
}) {
  const [rules, setRules] = useState<Rule[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName]       = useState('')
  const [newMetric, setNewMetric]   = useState('ROAS')
  const [newThreshold, setNewThreshold] = useState('')
  const [newDir, setNewDir]         = useState<'above' | 'below'>('below')
  const [newChannel, setNewChannel] = useState('Email')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('adnexusone_alert_rules')
      if (saved) setRules(JSON.parse(saved))
    } catch {}
  }, [])

  function save(updated: Rule[]) {
    setRules(updated)
    localStorage.setItem('adnexusone_alert_rules', JSON.stringify(updated))
  }

  function addRule() {
    if (!newName.trim() || !newThreshold) return
    const rule: Rule = {
      id: Date.now().toString(),
      name: newName.trim(),
      metric: newMetric,
      threshold: newThreshold,
      direction: newDir,
      channel: newChannel,
      active: true,
    }
    save([...rules, rule])
    setNewName(''); setNewThreshold(''); setShowAdd(false)
  }

  function applyTemplate(t: typeof TEMPLATES[0]) {
    setNewName(t.name); setNewMetric(t.metric); setNewThreshold(t.threshold); setNewDir(t.direction); setShowAdd(true)
  }

  function toggleRule(id: string) {
    save(rules.map(r => r.id === id ? { ...r, active: !r.active } : r))
  }

  function removeRule(id: string) {
    save(rules.filter(r => r.id !== id))
  }

  const openIssues = issues.filter(i => i.status === 'open')
  const resolvedIssues = issues.filter(i => i.status !== 'open')

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Alerts</h1>
          <p className="text-zinc-400 text-sm mt-0.5">{accountCount} account{accountCount !== 1 ? 's' : ''} · Real issues from diagnostics</p>
        </div>
        <button onClick={() => setShowAdd(s => !s)}
          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4"/> Add Rule
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Open Issues',     value: openIssues.length, color: openIssues.length > 0 ? 'text-red-400' : 'text-white' },
          { label: 'Recommendations', value: recommendations.length, color: 'text-yellow-400' },
          { label: 'Alert Rules',     value: rules.length, color: 'text-zinc-200' },
        ].map(k => (
          <div key={k.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500 mb-1">{k.label}</p>
            <p className={`text-3xl font-bold font-mono ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Open Issues (real from DB) */}
      {openIssues.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-red-400"/>
            <p className="text-sm font-semibold text-white">Open Issues ({openIssues.length})</p>
          </div>
          <div className="space-y-2">
            {openIssues.map(issue => (
              <div key={issue.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${SEVERITY_COLORS[issue.severity] ?? SEVERITY_COLORS.low}`}>
                        {issue.severity}
                      </span>
                      <span className="text-xs text-zinc-500 capitalize">{issue.platform}</span>
                    </div>
                    <p className="text-sm font-medium text-white">{issue.title}</p>
                    {issue.description && <p className="text-xs text-zinc-400 mt-1">{issue.description}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    {(issue.estimated_impact_inr ?? 0) > 0 && (
                      <p className="text-xs font-mono text-red-400">-₹{((issue.estimated_impact_inr ?? 0) / 1000).toFixed(0)}k/mo</p>
                    )}
                    <p className="text-[10px] text-zinc-600 mt-0.5">{timeAgo(issue.detected_at)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations as Actionable Alerts */}
      {recommendations.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-yellow-400"/>
            <p className="text-sm font-semibold text-white">Action Required ({recommendations.length})</p>
          </div>
          <div className="space-y-2">
            {recommendations.map(rec => (
              <div key={rec.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white mb-1">{rec.title}</p>
                    <p className="text-xs text-zinc-400">{rec.explanation}</p>
                  </div>
                  {rec.estimated_impact && (
                    <span className="text-xs font-mono text-emerald-400 shrink-0">{rec.estimated_impact}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {issues.length === 0 && recommendations.length === 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
          <CheckCircle className="w-10 h-10 text-emerald-500/40 mx-auto mb-3"/>
          <p className="text-sm font-medium text-white mb-1">All clear</p>
          <p className="text-xs text-zinc-400">No open issues detected. Sync your accounts to run diagnostics.</p>
        </div>
      )}

      {/* Alert Rules (localStorage) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-white">Alert Rules</p>
          {rules.length === 0 && (
            <p className="text-xs text-zinc-500">Rules run when your accounts sync</p>
          )}
        </div>

        {/* Templates */}
        {rules.length === 0 && !showAdd && (
          <div className="mb-4">
            <p className="text-xs text-zinc-500 mb-2">Quick add from templates:</p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map(t => (
                <button key={t.name} onClick={() => applyTemplate(t)}
                  className="text-xs bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 rounded-full px-3 py-1.5 transition-colors">
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {showAdd && (
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 mb-4">
            <p className="text-sm font-semibold text-white mb-4">New Alert Rule</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Rule name"
                className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 col-span-2"/>
              <select value={newMetric} onChange={e => setNewMetric(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500">
                {['ROAS', 'CTR', 'CPA', 'Daily Spend', 'Conversions', 'Frequency'].map(m => <option key={m}>{m}</option>)}
              </select>
              <select value={newDir} onChange={e => setNewDir(e.target.value as any)}
                className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500">
                <option value="below">drops below</option>
                <option value="above">exceeds</option>
              </select>
              <input value={newThreshold} onChange={e => setNewThreshold(e.target.value)} placeholder="Threshold value"
                className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"/>
              <select value={newChannel} onChange={e => setNewChannel(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500">
                <option>Email</option>
                <option>In-app</option>
                <option>Email + In-app</option>
              </select>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={addRule} className="bg-purple-600 hover:bg-purple-500 text-white text-sm px-4 py-2 rounded-lg transition-colors">Save Rule</button>
              <button onClick={() => setShowAdd(false)} className="text-zinc-400 hover:text-white text-sm px-4 py-2 rounded-lg transition-colors">Cancel</button>
            </div>
          </div>
        )}

        {rules.length > 0 ? (
          <div className="space-y-2">
            {rules.map(rule => (
              <div key={rule.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleRule(rule.id)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${rule.active ? 'bg-purple-600' : 'bg-zinc-700'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${rule.active ? 'translate-x-5' : 'translate-x-0.5'}`}/>
                  </button>
                  <div>
                    <p className="text-sm font-medium text-white">{rule.name}</p>
                    <p className="text-xs text-zinc-500">{rule.metric} {rule.direction === 'above' ? 'exceeds' : 'drops below'} {rule.threshold} · {rule.channel}</p>
                  </div>
                </div>
                <button onClick={() => removeRule(rule.id)} className="text-zinc-600 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5"/>
                </button>
              </div>
            ))}
          </div>
        ) : !showAdd && (
          <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-xl p-6 text-center">
            <Bell className="w-8 h-8 text-zinc-600 mx-auto mb-2"/>
            <p className="text-sm text-zinc-400">No alert rules yet. Use a template above or create a custom rule.</p>
          </div>
        )}
      </div>
    </div>
  )
}
