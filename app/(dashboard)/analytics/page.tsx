'use client'

import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const trend = [
  { day: 'Jun 1',  spend: 12000, revenue: 54000, roas: 4.5 },
  { day: 'Jun 3',  spend: 14000, revenue: 59000, roas: 4.2 },
  { day: 'Jun 5',  spend: 11000, revenue: 51000, roas: 4.6 },
  { day: 'Jun 7',  spend: 16000, revenue: 72000, roas: 4.5 },
  { day: 'Jun 9',  spend: 18000, revenue: 83000, roas: 4.6 },
  { day: 'Jun 11', spend: 15000, revenue: 64000, roas: 4.3 },
  { day: 'Jun 13', spend: 20000, revenue: 96000, roas: 4.8 },
  { day: 'Jun 15', spend: 22000, revenue: 99000, roas: 4.5 },
  { day: 'Jun 17', spend: 19000, revenue: 88000, roas: 4.6 },
  { day: 'Jun 19', spend: 24000, revenue: 110000, roas: 4.6 },
  { day: 'Jun 21', spend: 21000, revenue: 96000, roas: 4.6 },
  { day: 'Jun 23', spend: 26000, revenue: 124000, roas: 4.8 },
  { day: 'Jun 25', spend: 23000, revenue: 108000, roas: 4.7 },
  { day: 'Jun 27', spend: 28000, revenue: 135000, roas: 4.8 },
  { day: 'Jun 29', spend: 25000, revenue: 119000, roas: 4.8 },
]

const platforms = [
  { name: 'Meta Ads',    spend: 244000, revenue: 1080000, roas: 4.4, cpa: 142, color: '#3b82f6' },
  { name: 'Google Ads',  spend: 126000, revenue: 560000,  roas: 4.4, cpa: 158, color: '#ef4444' },
  { name: 'Amazon Ads',  spend: 50000,  revenue: 220000,  roas: 4.4, cpa: 167, color: '#f97316' },
]

const kpis = [
  { label: 'Total Spend',    value: '₹4.2L',  change: '+12.4%', up: true  },
  { label: 'Total Revenue',  value: '₹18.6L', change: '+8.1%',  up: true  },
  { label: 'Blended ROAS',   value: '4.43x',  change: '-2.3%',  up: false },
  { label: 'Conversions',    value: '2,841',   change: '+19.2%', up: true  },
  { label: 'Avg CPA',        value: '₹148',    change: '-6.7%',  up: true  },
  { label: 'Blended CTR',    value: '2.18%',   change: '+0.4pt', up: true  },
]

const fmt = (v: number) => `₹${(v / 1000).toFixed(0)}k`

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-xs shadow-xl">
      <p className="text-zinc-400 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.name === 'ROAS' ? `${p.value}x` : fmt(p.value)}</p>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Performance Analytics</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Cross-platform overview · Last 30 days</p>
        </div>
        <select className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm rounded-lg px-3 py-2 focus:outline-none">
          <option>Last 30 days</option>
          <option>Last 14 days</option>
          <option>Last 7 days</option>
          <option>Last 90 days</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500 mb-1">{k.label}</p>
            <p className="text-2xl font-bold text-white font-mono">{k.value}</p>
            <p className={`text-xs font-mono mt-1 ${k.up ? 'text-emerald-400' : 'text-red-400'}`}>
              {k.up ? '↑' : '↓'} {k.change}
            </p>
          </div>
        ))}
      </div>

      {/* Revenue vs Spend Chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-white">Revenue vs Spend</p>
            <p className="text-xs text-zinc-500 mt-0.5">Daily · All platforms combined</p>
          </div>
          <div className="flex gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"/>Revenue</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block"/>Spend</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={trend}>
            <defs>
              <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="gSpend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="day" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false}/>
            <YAxis tickFormatter={fmt} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false}/>
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#34d399" fill="url(#gRev)" strokeWidth={2}/>
            <Area type="monotone" dataKey="spend" name="Spend" stroke="#60a5fa" fill="url(#gSpend)" strokeWidth={2}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ROAS Trend + Platform Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ROAS Trend */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-sm font-semibold text-white mb-1">ROAS Trend</p>
          <p className="text-xs text-zinc-500 mb-4">Daily blended ROAS</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a"/>
              <XAxis dataKey="day" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false}/>
              <YAxis domain={[3.5, 5.5]} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => [`${v}x`]}/>
              <Line type="monotone" dataKey="roas" name="ROAS" stroke="#a78bfa" strokeWidth={2} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Platform Breakdown */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-sm font-semibold text-white mb-1">Platform Contribution</p>
          <p className="text-xs text-zinc-500 mb-4">Spend & Revenue by platform</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={platforms} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false}/>
              <XAxis type="number" tickFormatter={fmt} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false}/>
              <YAxis type="category" dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} width={80}/>
              <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => [fmt(v)]}/>
              <Bar dataKey="spend" name="Spend" fill="#3b82f6" radius={[0, 4, 4, 0]}/>
              <Bar dataKey="revenue" name="Revenue" fill="#34d399" radius={[0, 4, 4, 0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Platform KPI Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <p className="text-sm font-semibold text-white mb-4">Platform Breakdown</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
              <th className="text-left pb-3 font-medium">Platform</th>
              <th className="text-right pb-3 font-medium">Spend</th>
              <th className="text-right pb-3 font-medium">Revenue</th>
              <th className="text-right pb-3 font-medium">ROAS</th>
              <th className="text-right pb-3 font-medium">CPA</th>
              <th className="text-right pb-3 font-medium">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {platforms.map((p) => (
              <tr key={p.name} className="hover:bg-zinc-800/40 transition-colors">
                <td className="py-3">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: p.color }}/>
                    <span className="text-white font-medium">{p.name}</span>
                  </span>
                </td>
                <td className="py-3 text-right font-mono text-zinc-300">₹{(p.spend/1000).toFixed(0)}k</td>
                <td className="py-3 text-right font-mono text-zinc-300">₹{(p.revenue/100000).toFixed(2)}L</td>
                <td className="py-3 text-right font-mono text-emerald-400">{p.roas}x</td>
                <td className="py-3 text-right font-mono text-zinc-300">₹{p.cpa}</td>
                <td className="py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(p.spend / 420000) * 100}%`, background: p.color }}/>
                    </div>
                    <span className="text-zinc-400 text-xs font-mono">{Math.round((p.spend / 420000) * 100)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
