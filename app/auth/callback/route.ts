import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }

  // Pass Supabase's reason (e.g. otp_expired) through so the login page can explain it
  const reason = searchParams.get('error_code') ?? 'oauth_error'
  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(reason)}`)
}
