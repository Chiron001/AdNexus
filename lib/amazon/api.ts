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

export async function fetchCampaignList(
  accessToken: string,
  profileId: string
): Promise<AmazonCampaign[]> {
  const res = await fetch(
    `${AMAZON_ADS_API}/v2/sp/campaigns?state=enabled,paused`,
    { headers: amazonHeaders(accessToken, profileId) }
  )
  if (!res.ok) throw new Error(`Amazon campaigns fetch failed: ${res.statusText}`)
  return res.json()
}

export async function requestSearchTermReport(
  accessToken: string,
  profileId: string
): Promise<string> {
  const today = new Date()
  const endDate = today.toISOString().split('T')[0]
  const startDate = new Date(today.setDate(today.getDate() - 30))
    .toISOString()
    .split('T')[0]

  const res = await fetch(`${AMAZON_ADS_API}/reporting/reports`, {
    method: 'POST',
    headers: amazonHeaders(accessToken, profileId),
    body: JSON.stringify({
      name: 'AdNexus Search Term Report',
      reportType: 'spSearchTerm',
      startDate,
      endDate,
      metrics: [
        'impressions', 'clicks', 'cost', 'sales7d', 'acos7d',
        'roas7d', 'purchases7d', 'unitsSoldClicks7d', 'searchTermImpressionRank',
      ],
      groupBy: ['searchTerm', 'campaign', 'adGroup'],
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
