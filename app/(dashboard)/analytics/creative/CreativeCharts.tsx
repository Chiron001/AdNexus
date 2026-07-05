'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts'

interface Campaign { name: string; platform: string; spend: number; roas: number; ctr: number; cpa: number; conversions: number }
interface FormatRow { format: string; avgRoas: number; avgCtr: number; spend: number }

export function CreativeCharts({ campaigns, formatData, sym = '$' }: { campaigns: Campaign[]; formatData: FormatRow[]; sym?: string }) {
  const scatterData = campaigns.map(c => ({ x: c.spend / 1000, y: c.roas, name: c.name }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <p className="text-sm font-semibold text-white mb-1">ROAS by Platform</p>
        <p className="text-xs text-zinc-500 mb-4">Average ROAS per platform</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={formatData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false}/>
            <XAxis dataKey="format" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false}/>
            <YAxis domain={[0, 'auto']} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => [`${v}x`, 'Avg ROAS']}/>
            <Bar dataKey="avgRoas" name="Avg ROAS" fill="#a78bfa" radius={[4, 4, 0, 0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <p className="text-sm font-semibold text-white mb-1">Spend vs ROAS</p>
        <p className="text-xs text-zinc-500 mb-4">Each dot = one campaign</p>
        <ResponsiveContainer width="100%" height={180}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a"/>
            <XAxis dataKey="x" name={`Spend (${sym}k)`} type="number" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} label={{ value: `Spend (${sym}k) →`, position: 'insideBottom', offset: -2, fill: '#52525b', fontSize: 10 }}/>
            <YAxis dataKey="y" name="ROAS" type="number" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false}/>
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }}/>
            <Scatter data={scatterData} fill="#34d399" opacity={0.8}/>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
