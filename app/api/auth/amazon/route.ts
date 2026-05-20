import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { exchangeCodeForTokens, getProfiles } from '@/lib/amazon/auth'
import { apiErrorResponse } from '@/lib/utils/errors'

const INDIA_MARKETPLACE_ID = 'A21TJRUUN4KGV'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error || !code) {
      return NextResponse.redirect(
        new URL('/accounts?error=amazon_denied', process.env.NEXT_PUBLIC_APP_URL!)
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL!))

    const tokens = await exchangeCodeForTokens(code)
    const tokenExpiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

    const profiles = await getProfiles(tokens.access_token)

    // Prefer India marketplace profiles
    const relevantProfiles = profiles.filter(
      (p) => p.accountInfo.marketplaceStringId === INDIA_MARKETPLACE_ID
    )
    const profilesToSave = relevantProfiles.length > 0 ? relevantProfiles : profiles

    for (const profile of profilesToSave) {
      await supabase.from('ad_accounts').upsert(
        {
          user_id: user.id,
          platform: 'amazon',
          account_id: profile.profileId,
          account_name: profile.accountInfo.name,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expires_at: tokenExpiresAt,
          status: 'active',
        },
        { onConflict: 'user_id,platform,account_id' }
      )
    }

    return NextResponse.redirect(
      new URL('/accounts?success=amazon_connected', process.env.NEXT_PUBLIC_APP_URL!)
    )
  } catch (error) {
    return apiErrorResponse(error, 'auth/amazon')
  }
}
