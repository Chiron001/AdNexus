import type { MetaTokenResponse, MetaAdAccount } from '@/types/meta'

const META_API_VERSION = 'v20.0'
const BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`

export function getMetaAuthUrl(): string {
  const state = Math.random().toString(36).substring(2, 15)
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: process.env.META_REDIRECT_URI!,
    scope: 'ads_read,business_management',
    state,
    response_type: 'code',
  })
  return `https://www.facebook.com/${META_API_VERSION}/dialog/oauth?${params.toString()}`
}

export async function exchangeCodeForToken(code: string): Promise<MetaTokenResponse> {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    redirect_uri: process.env.META_REDIRECT_URI!,
    code,
  })

  const res = await fetch(`${BASE_URL}/oauth/access_token?${params.toString()}`)
  if (!res.ok) {
    const err = await res.json()
    throw new Error(`Meta token exchange failed: ${err.error?.message || res.statusText}`)
  }
  return res.json()
}

export async function getLongLivedToken(shortToken: string): Promise<MetaTokenResponse> {
  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    fb_exchange_token: shortToken,
  })

  const res = await fetch(`${BASE_URL}/oauth/access_token?${params.toString()}`)
  if (!res.ok) {
    const err = await res.json()
    throw new Error(`Meta long-lived token exchange failed: ${err.error?.message || res.statusText}`)
  }
  return res.json()
}

export async function getAdAccounts(accessToken: string): Promise<MetaAdAccount[]> {
  const fields = 'id,name,account_status,currency,timezone_name'
  const res = await fetch(
    `${BASE_URL}/me/adaccounts?fields=${fields}&access_token=${accessToken}`
  )
  if (!res.ok) {
    const err = await res.json()
    throw new Error(`Failed to fetch Meta ad accounts: ${err.error?.message || res.statusText}`)
  }
  const data = await res.json()
  return data.data ?? []
}
