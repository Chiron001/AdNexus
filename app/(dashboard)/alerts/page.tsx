'use client'

import { useState } from 'react'
import { Bell, Plus, Trash2, ToggleLeft, ToggleRight, AlertCircle, CheckCircle, Clock } from 'lucide-react'

const rules = [
  { id: 1, name: 'ROAS Drop Alert', metric: 'ROAS', operator: 'drops below', value: '3.0x', platform: 'All', channel: 'Email + WhatsApp', active: true, lastTriggered: null },
  { id: 2, name: 'Daily Overspend', metric: 'Daily Spend', operator: 'exceeds', value: '₹20,000', platform: 'All', channel: 'Email', active: true, lastTriggered: '2 days ago' },
  { id: 3, name: 'Creative Fatigue', metric: 'Frequency', operator: 'exceeds', value: '7', platform: 'Meta', channel: 'In-app', active: true, lastTriggered: '1 day ago' },
  { id: 4, name: 'CTR Drop', metric: 'CTR', operator: 'drops below', value: '1%', platform: 'Meta', channel: 'Email', active: false, lastTriggered: null },
  { id: 5, name: 'CPA Spike', metric: 'CPA', operator: 'exceeds', value: '₹250', platform: 'All', channel: 'Email + WhatsApp', active: true, lastTriggered: null },
]

const log = [
  { id: 1, rule: 'Daily Overspend',  time: '2 days ago, 11:42pm', detail: 'Daily spend hit ₹21,400 — 7.1% over budget limit', severity: 'medium' },
  { id: 2, rule: 'Creative Fatigue', time: '1 day ago, 3:15pm',   detail: 'Collection Drop — Image frequency reached 8.1', severity: 'high'   },
  { id: 3, rule: 'Daily Overspend',  time: '5 days ago, 9:18pm',  detail: 'Daily spend hit ₹19,800 — borderline threshold',   severity: 'low'    },
]

const templates = [
  { name: 'ROAS drops below 2x',       metric: 'ROAS',       value: '2x' },
  { name: 'Daily spend > ₹50k',        metric: 'Daily Spend', value: '₹50,000' },
  { name: 'CTR drops more than 30%',   metric: 'CTR Delta',  value: '-30%' },
  { name: 'Frequency > 8',             metric: 'Frequency',  value: '8' },
  { name: 'Zero conversions in 48hrs', metric: 'Conversions', value: '0' },
]

export default function AlertsPage() {
  const [activeRules, setActiveRules] = useState(rules.map(r => ({ ...r })))
  const [showNew, setShowNew] = useState(false)

  function toggle(id: number) {
    setActiveRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r))
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Alert Rules</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Get notified before problems become disasters</p>
        </div>
        <button onClick={() => setShowNew(!showNew)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4"/> New Rule
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Active Rules',    value: activeRules.filter(r => r.active).length, color: 'text-emerald-400' },
          { label: 'Triggered Today', value: 1,                                         color: 'text-yellow-400' },
          { label: 'This Week',       value: log.length,                                color: 'text-blue-400'   },
        ].map(s => (
          <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</p>
            <p className="text-xs text-zinc-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Template Quick-add */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <p className="text-sm font-semibold text-white mb-3">Quick Templates</p>
        <div className="flex flex-wrap gap-2">
          {templates.map(t => (
            <button key={t.name}
              className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-full px-3 py-1.5 transition-colors flex items-center gap-1.5">
              <Plus className="w-3 h-3"/> {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Rules List */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <p className="text-sm font-semibold text-white mb-4">Active Rules</p>
        <div className="space-y-3">
          {activeRules.map(r => (
            <div key={r.id} className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${r.active ? 'bg-zinc-800/40 border-zinc-700' : 'bg-zinc-900 border-zinc-800 opacity-50'}`}>
              <button onClick={() => toggle(r.id)} className="shrink-0">
                {r.active
                  ? <ToggleRight className="w-5 h-5 text-purple-400"/>
                  : <ToggleLeft className="w-5 h-5 text-zinc-600"/>}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{r.name}</p>
                <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                  IF {r.metric} {r.operator} {r.value} on {r.platform}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono">{r.channel}</span>
                {r.lastTriggered
                  ? <span className="text-xs text-yellow-400 flex items-center gap-1"><Clock className="w-3 h-3"/> {r.lastTriggered}</span>
                  : <span className="text-xs text-zinc-600">Never triggered</span>}
              </div>
              <button className="shrink-0 text-zinc-600 hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4"/>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Alert Log */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <p className="text-sm font-semibold text-white mb-4">Recent Alerts</p>
        <div className="space-y-3">
          {log.map(l => (
            <div key={l.id} className={`flex gap-3 p-4 rounded-lg border ${
              l.severity === 'high' ? 'bg-red-500/5 border-red-500/20' :
              l.severity === 'medium' ? 'bg-yellow-500/5 border-yellow-500/20' :
              'bg-zinc-800/40 border-zinc-700'}`}>
              <AlertCircle className={`w-4 h-4 mt-0.5 shrink-0 ${l.severity === 'high' ? 'text-red-400' : l.severity === 'medium' ? 'text-yellow-400' : 'text-zinc-500'}`}/>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white">{l.rule}</p>
                  <span className="text-xs text-zinc-500 font-mono">{l.time}</span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">{l.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
