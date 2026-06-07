export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateAuditReport } from '@/lib/reports/generate'
import { apiErrorResponse } from '@/lib/utils/errors'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    // Check plan gate
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, company_name, full_name')
      .eq('id', user.id)
      .single()

    if (!profile || profile.plan === 'free') {
      return Response.json({ error: 'PDF reports require a Growth plan or higher' }, { status: 403 })
    }

    // Fetch all connected accounts
    const { data: accounts } = await supabase
      .from('ad_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')

    if (!accounts || accounts.length === 0) {
      return Response.json({ error: 'No connected accounts found' }, { status: 400 })
    }

    const accountsData = await Promise.all(
      accounts.map(async (account) => {
        const [issuesResult, metricsResult] = await Promise.all([
          supabase
            .from('diagnostic_issues')
            .select('*')
            .eq('ad_account_id', account.id)
            .eq('status', 'open')
            .order('severity', { ascending: true }),
          supabase
            .from('campaign_metrics')
            .select('campaign_name, spend, revenue, roas, conversions, clicks')
            .eq('ad_account_id', account.id)
            .order('spend', { ascending: false })
            .limit(20),
        ])

        return {
          platform: account.platform,
          accountName: account.account_name ?? account.account_id,
          issues: (issuesResult.data ?? []).map((issue) => ({
            platform: issue.platform as 'meta' | 'google' | 'amazon',
            issue_type: issue.issue_type,
            severity: issue.severity as 'critical' | 'high' | 'medium' | 'low',
            title: issue.title,
            description: issue.description ?? '',
            affected_entity_type: (issue.affected_entity_type ?? 'campaign') as 'campaign' | 'adset' | 'ad' | 'keyword' | 'account',
            affected_entity_id: issue.affected_entity_id ?? '',
            affected_entity_name: issue.affected_entity_name ?? '',
            estimated_impact_inr: issue.estimated_impact_inr ?? 0,
            raw_data: issue.raw_data ?? {},
          })),
          metrics: metricsResult.data ?? [],
        }
      })
    )

    // Fetch top recommendations (plain select — join typing not supported in manual types)
    const { data: rawRecs } = await supabase
      .from('recommendations')
      .select('title, explanation, action_steps, estimated_impact, effort_level, diagnostic_issue_id')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .limit(10)

    type RawRec = {
      title: string
      explanation: string | null
      action_steps: unknown
      estimated_impact: string | null
      effort_level: string | null
      diagnostic_issue_id: string
    }

    const recommendations = rawRecs as RawRec[] | null

    const brandName = profile.company_name ?? profile.full_name ?? user.email ?? 'Your Brand'

    const pdfBuffer = await generateAuditReport({
      brandName,
      generatedAt: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      accounts: accountsData,
      recommendations: (recommendations ?? []).map((rec) => ({
        title: rec.title,
        explanation: rec.explanation ?? '',
        action_steps: Array.isArray(rec.action_steps) ? rec.action_steps as string[] : [],
        estimated_impact: rec.estimated_impact ?? '',
        effort_level: rec.effort_level ?? 'medium',
        platform: 'unknown',
      })),
    })

    return new Response(pdfBuffer as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="adnexus-audit-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    })
  } catch (error) {
    return apiErrorResponse(error, 'reports/generate')
  }
}
