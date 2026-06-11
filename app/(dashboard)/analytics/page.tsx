import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NoAccounts } from '@/components/shared/NoAccounts'
import { SyncButton } from '@/components/shared/SyncButton'
import { TrendChart, RoasTrendChart, PlatformBarChart } from './AnalyticsCharts'
import { RefreshCw } from 'lucide-react'

const PLATFORM_COLORS: Record<string, string> = { meta: '#3b82f6', google: '#22c55e', amazon: '#f97316' }
const PLATFORM_LABELS: Record<string, string> = { meta: 'Meta Ads', google: 'Google Ads', amazon: 'Amazon Ads' }

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: accounts } = await supabase
    .from('ad_accounts')
    .select('id, platform, account_name, last_synced_at')
    .eq('user_id', user.id)
    .eq('status', 'active')

  if (!accounts || accounts.length === 0) {
    return <NoAccounts section="Performance Analytics" />
  }

  const accountIds = accounts.map(a => a.id)
  const neverSynced = accounts.every(a => !a.last_synced_at)

  const since = new Date()
  since.setFullYear(since.getFullYear() - 2)

  const { data: rawMetrics } = await supabase
    .from('campaign_metrics')
    .select('date, platform, spend, revenue, impressions, clicks, conversions, roas, cpm')
    .in('ad_account_id', accountIds)
    .gte('date', since.toISOString().split('T')[0])
    .order('date')

  const metrics = rawMetrics ?? []
  const hasData = metrics.length > 0

  // Aggregate totals
  const totals = metrics.reduce((acc, m) => ({
    spend:       acc.spend + (m.spend ?? 0),
    revenue:     acc.revenue + (m.revenue ?? 0),
    impressions: acc.impressions + (m.impressions ?? 0),
    clicks:      acc.clicks + (m.clicks ?? 0),
    conversions: acc.conversions + (m.conversions ?? 0),
  }), { spend: 0, revenue: 0, impressions: 0, clicks: 0, conversions: 0 })

  const blendedRoas = totals.spend > 0 ? totals.revenue / totals.spend : 0
  const avgCpa      = totals.conversions > 0 ? totals.spend / totals.conversions : 0
  const avgCtr      = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0

  // Group by date for trend
  const byDate = new Map<string, { spend: number; revenue: number }>()
  for (const m of metrics) {
    const key = m.date.slice(0, 10)
    const prev = byDate.get(key) ?? { spend: 0, revenue: 0 }
    byDate.set(key, {
      spend:   prev.spend + (m.spend ?? 0),
      revenue: prev.revenue + (m.revenue ?? 0),
    })
  }
  const trend = Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({
      day:     date.slice(5),
      spend:   Math.round(v.spend),
      revenue: Math.round(v.revenue),
      roas:    v.spend > 0 ? Math.round((v.revenue / v.spend) * 100) / 100 : 0,
    }))

  // Group by platform
  const byPlatform = new Map<string, { spend: number; revenue: number; conversions: number }>()
  for (const m of metrics) {
    const prev = byPlatform.get(m.platform) ?? { spend: 0, revenue: 0, conversions: 0 }
    byPlatform.set(m.platform, {
      spend:       prev.spend + (m.spend ?? 0),
      revenue:     prev.revenue + (m.revenue ?? 0),
      conversions: prev.conversions + (m.conversions ?? 0),
    })
  }

  // If no data, create placeholder rows per connected platform
  const platformRows = hasData
    ? Array.from(byPlatform.entries())
    : accounts.map(a => [a.platform, { spend: 0, revenue: 0, conversions: 0 }] as [string, { spend: number; revenue: number; conversions: number }])

  const platforms = platformRows.map(([platform, v]) => ({
    name:    PLATFORM_LABELS[platform] ?? platform,
    spend:   Math.round(v.spend),
    revenue: Math.round(v.revenue),
    roas:    v.spend > 0 ? Math.round((v.revenue / v.spend) * 100) / 100 : 0,
    cpa:     v.conversions > 0 ? Math.round(v.spend / v.conversions) : 0,
    color:   PLATFORM_COLORS[platform] ?? '#6b7280',
    pct:     totals.spend > 0 ? Math.round((v.spend / totals.spend) * 100) : 0,
  }))

  const fmtINR = (v: number) => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : v > 0 ? `₹${(v / 1000).toFixed(0)}k` : '₹0'

  const kpis = [
    { label: 'Total Spend',   value: fmtINR(totals.spend) },
    { label: 'Total Revenue', value: fmtINR(totals.revenue) },
    { label: 'Blended ROAS',  value: `${blendedRoas.toFixed(2)}x` },
    { label: 'Conversions',   value: totals.conversions.toLocaleString('en-IN') },
    { label: 'Avg CPA',       value: totals.conversions > 0 ? `₹${Math.round(avgCpa).toLocaleString('en-IN')}` : '—' },
    { label: 'Blended CTR',   value: `${avgCtr.toFixed(2)}%` },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Performance Analytics</h1>
          <p className="text-zinc-400 text-sm mt-0.5">
            {accounts.map(a => a.account_name ?? a.platform).join(' · ')} · Last 2 years
          </p>
        </div>
        <div className="flex items-center gap-2">
          {accounts.map(a => (
            <SyncButton key={a.id} accountId={a.id} platform={a.platform} />
          ))}
        </div>
      </div>

      {/* Sync banner when no data */}
      {!hasData && (
        <div className="flex items-start gap-3 bg-amber-500/[0.08] border border-amber-500/25 rounded-xl px-4 py-3.5">
          <RefreshCw className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-300">
              {neverSynced ? 'Sync your account to populate this dashboard' : 'No campaign activity found in the last 2 years'}
            </p>
            <p className="text-xs text-amber-400/70 mt-0.5">
              {neverSynced
                ? 'Click "Sync" above to pull your campaign data from Meta, Google, or Amazon.'
                : 'Your account was synced but no campaign data was returned. Confirm your campaigns are active in Ads Manager.'}
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500 mb-1">{k.label}</p>
            <p className={`text-2xl font-bold font-mono ${hasData ? 'text-white' : 'text-zinc-600'}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue vs Spend Chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-white">Revenue vs Spend</p>
            <p className="text-xs text-zinc-500 mt-0.5">Daily · All platforms</p>
          </div>
          <div className="flex gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />Revenue</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />Spend</span>
          </div>
        </div>
        {hasData ? <TrendChart data={trend} /> : (
          <div className="h-48 flex items-center justify-center border border-dashed border-zinc-800 rounded-lg">
            <p className="text-sm text-zinc-600">Sync your account to see the trend chart</p>
          </div>
        )}
      </div>

      {/* ROAS + Platform Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-sm font-semibold text-white mb-1">ROAS Trend</p>
          <p className="text-xs text-zinc-500 mb-4">Daily blended ROAS</p>
          {hasData ? <RoasTrendChart data={trend} /> : (
            <div className="h-48 flex items-center justify-center border border-dashed border-zinc-800 rounded-lg">
              <p className="text-sm text-zinc-600">No data yet</p>
            </div>
          )}
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-sm font-semibold text-white mb-1">Platform Contribution</p>
          <p className="text-xs text-zinc-500 mb-4">Spend & Revenue by platform</p>
          {hasData ? <PlatformBarChart data={platforms} /> : (
            <div className="h-48 flex items-center justify-center border border-dashed border-zinc-800 rounded-lg">
              <p className="text-sm text-zinc-600">No data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Platform Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <p className="text-sm font-semibold text-white mb-4">Platform Breakdown</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
              <th className="text-left pb-3 font-medium">Platform</th>
              <th className="text-right pb-3 font-medium">Spend</th>
              <th className="text-right pb-3 font-medium">Revenue</th>
              <th className="text-right pb-3 font-medium">ROAS</th>
              <th className="text-right pb-3 font-medium">CPA</th>
              <th className="text-right pb-3 font-medium">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {platforms.map(p => (
              <tr key={p.name} className="hover:bg-zinc-800/40 transition-colors">
                <td className="py-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
                  <span className={`font-medium ${hasData ? 'text-white' : 'text-zinc-500'}`}>{p.name}</span>
                </td>
                <td className={`py-3 text-right font-mono ${hasData ? 'text-zinc-300' : 'text-zinc-600'}`}>{fmtINR(p.spend)}</td>
                <td className={`py-3 text-right font-mono ${hasData ? 'text-zinc-300' : 'text-zinc-600'}`}>{fmtINR(p.revenue)}</td>
                <td className={`py-3 text-right font-mono ${hasData ? 'text-emerald-400' : 'text-zinc-600'}`}>{p.roas}x</td>
                <td className={`py-3 text-right font-mono ${hasData ? 'text-zinc-300' : 'text-zinc-600'}`}>
                  {p.cpa > 0 ? `₹${p.cpa.toLocaleString('en-IN')}` : '—'}
                </td>
                <td className="py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${p.pct}%`, background: p.color }} />
                    </div>
                    <span className="text-zinc-400 text-xs font-mono">{p.pct}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
