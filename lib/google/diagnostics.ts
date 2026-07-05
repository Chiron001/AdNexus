import type { DiagnosticIssue } from '@/lib/diagnostics/types'
import type { GoogleCampaignRow, GoogleKeywordRow, GoogleConversionAction } from '@/types/google'
import { microsToCost } from './api'

interface GoogleDiagnosticsInput {
  campaigns: GoogleCampaignRow[]
  keywords: GoogleKeywordRow[]
  conversionActions: GoogleConversionAction[]
  accountId: string
}

export function runGoogleDiagnostics(input: GoogleDiagnosticsInput): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = []

  issues.push(
    ...checkConversionTrackingBroken(input.campaigns, input.conversionActions),
    ...checkLowQualityScoreKeywords(input.keywords),
    ...checkImpressionShareLostToBudget(input.campaigns),
    ...checkKeywordCannibalization(input.keywords),
    ...checkHighSpendZeroConversionKeywords(input.keywords),
    ...checkLowRoasCampaigns(input.campaigns),
    ...checkBroadMatchOveruse(input.keywords),
    ...checkLowCtrCampaigns(input.campaigns),
  )

  return issues
}

function checkConversionTrackingBroken(
  campaigns: GoogleCampaignRow[],
  conversionActions: GoogleConversionAction[]
): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = []

  const hasConversionActions = conversionActions.some(
    (ca) => ca.conversion_action?.status === 'ENABLED'
  )
  if (!hasConversionActions) return issues

  const totalConversions = conversionActions.reduce(
    (sum, ca) => sum + parseFloat(ca.metrics?.all_conversions || '0'),
    0
  )

  const totalSpend = campaigns.reduce(
    (sum, c) => sum + microsToCost(c.metrics?.cost_micros ?? 0),
    0
  )

  if (totalConversions === 0 && totalSpend > 10000) {
    issues.push({
      platform: 'google',
      issue_type: 'conversion_tracking_broken',
      severity: 'critical',
      title: 'Conversion tracking may be broken',
      description: `Your account has spent $${Math.round(totalSpend).toLocaleString('en-US')} in the last 30 days but recorded zero conversions. Your conversion tracking tag may be firing incorrectly or not at all.`,
      affected_entity_type: 'account',
      affected_entity_id: 'account',
      affected_entity_name: 'Google Ads Account',
      estimated_impact_inr: Math.round(totalSpend),
      raw_data: { total_spend: totalSpend, total_conversions: totalConversions, conversion_actions: conversionActions.length },
    })
  }

  return issues
}

function checkLowQualityScoreKeywords(keywords: GoogleKeywordRow[]): DiagnosticIssue[] {
  const lowQsKeywords = keywords.filter((kw) => {
    const qs = kw.ad_group_criterion?.quality_info?.quality_score ?? 10
    const spend = microsToCost(kw.metrics?.cost_micros ?? 0)
    return qs <= 4 && spend > 2000
  })

  if (lowQsKeywords.length === 0) return []

  const totalWasted = lowQsKeywords.reduce(
    (sum, kw) => sum + microsToCost(kw.metrics?.cost_micros ?? 0),
    0
  )

  return [
    {
      platform: 'google',
      issue_type: 'low_quality_score',
      severity: 'high',
      title: `${lowQsKeywords.length} keywords with poor Quality Score draining budget`,
      description: `${lowQsKeywords.length} keywords have a Quality Score of 4 or below and have spent $${Math.round(totalWasted).toLocaleString('en-US')}. Low Quality Scores mean you pay more per click than competitors for the same position.`,
      affected_entity_type: 'keyword',
      affected_entity_id: lowQsKeywords[0].ad_group_criterion?.keyword?.text ?? '',
      affected_entity_name: lowQsKeywords.map((k) => k.ad_group_criterion?.keyword?.text ?? '').filter(Boolean).slice(0, 5).join(', '),
      estimated_impact_inr: Math.round(totalWasted * 0.3),
      raw_data: {
        keyword_count: lowQsKeywords.length,
        total_spend: totalWasted,
        keywords: lowQsKeywords.slice(0, 10).map((k) => ({
          text: k.ad_group_criterion?.keyword?.text,
          qs: k.ad_group_criterion?.quality_info?.quality_score,
          spend: microsToCost(k.metrics?.cost_micros ?? 0),
        })),
      },
    },
  ]
}

