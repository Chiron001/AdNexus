import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchCampaignPerformance, fetchKeywordPerformance, fetchConversionActions, microsToCost } from '@/lib/google/api'
import { refreshAccessToken } from '@/lib/google/auth'
import { runGoogleDiagnostics } from '@/lib/google/diagnostics'
import { apiErrorResponse } from '@/lib/utils/errors'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { account_id } = body

    const { data: account } = await supabase
      .from('ad_accounts')
      .select('*')
      .eq('id', account_id)
      .eq('user_id', user.id)
      .eq('platform', 'google')
      .single()

    if (!account) return Response.json({ error: 'Account not found' }, { status: 404 })

    const { data: syncLog } = await supabase
      .from('sync_logs')
      .insert({
        ad_account_id: account.id,
        sync_type: 'manual',
        status: 'running',
      })
      .select()
      .single()

    try {
      // Refresh access token (Google tokens expire in 1 hour)
      let accessToken = account.access_token
      if (account.refresh_token) {
        const refreshed = await refreshAccessToken(account.refresh_token)
        accessToken = refreshed.access_token
        await supabase
          .from('ad_accounts')
          .update({
            access_token: refreshed.access_token,
            token_expires_at: new Date(
              Date.now() + refreshed.expires_in * 1000
            ).toISOString(),
          })
          .eq('id', account.id)
      }

      const developerToken = process.env.GOOGLE_DEVELOPER_TOKEN!

      const [campaigns, keywords, conversionActions] = await Promise.all([
        fetchCampaignPerformance(accessToken, account.account_id, developerToken),
        fetchKeywordPerformance(accessToken, account.account_id, developerToken),
        fetchConversionActions(accessToken, account.account_id, developerToken),
      ])

      // Upsert campaign metrics
      for (const row of campaigns) {
        const spend = microsToCost(row.metrics.cost_micros)
        const conversions = parseFloat(row.metrics.conversions || '0')
        const clicks = parseInt(row.metrics.clicks || '0')
        const impressions = parseInt(row.metrics.impressions || '0')
        const ctr = parseFloat(row.metrics.ctr || '0')
        const cpc = microsToCost(row.metrics.average_cpc)

        await supabase.from('campaign_metrics').upsert(
          {
            ad_account_id: account.id,
            platform: 'google',
            campaign_id: row.campaign.id,
            campaign_name: row.campaign.name,
            status: row.campaign.status,
            date: new Date().toISOString().split('T')[0],
            spend,
            revenue: 0,
            impressions,
            clicks,
            conversions,
            ctr,
            cpc,
            roas: 0,
            cpm: impressions > 0 ? (spend / impressions) * 1000 : 0,
            google_data: {
              search_impression_share: row.metrics.search_impression_share,
              search_budget_lost_impression_share: row.metrics.search_budget_lost_impression_share,
            },
          },
          { onConflict: 'ad_account_id,campaign_id,date' }
        )
      }

      const issues = runGoogleDiagnostics({
        campaigns,
        keywords,
        conversionActions,
        accountId: account.account_id,
      })

      await supabase
        .from('diagnostic_issues')
        .update({ status: 'fixed' })
        .eq('ad_account_id', account.id)
        .eq('status', 'open')
        .eq('platform', 'google')

      for (const issue of issues) {
        await supabase.from('diagnostic_issues').insert({
          ad_account_id: account.id,
          user_id: user.id,
          platform: issue.platform,
          issue_type: issue.issue_type,
          severity: issue.severity,
          title: issue.title,
          description: issue.description,
          affected_entity_type: issue.affected_entity_type,
          affected_entity_id: issue.affected_entity_id,
          affected_entity_name: issue.affected_entity_name,
          estimated_impact_inr: issue.estimated_impact_inr,
          raw_data: issue.raw_data,
        })
      }

      await supabase
        .from('ad_accounts')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', account.id)

      await supabase
        .from('sync_logs')
        .update({
          status: 'completed',
          campaigns_synced: campaigns.length,
          issues_found: issues.length,
          completed_at: new Date().toISOString(),
        })
        .eq('id', syncLog!.id)

      return Response.json({
        success: true,
        campaigns_synced: campaigns.length,
        issues_found: issues.length,
      })
    } catch (syncError) {
      await supabase
        .from('sync_logs')
        .update({
          status: 'failed',
          error_message: syncError instanceof Error ? syncError.message : 'Unknown error',
          completed_at: new Date().toISOString(),
        })
        .eq('id', syncLog!.id)
      throw syncError
    }
  } catch (error) {
    return apiErrorResponse(error, 'sync/google')
  }
}
