import type { DiagnosticIssue } from '@/lib/diagnostics/types'
import type { AmazonCampaign, AmazonSearchTermRow } from '@/types/amazon'

interface AmazonDiagnosticsInput {
  campaigns: AmazonCampaign[]
  searchTerms: AmazonSearchTermRow[]
  profileId: string
}

const DEFAULT_TARGET_ACOS = 0.3

export function runAmazonDiagnostics(input: AmazonDiagnosticsInput): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = []

  issues.push(
    ...checkHighAcosCampaigns(input.campaigns, input.searchTerms),
    ...checkZeroConversionKeywords(input.searchTerms),
    ...checkUnderperformingCampaigns(input.campaigns, input.searchTerms),
    ...checkMissingBrandedKeywords(input.searchTerms),
    ...checkSpendConcentrationRisk(input.campaigns, input.searchTerms),
    ...checkAutoCampaignCannibalization(input.campaigns),
  )

  return issues
}

function checkHighAcosCampaigns(
  campaigns: AmazonCampaign[],
  searchTerms: AmazonSearchTermRow[]
): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = []

  // Aggregate spend and sales per campaign
  const campaignStats = new Map<string, { spend: number; sales: number }>()
  for (const st of searchTerms) {
    const name = st.campaignName
    if (!campaignStats.has(name)) campaignStats.set(name, { spend: 0, sales: 0 })
    const stats = campaignStats.get(name)!
    stats.spend += st.cost
    stats.sales += st.sales7d
  }

  for (const [campaignName, stats] of campaignStats) {
    if (stats.spend < 5000) continue
    const acos = stats.sales > 0 ? stats.spend / stats.sales : 1
    if (acos > DEFAULT_TARGET_ACOS) {
      const campaign = campaigns.find((c) => c.name === campaignName)
      issues.push({
        platform: 'amazon',
        issue_type: 'high_acos',
        severity: 'high',
        title: `ACOS ${Math.round(acos * 100)}% exceeds target — profitability at risk: "${campaignName}"`,
        description: `This campaign's ACOS is ${Math.round(acos * 100)}% against a target of ${Math.round(DEFAULT_TARGET_ACOS * 100)}%. For every ₹100 in sales, you're spending $${Math.round(acos * 100)} on ads — above the profitable threshold.`,
        affected_entity_type: 'campaign',
        affected_entity_id: campaign?.campaignId ?? campaignName,
        affected_entity_name: campaignName,
        estimated_impact_inr: Math.round(stats.spend - stats.sales * DEFAULT_TARGET_ACOS),
        raw_data: { acos, target_acos: DEFAULT_TARGET_ACOS, spend: stats.spend, sales: stats.sales },
      })
    }
  }

  return issues
}

function checkZeroConversionKeywords(searchTerms: AmazonSearchTermRow[]): DiagnosticIssue[] {
  const wastedTerms = searchTerms.filter(
    (st) => st.clicks >= 50 && st.purchases7d === 0
  )

  if (wastedTerms.length === 0) return []

  const totalWasted = wastedTerms.reduce((sum, st) => sum + st.cost, 0)

  return [
    {
      platform: 'amazon',
      issue_type: 'zero_conversion_keywords',
      severity: 'high',
      title: `${wastedTerms.length} search terms wasting spend with zero orders — add as negatives`,
      description: `${wastedTerms.length} search terms have received 50+ clicks with zero purchases. Adding these as negative keywords will stop budget waste and improve overall ACOS. Total wasted: $${Math.round(totalWasted).toLocaleString('en-US')}.`,
      affected_entity_type: 'keyword',
      affected_entity_id: wastedTerms[0].searchTerm,
      affected_entity_name: wastedTerms.slice(0, 5).map((t) => t.searchTerm).join(', '),
      estimated_impact_inr: Math.round(totalWasted),
      raw_data: {
        term_count: wastedTerms.length,
        total_wasted: totalWasted,
        terms: wastedTerms.slice(0, 20).map((t) => ({
          term: t.searchTerm,
          clicks: t.clicks,
          cost: t.cost,
          campaign: t.campaignName,
        })),
      },
    },
  ]
}

