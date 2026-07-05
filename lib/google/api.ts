import type { GoogleCampaignRow, GoogleKeywordRow, GoogleConversionAction } from '@/types/google'
import { withRetry } from '@/lib/utils/errors'

const GOOGLE_ADS_API = 'https://googleads.googleapis.com/v21'

function defaultRange() {
  const until = new Date().toISOString().split('T')[0]
  const d = new Date(); d.setFullYear(d.getFullYear() - 2)
  return { since: d.toISOString().split('T')[0], until }
}

async function gaqlSearch<T>(
  accessToken: string,
  customerId: string,
  developerToken: string,
  query: string
): Promise<T[]> {
  const cleanId = customerId.replace(/-/g, '') // API requires no dashes; UI shows 223-129-7631 but endpoint needs 2231297631
  return withRetry(async () => {
    const res = await fetch(
      `${GOOGLE_ADS_API}/customers/${cleanId}/googleAds:search`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'developer-token': developerToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      }
    )
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(`Google Ads API error ${res.status}: ${JSON.stringify(err)}`)
    }
    const data = await res.json()
    return (data.results ?? []) as T[]
  })
}

export async function fetchCampaignPerformance(
  accessToken: string,
  customerId: string,
  developerToken: string,
  since?: string,
  until?: string
): Promise<GoogleCampaignRow[]> {
  const r = defaultRange()
  const from = since ?? r.since
  const to   = until ?? r.until
  return gaqlSearch<GoogleCampaignRow>(accessToken, customerId, developerToken, `
    SELECT
      campaign.id, campaign.name, campaign.status,
      campaign.advertising_channel_type, campaign.bidding_strategy_type,
      metrics.cost_micros, metrics.impressions, metrics.clicks, metrics.ctr,
      metrics.average_cpc, metrics.average_cpm, metrics.average_cpv,
      metrics.conversions, metrics.conversions_value, metrics.cost_per_conversion,
      metrics.all_conversions, metrics.all_conversions_value,
      metrics.view_through_conversions,
      metrics.video_views, metrics.video_view_rate,
      metrics.video_quartile_p25_rate, metrics.video_quartile_p50_rate,
      metrics.video_quartile_p75_rate, metrics.video_quartile_p100_rate,
      metrics.search_impression_share, metrics.search_top_impression_share,
      metrics.search_absolute_top_impression_share,
      metrics.search_budget_lost_absolute_top_impression_share,
      metrics.search_rank_lost_impression_share,
      segments.date
    FROM campaign
    WHERE segments.date BETWEEN '${from}' AND '${to}'
      AND campaign.status != 'REMOVED'
    ORDER BY segments.date ASC
  `)
}

export async function fetchAdGroupPerformance(
  accessToken: string,
  customerId: string,
  developerToken: string,
  since?: string,
  until?: string
): Promise<any[]> {
  const r = defaultRange()
  const from = since ?? r.since
  const to   = until ?? r.until
  return gaqlSearch<any>(accessToken, customerId, developerToken, `
    SELECT
      ad_group.id, ad_group.name, ad_group.status,
      campaign.id, campaign.name,
      metrics.cost_micros, metrics.impressions, metrics.clicks, metrics.ctr,
      metrics.average_cpc, metrics.average_cpm,
      metrics.conversions, metrics.conversions_value,
      metrics.search_impression_share,
      segments.date
    FROM ad_group
    WHERE segments.date BETWEEN '${from}' AND '${to}'
      AND ad_group.status != 'REMOVED'
      AND campaign.status != 'REMOVED'
    ORDER BY segments.date ASC
  `)
}

export async function fetchAdPerformance(
  accessToken: string,
  customerId: string,
  developerToken: string,
  since?: string,
  until?: string
): Promise<any[]> {
  const r = defaultRange()
  const from = since ?? r.since
  const to   = until ?? r.until
  return gaqlSearch<any>(accessToken, customerId, developerToken, `
    SELECT
      ad_group_ad.ad.id, ad_group_ad.ad.name, ad_group_ad.status,
      ad_group_ad.ad.type,
      ad_group.id, ad_group.name,
      campaign.id, campaign.name,
      metrics.cost_micros, metrics.impressions, metrics.clicks, metrics.ctr,
      metrics.average_cpc, metrics.average_cpm,
      metrics.conversions, metrics.conversions_value,
      metrics.video_views, metrics.video_view_rate,
      segments.date
    FROM ad_group_ad
    WHERE segments.date BETWEEN '${from}' AND '${to}'
      AND ad_group_ad.status != 'REMOVED'
      AND campaign.status != 'REMOVED'
    ORDER BY segments.date ASC
  `)
}

