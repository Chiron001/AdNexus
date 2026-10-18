'use client'

import { useSyncExternalStore } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export type DayPoint = { date: string; spend: number; revenue: number }

/* Recharts measures the DOM, so render only after hydration */
const noop = () => () => {}
function useMounted() {
  return useSyncExternalStore(noop, () => true, () => false)
}

/* Short axis labels: ₹ uses K / L / Cr (Intl's en-IN compact writes thousands as "T") */
function compact(n: number, sym: string) {
  if (sym !== '₹') return sym + new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
  const short = (v: number) => String(Math.round(v * 10) / 10)
  if (n >= 1e7) return `₹${short(n / 1e7)}Cr`
  if (n >= 1e5) return `₹${short(n / 1e5)}L`
  if (n >= 1e3) return `₹${short(n / 1e3)}K`
  return `₹${Math.round(n)}`
}

/* Tiny trend line for KPI cards */
export function Sparkline({ data, color, id }: { data: number[]; color: string; id: string }) {
  const mounted = useMounted()
  if (!mounted || data.length < 2) return <div className="h-10" />
  const points = data.map((v, i) => ({ i, v }))
  return (
    <div className="h-10">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={color} stopOpacity={0.35} />
              <stop offset="1" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.75} fill={`url(#spark-${id})`} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

/* Spend vs revenue over time */
export function PerformanceChart({ data, sym }: { data: DayPoint[]; sym: string }) {
  const mounted = useMounted()
  if (!mounted) return <div className="h-[260px]" />
  return (
    <div className="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="perf-rev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8B7BFF" stopOpacity={0.4} />
              <stop offset="1" stopColor="#8B7BFF" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="perf-spend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3B5BFD" stopOpacity={0.3} />
              <stop offset="1" stopColor="#3B5BFD" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: 'rgba(255,255,255,.4)', fontSize: 11 }}
            tickFormatter={d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} minTickGap={24} />
          <YAxis tickLine={false} axisLine={false} width={56} tick={{ fill: 'rgba(255,255,255,.4)', fontSize: 11 }}
            tickFormatter={v => compact(v, sym)} />
          <Tooltip
            cursor={{ stroke: 'rgba(255,255,255,.2)' }}
            contentStyle={{ background: '#141127', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, fontSize: 12 }}
            labelStyle={{ color: 'rgba(255,255,255,.6)', marginBottom: 4 }}
            labelFormatter={d => new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
            formatter={(v, name) => [compact(Number(v), sym), name === 'revenue' ? 'Revenue' : 'Spend']}
          />
          <Area type="monotone" dataKey="revenue" stroke="#A99BFF" strokeWidth={2} fill="url(#perf-rev)" />
          <Area type="monotone" dataKey="spend" stroke="#3B5BFD" strokeWidth={2} fill="url(#perf-spend)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
