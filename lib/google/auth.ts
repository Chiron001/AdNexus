import type { GoogleTokenResponse } from '@/types/google'

const DEFAULT_REDIRECT = process.env.GOOGLE_REDIRECT_URI
  || (process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google` : null)

export function getGoogleAuthUrl(clientId?: string, clientSecret?: string): string | null {
  const id  = clientId  || process.env.GOOGLE_CLIENT_ID
  const uri = DEFAULT_REDIRECT
  if (!id || id === 'your_google_client_id' || !uri) return null
  // client_secret not needed in the URL but we validate it exists
  const secret = clientSecret || process.env.GOOGLE_CLIENT_SECRET
  if (!secret) return null
  const params = new URLSearchParams({
    client_id:     id,
    redirect_uri:  uri,
    scope:         'https://www.googleapis.com/auth/adwords',
    response_type: 'code',
    access_type:   'offline',
    prompt:        'consent',
    state:         Math.random().toString(36).substring(2, 15),
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export async function exchangeCodeForTokens(
  code: string,
  clientId?: string,
  clientSecret?: string,
): Promise<GoogleTokenResponse> {
  const id     = clientId     || process.env.GOOGLE_CLIENT_ID!
  const secret = clientSecret || process.env.GOOGLE_CLIENT_SECRET!
  const uri    = DEFAULT_REDIRECT!
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, client_id: id, client_secret: secret, redirect_uri: uri, grant_type: 'authorization_code' }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Google token exchange failed: ${JSON.stringify(err)}`)
  }
  return res.json()
}

export async function refreshAccessToken(
  refreshToken: string,
  clientId?: string,
  clientSecret?: string,
): Promise<GoogleTokenResponse> {
  const id     = clientId     || process.env.GOOGLE_CLIENT_ID!
  const secret = clientSecret || process.env.GOOGLE_CLIENT_SECRET!
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ refresh_token: refreshToken, client_id: id, client_secret: secret, grant_type: 'refresh_token' }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Google token refresh failed: ${JSON.stringify(err)}`)
  }
  return res.json()
}

export async function getGoogleCustomers(
  accessToken: string,
  developerToken: string,
): Promise<Array<{ id: string; descriptiveName: string }>> {
  const res = await fetch(
    'https://googleads.googleapis.com/v21/customers:listAccessibleCustomers',
    { headers: { Authorization: `Bearer ${accessToken}`, 'developer-token': developerToken } },
  )
  if (!res.ok) throw new Error(`Failed to list Google customers: ${res.statusText}`)
  const data = await res.json()
  return (data.resourceNames ?? []).map((name: string) => ({
    id:              name.replace('customers/', ''),
    descriptiveName: name,
  }))
}
