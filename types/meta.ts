export interface MetaCampaignInsight {
  campaign_id: string
  campaign_name: string
  spend: string
  impressions: string
  clicks: string
  reach?: string
  frequency?: string
  ctr: string
  cpc: string
  cpm: string
  cpp: string
  actions?: MetaAction[]
  action_values?: MetaAction[]
  date_start: string
  date_stop: string
}

export interface MetaAction {
  action_type: string
  value: string
}

export interface MetaAdAccount {
  id: string
  name: string
  account_status: number
  currency: string
  timezone_name: string
}

export interface MetaAdSet {
  id: string
  name: string
  status: string
  targeting: Record<string, unknown>
  budget_remaining: string
  daily_budget: string
  optimization_goal: string
  billing_event: string
  campaign_id: string
}

export interface MetaAd {
  id: string
  name: string
  status: string
  adset_id: string
  creative: { id: string }
  insights?: {
    data: Array<{
      ctr: string
      impressions: string
      spend: string
      frequency: string
    }>
  }
}

export interface MetaPixelEvent {
  event_name: string
  event_match_quality?: {
    score: number
  }
}

export interface MetaTokenResponse {
  access_token: string
  token_type: string
  expires_in?: number
}
