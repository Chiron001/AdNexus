'use client'

import { useState } from 'react'
import { Target, Plus, CheckCircle, AlertCircle, XCircle } from 'lucide-react'

const goals = [
  { id: 1, metric: 'Blended ROAS',    platform: 'All',    target: 5.0,  current: 4.43, unit: 'x',  period: 'June 2026' },
  { id: 2, metric: 'Monthly Revenue', platform: 'All',    target: 2500000, current: 1860000, unit: '₹', period: 'June 2026' },
  { id: 3, metric: 'Meta ROAS',       platform: 'Meta',   target: 5.5,  current: 4.6,  unit: 'x',  period: 'June 2026' },
  { id: 4, metric: 'Avg CPA',         platform: 'All',    target: 120,  current: 148,  unit: '₹',  period: 'June 2026' },
  { id: 5, metric: 'Total Spend',     platform: 'All',    target: 500000, current: 420000, unit: '₹', period: 'June 2026' },
  { id: 6, metric: 'Google ROAS',     platform: 'Google', target: 4.5,  current: 4.4,  unit: 'x',  period: 'June 2026' },
]

const history = [
  { month: 'March', roas: 3.8, revenue: 1400000, cpa: 182, hit: false },
  { month: 'April', roas: 4.1, revenue: 1600000, cpa: 168, hit: false },
  { month: 'May',   roas: 4.3, revenue: 1780000, cpa: 155, hit: false },
  { month: 'June',  roas: 4.4, revenue: 1860000, cpa: 148, hit: null },
]

function GoalGauge({ pct, status }: { pct: number; status: string }) {
  const r = 28, cx = 32, cy = 32
  const circ = 2 * Math.PI * r
  const dash = (Math.min(pct, 100) / 100) * circ
  const color = status === 'on-track' ? '#34d399' : status === 'at-risk' ? '#fbbf24' : '#f87171'
  return (
    <svg width="64" height="64" viewBox="0 0 64 64">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#27272a" strokeWidth="6"/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}/>
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize="11" fontFamily="monospace" fontWeight="600">
        {pct}%
      </text>
    </svg>
  )
}

export default function GoalsPage() {
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Goals & KPI Targets</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Track performance against monthly targets</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4"/> Add Goal
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'On Track', count: goals.filter(g => (g.current / g.target) >= 0.85).length, color: 'text-emerald-400', icon: CheckCircle },
          { label: 'At Risk',  count: goals.filter(g => { const p = g.current/g.target; return p >= 0.7 && p < 0.85 }).length, color: 'text-yellow-400', icon: AlertCircle },
          { label: 'Off Track', count: goals.filter(g => (g.current / g.target) < 0.7).length, color: 'text-red-400', icon: XCircle },
        ].map(s => (
          <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
            <s.icon className={`w-8 h-8 ${s.color}`}/>
            <div>
              <p className="text-2xl font-bold text-white font-mono">{s.count}</p>
              <p className="text-xs text-zinc-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Goal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {goals.map(g => {
          const pct = Math.round((g.current / g.target) * 100)
          const status = pct >= 85 ? 'on-track' : pct >= 70 ? 'at-risk' : 'off-track'
          const statusLabel = status === 'on-track' ? 'On Track' : status === 'at-risk' ? 'At Risk' : 'Off Track'
          const statusColor = status === 'on-track' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : status === 'at-risk' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' : 'text-red-400 bg-red-400/10 border-red-400/20'
          const fmtVal = (v: number) => g.unit === '₹' ? v >= 100000 ? `₹${(v/100000).toFixed(1)}L` : `₹${(v/1000).toFixed(0)}k` : `${v}${g.unit}`
          return (
            <div key={g.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-white">{g.metric}</p>
                  <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono mt-1 inline-block">{g.platform}</span>
                </div>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusColor}`}>{statusLabel}</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white font-mono">{fmtVal(g.current)}</p>
                  <p className="text-xs text-zinc-500 mt-1">Target: <span className="text-zinc-300 font-mono">{fmtVal(g.target)}</span></p>
                  <p className="text-xs text-zinc-600 mt-0.5">{g.period}</p>
                </div>
                <GoalGauge pct={pct} status={status}/>
              </div>
            </div>
          )
        })}
      </div>

      {/* History Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <p className="text-sm font-semibold text-white mb-4">Monthly Goal History</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
              <th className="text-left pb-3 font-medium">Month</th>
              <th className="text-right pb-3 font-medium">ROAS</th>
              <th className="text-right pb-3 font-medium">Revenue</th>
              <th className="text-right pb-3 font-medium">CPA</th>
              <th className="text-center pb-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {history.map(h => (
              <tr key={h.month} className="hover:bg-zinc-800/40">
                <td className="py-3 text-white font-medium">{h.month}</td>
                <td className="py-3 text-right font-mono text-zinc-300">{h.roas}x</td>
                <td className="py-3 text-right font-mono text-zinc-300">₹{(h.revenue/100000).toFixed(1)}L</td>
                <td className="py-3 text-right font-mono text-zinc-300">₹{h.cpa}</td>
                <td className="py-3 text-center">
                  {h.hit === null ? (
                    <span className="text-[11px] bg-blue-400/10 border border-blue-400/20 text-blue-400 px-2 py-0.5 rounded-full">In Progress</span>
                  ) : h.hit ? (
                    <span className="text-[11px] bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 px-2 py-0.5 rounded-full">Hit</span>
                  ) : (
                    <span className="text-[11px] bg-red-400/10 border border-red-400/20 text-red-400 px-2 py-0.5 rounded-full">Missed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
