import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NoAccounts } from '@/components/shared/NoAccounts'
import { SyncButton } from '@/components/shared/SyncButton'
import { DateRangePicker } from '@/components/shared/DateRangePicker'
import { TrendChart, RoasTrendChart, PlatformBarChart } from './AnalyticsCharts'
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react'
import { buildDateParams, deltaPercent } from '@/lib/utils/dateRange'
import { currencySymbol, fmtMoney } from '@/lib/utils/currency'

const PLATFORM_COLORS: Record<string, string> = { meta: '#3b82f6', google: '#22c55e', amazon: '#f97316' }
const PLATFORM_LABELS: Record<string, string>  = { meta: 'Meta Ads', google: 'Google Ads', amazon: 'Amazon Ads' }

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function str(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v
}

function Delta({ pct }: { pct: number | null }) {
  if (pct === null) return null
  const pos = pct >= 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-mono px-1.5 py-0.5 rounded ${pos ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'}`}>
      {pos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {Math.abs(pct)}%
    </span>
  )
}

async function fetchTotals(supabase: any, accountIds: string[], from: string, to: string) {
  const { data } = await supabase
    .from('campaign_metrics')
    .select('date, platform, spend, revenue, impressions, clicks, conversions, roas, cpm')
    .in('ad_account_id', accountIds)
    .gte('date', from).lte('date', to)
    .order('date')
  return data ?? []
}

export default async function AnalyticsPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: accounts } = await supabase
    .from('ad_accounts')
    .select('id, platform, account_name, last_synced_at')
    .eq('user_id', user.id).eq('status', 'active')

  if (!accounts || accounts.length === 0) return <NoAccounts section="Performance Analytics" />

  const { data: profileRow } = await supabase.from('profiles').select('country').eq('id', user.id).single()
  const sym = currencySymbol(profileRow?.country)

  const sp = await searchParams
  const { current, comparison } = buildDateParams({
    from:         str(sp.from),
    to:           str(sp.to),
    compare:      str(sp.compare),
    compare_from: str(sp.compare_from),
    compare_to:   str(sp.compare_to),
  })

  const accountIds  = accounts.map(a => a.id)
  const neverSynced = accounts.every(a => !a.last_synced_at)

  const [metrics, cmpMetrics] = await Promise.all([
    fetchTotals(supabase, accountIds, current.from, current.to),
    comparison ? fetchTotals(supabase, accountIds, comparison.from, comparison.to) : Promise.resolve([]),
  ])

  const hasData = metrics.length > 0

  function agg(rows: typeof metrics) {
    return rows.reduce(
      (acc: { spend: number; revenue: number; impressions: number; clicks: number; conversions: number }, m: any) => ({
        spend:       acc.spend + (m.spend ?? 0),
        revenue:     acc.revenue + (m.revenue ?? 0),
        impressions: acc.impressions + (m.impressions ?? 0),
        clicks:      acc.clicks + (m.clicks ?? 0),
        conversions: acc.conversions + (m.conversions ?? 0),
      }),
      { spend: 0, revenue: 0, impressions: 0, clicks: 0, conversions: 0 }
    )
  }

  const totals    = agg(metrics)
  const cmpTotals = comparison ? agg(cmpMetrics) : null

  const blendedRoas = totals.spend > 0 ? totals.revenue / totals.spend : 0
  const avgCpa      = totals.conversions > 0 ? totals.spend / totals.conversions : 0
  const avgCtr      = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0

  const cmpRoas = cmpTotals && cmpTotals.spend > 0 ? cmpTotals.revenue / cmpTotals.spend : 0
  const cmpCpa  = cmpTotals && cmpTotals.conversions > 0 ? cmpTotals.spend / cmpTotals.conversions : 0
  const cmpCtr  = cmpTotals && cmpTotals.impressions > 0 ? (cmpTotals.clicks / cmpTotals.impressions) * 100 : 0

  // ── Blended daily trend ───────────────────────────────────────────────
  const byDate = new Map<string, { spend: number; revenue: number }>()
  for (const m of metrics) {
    const key = m.date.slice(0, 10)
    const prev = byDate.get(key) ?? { spend: 0, revenue: 0 }
    byDate.set(key, { spend: prev.spend + (m.spend ?? 0), revenue: prev.revenue + (m.revenue ?? 0) })
  }
  const trend = Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({
      day:     date.slice(5),
      spend:   Math.round(v.spend),
      revenue: Math.round(v.revenue),
      roas:    v.spend > 0 ? Math.round((v.revenue / v.spend) * 100) / 100 : 0,
    }))

  // ── Per-platform aggregates (extended: impressions + clicks) ──────────
  const byPlatform = new Map<string, { spend: number; revenue: number; conversions: number; impressions: number; clicks: number }>()
  for (const m of metrics) {
    const prev = byPlatform.get(m.platform) ?? { spend: 0, revenue: 0, conversions: 0, impressions: 0, clicks: 0 }
    byPlatform.set(m.platform, {
      spend:       prev.spend + (m.spend ?? 0),
      revenue:     prev.revenue + (m.revenue ?? 0),
      conversions: prev.conversions + (m.conversions ?? 0),
      impressions: prev.impressions + (m.impressions ?? 0),
      clicks:      prev.clicks + (m.clicks ?? 0),
    })
  }

  // ── Per-platform daily trends (for per-platform charts) ───────────────
  const byPlatformDate = new Map<string, Map<string, { spend: number; revenue: number }>>()
  for (const m of metrics) {
    if (!byPlatformDate.has(m.platform)) byPlatformDate.set(m.platform, new Map())
    const platMap = byPlatformDate.get(m.platform)!
    const key  = m.date.slice(0, 10)
    const prev = platMap.get(key) ?? { spend: 0, revenue: 0 }
    platMap.set(key, { spend: prev.spend + (m.spend ?? 0), revenue: prev.revenue + (m.revenue ?? 0) })
  }

  // ── Platform contribution chart data ──────────────────────────────────
  const uniquePlatforms = [...new Set(accounts.map(a => a.platform))]

  const platformChartRows = hasData
    ? Array.from(byPlatform.entries())
    : uniquePlatforms.map(p => [p, { spend: 0, revenue: 0, conversions: 0, impressions: 0, clicks: 0 }] as [string, { spend: number; revenue: number; conversions: number; impressions: number; clicks: number }])

  const platformChartData = platformChartRows.map(([platform, v]) => ({
    name:    PLATFORM_LABELS[platform] ?? platform,
    spend:   Math.round(v.spend),
    revenue: Math.round(v.revenue),
    roas:    v.spend > 0 ? Math.round((v.revenue / v.spend) * 100) / 100 : 0,
    cpa:     v.conversions > 0 ? Math.round(v.spend / v.conversions) : 0,
    color:   PLATFORM_COLORS[platform] ?? '#6b7280',
    pct:     totals.spend > 0 ? Math.round((v.spend / totals.spend) * 100) : 0,
  }))

  // ── Per-platform section data ─────────────────────────────────────────
  const platformSections = uniquePlatforms.map(platform => {
    const v   = byPlatform.get(platform) ?? { spend: 0, revenue: 0, conversions: 0, impressions: 0, clicks: 0 }
    const acc = accounts.find(a => a.platform === platform)
    const ctr = v.impressions > 0 ? (v.clicks / v.impressions) * 100 : 0
    const dateMap  = byPlatformDate.get(platform)
    const platTrend = dateMap
      ? Array.from(dateMap.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, d]) => ({
            day:     date.slice(5),
            spend:   Math.round(d.spend),
            revenue: Math.round(d.revenue),
            roas:    d.spend > 0 ? Math.round((d.revenue / d.spend) * 100) / 100 : 0,
          }))
      : []
    return {
      platform,
      label:        PLATFORM_LABELS[platform] ?? platform,
      color:        PLATFORM_COLORS[platform] ?? '#6b7280',
      accountName:  acc?.account_name ?? PLATFORM_LABELS[platform] ?? platform,
      lastSyncedAt: acc?.last_synced_at as string | null,
      spend:        Math.round(v.spend),
      revenue:      Math.round(v.revenue),
      conversions:  v.conversions,
      roas:         v.spend > 0 ? Math.round((v.revenue / v.spend) * 100) / 100 : 0,
      cpa:          v.conversions > 0 ? Math.round(v.spend / v.conversions) : 0,
      ctr:          parseFloat(ctr.toFixed(2)),
      trend:        platTrend,
      hasData:      platTrend.length > 0,
    }
  })

  const fmt = (v: number) => fmtMoney(v, sym)

  const blendedKpis = [
    { label: 'Total Spend',   value: fmt(totals.spend),      cmp: cmpTotals ? deltaPercent(totals.spend, cmpTotals.spend) : null, invert: true },
    { label: 'Total Revenue', value: fmt(totals.revenue),    cmp: cmpTotals ? deltaPercent(totals.revenue, cmpTotals.revenue) : null },
    { label: 'Blended ROAS',  value: `${blendedRoas.toFixed(2)}x`, cmp: cmpTotals ? deltaPercent(blendedRoas, cmpRoas) : null },
    { label: 'Conversions',   value: totals.conversions.toLocaleString('en-US'), cmp: cmpTotals ? deltaPercent(totals.conversions, cmpTotals.conversions) : null },
    { label: 'Avg CPA',       value: totals.conversions > 0 ? `$${Math.round(avgCpa).toLocaleString('en-US')}` : '—', cmp: cmpTotals ? deltaPercent(avgCpa, cmpCpa) : null, invert: true },
    { label: 'Blended CTR',   value: `${avgCtr.toFixed(2)}%`, cmp: cmpTotals ? deltaPercent(avgCtr, cmpCtr) : null },
  ]

  return (
    <div className="p-6 space-y-6">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Performance Analytics</h1>
          <p className="text-zinc-400 text-sm mt-0.5">
            {accounts.map(a => a.account_name ?? a.platform).join(' · ')}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <DateRangePicker />
          {accounts.map(a => <SyncButton key={a.id} accountId={a.id} platform={a.platform} />)}
        </div>
      </div>

      {/* ── No-data banner ──────────────────────────────────────────── */}
      {!hasData && (
        <div className="flex items-start gap-3 bg-amber-500/[0.08] border border-amber-500/25 rounded-xl px-4 py-3.5">
          <RefreshCw className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-300">
              {neverSynced ? 'Sync your accounts to populate this dashboard' : 'No campaign activity in selected date range'}
            </p>
            <p className="text-xs text-amber-400/70 mt-0.5">
              {neverSynced
                ? 'Click "Sync Meta" / "Sync Google" above to pull your campaign data.'
                : 'Try a wider date range or click Sync to pull more historical data.'}
            </p>
          </div>
        </div>
      )}

      {/* ── Comparison banner ───────────────────────────────────────── */}
      {comparison && (
        <div className="text-xs text-blue-300 bg-blue-400/5 border border-blue-400/15 rounded-lg px-3 py-2">
          Comparing <span className="font-mono">{current.from} → {current.to}</span> vs <span className="font-mono">{comparison.from} → {comparison.to}</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          BLENDED OVERVIEW — all accounts combined
      ══════════════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-blue-500 shrink-0" />
          <p className="text-sm font-bold text-white">Blended Overview</p>
          <p className="text-xs text-zinc-500">All connected accounts · {current.from} to {current.to}</p>
        </div>

        {/* 6 Blended KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {blendedKpis.map(k => (
            <div key={k.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-xs text-zinc-500 mb-1">{k.label}</p>
              <p className={`text-2xl font-bold font-mono ${hasData ? 'text-white' : 'text-zinc-600'}`}>{k.value}</p>
              {k.cmp !== null && k.cmp !== undefined && (
                <div className="mt-1.5">
                  <Delta pct={k.invert ? (k.cmp !== null ? -k.cmp : null) : k.cmp} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Revenue vs Spend — blended */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-white">Revenue vs Spend</p>
              <p className="text-xs text-zinc-500 mt-0.5">Daily · All platforms blended</p>
            </div>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />Revenue</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />Spend</span>
            </div>
          </div>
          {hasData ? <TrendChart data={trend} prefix="blend" /> : (
            <div className="h-48 flex items-center justify-center border border-dashed border-zinc-800 rounded-lg">
              <p className="text-sm text-zinc-600">Sync your accounts to see the trend chart</p>
            </div>
          )}
        </div>

        {/* ROAS trend + Platform contribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-sm font-semibold text-white mb-1">ROAS Trend</p>
            <p className="text-xs text-zinc-500 mb-4">Daily blended ROAS · All platforms</p>
            {hasData ? <RoasTrendChart data={trend} /> : (
              <div className="h-[180px] flex items-center justify-center border border-dashed border-zinc-800 rounded-lg">
                <p className="text-sm text-zinc-600">No data yet</p>
              </div>
            )}
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-sm font-semibold text-white mb-1">Platform Contribution</p>
            <p className="text-xs text-zinc-500 mb-4">Spend & Revenue split by platform</p>
            {hasData ? <PlatformBarChart data={platformChartData} /> : (
              <div className="h-[180px] flex items-center justify-center border border-dashed border-zinc-800 rounded-lg">
                <p className="text-sm text-zinc-600">No data yet</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          PER-PLATFORM ANALYSIS — one section per connected account
      ══════════════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-purple-500 shrink-0" />
          <p className="text-sm font-bold text-white">Platform Analysis</p>
          <p className="text-xs text-zinc-500">Drill into each connected account separately</p>
        </div>

        {platformSections.map(p => (
          <div key={p.platform} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">

            {/* Platform card header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/80">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: p.color }} />
                <div>
                  <p className="text-sm font-semibold text-white">{p.label}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{p.accountName}</p>
                </div>
              </div>
              {p.lastSyncedAt && (
                <p className="text-xs text-zinc-600">
                  Last synced&nbsp;
                  {new Date(p.lastSyncedAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              )}
            </div>

            {/* Per-platform KPI row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-zinc-800/50">
              {[
                { label: 'Spend',       value: fmt(p.spend) },
                { label: 'Revenue',     value: fmt(p.revenue) },
                { label: 'ROAS',        value: `${p.roas.toFixed(2)}x` },
                { label: 'Conversions', value: p.conversions.toLocaleString('en-US') },
                { label: 'Avg CPA',     value: p.cpa > 0 ? `$${p.cpa.toLocaleString('en-US')}` : '—' },
              ].map(kpi => (
                <div key={kpi.label} className="bg-zinc-900 px-4 py-3.5">
                  <p className="text-xs text-zinc-500 mb-1">{kpi.label}</p>
                  <p className={`text-xl font-bold font-mono ${p.hasData ? 'text-white' : 'text-zinc-600'}`}>{kpi.value}</p>
                </div>
              ))}
            </div>

            {/* Per-platform Revenue vs Spend chart */}
            <div className="px-5 pt-4 pb-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-zinc-500">Revenue vs Spend — daily</p>
                <div className="flex gap-3 text-xs">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />Revenue</span>
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />Spend</span>
                </div>
              </div>
              {p.hasData ? (
                <TrendChart data={p.trend} prefix={p.platform} height={160} />
              ) : (
                <div className="h-28 flex items-center justify-center border border-dashed border-zinc-800 rounded-lg">
                  <p className="text-sm text-zinc-600">
                    {p.lastSyncedAt ? 'No data for this period — try widening the date range' : 'Click Sync to pull data'}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </section>

    </div>
  )
}
