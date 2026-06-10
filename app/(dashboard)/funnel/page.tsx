'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

const funnel = [
  { stage: 'Impressions',       value: 1240000, pct: 100,  color: '#3b82f6' },
  { stage: 'Clicks',            value: 27032,   pct: 2.18, color: '#8b5cf6' },
  { stage: 'Landing Page View', value: 19000,   pct: 1.53, color: '#a78bfa' },
  { stage: 'Add to Cart',       value: 12975,   pct: 1.05, color: '#c084fc' },
  { stage: 'Checkout Started',  value: 4930,    pct: 0.40, color: '#f0abfc' },
  { stage: 'Purchase',          value: 2841,    pct: 0.23, color: '#34d399' },
]

const platformFunnel = [
  { stage: 'CTR',    meta: 2.8, google: 4.2, amazon: 1.4 },
  { stage: 'LP CVR', meta: 48,  google: 62,  amazon: 35  },
  { stage: 'ATC',    meta: 38,  google: 44,  amazon: 28  },
  { stage: 'Purch',  meta: 58,  google: 71,  amazon: 52  },
]

const weeklyFunnel = [
  { week: 'W1', ctr: 1.9, atcRate: 0.9, purchRate: 0.19 },
  { week: 'W2', ctr: 2.0, atcRate: 1.0, purchRate: 0.20 },
  { week: 'W3', ctr: 2.2, atcRate: 1.1, purchRate: 0.22 },
  { week: 'W4', ctr: 2.4, atcRate: 1.1, purchRate: 0.25 },
]

function fmt(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`
  return n.toString()
}

export default function FunnelPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Funnel Analytics</h1>
        <p className="text-zinc-400 text-sm mt-0.5">Conversion funnel from impression to purchase · All platforms</p>
      </div>

      {/* Visual Funnel */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-semibold text-white">Ad Conversion Funnel — Last 30 Days</p>
          <span className="text-xs font-mono text-zinc-400">Overall CVR: 0.23%</span>
        </div>
        <div className="space-y-2">
          {funnel.map((stage, i) => {
            const widthPct = Math.max(20, (stage.value / funnel[0].value) * 100)
            const dropOff = i > 0 ? Math.round((1 - stage.value / funnel[i - 1].value) * 100) : null
            return (
              <div key={stage.stage}>
                {dropOff !== null && (
                  <div className="text-center text-xs font-mono text-zinc-600 py-0.5">
                    ↓ {dropOff}% drop-off
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <div className="w-32 text-xs text-zinc-400 text-right shrink-0">{stage.stage}</div>
                  <div className="flex-1 flex items-center gap-3">
                    <div
                      className="h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold font-mono transition-all"
                      style={{ width: `${widthPct}%`, background: stage.color, opacity: 0.85 }}
                    >
                      {fmt(stage.value)}
                    </div>
                  </div>
                  <div className="w-16 text-xs font-mono text-zinc-400 text-right shrink-0">{stage.pct}%</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Platform Funnel Comparison */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <p className="text-sm font-semibold text-white mb-1">Funnel CVR by Platform</p>
        <p className="text-xs text-zinc-500 mb-4">Stage conversion rates (%) — Meta vs Google vs Amazon</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={platformFunnel}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false}/>
            <XAxis dataKey="stage" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }}/>
            <Bar dataKey="meta" name="Meta" fill="#3b82f6" radius={[3, 3, 0, 0]}/>
            <Bar dataKey="google" name="Google" fill="#ef4444" radius={[3, 3, 0, 0]}/>
            <Bar dataKey="amazon" name="Amazon" fill="#f97316" radius={[3, 3, 0, 0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Funnel Trend */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <p className="text-sm font-semibold text-white mb-1">Weekly Funnel Trend</p>
        <p className="text-xs text-zinc-500 mb-4">CTR, ATC rate, and Purchase rate over time (%)</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={weeklyFunnel}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a"/>
            <XAxis dataKey="week" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => [`${v}%`]}/>
            <Line type="monotone" dataKey="ctr" name="CTR %" stroke="#60a5fa" strokeWidth={2} dot={false}/>
            <Line type="monotone" dataKey="atcRate" name="ATC %" stroke="#a78bfa" strokeWidth={2} dot={false}/>
            <Line type="monotone" dataKey="purchRate" name="Purchase %" stroke="#34d399" strokeWidth={2} dot={false}/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Drop-off Insights */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <p className="text-sm font-semibold text-white mb-4">AI Drop-off Insights</p>
        <div className="space-y-3">
          {[
            { stage: 'Clicks → Landing Page', dropOff: '30%', issue: 'High bounce rate — landing page load time > 3s on mobile. Fix: compress images, use lazy loading.', severity: 'high' },
            { stage: 'Landing Page → Add to Cart', dropOff: '32%', issue: 'Price point friction. Users viewing but not adding — consider showing EMI options or free shipping threshold.', severity: 'medium' },
            { stage: 'Checkout Started → Purchase', dropOff: '42%', issue: 'Checkout abandonment spike on mobile. Likely payment friction — add UPI/Razorpay Pay Button.', severity: 'high' },
          ].map(ins => (
            <div key={ins.stage} className={`p-4 rounded-lg border ${ins.severity === 'high' ? 'bg-red-500/5 border-red-500/20' : 'bg-yellow-500/5 border-yellow-500/20'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold font-mono ${ins.severity === 'high' ? 'text-red-400' : 'text-yellow-400'}`}>
                  {ins.stage} — {ins.dropOff} drop
                </span>
              </div>
              <p className="text-xs text-zinc-400">{ins.issue}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
