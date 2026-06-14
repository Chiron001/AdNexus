import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('blog_posts')
    .select('id,title,slug,status,category,featured,published_at,updated_at,view_count,seo_title,seo_description,focus_keyword,cover_image_url')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('blog_posts')
    .insert(body)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