function checkUnderperformingCampaigns(
  campaigns: AmazonCampaign[],
  searchTerms: AmazonSearchTermRow[]
): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = []

  const campaignImpressions = new Map<string, number>()
  for (const st of searchTerms) {
    const existing = campaignImpressions.get(st.campaignName) ?? 0
    campaignImpressions.set(st.campaignName, existing + st.impressions)
  }

  for (const campaign of campaigns) {
    if (campaign.state !== 'enabled') continue
    const impressions = campaignImpressions.get(campaign.name) ?? 0
    const dailyBudget = campaign.dailyBudget

    // Campaign has budget but very few impressions — likely bid too low
    if (dailyBudget > 500 && impressions < 100) {
      issues.push({
        platform: 'amazon',
        issue_type: 'underperforming_campaign',
        severity: 'medium',
        title: `Budget unused — bids likely too low: "${campaign.name}"`,
        description: `This campaign has a daily budget of $${campaign.dailyBudget} but received only ${impressions} impressions in the last 30 days. Increase bids to compete for page 1 placements.`,
        affected_entity_type: 'campaign',
        affected_entity_id: campaign.campaignId,
        affected_entity_name: campaign.name,
        estimated_impact_inr: 0,
        raw_data: { daily_budget: dailyBudget, impressions_30d: impressions },
      })
    }
  }

  return issues
}

function checkMissingBrandedKeywords(searchTerms: AmazonSearchTermRow[]): DiagnosticIssue[] {
  // Heuristic: if search terms show impressions but no branded campaign evident
  // Look for patterns like high impression rank terms with low conversion
  const highImpressTerms = searchTerms.filter(
    (st) => st.searchTermImpressionRank <= 5 && st.purchases7d === 0
  )

  if (highImpressTerms.length < 3) return []

  return [
    {
      platform: 'amazon',
      issue_type: 'missing_branded_keywords',
      severity: 'high',
      title: 'High-impression search terms converting poorly — review branded coverage',
      description: `${highImpressTerms.length} search terms appearing in the top 5 impression rank positions are generating zero purchases. Competitors may be capturing your brand traffic.`,
      affected_entity_type: 'account',
      affected_entity_id: 'account',
      affected_entity_name: 'Amazon Ads Account',
      estimated_impact_inr: Math.round(
        highImpressTerms.reduce((sum, t) => sum + t.cost, 0)
      ),
      raw_data: {
        term_count: highImpressTerms.length,
        terms: highImpressTerms.slice(0, 10).map((t) => ({
          term: t.searchTerm,
          rank: t.searchTermImpressionRank,
          impressions: t.impressions,
        })),
      },
    },
  ]
}

function checkSpendConcentrationRisk(
  campaigns: AmazonCampaign[],
  searchTerms: AmazonSearchTermRow[]
): DiagnosticIssue[] {
  const campaignSpend = new Map<string, number>()
  let totalSpend = 0

  for (const st of searchTerms) {
    const existing = campaignSpend.get(st.campaignName) ?? 0
    campaignSpend.set(st.campaignName, existing + st.cost)
    totalSpend += st.cost
  }

  if (totalSpend === 0) return []

  for (const [name, spend] of campaignSpend) {
    const concentration = spend / totalSpend
    if (concentration > 0.7 && totalSpend > 10000) {
      const campaign = campaigns.find((c) => c.name === name)
      return [
        {
          platform: 'amazon',
          issue_type: 'spend_concentration',
          severity: 'low',
          title: `${Math.round(concentration * 100)}% of budget in one campaign — high concentration risk`,
          description: `"${name}" accounts for ${Math.round(concentration * 100)}% of your total Amazon ad spend. If this campaign underperforms or pauses, your entire advertising program is affected.`,
          affected_entity_type: 'campaign',
          affected_entity_id: campaign?.campaignId ?? name,
          affected_entity_name: name,
          estimated_impact_inr: 0,
          raw_data: { campaign: name, spend, total_spend: totalSpend, concentration },
        },
      ]
    }
  }

  return []
}

function checkAutoCampaignCannibalization(campaigns: AmazonCampaign[]): DiagnosticIssue[] {
  const autoCampaigns = campaigns.filter(
    (c) => c.targetingType === 'auto' && c.state === 'enabled'
  )
  const manualCampaigns = campaigns.filter(
    (c) => c.targetingType === 'manual' && c.state === 'enabled'
  )

  if (autoCampaigns.length === 0 || manualCampaigns.length === 0) return []

  return [
    {
      platform: 'amazon',
      issue_type: 'auto_manual_cannibalization',
      severity: 'medium',
      title: 'Auto and manual campaigns competing on same terms',
      description: `You have ${autoCampaigns.length} auto-targeting campaign(s) running alongside ${manualCampaigns.length} manual campaign(s). Without proper negative keywords on the auto campaigns, they compete for the same traffic and inflate your bids.`,
      affected_entity_type: 'account',
      affected_entity_id: 'account',
      affected_entity_name: 'Amazon Ads Account',
      estimated_impact_inr: 0,
      raw_data: {
        auto_campaigns: autoCampaigns.map((c) => c.name),
        manual_campaigns: manualCampaigns.map((c) => c.name),
      },
    },
  ]
}
