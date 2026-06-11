'use client'

import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

interface TrendPoint { day: string; spend: number; revenue: number; roas: number }
interface PlatformRow { name: string; spend: number; revenue: number; roas: number; cpa: number; color: string; pct: number }

const fmt = (v: number) => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${(v / 1000).toFixed(0)}k`

export function TrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data}>
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
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a"/>
        <XAxis dataKey="day" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false}/>
        <YAxis tickFormatter={fmt} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false}/>
        <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => [fmt(v)]}/>
        <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#34d399" fill="url(#gRev)" strokeWidth={2}/>
        <Area type="monotone" dataKey="spend" name="Spend" stroke="#60a5fa" fill="url(#gSpend)" strokeWidth={2}/>
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function RoasTrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a"/>
        <XAxis dataKey="day" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false}/>
        <YAxis domain={['auto', 'auto']} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false}/>
        <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => [`${Number(v).toFixed(2)}x`, 'ROAS']}/>
        <Line type="monotone" dataKey="roas" name="ROAS" stroke="#a78bfa" strokeWidth={2} dot={false}/>
      </LineChart>
    </ResponsiveContainer>
  )
}

export function PlatformBarChart({ data }: { data: PlatformRow[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false}/>
        <XAxis type="number" tickFormatter={fmt} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false}/>
        <YAxis type="category" dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} width={90}/>
        <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => [fmt(v)]}/>
        <Bar dataKey="spend" name="Spend" fill="#3b82f6" radius={[0, 4, 4, 0]}/>
        <Bar dataKey="revenue" name="Revenue" fill="#34d399" radius={[0, 4, 4, 0]}/>
      </BarChart>
    </ResponsiveContainer>
  )
}
