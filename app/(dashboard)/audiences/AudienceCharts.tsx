'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const PLATFORM_COLORS: Record<string, string> = { meta: '#3b82f6', google: '#ef4444', amazon: '#f97316' }

interface PlatformData { name: string; platform: string; spend: number; revenue: number; roas: number; cpa: number; ctr: number }

export function AudienceCharts({ platformData }: { platformData: PlatformData[] }) {
  const colored = platformData.map(p => ({ ...p, fill: PLATFORM_COLORS[p.platform] ?? '#a78bfa' }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <p className="text-sm font-semibold text-white mb-1">Revenue by Platform</p>
        <p className="text-xs text-zinc-500 mb-4">Total revenue from each platform audience</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={colored}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false}/>
            <XAxis dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false}/>
            <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => [`₹${(v/1000).toFixed(0)}k`, 'Revenue']}/>
            <Bar dataKey="revenue" name="Revenue" fill="#34d399" radius={[4, 4, 0, 0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <p className="text-sm font-semibold text-white mb-1">CPA by Platform</p>
        <p className="text-xs text-zinc-500 mb-4">Cost per acquisition per platform (₹)</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={colored}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false}/>
            <XAxis dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => [`₹${v}`, 'CPA']}/>
            <Bar dataKey="cpa" name="CPA ₹" fill="#f97316" radius={[4, 4, 0, 0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
