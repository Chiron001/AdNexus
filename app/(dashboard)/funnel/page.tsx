import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NoAccounts } from '@/components/shared/NoAccounts'
import { SyncButton } from '@/components/shared/SyncButton'
import { DateRangePicker } from '@/components/shared/DateRangePicker'
import { FunnelCharts } from './FunnelCharts'
import { RefreshCw } from 'lucide-react'
import { buildDateParams } from '@/lib/utils/dateRange'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function str(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v
}

function fmt(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000)    return `${(n / 1000).toFixed(0)}k`
  return n.toString()
}

export default async function FunnelPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: accounts } = await supabase
    .from('ad_accounts')
    .select('id, platform')
    .eq('user_id', user.id)
    .eq('status', 'active')

  if (!accounts || accounts.length === 0) {
    return <NoAccounts section="Funnel Analytics" />
  }

  const accountIds = accounts.map(a => a.id)

  const sp = await searchParams
  const { current, comparison } = buildDateParams({
    from:         str(sp.from),
    to:           str(sp.to),
    compare:      str(sp.compare),
    compare_from: str(sp.compare_from),
    compare_to:   str(sp.compare_to),
  })

  const { data: metrics } = await supabase
    .from('campaign_metrics')
    .select('date, platform, impressions, clicks, conversions, spend')
    .in('ad_account_id', accountIds)
    .gte('date', current.from)
    .lte('date', current.to)

  const hasData = !!(metrics && metrics.length > 0)
  const safeMetrics = metrics ?? []

  const totals = safeMetrics.reduce((acc, m) => ({
    impressions: acc.impressions + (m.impressions ?? 0),
    clicks:      acc.clicks + (m.clicks ?? 0),
    conversions: acc.conversions + (m.conversions ?? 0),
    spend:       acc.spend + (m.spend ?? 0),
  }), { impressions: 0, clicks: 0, conversions: 0, spend: 0 })

  // Estimate intermediate funnel stages from available data
  // clicks = landing page views proxy
  // conversions = purchases
  const atcEstimate  = Math.round(totals.clicks * 0.48)  // industry avg ~48% of clicks add to cart
  const coEstimate   = Math.round(atcEstimate * 0.38)    // ~38% checkout rate

  const funnelStages = [
    { stage: 'Impressions',       value: Math.round(totals.impressions), pct: 100,   color: '#3b82f6' },
    { stage: 'Clicks',            value: Math.round(totals.clicks),      pct: totals.impressions > 0 ? Math.round((totals.clicks / totals.impressions) * 1000) / 10 : 0, color: '#8b5cf6' },
    { stage: 'Est. Add to Cart',  value: atcEstimate,                    pct: totals.impressions > 0 ? Math.round((atcEstimate / totals.impressions) * 1000) / 10 : 0, color: '#c084fc' },
    { stage: 'Est. Checkout',     value: coEstimate,                     pct: totals.impressions > 0 ? Math.round((coEstimate / totals.impressions) * 1000) / 10 : 0, color: '#f0abfc' },
    { stage: 'Conversions',       value: Math.round(totals.conversions), pct: totals.impressions > 0 ? Math.round((totals.conversions / totals.impressions) * 1000) / 10 : 0, color: '#34d399' },
  ]

  // Weekly trend
  const byWeek = new Map<string, { impressions: number; clicks: number; conversions: number }>()
  for (const m of safeMetrics) {
    const date = new Date(m.date)
    const key = `W${Math.ceil(date.getDate() / 7)}`
    const prev = byWeek.get(key) ?? { impressions: 0, clicks: 0, conversions: 0 }
    byWeek.set(key, {
      impressions: prev.impressions + (m.impressions ?? 0),
      clicks:      prev.clicks + (m.clicks ?? 0),
      conversions: prev.conversions + (m.conversions ?? 0),
    })
  }
  const weeklyTrend = Array.from(byWeek.entries()).map(([week, v]) => ({
    week,
    ctr:       v.impressions > 0 ? Math.round((v.clicks / v.impressions) * 10000) / 100 : 0,
    purchRate: v.impressions > 0 ? Math.round((v.conversions / v.impressions) * 100000) / 1000 : 0,
  }))

  // By platform
  const byPlatform = new Map<string, { impressions: number; clicks: number; conversions: number }>()
  for (const m of safeMetrics) {
    const prev = byPlatform.get(m.platform) ?? { impressions: 0, clicks: 0, conversions: 0 }
    byPlatform.set(m.platform, {
      impressions: prev.impressions + (m.impressions ?? 0),
      clicks:      prev.clicks + (m.clicks ?? 0),
      conversions: prev.conversions + (m.conversions ?? 0),
    })
  }
  const platformFunnel = [
    {
      stage: 'CTR %',
      ...Object.fromEntries(Array.from(byPlatform.entries()).map(([p, v]) => [p, v.impressions > 0 ? Math.round((v.clicks / v.impressions) * 10000) / 100 : 0])),
    },
    {
      stage: 'Conv %',
      ...Object.fromEntries(Array.from(byPlatform.entries()).map(([p, v]) => [p, v.clicks > 0 ? Math.round((v.conversions / v.clicks) * 10000) / 100 : 0])),
    },
  ]

  const usedPlatforms = Array.from(byPlatform.keys())
  const overallCvr = totals.impressions > 0 ? `${(totals.conversions / totals.impressions * 100).toFixed(3)}%` : '—'

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Funnel Analytics</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Impression → Purchase</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <DateRangePicker />
          {accounts.map((a: {id: string; platform: string}) => <SyncButton key={a.id} accountId={a.id} platform={a.platform} />)}
        </div>
      </div>

      {!hasData && (
        <div className="flex items-start gap-3 bg-amber-500/[0.08] border border-amber-500/25 rounded-xl px-4 py-3.5">
          <RefreshCw className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-300">Sync your account to populate funnel data.</p>
        </div>
      )}

      {comparison && (
        <div className="text-xs text-blue-300 bg-blue-400/5 border border-blue-400/15 rounded-lg px-3 py-2">
          Comparing <span className="font-mono">{current.from} → {current.to}</span> vs <span className="font-mono">{comparison.from} → {comparison.to}</span>
        </div>
      )}

      {/* Visual Funnel */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-semibold text-white">Conversion Funnel</p>
          <span className="text-xs font-mono text-zinc-400">Overall CVR: {overallCvr}</span>
        </div>
        <div className="space-y-2">
          {funnelStages.map((stage, i) => {
            const widthPct = Math.max(18, (stage.value / (funnelStages[0].value || 1)) * 100)
            const dropOff  = i > 0 && funnelStages[i - 1].value > 0
              ? Math.round((1 - stage.value / funnelStages[i - 1].value) * 100) : null
            return (
              <div key={stage.stage}>
                {dropOff !== null && (
                  <div className="text-center text-xs font-mono text-zinc-600 py-0.5">
                    ↓ {dropOff}% drop-off
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <div className="w-36 text-xs text-zinc-400 text-right shrink-0">{stage.stage}</div>
                  <div className="flex-1 flex items-center gap-3">
                    <div className="h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold font-mono"
                      style={{ width: `${widthPct}%`, background: stage.color, opacity: 0.85 }}>
                      {fmt(stage.value)}
                    </div>
                  </div>
                  <div className="w-14 text-xs font-mono text-zinc-400 text-right shrink-0">{stage.pct}%</div>
                </div>
              </div>
            )
          })}
        </div>
        <p className="text-xs text-zinc-600 mt-4">* Add to Cart and Checkout are estimated from industry benchmarks. Connect Google Analytics for exact values.</p>
      </div>

      <FunnelCharts weeklyTrend={weeklyTrend} platformFunnel={platformFunnel} usedPlatforms={usedPlatforms} />
    </div>
  )
}
