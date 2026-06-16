import type { DiagnosticIssue } from '@/lib/diagnostics/types'
import type { Json } from '@/types/database'
import type { MetaCampaignInsight, MetaAdSet, MetaAd } from '@/types/meta'
import { extractConversions } from './api'

interface MetaDiagnosticsInput {
  insights: MetaCampaignInsight[]
  adSets: MetaAdSet[]
  ads: MetaAd[]
  accountId: string
}

export function runMetaDiagnostics(input: MetaDiagnosticsInput): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = []

  issues.push(
    ...checkCreativeFatigue(input.ads),
    ...checkZeroConversionCampaigns(input.insights),
    ...checkLowRoas(input.insights),
    ...checkDisapprovedAds(input.ads),
    ...checkBudgetPacing(input.adSets),
    ...checkAudienceOverlap(input.adSets),
  )

  return issues
}

function checkCreativeFatigue(ads: MetaAd[]): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = []

  for (const ad of ads) {
    if (!ad.insights?.data?.[0]) continue
    const insight = ad.insights.data[0]
    const frequency = parseFloat(insight.frequency || '0')
    const ctr = parseFloat(insight.ctr || '0')
    const spend = parseFloat(insight.spend || '0')

    if (frequency > 3.5 && ctr < 0.01) {
      issues.push({
        platform: 'meta',
        issue_type: 'creative_fatigue',
        severity: 'high',
        title: `Creative fatigue detected: "${ad.name}"`,
        description: `This ad has a frequency of ${frequency.toFixed(1)}x (audience is seeing it too often) with a CTR that has likely dropped significantly. The creative is worn out.`,
        affected_entity_type: 'ad',
        affected_entity_id: ad.id,
        affected_entity_name: ad.name,
        estimated_impact_inr: Math.round(spend * 14),
        raw_data: { frequency, ctr, spend },
      })
    }
  }

  return issues
}

function checkZeroConversionCampaigns(insights: MetaCampaignInsight[]): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = []

  for (const insight of insights) {
    const spend = parseFloat(insight.spend || '0')
    const conversions = extractConversions(insight)

    if (spend > 10000 && conversions === 0) {
      issues.push({
        platform: 'meta',
        issue_type: 'zero_conversions',
        severity: 'critical',
        title: `High spend with zero conversions: "${insight.campaign_name}"`,
        description: `This campaign has spent $${Math.round(spend).toLocaleString('en-US')} in the last 30 days with zero recorded conversions. Your money is being spent with no return.`,
        affected_entity_type: 'campaign',
        affected_entity_id: insight.campaign_id,
        affected_entity_name: insight.campaign_name,
        estimated_impact_inr: Math.round(spend),
        raw_data: { spend, conversions },
      })
    }
  }

  return issues
}

function checkLowRoas(insights: MetaCampaignInsight[]): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = []

  for (const insight of insights) {
    const spend = parseFloat(insight.spend || '0')
    if (spend < 5000) continue

    const revenue = insight.action_values?.find(
      (a) => a.action_type === 'purchase' || a.action_type === 'offsite_conversion.fb_pixel_purchase'
    )
    const revenueValue = revenue ? parseFloat(revenue.value) : 0
    const roas = spend > 0 ? revenueValue / spend : 0

    if (roas < 1.0 && roas > 0) {
      issues.push({
        platform: 'meta',
        issue_type: 'low_roas',
        severity: 'critical',
        title: `ROAS below 1.0 — losing money: "${insight.campaign_name}"`,
        description: `This campaign has a ROAS of ${roas.toFixed(2)}x, meaning you're getting back less than $1 for every $1 spent. You are actively losing money on this campaign.`,
        affected_entity_type: 'campaign',
        affected_entity_id: insight.campaign_id,
        affected_entity_name: insight.campaign_name,
        estimated_impact_inr: Math.round(spend - revenueValue),
        raw_data: { spend, revenue: revenueValue, roas },
      })
    }
  }

  return issues
}

function checkDisapprovedAds(ads: MetaAd[]): DiagnosticIssue[] {
  const disapproved = ads.filter((ad) => ad.status === 'DISAPPROVED')
  if (disapproved.length === 0) return []

  return [
    {
      platform: 'meta',
      issue_type: 'disapproved_ads',
      severity: 'high',
      title: `${disapproved.length} ad${disapproved.length > 1 ? 's' : ''} disapproved — reducing delivery`,
      description: `${disapproved.length} active ad${disapproved.length > 1 ? 's' : ''} ${disapproved.length > 1 ? 'have' : 'has'} been disapproved by Meta. These ads are not running and are reducing your account's overall delivery.`,
      affected_entity_type: 'ad',
      affected_entity_id: disapproved[0].id,
      affected_entity_name: disapproved.map((a) => a.name).join(', '),
      estimated_impact_inr: 0,
      raw_data: { count: disapproved.length, ad_ids: disapproved.map((a) => a.id) },
    },
  ]
}

function checkBudgetPacing(adSets: MetaAdSet[]): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = []

  for (const adSet of adSets) {
    const dailyBudget = parseFloat(adSet.daily_budget || '0')
    const budgetRemaining = parseFloat(adSet.budget_remaining || '0')
    if (dailyBudget === 0) continue

    const spentPercent = (dailyBudget - budgetRemaining) / dailyBudget

    if (spentPercent < 0.1 && dailyBudget > 1000) {
      issues.push({
        platform: 'meta',
        issue_type: 'budget_underspend',
        severity: 'medium',
        title: `Budget severely underpacing: "${adSet.name}"`,
        description: `This ad set has only spent ${Math.round(spentPercent * 100)}% of its daily budget. This usually means the audience is too narrow or bids are too low to win auctions.`,
        affected_entity_type: 'adset',
        affected_entity_id: adSet.id,
        affected_entity_name: adSet.name,
        estimated_impact_inr: Math.round(budgetRemaining * 30 * 0.1),
        raw_data: { daily_budget: dailyBudget, budget_remaining: budgetRemaining, spent_percent: spentPercent },
      })
    }
  }

  return issues
}

function checkAudienceOverlap(adSets: MetaAdSet[]): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = []
  const seen = new Map<string, MetaAdSet>()

  for (const adSet of adSets) {
    const targeting = adSet.targeting as { age_min?: number; age_max?: number; genders?: number[] } | null
    if (!targeting) continue

    const key = JSON.stringify({
      age_min: targeting.age_min,
      age_max: targeting.age_max,
      genders: targeting.genders,
    })

    if (seen.has(key)) {
      const existing = seen.get(key)!
      issues.push({
        platform: 'meta',
        issue_type: 'audience_overlap',
        severity: 'medium',
        title: `Audience overlap: "${adSet.name}" vs "${existing.name}"`,
        description: `These two ad sets are targeting the same audience segment, causing them to compete in the same auctions. This drives up your CPM and reduces efficiency.`,
        affected_entity_type: 'adset',
        affected_entity_id: adSet.id,
        affected_entity_name: adSet.name,
        estimated_impact_inr: 0,
        raw_data: { adset_1: existing.id, adset_2: adSet.id },
      })
    } else {
      seen.set(key, adSet)
    }
  }

  return issues
}
