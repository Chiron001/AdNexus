import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { exchangeCodeForToken, getLongLivedToken, getAdAccounts } from '@/lib/meta/auth'
import { apiErrorResponse } from '@/lib/utils/errors'
import { checkAccountLimit } from '@/lib/utils/plan-gate'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(new URL('/accounts?error=meta_denied', process.env.NEXT_PUBLIC_APP_URL!))
    }

    if (!code) {
      return NextResponse.redirect(new URL('/accounts?error=meta_no_code', process.env.NEXT_PUBLIC_APP_URL!))
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL!))
    }

    // Exchange for short-lived token, then upgrade to long-lived (60 days)
    const shortToken = await exchangeCodeForToken(code)
    const longToken = await getLongLivedToken(shortToken.access_token)

    const tokenExpiresAt = longToken.expires_in
      ? new Date(Date.now() + longToken.expires_in * 1000).toISOString()
      : null

    // Fetch all ad accounts this user has access to
    const adAccounts = await getAdAccounts(longToken.access_token)

    if (adAccounts.length === 0) {
      return NextResponse.redirect(
        new URL('/accounts?error=meta_no_accounts', process.env.NEXT_PUBLIC_APP_URL!)
      )
    }

    // Check account limit before connecting new accounts
    const incomingIds = adAccounts.map(a => a.id.replace('act_', ''))
    const limitCheck = await checkAccountLimit(supabase, user.id, incomingIds, 'meta')
    if (!limitCheck.allowed) {
      return NextResponse.redirect(
        new URL(`/accounts?error=account_limit&current=${limitCheck.currentCount}&limit=${limitCheck.limit}`, process.env.NEXT_PUBLIC_APP_URL!)
      )
    }

    // Save all connected accounts (upsert to handle reconnects)
    for (const account of adAccounts) {
      const accountId = account.id.replace('act_', '')
      await supabase.from('ad_accounts').upsert(
        {
          user_id: user.id,
          platform: 'meta',
          account_id: accountId,
          account_name: account.name,
          access_token: longToken.access_token,
          token_expires_at: tokenExpiresAt,
          status: 'active',
        },
        { onConflict: 'user_id,platform,account_id' }
      )
    }

    return NextResponse.redirect(
      new URL('/accounts?success=meta_connected', process.env.NEXT_PUBLIC_APP_URL!)
    )
  } catch (error) {
    return apiErrorResponse(error, 'auth/meta')
  }
}
