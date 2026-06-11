'use client'

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const PLATFORM_COLORS: Record<string, string> = { meta: '#3b82f6', google: '#ef4444', amazon: '#f97316' }

export function BudgetCharts({
  dailySpend, cpmTrend, usedPlatforms,
}: {
  dailySpend: { day: string; spend: number }[]
  cpmTrend: Record<string, any>[]
  usedPlatforms: string[]
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <p className="text-sm font-semibold text-white mb-1">Daily Spend</p>
        <p className="text-xs text-zinc-500 mb-4">Actual spend per day (₹)</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={dailySpend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false}/>
            <XAxis dataKey="day" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false}/>
            <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => [`₹${(v/1000).toFixed(1)}k`, 'Spend']}/>
            <Bar dataKey="spend" name="Spend" fill="#60a5fa" radius={[4, 4, 0, 0]}/>
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
            <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => [`₹${v}`]}/>
            {usedPlatforms.map(p => (
              <Line key={p} type="monotone" dataKey={p} name={p.charAt(0).toUpperCase() + p.slice(1)} stroke={PLATFORM_COLORS[p] ?? '#a78bfa'} strokeWidth={2} dot={false}/>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
