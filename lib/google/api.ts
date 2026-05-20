import type { GoogleCampaignRow, GoogleKeywordRow, GoogleConversionAction } from '@/types/google'
import { withRetry } from '@/lib/utils/errors'

const GOOGLE_ADS_API = 'https://googleads.googleapis.com/v17'

async function gaqlSearch<T>(
  accessToken: string,
  customerId: string,
  developerToken: string,
  query: string
): Promise<T[]> {
  return withRetry(async () => {
    const res = await fetch(
      `${GOOGLE_ADS_API}/customers/${customerId}/googleAds:search`,
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
  developerToken: string
): Promise<GoogleCampaignRow[]> {
  return gaqlSearch<GoogleCampaignRow>(
    accessToken,
    customerId,
    developerToken,
    `SELECT campaign.id, campaign.name, campaign.status,
            metrics.cost_micros, metrics.conversions, metrics.clicks,
            metrics.impressions, metrics.search_impression_share,
            metrics.search_budget_lost_impression_share,
            metrics.ctr, metrics.average_cpc
     FROM campaign
     WHERE segments.date DURING LAST_30_DAYS
       AND campaign.status != 'REMOVED'`
  )
}

export async function fetchKeywordPerformance(
  accessToken: string,
  customerId: string,
  developerToken: string
): Promise<GoogleKeywordRow[]> {
  return gaqlSearch<GoogleKeywordRow>(
    accessToken,
    customerId,
    developerToken,
    `SELECT ad_group_criterion.keyword.text, ad_group_criterion.status,
            ad_group_criterion.quality_info.quality_score,
            ad_group_criterion.quality_info.creative_quality_score,
            ad_group_criterion.quality_info.post_click_quality_score,
            metrics.cost_micros, metrics.conversions, metrics.clicks,
            campaign.name, ad_group.name
     FROM keyword_view
     WHERE segments.date DURING LAST_30_DAYS
       AND campaign.status = 'ENABLED'
       AND ad_group.status = 'ENABLED'`
  )
}

export async function fetchConversionActions(
  accessToken: string,
  customerId: string,
  developerToken: string
): Promise<GoogleConversionAction[]> {
  return gaqlSearch<GoogleConversionAction>(
    accessToken,
    customerId,
    developerToken,
    `SELECT conversion_action.id, conversion_action.name,
            conversion_action.status, conversion_action.type,
            metrics.all_conversions
     FROM conversion_action`
  )
}

export function microsToCost(micros: string | number): number {
  return Number(micros) / 1_000_000
}
