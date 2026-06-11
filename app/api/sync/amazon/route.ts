export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  fetchCampaignList, requestSearchTermReport, waitForReport, amazonRowToMetrics,
} from '@/lib/amazon/api'
import { refreshAccessToken } from '@/lib/amazon/auth'
import { runAmazonDiagnostics } from '@/lib/amazon/diagnostics'
import { apiErrorResponse } from '@/lib/utils/errors'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { account_id } = await request.json()

    const { data: account } = await supabase
      .from('ad_accounts').select('*')
      .eq('id', account_id).eq('user_id', user.id).eq('platform', 'amazon').single()
    if (!account) return Response.json({ error: 'Account not found' }, { status: 404 })

    const { data: syncLog } = await (supabase as AnyClient)
      .from('sync_logs')
      .insert({ ad_account_id: account.id, sync_type: 'manual', status: 'running' })
      .select().single()
    const syncLogId = syncLog?.id ?? null

    try {
      let accessToken = account.access_token
      if (account.refresh_token) {
        const refreshed = await refreshAccessToken(account.refresh_token)
        accessToken = refreshed.access_token
        await supabase.from('ad_accounts').update({
          access_token: refreshed.access_token,
          token_expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
        }).eq('id', account.id)
      }

      const profileId = account.account_id

      // Fetch campaigns + search term report in parallel
      const [campaigns, reportId] = await Promise.all([
        fetchCampaignList(accessToken, profileId),
        requestSearchTermReport(accessToken, profileId),
      ])

      const searchTerms = await waitForReport(accessToken, profileId, reportId)

      // Roll search terms up to campaign level with all metrics
      const byName = new Map<string, Record<string, number>>()
      for (const st of searchTerms) {
        const key = st.campaignName ?? ''
        const prev = byName.get(key) ?? {}
        byName.set(key, {
          spend:       (prev.spend ?? 0)       + (st.cost ?? 0),
          revenue:     (prev.revenue ?? 0)     + (st.sales7d ?? 0),
          clicks:      (prev.clicks ?? 0)      + (st.clicks ?? 0),
          impressions: (prev.impressions ?? 0) + (st.impressions ?? 0),
          purchases:   (prev.purchases ?? 0)   + (st.purchases7d ?? 0),
        })
      }

      const today = new Date().toISOString().split('T')[0]

      for (const campaign of campaigns) {
        const agg = byName.get(campaign.name) ?? {}
        const row = {
          spend:       agg.spend ?? 0,
          revenue:     agg.revenue ?? 0,
          clicks:      agg.clicks ?? 0,
          impressions: agg.impressions ?? 0,
          purchases14d: agg.purchases ?? 0,
          sales14d:    agg.revenue ?? 0,
          campaignStatus: campaign.state,
        }
        const m = amazonRowToMetrics(row)

        await (supabase as AnyClient).from('campaign_metrics').upsert(
          {
            ad_account_id: account.id,
            platform: 'amazon',
            campaign_id: String(campaign.campaignId),
            campaign_name: campaign.name,
            date: today,
            ...m,
            raw_data: {
              campaign_type: campaign.campaignType,
              targeting_type: campaign.targetingType,
              daily_budget: campaign.dailyBudget,
            },
          },
          { onConflict: 'ad_account_id,campaign_id,date' }
        )
      }

      const issues = runAmazonDiagnostics({ campaigns, searchTerms, profileId })

      await supabase.from('diagnostic_issues').update({ status: 'fixed' })
        .eq('ad_account_id', account.id).eq('status', 'open').eq('platform', 'amazon')

      for (const issue of issues) {
        await supabase.from('diagnostic_issues').insert({
          ad_account_id: account.id, user_id: user.id,
          platform: issue.platform, issue_type: issue.issue_type, severity: issue.severity,
          title: issue.title, description: issue.description,
          affected_entity_type: issue.affected_entity_type,
          affected_entity_id: issue.affected_entity_id,
          affected_entity_name: issue.affected_entity_name,
          estimated_impact_inr: issue.estimated_impact_inr,
          raw_data: issue.raw_data,
        })
      }

      await supabase.from('ad_accounts')
        .update({ last_synced_at: new Date().toISOString() }).eq('id', account.id)

      if (syncLogId) {
        await (supabase as AnyClient).from('sync_logs').update({
          status: 'completed',
          campaigns_synced: campaigns.length,
          issues_found: issues.length,
          completed_at: new Date().toISOString(),
        }).eq('id', syncLogId)
      }

      return Response.json({ success: true, campaigns_synced: campaigns.length, issues_found: issues.length })
    } catch (syncError) {
      if (syncLogId) {
        await (supabase as AnyClient).from('sync_logs').update({
          status: 'failed',
          error_message: syncError instanceof Error ? syncError.message : 'Unknown error',
          completed_at: new Date().toISOString(),
        }).eq('id', syncLogId)
      }
      throw syncError
    }
  } catch (error) {
    return apiErrorResponse(error, 'sync/amazon')
  }
}
