export interface GoogleCampaignRow {
  campaign: {
    id: string
    name: string
    status: string
  }
  metrics: {
    cost_micros: string
    conversions: string
    clicks: string
    impressions: string
    search_impression_share: string
    search_budget_lost_impression_share: string
    ctr: string
    average_cpc: string
  }
}

export interface GoogleKeywordRow {
  ad_group_criterion: {
    keyword: { text: string }
    status: string
    quality_info: {
      quality_score: number
      creative_quality_score: string
      post_click_quality_score: string
    }
  }
  metrics: {
    cost_micros: string
    conversions: string
    clicks: string
  }
  campaign: { name: string }
  ad_group: { name: string }
}

export interface GoogleConversionAction {
  conversion_action: {
    id: string
    name: string
    status: string
    type: string
  }
  metrics: {
    all_conversions: string
  }
}

export interface GoogleTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
}

export interface GoogleCustomer {
  resourceName: string
  id: string
  descriptiveName: string
  currencyCode: string
  timeZone: string
}
