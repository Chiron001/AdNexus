import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NoAccounts } from '@/components/shared/NoAccounts'
import { AlertsClient } from './AlertsClient'

export default async function AlertsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: accounts } = await supabase
    .from('ad_accounts')
    .select('id, platform, account_name')
    .eq('user_id', user.id)
    .eq('status', 'active')

  if (!accounts || accounts.length === 0) {
    return <NoAccounts section="Alerts" />
  }

  // Real fired alerts from diagnostic_issues
  const { data: issues } = await supabase
    .from('diagnostic_issues')
    .select('id, title, platform, severity, description, status, estimated_impact_inr, detected_at')
    .eq('user_id', user.id)
    .order('detected_at', { ascending: false })
    .limit(30)

  // Real AI-generated recommendations as actionable alerts
  const { data: recommendations } = await supabase
    .from('recommendations')
    .select('id, title, explanation, estimated_impact, status, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <AlertsClient
      issues={issues ?? []}
      recommendations={recommendations ?? []}
      accountCount={accounts.length}
    />
  )
}
