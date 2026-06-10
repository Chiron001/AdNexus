'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

const dailySpend = [
  { day: 'Jun 1',  spend: 12000, budget: 14000 },
  { day: 'Jun 5',  spend: 11000, budget: 14000 },
  { day: 'Jun 10', spend: 16000, budget: 14000 },
  { day: 'Jun 15', spend: 22000, budget: 14000 },
  { day: 'Jun 20', spend: 19000, budget: 14000 },
  { day: 'Jun 25', spend: 26000, budget: 14000 },
  { day: 'Jun 29', spend: 25000, budget: 14000 },
]

const cpmTrend = [
  { day: 'Jun 1',  meta: 220, google: 180, amazon: 140 },
  { day: 'Jun 5',  meta: 240, google: 175, amazon: 148 },
  { day: 'Jun 10', meta: 260, google: 190, amazon: 152 },
  { day: 'Jun 15', meta: 280, google: 200, amazon: 158 },
  { day: 'Jun 20', meta: 310, google: 210, amazon: 165 },
  { day: 'Jun 25', meta: 295, google: 205, amazon: 162 },
  { day: 'Jun 29', meta: 320, google: 215, amazon: 170 },
]

const wastedSpend = [
  { campaign: 'Brand Awareness — Tier 3',   platform: 'Meta',   spend: 18400, conversions: 0,  issue: 'Zero conversions in 14 days' },
  { campaign: 'Retargeting 180d — Desktop', platform: 'Google', spend: 12200, conversions: 2,  issue: 'CPA 8x above target' },
  { campaign: 'Broad Match Keywords',        platform: 'Google', spend: 9800,  conversions: 3,  issue: 'Low search term relevance' },
  { campaign: 'Story Ads — Cold Audience',  platform: 'Meta',   spend: 7600,  conversions: 1,  issue: 'Frequency > 9, CTR < 0.5%' },
]

const allocation = [
  { name: 'Meta — Retargeting',    value: 92000,  pct: 22 },
  { name: 'Meta — Lookalike',      value: 84000,  pct: 20 },
  { name: 'Meta — Cold',           value: 68000,  pct: 16 },
  { name: 'Google — Search',       value: 76000,  pct: 18 },
  { name: 'Google — Shopping',     value: 50000,  pct: 12 },
  { name: 'Amazon — SP',           value: 50000,  pct: 12 },
]

const totalWaste = wastedSpend.reduce((s, r) => s + r.spend, 0)
const totalSpend = 420000
const pacingPct = Math.round((totalSpend / 500000) * 100)

export default function BudgetPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Budget & Spend Analytics</h1>
        <p className="text-zinc-400 text-sm mt-0.5">Spend tracking, pacing, and efficiency</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Month Spend',    value: '₹4.2L',                    sub: 'of ₹5L budget' },
          { label: 'Pacing',         value: `${pacingPct}%`,             sub: 'on track' },
          { label: 'Wasted Spend',   value: `₹${(totalWaste/1000).toFixed(1)}k`, sub: `${Math.round(totalWaste/totalSpend*100)}% of total` },
          { label: 'Avg Daily Spend', value: '₹14k',                    sub: 'target: ₹14k' },
        ].map(k => (
          <div key={k.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500 mb-1">{k.label}</p>
            <p className="text-2xl font-bold text-white font-mono">{k.value}</p>
            <p className="text-xs text-zinc-500 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Pacing Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm font-semibold text-white">Monthly Spend Pacing</p>
          <span className="text-xs font-mono text-emerald-400">On Track</span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-4 overflow-hidden">
          <div className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all" style={{ width: `${pacingPct}%` }}/>
        </div>
        <div className="flex justify-between mt-2 text-xs font-mono text-zinc-500">
          <span>₹0</span>
          <span>₹4.2L spent ({pacingPct}%)</span>
          <span>₹5L target</span>
        </div>
      </div>

      {/* Daily Spend vs Budget + CPM Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-sm font-semibold text-white mb-1">Daily Spend vs Budget</p>
          <p className="text-xs text-zinc-500 mb-4">Orange = overpace days</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dailySpend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false}/>
              <XAxis dataKey="day" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false}/>
              <YAxis tickFormatter={v => `₹${v/1000}k`} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => [`₹${(v/1000).toFixed(0)}k`]}/>
              <Bar dataKey="spend" name="Spend" fill="#60a5fa" radius={[4, 4, 0, 0]}/>
              <Line type="monotone" dataKey="budget" name="Budget" stroke="#f97316" strokeWidth={1.5} strokeDasharray="4 2" dot={false}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-sm font-semibold text-white mb-1">CPM Trend by Platform</p>
          <p className="text-xs text-zinc-500 mb-4">Cost per 1,000 impressions (₹)</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={cpmTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a"/>
              <XAxis dataKey="day" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => [`₹${v}`, '']}/>
              <Line type="monotone" dataKey="meta" name="Meta" stroke="#3b82f6" strokeWidth={2} dot={false}/>
              <Line type="monotone" dataKey="google" name="Google" stroke="#ef4444" strokeWidth={2} dot={false}/>
              <Line type="monotone" dataKey="amazon" name="Amazon" stroke="#f97316" strokeWidth={2} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Budget Allocation */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <p className="text-sm font-semibold text-white mb-4">Budget Allocation Breakdown</p>
        <div className="space-y-3">
          {allocation.map(a => (
            <div key={a.name}>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-zinc-300">{a.name}</span>
                <span className="text-zinc-400">₹{(a.value/1000).toFixed(0)}k · {a.pct}%</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div className="h-2 rounded-full bg-purple-500/70" style={{ width: `${a.pct * 3}%` }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wasted Spend */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-white">Wasted Spend Tracker</p>
            <p className="text-xs text-zinc-500 mt-0.5">Campaigns with poor ROI that need attention</p>
          </div>
          <span className="text-xs font-mono text-red-400 bg-red-400/10 border border-red-400/20 px-3 py-1 rounded-full">
            ₹{(totalWaste/1000).toFixed(1)}k wasted
          </span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
              <th className="text-left pb-3 font-medium">Campaign</th>
              <th className="text-center pb-3 font-medium">Platform</th>
              <th className="text-right pb-3 font-medium">Spend</th>
              <th className="text-right pb-3 font-medium">Conv.</th>
              <th className="text-left pb-3 font-medium pl-4">Issue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {wastedSpend.map((w) => (
              <tr key={w.campaign} className="hover:bg-zinc-800/40">
                <td className="py-3 text-white font-medium">{w.campaign}</td>
                <td className="py-3 text-center">
                  <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">{w.platform}</span>
                </td>
                <td className="py-3 text-right font-mono text-red-400">₹{(w.spend/1000).toFixed(1)}k</td>
                <td className="py-3 text-right font-mono text-zinc-400">{w.conversions}</td>
                <td className="py-3 pl-4 text-xs text-orange-300">{w.issue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
