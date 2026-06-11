import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NoAccounts } from '@/components/shared/NoAccounts'
import { SyncButton } from '@/components/shared/SyncButton'
import { BudgetCharts } from './BudgetCharts'
import { RefreshCw } from 'lucide-react'

export default async function BudgetPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: accounts } = await supabase
    .from('ad_accounts')
    .select('id, platform, account_name')
    .eq('user_id', user.id)
    .eq('status', 'active')

  if (!accounts || accounts.length === 0) {
    return <NoAccounts section="Budget & Spend Analytics" />
  }

  const accountIds = accounts.map(a => a.id)
  const since = new Date()
  since.setFullYear(since.getFullYear() - 2)

  const { data: metrics } = await supabase
    .from('campaign_metrics')
    .select('date, platform, spend, revenue, cpm, campaign_name, campaign_id, conversions')
    .in('ad_account_id', accountIds)
    .gte('date', since.toISOString().split('T')[0])
    .order('date')

  const hasData = !!(metrics && metrics.length > 0)
  const safeMetrics = metrics ?? []

  // Daily spend grouped by date
  const byDate = new Map<string, number>()
  for (const m of safeMetrics) {
    const key = m.date.slice(0, 10)
    byDate.set(key, (byDate.get(key) ?? 0) + (m.spend ?? 0))
  }
  const dailySpend = Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, spend]) => ({ day: day.slice(5), spend: Math.round(spend) }))

  // CPM trend by platform
  const cpmByDate = new Map<string, Record<string, { totalCpm: number; count: number }>>()
  for (const m of safeMetrics) {
    const day = m.date.slice(5)
    if (!cpmByDate.has(day)) cpmByDate.set(day, {})
    const dayData = cpmByDate.get(day)!
    if (!dayData[m.platform]) dayData[m.platform] = { totalCpm: 0, count: 0 }
    dayData[m.platform].totalCpm += (m.cpm ?? 0)
    dayData[m.platform].count++
  }
  const cpmTrend = Array.from(cpmByDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, platforms]) => {
      const row: Record<string, any> = { day }
      for (const [p, v] of Object.entries(platforms)) {
        row[p] = v.count > 0 ? Math.round(v.totalCpm / v.count) : 0
      }
      return row
    })

  // Platform spend allocation
  const byPlatform = new Map<string, { spend: number; revenue: number; conversions: number }>()
  for (const m of safeMetrics) {
    const prev = byPlatform.get(m.platform) ?? { spend: 0, revenue: 0, conversions: 0 }
    byPlatform.set(m.platform, {
      spend:       prev.spend + (m.spend ?? 0),
      revenue:     prev.revenue + (m.revenue ?? 0),
      conversions: prev.conversions + (m.conversions ?? 0),
    })
  }
  const totalSpend = Array.from(byPlatform.values()).reduce((s, v) => s + v.spend, 0)
  const allocation = Array.from(byPlatform.entries()).map(([platform, v]) => ({
    name: platform.charAt(0).toUpperCase() + platform.slice(1),
    value: Math.round(v.spend),
    pct:  Math.round((v.spend / totalSpend) * 100),
  }))

  // Zero-conversion campaigns (potential wasted spend)
  const byCampaign = new Map<string, { name: string; platform: string; spend: number; conversions: number }>()
  for (const m of safeMetrics) {
    const key = m.campaign_id
    const prev = byCampaign.get(key) ?? { name: m.campaign_name ?? key, platform: m.platform, spend: 0, conversions: 0 }
    byCampaign.set(key, { ...prev, spend: prev.spend + (m.spend ?? 0), conversions: prev.conversions + (m.conversions ?? 0) })
  }
  const wastedSpend = Array.from(byCampaign.values())
    .filter(c => c.conversions === 0 && c.spend > 1000)
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 5)

  const totalWaste = wastedSpend.reduce((s, c) => s + c.spend, 0)
  const fmtINR = (v: number) => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${(v / 1000).toFixed(1)}k`

  const usedPlatforms = Array.from(byPlatform.keys())

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Budget & Spend Analytics</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Last 2 years · All connected accounts</p>
        </div>
        <div className="flex gap-2">{accounts.map(a => <SyncButton key={a.id} accountId={a.id} platform={a.platform} />)}</div>
      </div>
      {!hasData && (
        <div className="flex items-start gap-3 bg-amber-500/[0.08] border border-amber-500/25 rounded-xl px-4 py-3.5">
          <RefreshCw className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-300">Sync your account to populate budget and spend data.</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Spend',    value: fmtINR(totalSpend) },
          { label: 'Platforms',      value: String(byPlatform.size) },
          { label: 'Wasted Spend',   value: fmtINR(totalWaste) },
          { label: 'Zero-Conv Campaigns', value: String(wastedSpend.length) },
        ].map(k => (
          <div key={k.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500 mb-1">{k.label}</p>
            <p className="text-2xl font-bold text-white font-mono">{k.value}</p>
          </div>
        ))}
      </div>

      <BudgetCharts dailySpend={dailySpend} cpmTrend={cpmTrend} usedPlatforms={usedPlatforms} />

      {/* Allocation */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <p className="text-sm font-semibold text-white mb-4">Spend Allocation by Platform</p>
        <div className="space-y-3">
          {allocation.map(a => (
            <div key={a.name}>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-zinc-300">{a.name}</span>
                <span className="text-zinc-400">{fmtINR(a.value)} · {a.pct}%</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div className="h-2 rounded-full bg-purple-500/70" style={{ width: `${a.pct}%` }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wasted Spend */}
      {wastedSpend.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-white">Zero-Conversion Campaigns</p>
              <p className="text-xs text-zinc-500 mt-0.5">Campaigns with spend but no conversions in last 30 days</p>
            </div>
            <span className="text-xs font-mono text-red-400 bg-red-400/10 border border-red-400/20 px-3 py-1 rounded-full">
              {fmtINR(totalWaste)} at risk
            </span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
                <th className="text-left pb-3 font-medium">Campaign</th>
                <th className="text-center pb-3 font-medium">Platform</th>
                <th className="text-right pb-3 font-medium">Spend</th>
                <th className="text-right pb-3 font-medium">Conversions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {wastedSpend.map((w, i) => (
                <tr key={i} className="hover:bg-zinc-800/40">
                  <td className="py-3 text-white font-medium max-w-[220px] truncate">{w.name}</td>
                  <td className="py-3 text-center">
                    <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded capitalize">{w.platform}</span>
                  </td>
                  <td className="py-3 text-right font-mono text-red-400">{fmtINR(w.spend)}</td>
                  <td className="py-3 text-right font-mono text-zinc-400">0</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
