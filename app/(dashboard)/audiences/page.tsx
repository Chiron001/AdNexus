'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const segments = [
  { name: 'Retargeting 30d',         size: 42000, roas: 6.2, cpa: 98,  ctr: 4.1, spend: 88000, status: 'Healthy'   },
  { name: 'Lookalike 1% — Buyers',   size: 310000, roas: 4.8, cpa: 128, ctr: 2.9, spend: 76000, status: 'Healthy'  },
  { name: 'Lookalike 3% — Buyers',   size: 890000, roas: 4.1, cpa: 148, ctr: 2.4, spend: 52000, status: 'Healthy'  },
  { name: 'Interest — Fitness',      size: 1200000, roas: 3.4, cpa: 178, ctr: 1.8, spend: 38000, status: 'Monitor' },
  { name: 'Retargeting 180d',        size: 128000, roas: 2.8, cpa: 224, ctr: 1.2, spend: 28000, status: 'At Risk'  },
  { name: 'Broad — India 25-44',     size: 4200000, roas: 2.2, cpa: 286, ctr: 0.9, spend: 14000, status: 'Poor'    },
]

const ageData = [
  { age: '18–24', spend: 48000, revenue: 192000, cpa: 168 },
  { age: '25–34', spend: 142000, revenue: 710000, cpa: 128 },
  { age: '35–44', spend: 118000, revenue: 590000, cpa: 138 },
  { age: '45–54', spend: 72000, revenue: 302000, cpa: 188 },
  { age: '55+',   spend: 40000, revenue: 156000, cpa: 212 },
]

const statusConfig: Record<string, { color: string; bg: string }> = {
  Healthy:  { color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
  Monitor:  { color: 'text-yellow-400',  bg: 'bg-yellow-400/10 border-yellow-400/20'  },
  'At Risk':{ color: 'text-orange-400',  bg: 'bg-orange-400/10 border-orange-400/20'  },
  Poor:     { color: 'text-red-400',     bg: 'bg-red-400/10 border-red-400/20'        },
}

export default function AudiencesPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Audience Insights</h1>
        <p className="text-zinc-400 text-sm mt-0.5">Segment performance, demographics, and overlap analysis</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Best Segment ROAS',  value: '6.2x', sub: 'Retargeting 30d' },
          { label: 'Top Age Group',      value: '25–34', sub: '4.4x ROAS' },
          { label: 'Saturated Segments', value: '2', sub: 'Needs refresh' },
          { label: 'Audience Reach',     value: '6.7M', sub: 'Total addressable' },
        ].map(k => (
          <div key={k.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500 mb-1">{k.label}</p>
            <p className="text-2xl font-bold text-white font-mono">{k.value}</p>
            <p className="text-xs text-zinc-500 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Segment Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <p className="text-sm font-semibold text-white mb-4">Audience Segment Performance</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="text-xs text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
                <th className="text-left pb-3 font-medium">Segment</th>
                <th className="text-right pb-3 font-medium">Size</th>
                <th className="text-right pb-3 font-medium">Spend</th>
                <th className="text-right pb-3 font-medium">ROAS</th>
                <th className="text-right pb-3 font-medium">CPA</th>
                <th className="text-right pb-3 font-medium">CTR</th>
                <th className="text-center pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {segments.map(s => {
                const sc = statusConfig[s.status]
                return (
                  <tr key={s.name} className="hover:bg-zinc-800/40">
                    <td className="py-3 text-white font-medium">{s.name}</td>
                    <td className="py-3 text-right font-mono text-zinc-400">{(s.size/1000).toFixed(0)}k</td>
                    <td className="py-3 text-right font-mono text-zinc-300">₹{(s.spend/1000).toFixed(0)}k</td>
                    <td className={`py-3 text-right font-mono ${s.roas >= 4 ? 'text-emerald-400' : s.roas >= 3 ? 'text-yellow-400' : 'text-red-400'}`}>{s.roas}x</td>
                    <td className="py-3 text-right font-mono text-zinc-300">₹{s.cpa}</td>
                    <td className="py-3 text-right font-mono text-zinc-300">{s.ctr}%</td>
                    <td className="py-3 text-center">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${sc.bg} ${sc.color}`}>{s.status}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Age Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-sm font-semibold text-white mb-1">Revenue by Age Group</p>
          <p className="text-xs text-zinc-500 mb-4">All platforms combined</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={ageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false}/>
              <XAxis dataKey="age" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false}/>
              <YAxis tickFormatter={v => `₹${v/1000}k`} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => [`₹${(v/1000).toFixed(0)}k`]}/>
              <Bar dataKey="revenue" name="Revenue" fill="#34d399" radius={[4, 4, 0, 0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-sm font-semibold text-white mb-1">CPA by Age Group</p>
          <p className="text-xs text-zinc-500 mb-4">Lower = better</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={ageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false}/>
              <XAxis dataKey="age" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => [`₹${v}`]}/>
              <Bar dataKey="cpa" name="CPA ₹" fill="#f97316" radius={[4, 4, 0, 0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
