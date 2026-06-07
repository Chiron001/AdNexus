export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { data: accounts } = await supabase
    .from('ad_accounts')
    .select('id, user_id, platform, account_name')
    .eq('status', 'active')

  if (!accounts) return Response.json({ anomalies: 0 })

  let anomaliesFound = 0

  for (const account of accounts) {
    // Check for expired tokens
    const { data: accountDetails } = await supabase
      .from('ad_accounts')
      .select('token_expires_at')
      .eq('id', account.id)
      .single()

    if (accountDetails?.token_expires_at) {
      const expiresAt = new Date(accountDetails.token_expires_at)
      const hoursUntilExpiry = (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60)

      if (hoursUntilExpiry < 24 && hoursUntilExpiry > 0) {
        // Token expiring soon — insert a diagnostic issue
        await supabase.from('diagnostic_issues').insert({
          ad_account_id: account.id,
          user_id: account.user_id,
          platform: account.platform,
          issue_type: 'token_expiring',
          severity: 'high',
          title: `${account.platform} Ads token expiring in ${Math.round(hoursUntilExpiry)} hours`,
          description: 'Your access token will expire soon. Reconnect your account to prevent sync failures.',
          affected_entity_type: 'account',
          affected_entity_id: account.id,
          affected_entity_name: account.account_name || account.id,
          estimated_impact_inr: 0,
          status: 'open',
        })
        anomaliesFound++
      }
    }
  }

  return Response.json({ anomalies: anomaliesFound })
}
