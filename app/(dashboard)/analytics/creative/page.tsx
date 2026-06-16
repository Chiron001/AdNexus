import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NoAccounts } from '@/components/shared/NoAccounts'
import { UpgradeWall } from '@/components/shared/UpgradeWall'
import { SyncButton } from '@/components/shared/SyncButton'
import { DateRangePicker } from '@/components/shared/DateRangePicker'
import { CreativeCharts } from './CreativeCharts'
import { RefreshCw } from 'lucide-react'
import { buildDateParams } from '@/lib/utils/dateRange'
import { getPlanLimits } from '@/lib/config/plans'
import type { PlanTier } from '@/lib/config/plans'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function str(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v
}

export default async function CreativeAnalyticsPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
  const plan = (profile?.plan ?? 'free') as PlanTier
  const limits = getPlanLimits(plan)

  if (!limits.creative_analytics) {
    return (
      <UpgradeWall
        feature="Creative Analytics"
        requiredPlan="growth"
        currentPlan={plan}
        bullets={[
          'Campaign-level ROAS, CTR, and CPA breakdown',
          'Top and bottom performing creatives',
          'Creative fatigue scoring',
          'Platform comparison charts',
          'CSV export of creative data',
        ]}
      />
    )
  }

  const { data: accounts } = await supabase
    .from('ad_accounts')
    .select('id, platform, account_name')
    .eq('user_id', user.id)
    .eq('status', 'active')

  if (!accounts || accounts.length === 0) {
    return <NoAccounts section="Creative Analytics" />
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
    .select('campaign_id, campaign_name, platform, spend, revenue, impressions, clicks, conversions, ctr, roas, cpm')
    .in('ad_account_id', accountIds)
    .gte('date', current.from)
    .lte('date', current.to)

  const hasData = !!(metrics && metrics.length > 0)

  // Group by campaign (campaigns as proxy until creative-level API is integrated)
  const byCampaign = new Map<string, {
    name: string; platform: string; spend: number; revenue: number
    impressions: number; clicks: number; conversions: number
  }>()

  for (const m of (metrics ?? [])) {
    const key = m.campaign_id
    const prev = byCampaign.get(key) ?? { name: m.campaign_name ?? m.campaign_id, platform: m.platform, spend: 0, revenue: 0, impressions: 0, clicks: 0, conversions: 0 }
    byCampaign.set(key, {
      name:        prev.name,
      platform:    prev.platform,
      spend:       prev.spend + (m.spend ?? 0),
      revenue:     prev.revenue + (m.revenue ?? 0),
      impressions: prev.impressions + (m.impressions ?? 0),
      clicks:      prev.clicks + (m.clicks ?? 0),
      conversions: prev.conversions + (m.conversions ?? 0),
    })
  }

  const campaigns = Array.from(byCampaign.values())
    .map(c => ({
      name:        c.name,
      platform:    c.platform,
      spend:       Math.round(c.spend),
      roas:        c.spend > 0 ? Math.round((c.revenue / c.spend) * 100) / 100 : 0,
      ctr:         c.impressions > 0 ? Math.round((c.clicks / c.impressions) * 10000) / 100 : 0,
      cpa:         c.conversions > 0 ? Math.round(c.spend / c.conversions) : 0,
      conversions: c.conversions,
    }))
    .sort((a, b) => b.roas - a.roas)

  // Platform breakdown
  const byPlatform = new Map<string, { spend: number; revenue: number; clicks: number; impressions: number }>()
  for (const m of (metrics ?? [])) {
    const prev = byPlatform.get(m.platform) ?? { spend: 0, revenue: 0, clicks: 0, impressions: 0 }
    byPlatform.set(m.platform, {
      spend:       prev.spend + (m.spend ?? 0),
      revenue:     prev.revenue + (m.revenue ?? 0),
      clicks:      prev.clicks + (m.clicks ?? 0),
      impressions: prev.impressions + (m.impressions ?? 0),
    })
  }
  const formatData = Array.from(byPlatform.entries()).map(([platform, v]) => ({
    format:  platform.charAt(0).toUpperCase() + platform.slice(1),
    avgRoas: v.spend > 0 ? Math.round((v.revenue / v.spend) * 100) / 100 : 0,
    avgCtr:  v.impressions > 0 ? Math.round((v.clicks / v.impressions) * 10000) / 100 : 0,
    spend:   Math.round(v.spend),
  }))

  const topRoas = campaigns[0]?.roas ?? 0
  const topCtr  = Math.max(...campaigns.map(c => c.ctr), 0)
  const fatigue = campaigns.filter(c => c.ctr < 1 && c.spend > 5000).length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Creative Analytics</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Campaign-level performance</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <DateRangePicker />
          {accounts.map(a => <SyncButton key={a.id} accountId={a.id} platform={a.platform} />)}
        </div>
      </div>

      {!hasData && (
        <div className="flex items-start gap-3 bg-amber-500/[0.08] border border-amber-500/25 rounded-xl px-4 py-3.5">
          <RefreshCw className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-300">Sync your account to populate campaign creative data.</p>
        </div>
      )}

      {comparison && (
        <div className="text-xs text-blue-300 bg-blue-400/5 border border-blue-400/15 rounded-lg px-3 py-2">
          Comparing <span className="font-mono">{current.from} → {current.to}</span> vs <span className="font-mono">{comparison.from} → {comparison.to}</span>
        </div>
      )}

      {hasData && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 text-xs text-amber-300">
          Showing campaign-level data. Creative-level breakdown (individual ad images/videos) will be available once Meta Creative API is fully integrated.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Active Campaigns', value: String(campaigns.length) },
          { label: 'Top ROAS',         value: `${topRoas}x`            },
          { label: 'Top CTR',          value: `${topCtr}%`             },
          { label: 'Low Performers',   value: String(fatigue)          },
        ].map(k => (
          <div key={k.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500 mb-1">{k.label}</p>
            <p className="text-2xl font-bold text-white font-mono">{k.value}</p>
          </div>
        ))}
      </div>

      <CreativeCharts campaigns={campaigns} formatData={formatData} />

      {/* Campaign Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <p className="text-sm font-semibold text-white mb-4">All Campaigns</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="text-xs text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
                <th className="text-left pb-3 font-medium">Campaign</th>
                <th className="text-center pb-3 font-medium">Platform</th>
                <th className="text-right pb-3 font-medium">Spend</th>
                <th className="text-right pb-3 font-medium">ROAS</th>
                <th className="text-right pb-3 font-medium">CTR</th>
                <th className="text-right pb-3 font-medium">CPA</th>
                <th className="text-right pb-3 font-medium">Conv.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {campaigns.map((c, i) => (
                <tr key={i} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 text-white font-medium max-w-[200px] truncate">{c.name}</td>
                  <td className="py-3 text-center">
                    <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded capitalize">{c.platform}</span>
                  </td>
                  <td className="py-3 text-right font-mono text-zinc-300">
                    {c.spend >= 1000000 ? `$${(c.spend/1000000).toFixed(1)}M` : `$${(c.spend/1000).toFixed(1)}k`}
                  </td>
                  <td className={`py-3 text-right font-mono ${c.roas >= 4 ? 'text-emerald-400' : c.roas >= 2 ? 'text-yellow-400' : 'text-red-400'}`}>{c.roas}x</td>
                  <td className="py-3 text-right font-mono text-zinc-300">{c.ctr}%</td>
                  <td className="py-3 text-right font-mono text-zinc-300">{c.cpa > 0 ? `$${c.cpa}` : '—'}</td>
                  <td className="py-3 text-right font-mono text-zinc-300">{c.conversions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
