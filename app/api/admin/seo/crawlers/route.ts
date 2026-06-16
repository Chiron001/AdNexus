import { NextRequest, NextResponse } from 'next/server'
import { createRawAdminClient } from '@/lib/supabase/server'

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

function checkAuth(req: NextRequest) {
  const cookie = req.cookies.get('admin_session')?.value
  return cookie && cookie === process.env.ADMIN_PASSWORD
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized()
  const admin = createRawAdminClient()
  const { data, error } = await admin
    .from('site_config')
    .select('key, value, updated_at')
    .in('key', ['robots_txt', 'llm_txt'])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const map: Record<string, string> = {}
  for (const row of (data ?? []) as { key: string; value: string }[]) map[row.key] = row.value ?? ''
  return NextResponse.json(map)
}

export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized()
  const body = await req.json()
  const { key, value } = body as { key: string; value: string }
  if (!['robots_txt', 'llm_txt'].includes(key)) {
    return NextResponse.json({ error: 'Invalid key' }, { status: 400 })
  }
  const admin = createRawAdminClient()
  const { error } = await admin
    .from('site_config')
    .upsert({ key, value, updated_at: new Date().toISOString() })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
