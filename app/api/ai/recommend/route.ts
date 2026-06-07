export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateRecommendation } from '@/lib/ai/claude'
import { apiErrorResponse } from '@/lib/utils/errors'
import type { DiagnosticIssue } from '@/lib/diagnostics/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { issue_id } = await request.json()

    // Verify user owns this issue
    const { data: issue } = await supabase
      .from('diagnostic_issues')
      .select('*')
      .eq('id', issue_id)
      .eq('user_id', user.id)
      .single()

    if (!issue) return Response.json({ error: 'Issue not found' }, { status: 404 })

    const diagnosticIssue: DiagnosticIssue = {
      platform: issue.platform as DiagnosticIssue['platform'],
      issue_type: issue.issue_type,
      severity: issue.severity as DiagnosticIssue['severity'],
      title: issue.title,
      description: issue.description || '',
      affected_entity_type: (issue.affected_entity_type || 'campaign') as DiagnosticIssue['affected_entity_type'],
      affected_entity_id: issue.affected_entity_id || '',
      affected_entity_name: issue.affected_entity_name || '',
      estimated_impact_inr: issue.estimated_impact_inr || 0,
      raw_data: issue.raw_data || {},
    }

    const recommendation = await generateRecommendation(diagnosticIssue)

    // Save to database
    const { data: saved } = await supabase
      .from('recommendations')
      .insert({
        diagnostic_issue_id: issue.id,
        user_id: user.id,
        title: recommendation.title,
        explanation: recommendation.explanation,
        action_steps: recommendation.action_steps,
        estimated_impact: recommendation.estimated_impact,
        effort_level: recommendation.effort_level,
        time_to_implement: recommendation.time_to_implement,
        status: 'pending',
      })
      .select()
      .single()

    return Response.json({ success: true, recommendation: saved })
  } catch (error) {
    return apiErrorResponse(error, 'ai/recommend')
  }
}