function checkImpressionShareLostToBudget(campaigns: GoogleCampaignRow[]): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = []

  for (const campaign of campaigns) {
    const lostShare = parseFloat(
      campaign.metrics?.search_budget_lost_impression_share || '0'
    )
    const spend = microsToCost(campaign.metrics?.cost_micros ?? 0)

    if (lostShare > 0.3 && spend > 5000) {
      issues.push({
        platform: 'google',
        issue_type: 'impression_share_lost_budget',
        severity: 'high',
        title: `Losing ${Math.round(lostShare * 100)}% impression share due to budget: "${campaign.campaign.name}"`,
        description: `This campaign is losing ${Math.round(lostShare * 100)}% of eligible impressions because the daily budget runs out too early. You're missing qualified searches that could drive conversions.`,
        affected_entity_type: 'campaign',
        affected_entity_id: campaign.campaign.id,
        affected_entity_name: campaign.campaign.name,
        estimated_impact_inr: Math.round(spend * lostShare),
        raw_data: { budget_lost_impression_share: lostShare, spend },
      })
    }
  }

  return issues
}

function checkKeywordCannibalization(keywords: GoogleKeywordRow[]): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = []
  const kwToCampaigns = new Map<string, Set<string>>()

  for (const kw of keywords) {
    const text = (kw.ad_group_criterion?.keyword?.text ?? '').toLowerCase().trim()
    if (!text) continue
    if (!kwToCampaigns.has(text)) {
      kwToCampaigns.set(text, new Set())
    }
    kwToCampaigns.get(text)!.add(kw.campaign?.name ?? 'Unknown')
  }

  for (const [kwText, campaigns] of kwToCampaigns) {
    if (campaigns.size >= 2) {
      issues.push({
        platform: 'google',
        issue_type: 'keyword_cannibalization',
        severity: 'medium',
        title: `Campaigns competing on same keyword: "${kwText}"`,
        description: `The keyword "${kwText}" appears in ${campaigns.size} different campaigns, causing them to bid against each other and inflate your CPCs.`,
        affected_entity_type: 'keyword',
        affected_entity_id: kwText,
        affected_entity_name: kwText,
        estimated_impact_inr: 0,
        raw_data: { keyword: kwText, campaigns: Array.from(campaigns) },
      })
      if (issues.length >= 3) break
    }
  }

  return issues
}

function checkHighSpendZeroConversionKeywords(keywords: GoogleKeywordRow[]): DiagnosticIssue[] {
  const wastedKeywords = keywords.filter((kw) => {
    const spend = microsToCost(kw.metrics?.cost_micros ?? 0)
    const conversions = parseFloat(kw.metrics?.conversions || '0')
    return spend > 5000 && conversions === 0
  })

  if (wastedKeywords.length === 0) return []

  const totalWasted = wastedKeywords.reduce(
    (sum, kw) => sum + microsToCost(kw.metrics?.cost_micros ?? 0),
    0
  )

  return [
    {
      platform: 'google',
      issue_type: 'zero_conversion_keywords',
      severity: 'high',
      title: `${wastedKeywords.length} keywords spending $${Math.round(totalWasted).toLocaleString('en-US')} with zero conversions`,
      description: `${wastedKeywords.length} keywords have each spent over $60 in the last 30 days but generated zero conversions. These keywords need to be paused or have their match types tightened.`,
      affected_entity_type: 'keyword',
      affected_entity_id: wastedKeywords[0].ad_group_criterion?.keyword?.text ?? '',
      affected_entity_name: wastedKeywords.map((k) => k.ad_group_criterion?.keyword?.text ?? '').filter(Boolean).slice(0, 3).join(', '),
      estimated_impact_inr: Math.round(totalWasted),
      raw_data: {
        keyword_count: wastedKeywords.length,
        total_wasted: totalWasted,
        keywords: wastedKeywords.slice(0, 10).map((k) => ({
          text: k.ad_group_criterion?.keyword?.text,
          spend: microsToCost(k.metrics?.cost_micros ?? 0),
          campaign: k.campaign?.name,
        })),
      },
    },
  ]
}