export async function fetchKeywordPerformance(
  accessToken: string,
  customerId: string,
  developerToken: string,
  since?: string,
  until?: string
): Promise<GoogleKeywordRow[]> {
  const r = defaultRange()
  const from = since ?? r.since
  const to   = until ?? r.until
  return gaqlSearch<GoogleKeywordRow>(accessToken, customerId, developerToken, `
    SELECT
      ad_group_criterion.keyword.text, ad_group_criterion.status,
      ad_group_criterion.quality_info.quality_score,
      ad_group_criterion.quality_info.creative_quality_score,
      ad_group_criterion.quality_info.post_click_quality_score,
      metrics.cost_micros, metrics.conversions, metrics.clicks,
      metrics.impressions, metrics.ctr, metrics.average_cpc,
      campaign.id, campaign.name,
      ad_group.id, ad_group.name,
      segments.date
    FROM keyword_view
    WHERE segments.date BETWEEN '${from}' AND '${to}'
      AND campaign.status = 'ENABLED'
      AND ad_group.status = 'ENABLED'
    ORDER BY segments.date ASC
  `)
}

export async function testCampaignAccess(
  accessToken: string,
  customerId: string,
  developerToken: string
): Promise<{ count: number; names: string[] }> {
  const rows = await gaqlSearch<{ campaign: { id: string; name: string } }>(
    accessToken, customerId, developerToken,
    `SELECT campaign.id, campaign.name FROM campaign
     WHERE campaign.status != 'REMOVED'
     ORDER BY campaign.id LIMIT 20`
  )
  return {
    count: rows.length,
    names: rows.map(r => r.campaign?.name ?? '').filter(Boolean).slice(0, 5),
  }
}

export async function fetchConversionActions(
  accessToken: string,
  customerId: string,
  developerToken: string
): Promise<GoogleConversionAction[]> {
  return gaqlSearch<GoogleConversionAction>(accessToken, customerId, developerToken, `
    SELECT
      conversion_action.id, conversion_action.name,
      conversion_action.status, conversion_action.type,
      conversion_action.category, conversion_action.counting_type,
      metrics.all_conversions, metrics.all_conversions_value
    FROM conversion_action
  `)
}

export function microsToCost(micros: string | number): number {
  return Number(micros) / 1_000_000
}

export function googleRowToMetrics(row: GoogleCampaignRow) {
  const spend         = microsToCost(row.metrics.cost_micros)
  const conversions   = parseFloat(String(row.metrics.conversions ?? 0))
  const convValue     = parseFloat(String(row.metrics.conversions_value ?? 0))
  const impressions   = parseInt(String(row.metrics.impressions ?? 0))
  const clicks        = parseInt(String(row.metrics.clicks ?? 0))
  const roas          = spend > 0 && convValue > 0 ? convValue / spend : 0
  const cpa           = spend > 0 && conversions > 0 ? spend / conversions : 0

  return {
    spend,
    impressions,
    clicks,
    ctr:                        parseFloat(String(row.metrics.ctr ?? 0)) * 100,
    cpc:                        microsToCost(row.metrics.average_cpc),
    cpm:                        microsToCost(row.metrics.average_cpm ?? 0),
    average_cpv:                microsToCost(row.metrics.average_cpv ?? 0),
    purchases:                  Math.round(conversions),
    purchase_value:             convValue,
    revenue:                    convValue,
    conversions:                Math.round(conversions),
    all_conversions:            parseFloat(String(row.metrics.all_conversions ?? 0)),
    all_conversions_value:      parseFloat(String(row.metrics.all_conversions_value ?? 0)),
    view_through_conversions:   parseInt(String(row.metrics.view_through_conversions ?? 0)),
    roas,
    cpa,
    video_views:                parseInt(String(row.metrics.video_views ?? 0)),
    video_view_rate:            parseFloat(String(row.metrics.video_view_rate ?? 0)) * 100,
    video_quartile_p25_rate:    parseFloat(String(row.metrics.video_quartile_p25_rate ?? 0)) * 100,
    video_quartile_p50_rate:    parseFloat(String(row.metrics.video_quartile_p50_rate ?? 0)) * 100,
    video_quartile_p75_rate:    parseFloat(String(row.metrics.video_quartile_p75_rate ?? 0)) * 100,
    video_quartile_p100_rate:   parseFloat(String(row.metrics.video_quartile_p100_rate ?? 0)) * 100,
    search_impression_share:    parseFloat(String(row.metrics.search_impression_share ?? 0)),
    search_top_impression_share: parseFloat(String(row.metrics.search_top_impression_share ?? 0)),
    search_abs_top_impression_share: parseFloat(String(row.metrics.search_absolute_top_impression_share ?? 0)),
    search_budget_lost_is:      parseFloat(String(row.metrics.search_budget_lost_absolute_top_impression_share ?? 0)),
    search_rank_lost_is:        parseFloat(String(row.metrics.search_rank_lost_impression_share ?? 0)),
    campaign_status:            row.campaign.status ?? null,
    campaign_objective:         row.campaign.advertising_channel_type ?? null,
    bid_strategy:               row.campaign.bidding_strategy_type ?? null,
    raw_data:                   { metrics: row.metrics },
  }
}
