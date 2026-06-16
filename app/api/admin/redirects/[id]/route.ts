import { NextRequest, NextResponse } from 'next/server'
import { createRawAdminClient } from '@/lib/supabase/server'

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

function checkAuth(req: NextRequest) {
  const cookie = req.cookies.get('admin_session')?.value
  return cookie && cookie === process.env.ADMIN_PASSWORD
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(req)) return unauthorized()
  const { id } = await params
  const body = await req.json() as {
    source_path?: string
    destination_path?: string
    redirect_type?: number
    is_active?: boolean
  }
  const admin = createRawAdminClient()

  const { data, error } = await admin
    .from('url_redirects')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(req)) return unauthorized()
  const { id } = await params
  const admin = createRawAdminClient()

  const { error } = await admin.from('url_redirects').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
