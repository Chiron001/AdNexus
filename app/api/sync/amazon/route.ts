export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchCampaignList, requestSearchTermReport, waitForReport } from '@/lib/amazon/api'
import { refreshAccessToken } from '@/lib/amazon/auth'
import { runAmazonDiagnostics } from '@/lib/amazon/diagnostics'
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
      .eq('platform', 'amazon')
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

    const syncLogId = syncLog?.id ?? null

    try {
      // Refresh Amazon access token (expires in 1 hour)
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

      const profileId = account.account_id

      // Fetch campaigns + request async search term report in parallel
      const [campaigns, reportId] = await Promise.all([
        fetchCampaignList(accessToken, profileId),
        requestSearchTermReport(accessToken, profileId),
      ])

      // Wait for the report to complete (up to 5 minutes)
      const searchTerms = await waitForReport(accessToken, profileId, reportId)

      // Upsert campaign metrics from search term report
      const campaignMetrics = new Map<string, { spend: number; sales: number; clicks: number; impressions: number; purchases: number }>()
      for (const st of searchTerms) {
        if (!campaignMetrics.has(st.campaignName)) {
          campaignMetrics.set(st.campaignName, { spend: 0, sales: 0, clicks: 0, impressions: 0, purchases: 0 })
        }
        const m = campaignMetrics.get(st.campaignName)!
        m.spend += st.cost
        m.sales += st.sales7d
        m.clicks += st.clicks
        m.impressions += st.impressions
        m.purchases += st.purchases7d
      }

      for (const campaign of campaigns) {
        const metrics = campaignMetrics.get(campaign.name)
        const spend = metrics?.spend ?? 0
        const revenue = metrics?.sales ?? 0
        const clicks = metrics?.clicks ?? 0
        const impressions = metrics?.impressions ?? 0
        const conversions = metrics?.purchases ?? 0
        const roas = spend > 0 ? revenue / spend : 0
        const cpc = clicks > 0 ? spend / clicks : 0
        const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0

        await supabase.from('campaign_metrics').upsert(
          {
            ad_account_id: account.id,
            platform: 'amazon',
            campaign_id: campaign.campaignId,
            campaign_name: campaign.name,
            status: campaign.state,
            date: new Date().toISOString().split('T')[0],
            spend,
            revenue,
            impressions,
            clicks,
            conversions,
            ctr: impressions > 0 ? clicks / impressions : 0,
            cpc,
            roas,
            cpm,
            amazon_data: {
              campaign_type: campaign.campaignType,
              targeting_type: campaign.targetingType,
              daily_budget: campaign.dailyBudget,
            },
          },
          { onConflict: 'ad_account_id,campaign_id,date' }
        )
      }

      const issues = runAmazonDiagnostics({
        campaigns,
        searchTerms,
        profileId,
      })

      await supabase
        .from('diagnostic_issues')
        .update({ status: 'fixed' })
        .eq('ad_account_id', account.id)
        .eq('status', 'open')
        .eq('platform', 'amazon')

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

      if (syncLogId) {
        await supabase
          .from('sync_logs')
          .update({
            status: 'completed',
            campaigns_synced: campaigns.length,
            issues_found: issues.length,
            completed_at: new Date().toISOString(),
          })
          .eq('id', syncLogId)
      }

      return Response.json({
        success: true,
        campaigns_synced: campaigns.length,
        issues_found: issues.length,
      })
    } catch (syncError) {
      if (syncLogId) {
        await supabase
          .from('sync_logs')
          .update({
            status: 'failed',
            error_message: syncError instanceof Error ? syncError.message : 'Unknown error',
            completed_at: new Date().toISOString(),
          })
          .eq('id', syncLogId)
      }
      throw syncError
    }
  } catch (error) {
    return apiErrorResponse(error, 'sync/amazon')
  }
}
