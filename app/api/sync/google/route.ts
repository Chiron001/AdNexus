export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  fetchCampaignPerformance, fetchAdGroupPerformance, fetchAdPerformance,
  fetchKeywordPerformance, fetchConversionActions, microsToCost, googleRowToMetrics,
} from '@/lib/google/api'
import { refreshAccessToken } from '@/lib/google/auth'
import { runGoogleDiagnostics } from '@/lib/google/diagnostics'
import { apiErrorResponse } from '@/lib/utils/errors'
import { checkSyncAllowed } from '@/lib/utils/plan-gate'

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
      .eq('id', account_id).eq('user_id', user.id).eq('platform', 'google').single()
    if (!account) return Response.json({ error: 'Account not found' }, { status: 404 })

    const gateResult = await checkSyncAllowed(supabase, user.id, account_id)
    if (!gateResult.allowed) {
      return Response.json({
        error: gateResult.reason,
        checksUsed: gateResult.checksUsed,
        checksLimit: gateResult.checksLimit,
        retryAfterMs: gateResult.retryAfterMs,
        upgrade_required: true,
      }, { status: 429 })
    }

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

      const devToken = process.env.GOOGLE_DEVELOPER_TOKEN!
      const customerId = account.account_id

      const [campaigns, adGroups, ads, keywords, conversions] = await Promise.all([
        fetchCampaignPerformance(accessToken, customerId, devToken),
        fetchAdGroupPerformance(accessToken, customerId, devToken),
        fetchAdPerformance(accessToken, customerId, devToken),
        fetchKeywordPerformance(accessToken, customerId, devToken),
        fetchConversionActions(accessToken, customerId, devToken),
      ])

      // Upsert campaign_metrics (one row per campaign per day)
      for (const row of campaigns) {
        const m = googleRowToMetrics(row)
        const date = (row as any).segments?.date ?? new Date().toISOString().split('T')[0]
        await (supabase as AnyClient).from('campaign_metrics').upsert(
          {
            ad_account_id: account.id,
            platform: 'google',
            campaign_id: row.campaign.id,
            campaign_name: row.campaign.name,
            date,
            ...m,
          },
          { onConflict: 'ad_account_id,campaign_id,date' }
        )
      }

      // Upsert adset_metrics (ad group level)
      for (const row of adGroups) {
        const spend    = microsToCost(row.metrics?.cost_micros ?? 0)
        const conv     = parseFloat(String(row.metrics?.conversions ?? 0))
        const convVal  = parseFloat(String(row.metrics?.conversions_value ?? 0))
        const imp      = parseInt(String(row.metrics?.impressions ?? 0))
        const clicks   = parseInt(String(row.metrics?.clicks ?? 0))
        const date     = row.segments?.date ?? new Date().toISOString().split('T')[0]
        await (supabase as AnyClient).from('adset_metrics').upsert(
          {
            ad_account_id: account.id,
            platform: 'google',
            campaign_id: row.campaign?.id,
            campaign_name: row.campaign?.name,
            adset_id: row.ad_group?.id,
            adset_name: row.ad_group?.name,
            adset_status: row.ad_group?.status,
            date,
            spend,
            impressions: imp,
            clicks,
            ctr: parseFloat(String(row.metrics?.ctr ?? 0)) * 100,
            cpc: microsToCost(row.metrics?.average_cpc),
            cpm: microsToCost(row.metrics?.average_cpm),
            purchases: Math.round(conv),
            purchase_value: convVal,
            roas: spend > 0 && convVal > 0 ? convVal / spend : 0,
            cpa: spend > 0 && conv > 0 ? spend / conv : 0,
            search_impression_share: parseFloat(String(row.metrics?.search_impression_share ?? 0)),
            raw_data: { metrics: row.metrics },
          },
          { onConflict: 'ad_account_id,platform,adset_id,date' }
        )
      }

      // Upsert ad_metrics
      for (const row of ads) {
        const spend  = microsToCost(row.metrics?.cost_micros ?? 0)
        const conv   = parseFloat(String(row.metrics?.conversions ?? 0))
        const convVal = parseFloat(String(row.metrics?.conversions_value ?? 0))
        const imp    = parseInt(String(row.metrics?.impressions ?? 0))
        const clicks = parseInt(String(row.metrics?.clicks ?? 0))
        const date   = row.segments?.date ?? new Date().toISOString().split('T')[0]
        await (supabase as AnyClient).from('ad_metrics').upsert(
          {
            ad_account_id: account.id,
            platform: 'google',
            campaign_id: row.campaign?.id,
            campaign_name: row.campaign?.name,
            adset_id: row.ad_group?.id,
            adset_name: row.ad_group?.name,
            ad_id: row.ad_group_ad?.ad?.id,
            ad_name: row.ad_group_ad?.ad?.name,
            ad_status: row.ad_group_ad?.status,
            creative_type: row.ad_group_ad?.ad?.type,
            date,
            spend, impressions: imp, clicks,
            ctr: parseFloat(String(row.metrics?.ctr ?? 0)) * 100,
            cpc: microsToCost(row.metrics?.average_cpc),
            cpm: microsToCost(row.metrics?.average_cpm),
            purchases: Math.round(conv),
            purchase_value: convVal,
            roas: spend > 0 && convVal > 0 ? convVal / spend : 0,
            cpa: spend > 0 && conv > 0 ? spend / conv : 0,
            video_views: parseInt(String(row.metrics?.video_views ?? 0)),
            video_view_rate: parseFloat(String(row.metrics?.video_view_rate ?? 0)) * 100,
            raw_data: { metrics: row.metrics },
          },
          { onConflict: 'ad_account_id,platform,ad_id,date' }
        )
      }

      const issues = runGoogleDiagnostics({ campaigns, keywords, conversionActions: conversions, accountId: customerId })

      await supabase.from('diagnostic_issues').update({ status: 'fixed' })
        .eq('ad_account_id', account.id).eq('status', 'open').eq('platform', 'google')

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
          adsets_synced: adGroups.length,
          ads_synced: ads.length,
          issues_found: issues.length,
          completed_at: new Date().toISOString(),
        }).eq('id', syncLogId)
      }

      return Response.json({
        success: true,
        campaigns_synced: campaigns.length,
        adsets_synced: adGroups.length,
        ads_synced: ads.length,
        issues_found: issues.length,
      })
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
    return apiErrorResponse(error, 'sync/google')
  }
}
