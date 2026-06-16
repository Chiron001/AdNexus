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
    .from('url_redirects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized()
  const body = await req.json()
  const { source_path, destination_path, redirect_type } = body as {
    source_path: string
    destination_path: string
    redirect_type: number
  }

  if (!source_path || !destination_path) {
    return NextResponse.json({ error: 'source_path and destination_path are required' }, { status: 400 })
  }

  const sourcePath = source_path.startsWith('/')  ? source_path  : `/${source_path}`
  const destPath   = destination_path

  const admin = createRawAdminClient()
  const { data, error } = await admin
    .from('url_redirects')
    .insert({
      source_path:      sourcePath,
      destination_path: destPath,
      redirect_type:    redirect_type ?? 301,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
