import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { exchangeCodeForTokens, getGoogleCustomers } from '@/lib/google/auth'
import { apiErrorResponse } from '@/lib/utils/errors'
import { checkAccountLimit } from '@/lib/utils/plan-gate'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code  = searchParams.get('code')
    const error = searchParams.get('error')

    if (error || !code) {
      return NextResponse.redirect(
        new URL('/accounts?error=google_denied', process.env.NEXT_PUBLIC_APP_URL!)
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL!))

    // Use user's own OAuth credentials if saved in integrations form
    const { data: credRow } = await (supabase as AnyClient)
      .from('platform_credentials')
      .select('credentials')
      .eq('user_id', user.id)
      .eq('platform', 'google')
      .single()

    const savedCreds  = credRow?.credentials ?? {}
    const clientId     = savedCreds.client_id     || undefined
    const clientSecret = savedCreds.client_secret || undefined

    const tokens = await exchangeCodeForTokens(code, clientId, clientSecret)
    const tokenExpiresAt = new Date(Date.now() + (tokens.expires_in ?? 3600) * 1000).toISOString()

    const devToken = savedCreds.developer_token || process.env.GOOGLE_DEVELOPER_TOKEN || ''

    const customers = await getGoogleCustomers(tokens.access_token, devToken)

    const limitCheck = await checkAccountLimit(supabase, user.id, customers.map(c => c.id), 'google')
    if (!limitCheck.allowed) {
      return NextResponse.redirect(
        new URL(`/accounts?error=account_limit&current=${limitCheck.currentCount}&limit=${limitCheck.limit}`, process.env.NEXT_PUBLIC_APP_URL!)
      )
    }

    for (const customer of customers) {
      await supabase.from('ad_accounts').upsert(
        {
          user_id:          user.id,
          platform:         'google',
          account_id:       customer.id,
          account_name:     `Google Ads (${customer.id.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')})`,
          access_token:     tokens.access_token,
          refresh_token:    tokens.refresh_token ?? null,
          token_expires_at: tokenExpiresAt,
          status:           'active',
        },
        { onConflict: 'user_id,platform,account_id' }
      )
    }

    return NextResponse.redirect(
      new URL('/accounts?success=google_connected', process.env.NEXT_PUBLIC_APP_URL!)
    )
  } catch (error) {
    return apiErrorResponse(error, 'auth/google')
  }
}
