import type { MetaAdSet, MetaAd } from '@/types/meta'
import { withRetry } from '@/lib/utils/errors'

const META_API_VERSION = 'v20.0'
const BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`

// Maps Meta action_type strings → DB column names
const ACTION_COUNT_MAP: Record<string, string> = {
  purchase: 'purchases', omni_purchase: 'purchases',
  website_purchase: 'purchases',
  'offsite_conversion.fb_pixel_purchase': 'purchases',
  'app_custom_event.fb_mobile_purchase': 'purchases',
  onsite_web_purchase: 'purchases',

  add_to_cart: 'add_to_carts', omni_add_to_cart: 'add_to_carts',
  website_add_to_cart: 'add_to_carts',
  'offsite_conversion.fb_pixel_add_to_cart': 'add_to_carts',

  initiate_checkout: 'checkouts_initiated',
  omni_initiated_checkout: 'checkouts_initiated',
  'offsite_conversion.fb_pixel_initiate_checkout': 'checkouts_initiated',

  lead: 'leads', omni_lead: 'leads',
  'offsite_conversion.fb_pixel_lead': 'leads',

  complete_registration: 'registrations_completed',
  'offsite_conversion.fb_pixel_complete_registration': 'registrations_completed',

  view_content: 'content_views', omni_view_content: 'content_views',
  'offsite_conversion.fb_pixel_view_content': 'content_views',

  app_install: 'app_installs', mobile_app_install: 'app_installs',

  landing_page_view: 'landing_page_views',

  link_click: 'link_clicks',

  post_engagement: 'post_engagements',
  post_reaction: 'post_reactions', like: 'post_reactions',
  comment: 'post_comments',
  share: 'post_shares',
  page_like: 'page_likes',

  video_view: 'video_views',
  thruplay: 'video_thruplay',

  subscribe: 'subscriptions',
  contact: 'contacts',
}

const ACTION_VALUE_MAP: Record<string, string> = {
  purchase: 'purchase_value', omni_purchase: 'purchase_value',
  website_purchase: 'purchase_value',
  'offsite_conversion.fb_pixel_purchase': 'purchase_value',

  add_to_cart: 'add_to_cart_value', omni_add_to_cart: 'add_to_cart_value',
  'offsite_conversion.fb_pixel_add_to_cart': 'add_to_cart_value',

  lead: 'lead_value', omni_lead: 'lead_value',
}

type ActionArr = Array<{ action_type: string; value: string }> | undefined

async function metaFetch<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (res.status === 429) {
    const err = new Error('Meta rate limit hit') as Error & { code: number }
    err.code = 80004
    throw err
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(`Meta API error: ${body?.error?.message ?? res.statusText}`)
  }
  return res.json()
}

async function paginate<T>(url: string): Promise<T[]> {
  const data = await metaFetch<{ data: T[]; paging?: { next?: string } }>(url)
  let all = data.data ?? []
  let next = data.paging?.next
  while (next) {
    const page = await metaFetch<{ data: T[]; paging?: { next?: string } }>(next)
    all = all.concat(page.data ?? [])
    next = page.paging?.next
  }
  return all
}

function defaultRange() {
  const until = new Date().toISOString().split('T')[0]
  const d = new Date(); d.setFullYear(d.getFullYear() - 2)
  return { since: d.toISOString().split('T')[0], until }
}

// All insight fields we request
const INSIGHT_FIELDS = [
  'campaign_id','campaign_name','objective','buying_type',
  'spend','impressions','reach','frequency',
  'clicks','unique_clicks',
  'ctr','unique_ctr','cpc','cpm','cpp','cost_per_unique_click',
  'actions','action_values','cost_per_action_type',
  'video_p25_watched_actions','video_p50_watched_actions',
  'video_p75_watched_actions','video_p100_watched_actions',
  'video_avg_time_watched_actions','video_30_sec_watched_actions',
  'quality_ranking','engagement_rate_ranking','conversion_rate_ranking',
  'date_start','date_stop',
].join(',')

export interface MetaInsightRow {
  campaign_id: string
  campaign_name: string
  objective?: string
  buying_type?: string
  spend: string
  impressions: string
  reach?: string
  frequency?: string
  clicks: string
  unique_clicks?: string
  ctr: string
  unique_ctr?: string
  cpc: string
  cpm: string
  cpp?: string
  cost_per_unique_click?: string
  actions?: Array<{ action_type: string; value: string }>
  action_values?: Array<{ action_type: string; value: string }>
  cost_per_action_type?: Array<{ action_type: string; value: string }>
  video_p25_watched_actions?: ActionArr
  video_p50_watched_actions?: ActionArr
  video_p75_watched_actions?: ActionArr
  video_p100_watched_actions?: ActionArr
  video_avg_time_watched_actions?: ActionArr
  video_30_sec_watched_actions?: ActionArr
  quality_ranking?: string
  engagement_rate_ranking?: string
  conversion_rate_ranking?: string
  date_start: string
  date_stop: string
  adset_id?: string
  adset_name?: string
  ad_id?: string
  ad_name?: string
}

function insightParams(level: string, fields: string, since: string, until: string, token: string) {
  return new URLSearchParams({
    fields, level,
    time_range: JSON.stringify({ since, until }),
    time_increment: '1',
    access_token: token,
    limit: level === 'ad' ? '200' : '500',
  })
}

export async function fetchMetaCampaignInsights(
  token: string, accountId: string, since?: string, until?: string
): Promise<MetaInsightRow[]> {
  return withRetry(async () => {
    const r = defaultRange()
    const params = insightParams('campaign', INSIGHT_FIELDS, since ?? r.since, until ?? r.until, token)
    return paginate<MetaInsightRow>(`${BASE_URL}/act_${accountId}/insights?${params}`)
  }, 3)
}

export async function fetchMetaAdsetInsights(
  token: string, accountId: string, since?: string, until?: string
): Promise<MetaInsightRow[]> {
  return withRetry(async () => {
    const r = defaultRange()
    const fields = INSIGHT_FIELDS + ',adset_id,adset_name'
    const params = insightParams('adset', fields, since ?? r.since, until ?? r.until, token)
    return paginate<MetaInsightRow>(`${BASE_URL}/act_${accountId}/insights?${params}`)
  }, 3)
}

export async function fetchMetaAdInsights(
  token: string, accountId: string, since?: string, until?: string
): Promise<MetaInsightRow[]> {
  return withRetry(async () => {
    const r = defaultRange()
    const fields = INSIGHT_FIELDS + ',adset_id,adset_name,ad_id,ad_name'
    const params = insightParams('ad', fields, since ?? r.since, until ?? r.until, token)
    return paginate<MetaInsightRow>(`${BASE_URL}/act_${accountId}/insights?${params}`)
  }, 3)
}

export async function fetchMetaAdsets(token: string, accountId: string): Promise<MetaAdSet[]> {
  return withRetry(async () => {
    const fields = [
      'id','name','status','effective_status','targeting',
      'budget_remaining','daily_budget','lifetime_budget',
      'optimization_goal','billing_event','bid_amount','campaign_id',
    ].join(',')
    const params = new URLSearchParams({ fields, limit: '200', access_token: token })
    return paginate<MetaAdSet>(`${BASE_URL}/act_${accountId}/adsets?${params}`)
  }, 3)
}

export async function fetchMetaAds(token: string, accountId: string): Promise<MetaAd[]> {
  return withRetry(async () => {
    const fields = 'id,name,status,effective_status,adset_id,campaign_id,creative{id,name,object_type}'
    const params = new URLSearchParams({ fields, limit: '200', access_token: token })
    return paginate<MetaAd>(`${BASE_URL}/act_${accountId}/ads?${params}`)
  }, 3)
}

function sumActions(arr: ActionArr, map: Record<string, string>): Record<string, number> {
  const out: Record<string, number> = {}
  for (const a of arr ?? []) {
    const col = map[a.action_type]
    if (col) out[col] = (out[col] ?? 0) + parseFloat(a.value || '0')
  }
  return out
}

function sumVideoField(arr: ActionArr): number {
  return arr?.reduce((s, a) => s + parseFloat(a.value || '0'), 0) ?? 0
}

export function insightToMetrics(row: MetaInsightRow) {
  const counts = sumActions(row.actions, ACTION_COUNT_MAP)
  const values = sumActions(row.action_values, ACTION_VALUE_MAP)

  const purchases     = counts.purchases ?? 0
  const purchaseValue = values.purchase_value ?? 0
  const spend         = parseFloat(row.spend || '0')
  const roas          = spend > 0 && purchaseValue > 0 ? purchaseValue / spend : 0
  const cpa           = spend > 0 && purchases > 0 ? spend / purchases : 0

  return {
    spend,
    impressions:            parseInt(row.impressions || '0'),
    reach:                  parseInt(row.reach || '0'),
    frequency:              parseFloat(row.frequency || '0'),
    clicks:                 parseInt(row.clicks || '0'),
    unique_clicks:          parseInt(row.unique_clicks || '0'),
    link_clicks:            counts.link_clicks ?? 0,
    ctr:                    parseFloat(row.ctr || '0'),
    unique_ctr:             parseFloat(row.unique_ctr || '0'),
    cpc:                    parseFloat(row.cpc || '0'),
    cpm:                    parseFloat(row.cpm || '0'),
    cpp:                    parseFloat(row.cpp || '0'),
    cost_per_unique_click:  parseFloat(row.cost_per_unique_click || '0'),
    purchases,
    add_to_carts:           counts.add_to_carts ?? 0,
    checkouts_initiated:    counts.checkouts_initiated ?? 0,
    leads:                  counts.leads ?? 0,
    registrations_completed: counts.registrations_completed ?? 0,
    content_views:          counts.content_views ?? 0,
    app_installs:           counts.app_installs ?? 0,
    landing_page_views:     counts.landing_page_views ?? 0,
    subscriptions:          counts.subscriptions ?? 0,
    contacts:               counts.contacts ?? 0,
    post_engagements:       counts.post_engagements ?? 0,
    post_reactions:         counts.post_reactions ?? 0,
    post_comments:          counts.post_comments ?? 0,
    post_shares:            counts.post_shares ?? 0,
    page_likes:             counts.page_likes ?? 0,
    purchase_value:         purchaseValue,
    add_to_cart_value:      values.add_to_cart_value ?? 0,
    lead_value:             values.lead_value ?? 0,
    revenue:                purchaseValue,
    roas,
    cpa,
    conversions:            purchases,
    video_views:            counts.video_views ?? 0,
    video_thruplay:         counts.video_thruplay ?? 0,
    video_p25_views:        sumVideoField(row.video_p25_watched_actions),
    video_p50_views:        sumVideoField(row.video_p50_watched_actions),
    video_p75_views:        sumVideoField(row.video_p75_watched_actions),
    video_p100_views:       sumVideoField(row.video_p100_watched_actions),
    video_avg_watch_time:   sumVideoField(row.video_avg_time_watched_actions),
    video_30sec_views:      sumVideoField(row.video_30_sec_watched_actions),
    quality_ranking:            row.quality_ranking ?? null,
    engagement_rate_ranking:    row.engagement_rate_ranking ?? null,
    conversion_rate_ranking:    row.conversion_rate_ranking ?? null,
    campaign_objective:    row.objective ?? null,
    buying_type:           row.buying_type ?? null,
    raw_data: {
      actions:              row.actions,
      action_values:        row.action_values,
      cost_per_action_type: row.cost_per_action_type,
    },
  }
}

// Backward-compat aliases used by existing sync routes + diagnostics
export async function fetchCampaignInsights(token: string, accountId: string) {
  return fetchMetaCampaignInsights(token, accountId)
}
export async function fetchAdSets(token: string, accountId: string) {
  return fetchMetaAdsets(token, accountId)
}
export async function fetchCreativePerformance(token: string, accountId: string) {
  return fetchMetaAds(token, accountId)
}
export function extractConversions(row: MetaInsightRow) {
  return sumActions(row.actions, ACTION_COUNT_MAP).purchases ?? 0
}
export function extractRevenue(row: MetaInsightRow) {
  return sumActions(row.action_values, ACTION_VALUE_MAP).purchase_value ?? 0
}
