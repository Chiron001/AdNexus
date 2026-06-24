import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_PLATFORMS = ['meta', 'google', 'amazon']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params
  if (!ALLOWED_PLATFORMS.includes(platform))
    return NextResponse.json({ error: 'Invalid platform' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: row } = await (supabase as AnyClient)
    .from('platform_credentials')
    .select('credentials')
    .eq('user_id', user.id)
    .eq('platform', platform)
    .single()

  if (!row) return NextResponse.json({ error: 'No credentials saved for this platform' }, { status: 400 })

  const creds = (row as { credentials: Record<string, string> }).credentials
  let isValid = false
  let message = ''
  let accountsFound = 0

  try {
    if (platform === 'meta') {
      const token = creds.access_token
      if (!token) throw new Error('Access token is required')

      const res = await fetch(
        `https://graph.facebook.com/v20.0/me/adaccounts?fields=id,name,account_status&access_token=${token}`
      )
      const data = await res.json() as { data?: { id: string; name: string; account_status: number }[]; error?: { message: string } }

      if (data.error) throw new Error(data.error.message)
      if (!data.data || data.data.length === 0) throw new Error('No ad accounts found for this token')

      const activeAccounts = data.data.filter(a => a.account_status === 1)
      accountsFound = activeAccounts.length

      for (const account of activeAccounts) {
        const accountId = account.id.replace('act_', '')
        await supabase.from('ad_accounts').upsert(
          {
            user_id: user.id,
            platform: 'meta',
            account_id: accountId,
            account_name: account.name,
            access_token: token,
            status: 'active',
          },
          { onConflict: 'user_id,platform,account_id' }
        )
      }

      isValid = true
      message = `Connected — ${accountsFound} active ad account${accountsFound !== 1 ? 's' : ''} found`
    }

    if (platform === 'google') {
      const { developer_token, customer_id } = creds
      if (!developer_token) throw new Error('Developer token is required')
      if (!customer_id) throw new Error('Customer ID is required')

      const cleanId = customer_id.replace(/-/g, '')
      if (!/^\d{10}$/.test(cleanId)) throw new Error('Customer ID must be a 10-digit number (e.g. 123-456-7890)')

      isValid = true
      accountsFound = 1
      message = 'Google Ads credentials saved — account will sync on next cycle'

      // Only create the ad_accounts row if it doesn't exist yet — never overwrite
      // the OAuth access_token that was stored by the /api/auth/google OAuth flow
      const { data: existing } = await supabase
        .from('ad_accounts')
        .select('id')
        .eq('user_id', user.id)
        .eq('platform', 'google')
        .eq('account_id', cleanId)
        .single()

      if (!existing) {
        await supabase.from('ad_accounts').insert({
          user_id: user.id,
          platform: 'google',
          account_id: cleanId,
          account_name: `Google Ads (${customer_id})`,
          status: 'active',
        })
      }
    }

    if (platform === 'amazon') {
      const { client_id, profile_id } = creds
      if (!client_id) throw new Error('Client ID is required')
      if (!profile_id) throw new Error('Profile ID is required')

      isValid = true
      accountsFound = 1
      message = 'Amazon Ads credentials saved — account will sync on next cycle'

      await supabase.from('ad_accounts').upsert(
        {
          user_id: user.id,
          platform: 'amazon',
          account_id: profile_id,
          account_name: `Amazon Ads (${profile_id})`,
          access_token: client_id,
          status: 'active',
        },
        { onConflict: 'user_id,platform,account_id' }
      )
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Connection test failed'
    await (supabase as AnyClient).from('platform_credentials').update({
      is_valid: false,
      last_tested_at: new Date().toISOString(),
    }).eq('user_id', user.id).eq('platform', platform)

    return NextResponse.json({ success: false, error: errorMessage })
  }

  await (supabase as AnyClient).from('platform_credentials').update({
    is_valid: true,
    last_tested_at: new Date().toISOString(),
  }).eq('user_id', user.id).eq('platform', platform)

  return NextResponse.json({ success: true, message, accounts_found: accountsFound })
}
