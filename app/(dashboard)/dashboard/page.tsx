import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardHome, dashboardDays, type DashboardData } from '@/components/dashboard/DashboardHome'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: adAccounts }] = await Promise.all([
    supabase.from('profiles').select('full_name, company_name, country').eq('id', user.id).single(),
    supabase.from('ad_accounts').select('*').eq('user_id', user.id).eq('status', 'active'),
  ])

  const accounts   = adAccounts ?? []
  const accountIds = accounts.map(a => a.id)
  const days       = dashboardDays()

  const empty = { data: [] }
  const [
    { data: openIssues },
    { data: recommendations },
    { data: syncs },
    { data: metricRows },
  ] = accountIds.length === 0 ? [empty, empty, empty, empty] : await Promise.all([
    supabase.from('diagnostic_issues').select('*').eq('user_id', user.id).eq('status', 'open')
      .order('estimated_impact_inr', { ascending: false }),
    supabase.from('recommendations').select(`*, diagnostic_issues(title, platform, severity)`)
      .eq('user_id', user.id).eq('status', 'pending').order('created_at', { ascending: false }).limit(4),
    supabase.from('sync_logs').select(`*, ad_accounts(platform, account_name)`)
      .in('ad_account_id', accountIds).order('started_at', { ascending: false }).limit(6),
    supabase.from('campaign_metrics').select('date, spend, revenue, conversions')
      .in('ad_account_id', accountIds).gte('date', days[0]).lte('date', days[27]),
  ])

  return (
    <DashboardHome
      profile={profile}
      email={user.email ?? ''}
      adAccounts={accounts}
      issues={openIssues ?? []}
      recommendations={(recommendations ?? []) as DashboardData['recommendations']}
      syncs={(syncs ?? []) as DashboardData['syncs']}
      metricRows={metricRows ?? []}
      days={days}
    />
  )
}
