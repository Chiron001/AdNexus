import type { MetaCampaignInsight, MetaAdSet, MetaAd } from '@/types/meta'
import { withRetry } from '@/lib/utils/errors'

const META_API_VERSION = 'v20.0'
const BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`

async function metaFetch<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (res.status === 429) {
    const err = new Error('Meta rate limit hit')
    ;(err as Error & { code: number }).code = 80004
    throw err
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(`Meta API error: ${body?.error?.message || res.statusText}`)
  }
  return res.json()
}

export async function fetchCampaignInsights(
  accessToken: string,
  accountId: string,
  datePreset = 'last_30d'
): Promise<MetaCampaignInsight[]> {
  return withRetry(async () => {
    const fields = [
      'campaign_id', 'campaign_name', 'spend', 'impressions', 'clicks',
      'reach', 'frequency', 'actions', 'action_values', 'ctr', 'cpc', 'cpm', 'cpp',
    ].join(',')

    const params = new URLSearchParams({
      fields,
      level: 'campaign',
      date_preset: datePreset,
      access_token: accessToken,
    })

    const url = `${BASE_URL}/act_${accountId}/insights?${params.toString()}`
    const data = await metaFetch<{ data: MetaCampaignInsight[] }>(url)
    return data.data ?? []
  }, 3)
}

export async function fetchAdSets(
  accessToken: string,
  accountId: string
): Promise<MetaAdSet[]> {
  return withRetry(async () => {
    const fields = [
      'id', 'name', 'status', 'targeting', 'budget_remaining',
      'daily_budget', 'optimization_goal', 'billing_event', 'campaign_id',
    ].join(',')

    const params = new URLSearchParams({
      fields,
      filtering: JSON.stringify([{ field: 'effective_status', operator: 'IN', value: ['ACTIVE'] }]),
      access_token: accessToken,
      limit: '100',
    })

    const url = `${BASE_URL}/act_${accountId}/adsets?${params.toString()}`
    const data = await metaFetch<{ data: MetaAdSet[] }>(url)
    return data.data ?? []
  }, 3)
}

export async function fetchCreativePerformance(
  accessToken: string,
  accountId: string
): Promise<MetaAd[]> {
  return withRetry(async () => {
    const fields = [
      'id', 'name', 'status', 'adset_id', 'creative',
      'insights{ctr,impressions,spend,frequency}',
    ].join(',')

    const params = new URLSearchParams({
      fields,
      filtering: JSON.stringify([{ field: 'effective_status', operator: 'IN', value: ['ACTIVE'] }]),
      access_token: accessToken,
      limit: '200',
    })

    const url = `${BASE_URL}/act_${accountId}/ads?${params.toString()}`
    const data = await metaFetch<{ data: MetaAd[] }>(url)
    return data.data ?? []
  }, 3)
}

export function extractConversions(insight: MetaCampaignInsight): number {
  const purchaseAction = insight.actions?.find(
    (a) => a.action_type === 'purchase' || a.action_type === 'offsite_conversion.fb_pixel_purchase'
  )
  return purchaseAction ? parseFloat(purchaseAction.value) : 0
}

export function extractRevenue(insight: MetaCampaignInsight): number {
  const purchaseValue = insight.action_values?.find(
    (a) => a.action_type === 'purchase' || a.action_type === 'offsite_conversion.fb_pixel_purchase'
  )
  return purchaseValue ? parseFloat(purchaseValue.value) : 0
}