function checkLowRoasCampaigns(campaigns: GoogleCampaignRow[]): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = []

  for (const campaign of campaigns) {
    const spend = microsToCost(campaign.metrics?.cost_micros ?? 0)
    if (spend < 20000) continue

    const conversions = parseFloat(campaign.metrics?.conversions || '0')
    if (conversions === 0) {
      issues.push({
        platform: 'google',
        issue_type: 'low_roas_campaign',
        severity: 'high',
        title: `Campaign ROAS critically low — $${Math.round(spend).toLocaleString('en-US')} at risk: "${campaign.campaign?.name}"`,
        description: `This campaign has spent $${Math.round(spend).toLocaleString('en-US')} in the last 30 days with zero recorded conversions. The return on ad spend is effectively zero.`,
        affected_entity_type: 'campaign',
        affected_entity_id: campaign.campaign?.id ?? '',
        affected_entity_name: campaign.campaign?.name ?? '',
        estimated_impact_inr: Math.round(spend),
        raw_data: { spend, conversions, impressions: campaign.metrics?.impressions, ctr: campaign.metrics?.ctr },
      })
    }
  }

  return issues
}

function checkBroadMatchOveruse(keywords: GoogleKeywordRow[]): DiagnosticIssue[] {
  // Google Ads API doesn't return match type in keyword_view directly
  // We can infer: keywords with very low quality scores are often broad match
  // This is a heuristic check
  const total = keywords.length
  if (total === 0) return []

  const lowPerformers = keywords.filter((kw) => {
    const clicks = parseInt(kw.metrics?.clicks || '0')
    const conversions = parseFloat(kw.metrics?.conversions || '0')
    const spend = microsToCost(kw.metrics?.cost_micros ?? 0)
    return spend > 1000 && clicks > 100 && conversions === 0
  })

  const broadMatchPercent = lowPerformers.length / total
  if (broadMatchPercent < 0.5 || lowPerformers.length < 5) return []

  return [
    {
      platform: 'google',
      issue_type: 'broad_match_overuse',
      severity: 'medium',
      title: `${lowPerformers.length} keywords with high clicks but zero conversions — likely broad match waste`,
      description: `${lowPerformers.length} keywords are generating clicks with zero conversions, suggesting broad match keywords are attracting irrelevant traffic. Consider switching to phrase or exact match.`,
      affected_entity_type: 'account',
      affected_entity_id: 'account',
      affected_entity_name: 'Google Ads Account',
      estimated_impact_inr: Math.round(
        lowPerformers.reduce((sum, k) => sum + microsToCost(k.metrics?.cost_micros ?? 0), 0) * 0.4
      ),
      raw_data: {
        low_performing_keywords: lowPerformers.length,
        total_keywords: total,
        percent: broadMatchPercent,
      },
    },
  ]
}

function checkLowCtrCampaigns(campaigns: GoogleCampaignRow[]): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = []

  for (const campaign of campaigns) {
    const impressions = parseInt(campaign.metrics?.impressions || '0')
    const ctr = parseFloat(campaign.metrics?.ctr || '0')

    if (impressions > 10000 && ctr < 0.02) {
      issues.push({
        platform: 'google',
        issue_type: 'low_ctr',
        severity: 'medium',
        title: `Below-average CTR — ad copy needs improvement: "${campaign.campaign?.name}"`,
        description: `This search campaign has a CTR of ${(ctr * 100).toFixed(2)}% (industry average: 2-5%). Poor ad copy or irrelevant keywords are causing users to scroll past your ads.`,
        affected_entity_type: 'campaign',
        affected_entity_id: campaign.campaign?.id ?? '',
        affected_entity_name: campaign.campaign?.name ?? '',
        estimated_impact_inr: 0,
        raw_data: { ctr, impressions, clicks: campaign.metrics?.clicks },
      })
    }
  }

  return issues
}
