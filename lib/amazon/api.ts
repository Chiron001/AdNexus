import type { AmazonCampaign, AmazonSearchTermRow, AmazonReportRequest } from '@/types/amazon'

const AMAZON_ADS_API = 'https://advertising-api-fe.amazon.com'

function amazonHeaders(accessToken: string, profileId: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    'Amazon-Advertising-API-ClientId': process.env.AMAZON_CLIENT_ID!,
    'Amazon-Advertising-API-Scope': profileId,
    'Content-Type': 'application/json',
  }
}

function defaultRange() {
  const until = new Date().toISOString().split('T')[0]
  const d = new Date(); d.setFullYear(d.getFullYear() - 2)
  return { since: d.toISOString().split('T')[0], until }
}

export async function fetchCampaignList(
  accessToken: string,
  profileId: string
): Promise<AmazonCampaign[]> {
  const res = await fetch(
    `${AMAZON_ADS_API}/v2/sp/campaigns?state=enabled,paused,archived`,
    { headers: amazonHeaders(accessToken, profileId) }
  )
  if (!res.ok) throw new Error(`Amazon campaigns fetch failed: ${res.statusText}`)
  return res.json()
}

export async function fetchSBCampaignList(
  accessToken: string,
  profileId: string
): Promise<AmazonCampaign[]> {
  const res = await fetch(
    `${AMAZON_ADS_API}/v4/campaigns?state=enabled,paused,archived`,
    { headers: { ...amazonHeaders(accessToken, profileId), 'Content-Type': 'application/vnd.sbanext.v1+json' } }
  )
  if (!res.ok) return [] // SB may not be enabled
  const data = await res.json()
  return data.campaigns ?? []
}

// Request a comprehensive campaign metrics report (v3 async API)
export async function requestCampaignReport(
  accessToken: string,
  profileId: string,
  adProduct: 'SPONSORED_PRODUCTS' | 'SPONSORED_BRANDS' | 'SPONSORED_DISPLAY',
  since?: string,
  until?: string
): Promise<string> {
  const r = defaultRange()
  const startDate = since ?? r.since
  const endDate   = until ?? r.until

  const res = await fetch(`${AMAZON_ADS_API}/reporting/reports`, {
    method: 'POST',
    headers: amazonHeaders(accessToken, profileId),
    body: JSON.stringify({
      name: `Adnexusone ${adProduct} Campaign Report`,
      startDate,
      endDate,
      configuration: {
        adProduct,
        groupBy: ['campaign'],
        columns: adProduct === 'SPONSORED_PRODUCTS'
          ? [
              'campaignId','campaignName','campaignStatus','campaignBudget','campaignBudgetType',
              'impressions','clicks','clickThroughRate','cost','costPerClick','costPerMille',
              'purchases1d','purchases7d','purchases14d','purchases30d',
              'purchasesSameSku7d','purchasesSameSku14d',
              'sales1d','sales7d','sales14d','sales30d',
              'attributedSalesSameSku7d','attributedSalesSameSku14d',
              'unitsSoldClicks7d','unitsSoldClicks14d',
              'roasClicks7d','roasClicks14d',
              'newToBrandPurchases7d','newToBrandSales7d','newToBrandUnitsSold7d',
            ]
          : [
              'campaignId','campaignName','campaignStatus','campaignBudget',
              'impressions','clicks','clickThroughRate','cost','costPerClick',
              'purchases14d','sales14d','unitsSoldClicks14d',
              'newToBrandPurchases14d','newToBrandSales14d',
              'brandedSearches14d','detailPageViews14d',
            ],
        reportTypeId: adProduct === 'SPONSORED_PRODUCTS' ? 'spCampaigns' : 'sbCampaigns',
        timeUnit: 'DAILY',
        format: 'GZIP_JSON',
      },
    }),
  })
  if (!res.ok) throw new Error(`Amazon report request failed: ${res.statusText}`)
  const data = await res.json()
  return data.reportId as string
}

