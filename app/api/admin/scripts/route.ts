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
    .from('site_scripts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized()
  const body = await req.json()
  const { name, description, script_html, position } = body as {
    name: string
    description?: string
    script_html: string
    position: string
  }

  if (!name || !script_html) {
    return NextResponse.json({ error: 'name and script_html are required' }, { status: 400 })
  }
  if (!['head', 'body_start', 'body_end'].includes(position ?? 'head')) {
    return NextResponse.json({ error: 'Invalid position' }, { status: 400 })
  }

  const admin = createRawAdminClient()
  const { data, error } = await admin
    .from('site_scripts')
    .insert({ name, description, script_html, position: position ?? 'head' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
