import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { exchangeCodeForTokens, getGoogleCustomers } from '@/lib/google/auth'
import { apiErrorResponse } from '@/lib/utils/errors'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error || !code) {
      return NextResponse.redirect(
        new URL('/accounts?error=google_denied', process.env.NEXT_PUBLIC_APP_URL!)
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL!))

    const tokens = await exchangeCodeForTokens(code)
    const tokenExpiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

    const customers = await getGoogleCustomers(
      tokens.access_token,
      process.env.GOOGLE_DEVELOPER_TOKEN!
    )

    for (const customer of customers) {
      await supabase.from('ad_accounts').upsert(
        {
          user_id: user.id,
          platform: 'google',
          account_id: customer.id,
          account_name: customer.descriptiveName,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || null,
          token_expires_at: tokenExpiresAt,
          status: 'active',
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
