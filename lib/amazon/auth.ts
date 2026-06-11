import type { AmazonTokenResponse, AmazonProfile } from '@/types/amazon'

const AMAZON_ADS_API = 'https://advertising-api-fe.amazon.com'

export function getAmazonAuthUrl(): string | null {
  const clientId = process.env.AMAZON_CLIENT_ID
  const redirectUri = process.env.AMAZON_REDIRECT_URI
  if (!clientId || clientId === 'your_amazon_client_id' || !redirectUri) return null
  const params = new URLSearchParams({
    client_id: clientId,
    scope: 'advertising::campaign_management',
    response_type: 'code',
    redirect_uri: redirectUri,
    state: Math.random().toString(36).substring(2, 15),
  })
  return `https://www.amazon.com/ap/oa?${params.toString()}`
}

export async function exchangeCodeForTokens(code: string): Promise<AmazonTokenResponse> {
  const res = await fetch('https://api.amazon.com/auth/o2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.AMAZON_REDIRECT_URI!,
      client_id: process.env.AMAZON_CLIENT_ID!,
      client_secret: process.env.AMAZON_CLIENT_SECRET!,
    }),
  })
  if (!res.ok) throw new Error(`Amazon token exchange failed: ${res.statusText}`)
  return res.json()
}

export async function refreshAccessToken(refreshToken: string): Promise<AmazonTokenResponse> {
  const res = await fetch('https://api.amazon.com/auth/o2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.AMAZON_CLIENT_ID!,
      client_secret: process.env.AMAZON_CLIENT_SECRET!,
    }),
  })
  if (!res.ok) throw new Error(`Amazon token refresh failed: ${res.statusText}`)
  return res.json()
}

export async function getProfiles(accessToken: string): Promise<AmazonProfile[]> {
  const res = await fetch(`${AMAZON_ADS_API}/v2/profiles`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Amazon-Advertising-API-ClientId': process.env.AMAZON_CLIENT_ID!,
    },
  })
  if (!res.ok) throw new Error(`Failed to fetch Amazon profiles: ${res.statusText}`)
  return res.json()
}
