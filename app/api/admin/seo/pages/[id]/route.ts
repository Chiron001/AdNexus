import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(_: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const admin = createAdminClient()
  const { data, error } = await admin.from('page_seo').select('*').eq('id', id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

// Store blank fields as null so reads can use a single `?? fallback`
// without an empty string silently winning over the default.
const NULLABLE_TEXT_FIELDS = [
  'meta_title', 'meta_description', 'focus_keyword',
  'og_title', 'og_description', 'og_image_url',
  'canonical_url', 'schema_json',
] as const

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const body = await req.json()
  const admin = createAdminClient()

  for (const field of NULLABLE_TEXT_FIELDS) {
    if (body[field] === '') body[field] = null
  }

  const { data, error } = await admin
    .from('page_seo')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
