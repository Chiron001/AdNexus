'use client'

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'

const creatives = [
  { id: 1, name: 'Summer Sale — Reel 15s', format: 'Video', spend: 28000, roas: 5.2, ctr: 3.8, frequency: 2.1, score: 88, status: 'scale' },
  { id: 2, name: 'Product Grid — Carousel', format: 'Carousel', spend: 22000, roas: 4.6, ctr: 2.9, frequency: 3.4, score: 74, status: 'good' },
  { id: 3, name: 'Founder Story — Video 30s', format: 'Video', spend: 19000, roas: 4.1, ctr: 2.4, frequency: 4.8, score: 61, status: 'monitor' },
  { id: 4, name: 'Static Banner — Offer', format: 'Image', spend: 14000, roas: 3.8, ctr: 1.9, frequency: 6.2, score: 42, status: 'fatigue' },
  { id: 5, name: 'UGC Review — Reel', format: 'Video', spend: 31000, roas: 5.8, ctr: 4.2, frequency: 1.8, score: 94, status: 'scale' },
  { id: 6, name: 'Collection Drop — Image', format: 'Image', spend: 9000, roas: 2.9, ctr: 1.2, frequency: 8.1, score: 22, status: 'pause' },
  { id: 7, name: 'Flash Sale — Carousel', format: 'Carousel', spend: 18000, roas: 4.4, ctr: 3.1, frequency: 3.0, score: 72, status: 'good' },
  { id: 8, name: 'Testimonial — Static', format: 'Image', spend: 11000, roas: 3.5, ctr: 1.7, frequency: 5.5, score: 38, status: 'fatigue' },
]

const formatData = [
  { format: 'Video',    avgRoas: 5.0, avgCtr: 3.5, spend: 78000 },
  { format: 'Carousel', avgRoas: 4.5, avgCtr: 3.0, spend: 40000 },
  { format: 'Image',    avgRoas: 3.4, avgCtr: 1.6, spend: 34000 },
]

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  scale:   { label: 'Scale',   color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
  good:    { label: 'Good',    color: 'text-blue-400',    bg: 'bg-blue-400/10 border-blue-400/20'   },
  monitor: { label: 'Monitor', color: 'text-yellow-400',  bg: 'bg-yellow-400/10 border-yellow-400/20' },
  fatigue: { label: 'Fatigue', color: 'text-orange-400',  bg: 'bg-orange-400/10 border-orange-400/20' },
  pause:   { label: 'Pause',   color: 'text-red-400',     bg: 'bg-red-400/10 border-red-400/20'    },
}

const scatterData = creatives.map(c => ({ x: c.frequency, y: c.ctr, name: c.name, status: c.status }))

export default function CreativeAnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Creative Analytics</h1>
        <p className="text-zinc-400 text-sm mt-0.5">Performance breakdown by individual ad creative</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Active Creatives', value: '8' },
          { label: 'Avg ROAS',         value: '4.3x' },
          { label: 'Top CTR',          value: '4.2%' },
          { label: 'In Fatigue',       value: '3' },
        ].map(k => (
          <div key={k.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500 mb-1">{k.label}</p>
            <p className="text-2xl font-bold text-white font-mono">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Fatigue Scatter */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="mb-4">
          <p className="text-sm font-semibold text-white">Creative Fatigue Map</p>
          <p className="text-xs text-zinc-500 mt-0.5">Frequency vs CTR · High frequency + low CTR = fatigue zone</p>
        </div>
        {/* Fatigue zone indicator */}
        <div className="flex items-center gap-2 mb-3 text-xs text-orange-400">
          <span className="w-3 h-3 rounded bg-orange-400/10 border border-orange-400/30 inline-block"/>
          Fatigue zone (frequency &gt; 5.5)
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a"/>
            <XAxis dataKey="x" name="Frequency" type="number" domain={[0, 10]} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: 'Frequency →', position: 'insideBottom', offset: -2, fill: '#52525b', fontSize: 11 }}/>
            <YAxis dataKey="y" name="CTR" type="number" domain={[0, 5]} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: 'CTR %', angle: -90, position: 'insideLeft', fill: '#52525b', fontSize: 11 }}/>
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }}/>
            <Scatter data={scatterData} fill="#a78bfa" opacity={0.8}/>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Format Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-sm font-semibold text-white mb-1">Format Performance</p>
          <p className="text-xs text-zinc-500 mb-4">Average ROAS by creative format</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={formatData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false}/>
              <XAxis dataKey="format" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false}/>
              <YAxis domain={[0, 6]} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => [`${v}x`, 'Avg ROAS']}/>
              <Bar dataKey="avgRoas" name="Avg ROAS" fill="#a78bfa" radius={[4, 4, 0, 0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-sm font-semibold text-white mb-1">Format CTR</p>
          <p className="text-xs text-zinc-500 mb-4">Average CTR by creative format</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={formatData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false}/>
              <XAxis dataKey="format" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false}/>
              <YAxis domain={[0, 5]} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => [`${v}%`, 'Avg CTR']}/>
              <Bar dataKey="avgCtr" name="Avg CTR" fill="#34d399" radius={[4, 4, 0, 0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Creative Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <p className="text-sm font-semibold text-white mb-4">All Creatives</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="text-xs text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
                <th className="text-left pb-3 font-medium">Creative</th>
                <th className="text-center pb-3 font-medium">Format</th>
                <th className="text-right pb-3 font-medium">Spend</th>
                <th className="text-right pb-3 font-medium">ROAS</th>
                <th className="text-right pb-3 font-medium">CTR</th>
                <th className="text-right pb-3 font-medium">Frequency</th>
                <th className="text-center pb-3 font-medium">Score</th>
                <th className="text-center pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {creatives.map((c) => {
                const s = statusConfig[c.status]
                return (
                  <tr key={c.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 text-white font-medium">{c.name}</td>
                    <td className="py-3 text-center">
                      <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">{c.format}</span>
                    </td>
                    <td className="py-3 text-right font-mono text-zinc-300">₹{(c.spend/1000).toFixed(0)}k</td>
                    <td className="py-3 text-right font-mono text-emerald-400">{c.roas}x</td>
                    <td className="py-3 text-right font-mono text-zinc-300">{c.ctr}%</td>
                    <td className={`py-3 text-right font-mono ${c.frequency > 5 ? 'text-orange-400' : 'text-zinc-300'}`}>{c.frequency}</td>
                    <td className="py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-12 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-purple-500" style={{ width: `${c.score}%` }}/>
                        </div>
                        <span className="text-xs font-mono text-zinc-400">{c.score}</span>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${s.bg} ${s.color}`}>{s.label}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
