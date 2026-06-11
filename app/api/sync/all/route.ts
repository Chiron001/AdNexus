export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { fetchCampaignInsights, fetchAdSets, fetchCreativePerformance, extractConversions, extractRevenue } from '@/lib/meta/api'
import { runMetaDiagnostics } from '@/lib/meta/diagnostics'
import { fetchCampaignPerformance, fetchKeywordPerformance, fetchConversionActions, microsToCost } from '@/lib/google/api'
import { refreshAccessToken as refreshGoogleToken } from '@/lib/google/auth'
import { runGoogleDiagnostics } from '@/lib/google/diagnostics'
import { fetchCampaignList, requestSearchTermReport, waitForReport } from '@/lib/amazon/api'
import { refreshAccessToken as refreshAmazonToken } from '@/lib/amazon/auth'
import { runAmazonDiagnostics } from '@/lib/amazon/diagnostics'
import { generateAllRecommendations } from '@/lib/ai/claude'
import type { DiagnosticIssue } from '@/lib/diagnostics/types'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { data: accounts } = await supabase
    .from('ad_accounts')
    .select('*')
    .eq('status', 'active')
    .limit(50)

  if (!accounts || accounts.length === 0) {
    return Response.json({ message: 'No active accounts to sync' })
  }

  const results = { synced: 0, failed: 0, issues: 0 }

  for (const account of accounts) {
    try {
      let issues: DiagnosticIssue[] = []

      if (account.platform === 'meta') {
        const [insights, adSets, ads] = await Promise.all([
          fetchCampaignInsights(account.access_token, account.account_id),
          fetchAdSets(account.access_token, account.account_id),
          fetchCreativePerformance(account.access_token, account.account_id),
        ])
        for (const insight of insights) {
          await supabase.from('campaign_metrics').upsert(
            {
              ad_account_id: account.id,
              platform: 'meta',
              campaign_id: insight.campaign_id,
              campaign_name: insight.campaign_name,
              date: insight.date_start,
              spend: parseFloat(insight.spend || '0'),
              revenue: extractRevenue(insight),
              impressions: parseInt(insight.impressions || '0'),
              clicks: parseInt(insight.clicks || '0'),
              conversions: extractConversions(insight),
              ctr: parseFloat(insight.ctr || '0'),
              cpc: parseFloat(insight.cpc || '0'),
              roas: parseFloat(insight.spend || '0') > 0
                ? extractRevenue(insight) / parseFloat(insight.spend || '0')
                : 0,
              cpm: parseFloat(insight.cpm || '0'),
            },
            { onConflict: 'ad_account_id,campaign_id,date' }
          )
        }
        issues = runMetaDiagnostics({ insights: insights as any, adSets, ads, accountId: account.account_id })
      }

      if (account.platform === 'google') {
        let accessToken = account.access_token
        if (account.refresh_token) {
          const refreshed = await refreshGoogleToken(account.refresh_token)
          accessToken = refreshed.access_token
          await supabase
            .from('ad_accounts')
            .update({ access_token: refreshed.access_token })
            .eq('id', account.id)
        }
        const developerToken = process.env.GOOGLE_DEVELOPER_TOKEN!
        const [campaigns, keywords, conversionActions] = await Promise.all([
          fetchCampaignPerformance(accessToken, account.account_id, developerToken),
          fetchKeywordPerformance(accessToken, account.account_id, developerToken),
          fetchConversionActions(accessToken, account.account_id, developerToken),
        ])
        for (const row of campaigns) {
          const spend = microsToCost(row.metrics.cost_micros)
          await supabase.from('campaign_metrics').upsert(
            {
              ad_account_id: account.id,
              platform: 'google',
              campaign_id: row.campaign.id,
              campaign_name: row.campaign.name,
              date: new Date().toISOString().split('T')[0],
              spend,
              revenue: 0,
              impressions: parseInt(row.metrics.impressions || '0'),
              clicks: parseInt(row.metrics.clicks || '0'),
              conversions: parseFloat(row.metrics.conversions || '0'),
              ctr: parseFloat(row.metrics.ctr || '0'),
              cpc: microsToCost(row.metrics.average_cpc),
              roas: 0,
              cpm: parseInt(row.metrics.impressions || '0') > 0
                ? (spend / parseInt(row.metrics.impressions)) * 1000
                : 0,
            },
            { onConflict: 'ad_account_id,campaign_id,date' }
          )
        }
        issues = runGoogleDiagnostics({ campaigns, keywords, conversionActions, accountId: account.account_id })
      }

      if (account.platform === 'amazon') {
        let accessToken = account.access_token
        if (account.refresh_token) {
          const refreshed = await refreshAmazonToken(account.refresh_token)
          accessToken = refreshed.access_token
          await supabase
            .from('ad_accounts')
            .update({ access_token: refreshed.access_token })
            .eq('id', account.id)
        }
        const profileId = account.account_id
        const [campaigns, reportId] = await Promise.all([
          fetchCampaignList(accessToken, profileId),
          requestSearchTermReport(accessToken, profileId),
        ])
        const searchTerms = await waitForReport(accessToken, profileId, reportId)
        issues = runAmazonDiagnostics({ campaigns, searchTerms, profileId })
      }

      await supabase
        .from('diagnostic_issues')
        .update({ status: 'fixed' })
        .eq('ad_account_id', account.id)
        .eq('status', 'open')

      const insertedIssues = []
      for (const issue of issues) {
        const { data } = await supabase
          .from('diagnostic_issues')
          .insert({
            ad_account_id: account.id,
            user_id: account.user_id,
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
          .select()
          .single()
        if (data) insertedIssues.push(data)
      }

      const priorityIssues = insertedIssues.filter(
        (i) => i.severity === 'critical' || i.severity === 'high'
      ) as Array<DiagnosticIssue & { id: string; ad_account_id: string; user_id: string }>

      if (priorityIssues.length > 0) {
        const recommendations = await generateAllRecommendations(priorityIssues)
        for (const { issue_id, recommendation } of recommendations) {
          await supabase.from('recommendations').insert({
            diagnostic_issue_id: issue_id,
            user_id: account.user_id,
            title: recommendation.title,
            explanation: recommendation.explanation,
            action_steps: recommendation.action_steps,
            estimated_impact: recommendation.estimated_impact,
            effort_level: recommendation.effort_level,
            time_to_implement: recommendation.time_to_implement,
            status: 'pending',
          })
        }
      }

      await supabase
        .from('ad_accounts')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', account.id)

      results.synced++
      results.issues += issues.length
    } catch {
      results.failed++
    }
  }

  return Response.json(results)
}
