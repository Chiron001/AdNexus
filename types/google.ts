export interface GoogleCampaignRow {
  campaign: {
    id: string
    name: string
    status: string
    advertising_channel_type?: string
    bidding_strategy_type?: string
  }
  metrics: {
    cost_micros: string
    conversions: string
    conversions_value?: string
    cost_per_conversion?: string
    all_conversions?: string
    all_conversions_value?: string
    view_through_conversions?: string
    clicks: string
    impressions: string
    ctr: string
    average_cpc: string
    average_cpm?: string
    average_cpv?: string
    search_impression_share?: string
    search_top_impression_share?: string
    search_absolute_top_impression_share?: string
    search_budget_lost_absolute_top_impression_share?: string
    search_rank_lost_impression_share?: string
    video_views?: string
    video_view_rate?: string
    video_quartile_p25_rate?: string
    video_quartile_p50_rate?: string
    video_quartile_p75_rate?: string
    video_quartile_p100_rate?: string
    search_budget_lost_impression_share?: string
  }
  segments?: {
    date?: string
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
    impressions?: string
    ctr?: string
    average_cpc?: string
  }
  campaign: { id?: string; name: string }
  ad_group: { id?: string; name: string }
  segments?: { date?: string }
}

export interface GoogleConversionAction {
  conversion_action: {
    id: string
    name: string
    status: string
    type: string
    category?: string
    counting_type?: string
  }
  metrics: {
    all_conversions: string
    all_conversions_value?: string
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
