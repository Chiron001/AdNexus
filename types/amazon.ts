export interface AmazonProfile {
  profileId: string
  countryCode: string
  currencyCode: string
  timezone: string
  accountInfo: {
    marketplaceStringId: string
    id: string
    type: string
    name: string
  }
}

export interface AmazonCampaign {
  campaignId: string
  name: string
  campaignType: string
  targetingType: string
  state: string
  dailyBudget: number
  startDate: string
  endDate?: string
}

export interface AmazonSearchTermRow {
  searchTerm: string
  campaignName: string
  adGroupName: string
  impressions: number
  clicks: number
  cost: number
  sales7d: number
  purchases7d: number
  acos7d: number
  roas7d: number
  searchTermImpressionRank: number
}

export interface AmazonKeywordBidRecommendation {
  keywordText: string
  matchType: string
  suggestedBid: {
    recommended: number
    rangeStart: number
    rangeEnd: number
  }
}

export interface AmazonTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}

export interface AmazonReportRequest {
  reportId: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  url?: string
}
