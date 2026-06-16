'use client'

import React, { useState, useEffect } from 'react'
import { Target, Plus, Trash2, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

interface CurrentMetrics { roas: number; revenue: number; cpa: number; spend: number; ctr: number; conversions: number }
interface PrevSummary    { roas: number; revenue: number; cpa: number }
interface DayPoint       { day: string; revenue: number; roas: number }
interface Goal           { id: string; metric: string; target: number; unit: string; direction: 'above' | 'below' }

const METRIC_OPTIONS = [
  { label: 'Blended ROAS', key: 'roas', unit: 'x', direction: 'above' as const },
  { label: 'Monthly Revenue', key: 'revenue', unit: '$', direction: 'above' as const },
  { label: 'Avg CPA', key: 'cpa', unit: '$', direction: 'below' as const },
  { label: 'Total Spend', key: 'spend', unit: '$', direction: 'below' as const },
  { label: 'CTR', key: 'ctr', unit: '%', direction: 'above' as const },
]

function pct(current: number, target: number, direction: 'above' | 'below') {
  if (!target) return 0
  if (direction === 'above') return Math.min(100, Math.round((current / target) * 100))
  if (current === 0) return 100
  return Math.min(100, Math.round((target / current) * 100))
}

function status(p: number) {
  if (p >= 100) return 'achieved'
  if (p >= 75)  return 'on-track'
  if (p >= 50)  return 'at-risk'
  return 'off-track'
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  achieved: <CheckCircle className="w-4 h-4 text-emerald-400"/>,
  'on-track': <CheckCircle className="w-4 h-4 text-blue-400"/>,
  'at-risk': <AlertCircle className="w-4 h-4 text-yellow-400"/>,
  'off-track': <XCircle className="w-4 h-4 text-red-400"/>,
}
const STATUS_BAR: Record<string, string> = {
  achieved: 'bg-emerald-500',
  'on-track': 'bg-blue-500',
  'at-risk': 'bg-yellow-500',
  'off-track': 'bg-red-500',
}

function fmtVal(v: number, unit: string) {
  if (unit === '$') {
    if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`
    if (v >= 1000)    return `$${(v / 1000).toFixed(0)}k`
    return `$${v}`
  }
  return `${v}${unit}`
}

export function GoalsClient({ current, prevSummary, progression, monthLabel }: {
  current: CurrentMetrics
  prevSummary: PrevSummary
  progression: DayPoint[]
  monthLabel: string
}) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [newMetric, setNewMetric] = useState('roas')
  const [newTarget, setNewTarget] = useState('')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('adnexusone_goals')
      if (saved) setGoals(JSON.parse(saved))
    } catch {}
  }, [])

  function save(updated: Goal[]) {
    setGoals(updated)
    localStorage.setItem('adnexusone_goals', JSON.stringify(updated))
  }

  function addGoal() {
    const opt = METRIC_OPTIONS.find(o => o.key === newMetric)!
    if (!newTarget || isNaN(Number(newTarget))) return
    const goal: Goal = {
      id: Date.now().toString(),
      metric: newMetric,
      target: Number(newTarget),
      unit: opt.unit,
      direction: opt.direction,
    }
    save([...goals, goal])
    setNewTarget('')
    setShowAdd(false)
  }

  function removeGoal(id: string) {
    save(goals.filter(g => g.id !== id))
  }

  const metricLabel: Record<string, string> = { roas: 'Blended ROAS', revenue: 'Monthly Revenue', cpa: 'Avg CPA', spend: 'Total Spend', ctr: 'CTR' }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Goals & KPIs</h1>
          <p className="text-zinc-400 text-sm mt-0.5">{monthLabel} · Live vs targets</p>
        </div>
        <button onClick={() => setShowAdd(s => !s)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-sm px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4"/> Add Goal
        </button>
      </div>

      {showAdd && (
        <div className="bg-zinc-900 border border-purple-500/30 rounded-xl p-5">
          <p className="text-sm font-semibold text-white mb-4">New Goal</p>
          <div className="flex gap-3 flex-wrap">
            <select value={newMetric} onChange={e => setNewMetric(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500">
              {METRIC_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
            <input value={newTarget} onChange={e => setNewTarget(e.target.value)} placeholder="Target value"
              className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 w-36"/>
            <button onClick={addGoal} className="bg-purple-600 hover:bg-purple-500 text-white text-sm px-4 py-2 rounded-lg transition-colors">Save</button>
            <button onClick={() => setShowAdd(false)} className="text-zinc-400 hover:text-white text-sm px-4 py-2 rounded-lg transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Current Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {METRIC_OPTIONS.map(opt => {
          const curr = (current as any)[opt.key] as number
          const prev = (prevSummary as any)[opt.key] as number
          const delta = prev > 0 ? Math.round(((curr - prev) / prev) * 100) : null
          const positive = opt.direction === 'above' ? delta !== null && delta > 0 : delta !== null && delta < 0
          return (
            <div key={opt.key} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-xs text-zinc-500 mb-1">{opt.label}</p>
              <p className="text-2xl font-bold text-white font-mono">{fmtVal(curr, opt.unit)}</p>
              {delta !== null && (
                <p className={`text-xs font-mono mt-1 ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {delta > 0 ? '+' : ''}{delta}% vs last month
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Goals Progress */}
      {goals.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-white">Your Goals</p>
          {goals.map(g => {
            const curr = (current as any)[g.metric] as number ?? 0
            const p = pct(curr, g.target, g.direction)
            const s = status(p)
            return (
              <div key={g.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    {STATUS_ICON[s]}
                    <div>
                      <p className="text-sm font-semibold text-white">{metricLabel[g.metric] ?? g.metric}</p>
                      <p className="text-xs text-zinc-500">Target: {fmtVal(g.target, g.unit)} · Current: {fmtVal(curr, g.unit)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-mono font-bold ${s === 'achieved' ? 'text-emerald-400' : s === 'on-track' ? 'text-blue-400' : s === 'at-risk' ? 'text-yellow-400' : 'text-red-400'}`}>
                      {p}%
                    </span>
                    <button onClick={() => removeGoal(g.id)} className="text-zinc-600 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5"/>
                    </button>
                  </div>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full transition-all ${STATUS_BAR[s]}`} style={{ width: `${p}%` }}/>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-xl p-8 text-center">
          <Target className="w-10 h-10 text-zinc-600 mx-auto mb-3"/>
          <p className="text-sm font-medium text-white mb-1">No goals set yet</p>
          <p className="text-xs text-zinc-400 mb-4">Add a goal above to track your progress against real targets.</p>
          <button onClick={() => setShowAdd(true)}
            className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg transition-colors">
            Set your first goal
          </button>
        </div>
      )}

      {/* Revenue progression chart */}
      {progression.length > 1 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-sm font-semibold text-white mb-1">Monthly Revenue Progression</p>
          <p className="text-xs text-zinc-500 mb-4">Cumulative revenue for {monthLabel}</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={progression}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a"/>
              <XAxis dataKey="day" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false}/>
              <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }}
                formatter={(v: any, name: any) => name === 'revenue' ? [`$${(v/1000).toFixed(0)}k`, 'Revenue'] : [`${v}x`, 'ROAS']}/>
              <Line type="monotone" dataKey="revenue" name="revenue" stroke="#a78bfa" strokeWidth={2} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
