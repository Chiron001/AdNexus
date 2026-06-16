import Anthropic from '@anthropic-ai/sdk'
import type { DiagnosticIssue, Recommendation } from '@/lib/diagnostics/types'

const client = new Anthropic()

export async function generateRecommendation(issue: DiagnosticIssue): Promise<Recommendation> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    system: `You are an expert performance marketing consultant specialising in Meta Ads, Google Ads, and Amazon Ads for Indian D2C brands.

You will receive a diagnosed advertising account issue. Your job is to:
1. Explain the problem in plain English (2-3 sentences max, no jargon)
2. Give exactly 3-5 specific action steps the brand owner can take RIGHT NOW
3. Estimate the impact if fixed
4. Rate the effort level

Always respond in this exact JSON format:
{
  "title": "Short actionable title (under 10 words)",
  "explanation": "Plain English explanation of what's wrong and why it matters. Use USD for currency. No marketing jargon.",
  "action_steps": [
    "Specific step 1 with exact numbers/thresholds where relevant",
    "Specific step 2",
    "Specific step 3"
  ],
  "estimated_impact": "Human readable impact e.g. 'Could recover $550/month in wasted spend'",
  "effort_level": "quick_win | medium | complex",
  "time_to_implement": "e.g. 15 minutes | 1 hour | Half a day"
}

Be specific. Use actual numbers from the issue data. Don't be generic.`,

    messages: [
      {
        role: 'user',
        content: `Generate a recommendation for this ad account issue:

Platform: ${issue.platform}
Issue Type: ${issue.issue_type}
Severity: ${issue.severity}
Title: ${issue.title}
Description: ${issue.description}
Affected: ${issue.affected_entity_type} — "${issue.affected_entity_name}"
Estimated Revenue Impact: $${issue.estimated_impact_inr?.toLocaleString('en-US') || 'Unknown'}
Raw Data: ${JSON.stringify(issue.raw_data)}`,
      },
    ],
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unexpected Claude response type')

  const parsed = JSON.parse(content.text) as Recommendation
  return parsed
}

export async function generateAllRecommendations(
  issues: Array<DiagnosticIssue & { id: string; ad_account_id: string; user_id: string }>
): Promise<Array<{ issue_id: string; recommendation: Recommendation }>> {
  const results: Array<{ issue_id: string; recommendation: Recommendation }> = []
  const BATCH_SIZE = 3

  for (let i = 0; i < issues.length; i += BATCH_SIZE) {
    const batch = issues.slice(i, i + BATCH_SIZE)

    const batchResults = await Promise.allSettled(
      batch.map(async (issue) => {
        const rec = await generateRecommendation(issue)
        return { issue_id: issue.id, recommendation: rec }
      })
    )

    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value)
      }
    }

    if (i + BATCH_SIZE < issues.length) {
      await new Promise((r) => setTimeout(r, 1000))
    }
  }

  return results
}
