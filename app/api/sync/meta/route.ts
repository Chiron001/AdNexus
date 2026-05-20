import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchCampaignInsights, fetchAdSets, fetchCreativePerformance, extractConversions, extractRevenue } from '@/lib/meta/api'
import { runMetaDiagnostics } from '@/lib/meta/diagnostics'
import { apiErrorResponse } from '@/lib/utils/errors'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { account_id } = body

    // Verify user owns this account
    const { data: account } = await supabase
      .from('ad_accounts')
      .select('*')
      .eq('id', account_id)
      .eq('user_id', user.id)
      .eq('platform', 'meta')
      .single()

    if (!account) return Response.json({ error: 'Account not found' }, { status: 404 })

    // Create sync log
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
      const [insights, adSets, ads] = await Promise.all([
        fetchCampaignInsights(account.access_token, account.account_id),
        fetchAdSets(account.access_token, account.account_id),
        fetchCreativePerformance(account.access_token, account.account_id),
      ])

      // Upsert campaign metrics
      for (const insight of insights) {
        const conversions = extractConversions(insight)
        const revenue = extractRevenue(insight)
        const spend = parseFloat(insight.spend || '0')
        const roas = spend > 0 ? revenue / spend : 0

        await supabase.from('campaign_metrics').upsert(
          {
            ad_account_id: account.id,
            platform: 'meta',
            campaign_id: insight.campaign_id,
            campaign_name: insight.campaign_name,
            date: insight.date_start,
            spend,
            revenue,
            impressions: parseInt(insight.impressions || '0'),
            clicks: parseInt(insight.clicks || '0'),
            conversions,
            ctr: parseFloat(insight.ctr || '0'),
            cpc: parseFloat(insight.cpc || '0'),
            roas,
            cpm: parseFloat(insight.cpm || '0'),
            meta_data: {
              reach: insight.reach,
              frequency: insight.frequency,
            },
          },
          { onConflict: 'ad_account_id,campaign_id,date' }
        )
      }

      // Run diagnostics
      const issues = runMetaDiagnostics({ insights, adSets, ads, accountId: account.account_id })

      // Clear old open issues for this account before inserting new ones
      await supabase
        .from('diagnostic_issues')
        .update({ status: 'fixed' })
        .eq('ad_account_id', account.id)
        .eq('status', 'open')

      // Insert new issues
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

      // Update account last synced
      await supabase
        .from('ad_accounts')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', account.id)

      // Complete sync log
      await supabase
        .from('sync_logs')
        .update({
          status: 'completed',
          campaigns_synced: insights.length,
          issues_found: issues.length,
          completed_at: new Date().toISOString(),
        })
        .eq('id', syncLog!.id)

      return Response.json({
        success: true,
        campaigns_synced: insights.length,
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
    return apiErrorResponse(error, 'sync/meta')
  }
}
