export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  fetchMetaCampaignInsights, fetchMetaAdsetInsights, fetchMetaAdInsights,
  fetchMetaAdsets, fetchMetaAds, insightToMetrics,
} from '@/lib/meta/api'
import { runMetaDiagnostics } from '@/lib/meta/diagnostics'
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
      .eq('id', account_id).eq('user_id', user.id).eq('platform', 'meta').single()
    if (!account) return Response.json({ error: 'Account not found' }, { status: 404 })

    const { data: syncLog } = await (supabase as AnyClient)
      .from('sync_logs')
      .insert({ ad_account_id: account.id, sync_type: 'manual', status: 'running' })
      .select().single()
    const syncLogId = syncLog?.id ?? null

    try {
      const token     = account.access_token
      const accountId = account.account_id

      // Fetch sequentially to avoid Meta rate limits (each level makes multiple chunked requests)
      const campaignInsights = await fetchMetaCampaignInsights(token, accountId)
      const adsetInsights    = await fetchMetaAdsetInsights(token, accountId)
      const adInsights       = await fetchMetaAdInsights(token, accountId)
      const [adsets, ads]    = await Promise.all([
        fetchMetaAdsets(token, accountId),
        fetchMetaAds(token, accountId),
      ])

      // Upsert campaign_metrics
      for (const row of campaignInsights) {
        const m = insightToMetrics(row)
        await (supabase as AnyClient).from('campaign_metrics').upsert(
          {
            ad_account_id: account.id,
            platform: 'meta',
            campaign_id: row.campaign_id,
            campaign_name: row.campaign_name,
            date: row.date_start,
            ...m,
          },
          { onConflict: 'ad_account_id,campaign_id,date' }
        )
      }

      // Upsert adset_metrics
      for (const row of adsetInsights) {
        const m = insightToMetrics(row)
        // Find matching adset for targeting info
        const adset = adsets.find(a => a.id === row.adset_id)
        const targeting = adset?.targeting ?? {}
        await (supabase as AnyClient).from('adset_metrics').upsert(
          {
            ad_account_id: account.id,
            platform: 'meta',
            campaign_id: row.campaign_id,
            campaign_name: row.campaign_name,
            adset_id: row.adset_id,
            adset_name: row.adset_name,
            date: row.date_start,
            optimization_goal: adset?.optimization_goal ?? null,
            billing_event: adset?.billing_event ?? null,
            daily_budget: adset?.daily_budget ? parseFloat(adset.daily_budget) / 100 : null,
            targeting_age_min: (targeting as any).age_min ?? null,
            targeting_age_max: (targeting as any).age_max ?? null,
            targeting_countries: (targeting as any).geo_locations?.countries ?? null,
            targeting_interests: (targeting as any).flexible_spec ?? null,
            targeting_behaviors: (targeting as any).behaviors ?? null,
            ...m,
          },
          { onConflict: 'ad_account_id,platform,adset_id,date' }
        )
      }

      // Upsert ad_metrics
      for (const row of adInsights) {
        const m = insightToMetrics(row)
        const ad = ads.find(a => a.id === row.ad_id)
        await (supabase as AnyClient).from('ad_metrics').upsert(
          {
            ad_account_id: account.id,
            platform: 'meta',
            campaign_id: row.campaign_id,
            campaign_name: row.campaign_name,
            adset_id: row.adset_id,
            adset_name: row.adset_name,
            ad_id: row.ad_id,
            ad_name: row.ad_name,
            date: row.date_start,
            creative_id: ad?.creative?.id ?? null,
            ...m,
          },
          { onConflict: 'ad_account_id,platform,ad_id,date' }
        )
      }

      // Diagnostics
      const issues = runMetaDiagnostics({ insights: campaignInsights as any, adSets: adsets, ads, accountId })

      await supabase.from('diagnostic_issues').update({ status: 'fixed' })
        .eq('ad_account_id', account.id).eq('status', 'open')

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
          campaigns_synced: campaignInsights.length,
          adsets_synced: adsetInsights.length,
          ads_synced: adInsights.length,
          issues_found: issues.length,
          completed_at: new Date().toISOString(),
        }).eq('id', syncLogId)
      }

      return Response.json({
        success: true,
        campaigns_synced: campaignInsights.length,
        adsets_synced: adsetInsights.length,
        ads_synced: adInsights.length,
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
    return apiErrorResponse(error, 'sync/meta')
  }
}
