import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NoAccounts } from '@/components/shared/NoAccounts'
import { AIInsightsClient } from './AIInsightsClient'

export default async function AIPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: accounts } = await supabase
    .from('ad_accounts')
    .select('id, platform, account_name')
    .eq('user_id', user.id)
    .eq('status', 'active')

  if (!accounts || accounts.length === 0) {
    return <NoAccounts section="AI Insights" />
  }

  // Fetch AI insights from database
  const { data: aiInsights } = await supabase
    .from('ai_insights')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  // Fetch open recommendations as insights
  const { data: recommendations } = await supabase
    .from('recommendations')
    .select('*, diagnostic_issues(title, platform, severity)')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch open issues for context
  const { data: issues } = await supabase
    .from('diagnostic_issues')
    .select('id, title, platform, severity, estimated_impact_inr, description')
    .eq('user_id', user.id)
    .eq('status', 'open')
    .order('estimated_impact_inr', { ascending: false })
    .limit(5)

  return (
    <AIInsightsClient
      aiInsights={aiInsights ?? []}
      recommendations={recommendations ?? []}
      issues={issues ?? []}
      accountCount={accounts.length}
    />
  )
}
