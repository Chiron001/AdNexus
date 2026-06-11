'use client'

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const PLATFORM_COLORS: Record<string, string> = { meta: '#3b82f6', google: '#ef4444', amazon: '#f97316' }

export function FunnelCharts({
  weeklyTrend, platformFunnel, usedPlatforms,
}: {
  weeklyTrend: { week: string; ctr: number; purchRate: number }[]
  platformFunnel: Record<string, any>[]
  usedPlatforms: string[]
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <p className="text-sm font-semibold text-white mb-1">Weekly Funnel Trend</p>
        <p className="text-xs text-zinc-500 mb-4">CTR and Purchase rate over time (%)</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={weeklyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a"/>
            <XAxis dataKey="week" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => [`${v}%`]}/>
            <Line type="monotone" dataKey="ctr" name="CTR %" stroke="#60a5fa" strokeWidth={2} dot={false}/>
            <Line type="monotone" dataKey="purchRate" name="Purchase %" stroke="#34d399" strokeWidth={2} dot={false}/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <p className="text-sm font-semibold text-white mb-1">Funnel CVR by Platform</p>
        <p className="text-xs text-zinc-500 mb-4">CTR and Conversion rate per platform (%)</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={platformFunnel}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false}/>
            <XAxis dataKey="stage" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => [`${v}%`]}/>
            {usedPlatforms.map(p => (
              <Bar key={p} dataKey={p} name={p.charAt(0).toUpperCase() + p.slice(1)} fill={PLATFORM_COLORS[p] ?? '#a78bfa'} radius={[3, 3, 0, 0]}/>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
