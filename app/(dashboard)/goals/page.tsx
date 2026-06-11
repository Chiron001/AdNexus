import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NoAccounts } from '@/components/shared/NoAccounts'
import { GoalsClient } from './GoalsClient'

export default async function GoalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: accounts } = await supabase
    .from('ad_accounts')
    .select('id, platform, account_name')
    .eq('user_id', user.id)
    .eq('status', 'active')

  if (!accounts || accounts.length === 0) {
    return <NoAccounts section="Goals & KPIs" />
  }

  const accountIds = accounts.map(a => a.id)
  const now = new Date()

  // Current month metrics
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const { data: currentMetrics } = await supabase
    .from('campaign_metrics')
    .select('spend, revenue, conversions, impressions, clicks, date')
    .in('ad_account_id', accountIds)
    .gte('date', monthStart)

  // Previous month for trend
  const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]
  const prevEnd   = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]
  const { data: prevMetrics } = await supabase
    .from('campaign_metrics')
    .select('spend, revenue, conversions, impressions, clicks')
    .in('ad_account_id', accountIds)
    .gte('date', prevStart)
    .lte('date', prevEnd)

  function agg(rows: any[] | null) {
    return (rows ?? []).reduce((acc, m) => ({
      spend:       acc.spend + (m.spend ?? 0),
      revenue:     acc.revenue + (m.revenue ?? 0),
      conversions: acc.conversions + (m.conversions ?? 0),
      impressions: acc.impressions + (m.impressions ?? 0),
      clicks:      acc.clicks + (m.clicks ?? 0),
    }), { spend: 0, revenue: 0, conversions: 0, impressions: 0, clicks: 0 })
  }

  const curr = agg(currentMetrics)
  const prev = agg(prevMetrics)

  const current = {
    roas:    curr.spend > 0 ? Math.round((curr.revenue / curr.spend) * 100) / 100 : 0,
    revenue: Math.round(curr.revenue),
    cpa:     curr.conversions > 0 ? Math.round(curr.spend / curr.conversions) : 0,
    spend:   Math.round(curr.spend),
    ctr:     curr.impressions > 0 ? Math.round((curr.clicks / curr.impressions) * 10000) / 100 : 0,
    conversions: Math.round(curr.conversions),
  }

  // Build daily progression for the current month
  const byDay = new Map<string, { revenue: number; spend: number; conversions: number }>()
  for (const m of currentMetrics ?? []) {
    const day = m.date.slice(8, 10)
    const prev2 = byDay.get(day) ?? { revenue: 0, spend: 0, conversions: 0 }
    byDay.set(day, {
      revenue:     prev2.revenue + (m.revenue ?? 0),
      spend:       prev2.spend + (m.spend ?? 0),
      conversions: prev2.conversions + (m.conversions ?? 0),
    })
  }
  let cumRevenue = 0, cumSpend = 0
  const progression = Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, v]) => {
      cumRevenue += v.revenue
      cumSpend   += v.spend
      return { day: `D${day}`, revenue: Math.round(cumRevenue), roas: cumSpend > 0 ? Math.round((cumRevenue / cumSpend) * 100) / 100 : 0 }
    })

  const prevSummary = {
    roas:    prev.spend > 0 ? Math.round((prev.revenue / prev.spend) * 100) / 100 : 0,
    revenue: Math.round(prev.revenue),
    cpa:     prev.conversions > 0 ? Math.round(prev.spend / prev.conversions) : 0,
  }

  const monthLabel = now.toLocaleString('en-IN', { month: 'long', year: 'numeric' })

  return (
    <GoalsClient
      current={current}
      prevSummary={prevSummary}
      progression={progression}
      monthLabel={monthLabel}
    />
  )
}
