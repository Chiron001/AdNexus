import { createClient } from '@/lib/supabase/server'
import { getMetaAuthUrl } from '@/lib/meta/auth'
import { getGoogleAuthUrl } from '@/lib/google/auth'
import { getAmazonAuthUrl } from '@/lib/amazon/auth'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let googleAuthUrl: string | null = getGoogleAuthUrl()

  if (user) {
    const { data: row } = await (supabase as AnyClient)
      .from('platform_credentials')
      .select('credentials')
      .eq('user_id', user.id)
      .eq('platform', 'google')
      .single()

    const creds = row?.credentials ?? {}
    if (creds.client_id && creds.client_secret) {
      googleAuthUrl = getGoogleAuthUrl(creds.client_id, creds.client_secret)
    }
  }

  return Response.json({
    meta:   getMetaAuthUrl(),
    google: googleAuthUrl,
    amazon: getAmazonAuthUrl(),
  })
}