// Legacy SP search term report (kept for diagnostics)
export async function requestSearchTermReport(
  accessToken: string,
  profileId: string
): Promise<string> {
  const today    = new Date()
  const endDate  = today.toISOString().split('T')[0]
  const start    = new Date(today); start.setDate(start.getDate() - 30)
  const startDate = start.toISOString().split('T')[0]

  const res = await fetch(`${AMAZON_ADS_API}/reporting/reports`, {
    method: 'POST',
    headers: amazonHeaders(accessToken, profileId),
    body: JSON.stringify({
      name: 'Adnexusone Search Term Report',
      reportType: 'spSearchTerm',
      startDate,
      endDate,
      metrics: [
        'impressions','clicks','cost','sales7d','acos7d',
        'roas7d','purchases7d','unitsSoldClicks7d','searchTermImpressionRank',
      ],
      groupBy: ['searchTerm','campaign','adGroup'],
    }),
  })
  if (!res.ok) throw new Error(`Amazon report request failed: ${res.statusText}`)
  const data = await res.json()
  return data.reportId as string
}

export async function pollReportStatus(
  accessToken: string,
  profileId: string,
  reportId: string
): Promise<AmazonReportRequest> {
  const res = await fetch(
    `${AMAZON_ADS_API}/reporting/reports/${reportId}`,
    { headers: amazonHeaders(accessToken, profileId) }
  )
  if (!res.ok) throw new Error(`Amazon report poll failed: ${res.statusText}`)
  return res.json()
}

export async function downloadReport(url: string): Promise<AmazonSearchTermRow[]> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Amazon report download failed: ${res.statusText}`)
  const data = await res.json()
  return data as AmazonSearchTermRow[]
}

export async function waitForReport(
  accessToken: string,
  profileId: string,
  reportId: string,
  maxWaitMs = 300_000
): Promise<AmazonSearchTermRow[]> {
  const intervals = [10_000, 20_000, 30_000, 30_000, 30_000, 30_000, 30_000, 30_000, 30_000, 30_000]
  let waited = 0

  for (const interval of intervals) {
    if (waited >= maxWaitMs) break
    await new Promise((r) => setTimeout(r, interval))
    waited += interval

    const status = await pollReportStatus(accessToken, profileId, reportId)
    if (status.status === 'COMPLETED' && status.url) {
      return downloadReport(status.url)
    }
    if (status.status === 'FAILED') {
      throw new Error('Amazon report generation failed')
    }
  }

  throw new Error('Amazon report timed out after 5 minutes')
}

// Convert an Amazon campaign report row to DB metrics
export function amazonRowToMetrics(row: Record<string, any>) {
  const spend    = parseFloat(row.cost ?? row.spend ?? 0)
  const revenue  = parseFloat(row.sales14d ?? row.sales7d ?? row.sales30d ?? 0)
  const clicks   = parseInt(row.clicks ?? 0)
  const impressions = parseInt(row.impressions ?? 0)
  const purchases = parseInt(row.purchases14d ?? row.purchases7d ?? row.purchases30d ?? 0)
  const roas     = spend > 0 && revenue > 0 ? revenue / spend : 0
  const cpa      = spend > 0 && purchases > 0 ? spend / purchases : 0
  const cpc      = clicks > 0 ? spend / clicks : 0
  const cpm      = impressions > 0 ? (spend / impressions) * 1000 : 0
  const ctr      = impressions > 0 ? (clicks / impressions) * 100 : 0
  const acos     = revenue > 0 ? (spend / revenue) * 100 : 0

  return {
    spend, revenue, impressions, clicks,
    purchases,
    purchase_value:       revenue,
    conversions:          purchases,
    ctr, cpc, cpm, roas, cpa, acos,
    new_to_brand_orders:  parseInt(row.newToBrandPurchases14d ?? row.newToBrandPurchases7d ?? 0),
    new_to_brand_sales:   parseFloat(row.newToBrandSales14d ?? row.newToBrandSales7d ?? 0),
    detail_page_views:    parseInt(row.detailPageViews14d ?? 0),
    branded_searches:     parseInt(row.brandedSearches14d ?? 0),
    campaign_status:      row.campaignStatus ?? null,
    raw_data:             row,
  }
}
