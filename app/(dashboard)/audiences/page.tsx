import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NoAccounts } from '@/components/shared/NoAccounts'
import { SyncButton } from '@/components/shared/SyncButton'
import { AudienceCharts } from './AudienceCharts'
import { RefreshCw } from 'lucide-react'

export default async function AudiencesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: accounts } = await supabase
    .from('ad_accounts')
    .select('id, platform')
    .eq('user_id', user.id)
    .eq('status', 'active')

  if (!accounts || accounts.length === 0) {
    return <NoAccounts section="Audience Insights" />
  }

  const accountIds = accounts.map(a => a.id)
  const since = new Date()
  since.setFullYear(since.getFullYear() - 2)

  const { data: metrics } = await supabase
    .from('campaign_metrics')
    .select('platform, spend, revenue, clicks, impressions, conversions, meta_data, google_data, amazon_data')
    .in('ad_account_id', accountIds)
    .gte('date', since.toISOString().split('T')[0])

  const hasData = !!(metrics && metrics.length > 0)

  // Platform-level aggregates (demographic breakdown requires deeper API integration)
  const byPlatform = new Map<string, { spend: number; revenue: number; conversions: number; impressions: number; clicks: number }>()
  for (const m of (metrics ?? [])) {
    const prev = byPlatform.get(m.platform) ?? { spend: 0, revenue: 0, conversions: 0, impressions: 0, clicks: 0 }
    byPlatform.set(m.platform, {
      spend:       prev.spend + (m.spend ?? 0),
      revenue:     prev.revenue + (m.revenue ?? 0),
      conversions: prev.conversions + (m.conversions ?? 0),
      impressions: prev.impressions + (m.impressions ?? 0),
      clicks:      prev.clicks + (m.clicks ?? 0),
    })
  }

  const platformData = Array.from(byPlatform.entries()).map(([platform, v]) => ({
    name:    platform.charAt(0).toUpperCase() + platform.slice(1),
    platform,
    spend:   Math.round(v.spend),
    revenue: Math.round(v.revenue),
    roas:    v.spend > 0 ? Math.round((v.revenue / v.spend) * 100) / 100 : 0,
    cpa:     v.conversions > 0 ? Math.round(v.spend / v.conversions) : 0,
    ctr:     v.impressions > 0 ? Math.round((v.clicks / v.impressions) * 10000) / 100 : 0,
  }))

  const fmtINR = (v: number) => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${(v / 1000).toFixed(0)}k`

  const bestRoas  = platformData.length > 0 ? Math.max(...platformData.map(p => p.roas)) : 0
  const lowestCpa = platformData.filter(p => p.cpa > 0).length > 0
    ? Math.min(...platformData.filter(p => p.cpa > 0).map(p => p.cpa)) : 0
  const topCtr    = platformData.length > 0 ? Math.max(...platformData.map(p => p.ctr)) : 0

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Audience Insights</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Platform-level audience performance · Last 2 years</p>
        </div>
        <div className="flex gap-2">{accounts.map((a: {id: string; platform: string}) => <SyncButton key={a.id} accountId={a.id} platform={a.platform} />)}</div>
      </div>

      {!hasData && (
        <div className="flex items-start gap-3 bg-amber-500/[0.08] border border-amber-500/25 rounded-xl px-4 py-3.5">
          <RefreshCw className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-300">Sync your account to populate audience data.</p>
        </div>
      )}

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-3 text-xs text-blue-300">
        Demographic breakdowns (age, gender, city) require Meta Marketing API v18+ audience insights endpoint, which activates once your ad account is connected and synced.
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Platforms',  value: String(byPlatform.size) },
          { label: 'Best ROAS',  value: hasData ? `${bestRoas}x` : '—' },
          { label: 'Lowest CPA', value: hasData && lowestCpa > 0 ? `₹${lowestCpa}` : '—' },
          { label: 'Top CTR',    value: hasData ? `${topCtr}%` : '—' },
        ].map(k => (
          <div key={k.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500 mb-1">{k.label}</p>
            <p className="text-2xl font-bold text-white font-mono">{k.value}</p>
          </div>
        ))}
      </div>

      <AudienceCharts platformData={platformData} />

      {/* Platform Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <p className="text-sm font-semibold text-white mb-4">Platform Audience Performance</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
              <th className="text-left pb-3 font-medium">Platform</th>
              <th className="text-right pb-3 font-medium">Spend</th>
              <th className="text-right pb-3 font-medium">Revenue</th>
              <th className="text-right pb-3 font-medium">ROAS</th>
              <th className="text-right pb-3 font-medium">CPA</th>
              <th className="text-right pb-3 font-medium">CTR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {platformData.map(p => (
              <tr key={p.platform} className="hover:bg-zinc-800/40">
                <td className="py-3 text-white font-medium capitalize">{p.name}</td>
                <td className="py-3 text-right font-mono text-zinc-300">{fmtINR(p.spend)}</td>
                <td className="py-3 text-right font-mono text-zinc-300">{fmtINR(p.revenue)}</td>
                <td className={`py-3 text-right font-mono ${p.roas >= 4 ? 'text-emerald-400' : p.roas >= 2 ? 'text-yellow-400' : 'text-red-400'}`}>{p.roas}x</td>
                <td className="py-3 text-right font-mono text-zinc-300">{p.cpa > 0 ? `₹${p.cpa}` : '—'}</td>
                <td className="py-3 text-right font-mono text-zinc-300">{p.ctr}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
