import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_PLATFORMS = ['meta', 'google', 'amazon']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any

// GET — return stored credentials (masked) for a platform
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params
  if (!ALLOWED_PLATFORMS.includes(platform))
    return NextResponse.json({ error: 'Invalid platform' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await (supabase as AnyClient)
    .from('platform_credentials')
    .select('credentials, is_valid, last_tested_at')
    .eq('user_id', user.id)
    .eq('platform', platform)
    .single()

  if (!data) return NextResponse.json({ credentials: {}, is_valid: false })

  const row = data as { credentials: Record<string, string>; is_valid: boolean; last_tested_at: string | null }

  // Mask sensitive values — return key names with masked values so UI knows what's saved
  const masked: Record<string, string> = {}
  for (const [key, val] of Object.entries(row.credentials)) {
    if (typeof val === 'string' && val.length > 6) {
      masked[key] = val.slice(0, 4) + '••••••••' + val.slice(-4)
    } else {
      masked[key] = val
    }
  }

  return NextResponse.json({
    credentials: masked,
    is_valid: row.is_valid,
    last_tested_at: row.last_tested_at,
  })
}

// POST — save credentials for a platform
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params
  if (!ALLOWED_PLATFORMS.includes(platform))
    return NextResponse.json({ error: 'Invalid platform' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as Record<string, string>

  // Don't save masked values (means field wasn't changed)
  const { data: existingRow } = await (supabase as AnyClient)
    .from('platform_credentials')
    .select('credentials')
    .eq('user_id', user.id)
    .eq('platform', platform)
    .single()

  const existingCreds = ((existingRow as { credentials: Record<string, string> } | null)?.credentials ?? {}) as Record<string, string>
  const merged: Record<string, string> = { ...existingCreds }

  for (const [key, val] of Object.entries(body)) {
    if (typeof val === 'string' && !val.includes('••••••••')) {
      merged[key] = val.trim()
    }
  }

  const { error } = await (supabase as AnyClient)
    .from('platform_credentials')
    .upsert(
      { user_id: user.id, platform, credentials: merged, is_valid: false },
      { onConflict: 'user_id,platform' }
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// DELETE — remove credentials for a platform
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params
  if (!ALLOWED_PLATFORMS.includes(platform))
    return NextResponse.json({ error: 'Invalid platform' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await (supabase as AnyClient)
    .from('platform_credentials')
    .delete()
    .eq('user_id', user.id)
    .eq('platform', platform)

  // Also remove associated ad accounts
  await supabase
    .from('ad_accounts')
    .delete()
    .eq('user_id', user.id)
    .eq('platform', platform as 'meta' | 'google' | 'amazon')

  return NextResponse.json({ success: true })
}
