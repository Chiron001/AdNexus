export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { fetchCampaignInsights, fetchAdSets, fetchCreativePerformance, extractConversions, extractRevenue } from '@/lib/meta/api'
import { runMetaDiagnostics } from '@/lib/meta/diagnostics'
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

        issues = runMetaDiagnostics({ insights, adSets, ads, accountId: account.account_id })
      }

      // Mark old issues as fixed
      await supabase
        .from('diagnostic_issues')
        .update({ status: 'fixed' })
        .eq('ad_account_id', account.id)
        .eq('status', 'open')

      // Insert new issues
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

      // Auto-generate AI recommendations for critical/high issues
      const priorityIssues = insertedIssues.filter(
        (i) => i.severity === 'critical' || i.severity === 'high'
      ) as Array<DiagnosticIssue & { id: string; ad_account_id: string; user_id: string }>

      if (priorityIssues.length > 0) {
        const recommendations = await generateAllRecommendations(priorityIssues)
        for (const { issue_id, recommendation } of recommendations) {
          await supabase.from('recommendations').insert({
            diagnostic_issue_id: issue_id,
            user_id: account.user_id,
            ...recommendation,
            action_steps: recommendation.action_steps,
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
