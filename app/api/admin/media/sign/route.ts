import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'

const FOLDER_MAP: Record<string, string> = {
  'image/jpeg':     'images',
  'image/jpg':      'images',
  'image/png':      'images',
  'image/webp':     'images',
  'image/gif':      'images',
  'video/mp4':      'videos',
  'video/quicktime':'videos',
  'video/mov':      'videos',
  'application/pdf':'documents',
  'application/msword': 'documents',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'documents',
  'text/plain':     'documents',
  'text/csv':       'documents',
}

const MAX_SIZE = 500 * 1024 * 1024 // 500 MB

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value
  if (!session || session !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, type, size } = await req.json() as { name: string; type: string; size: number }

  const folder = FOLDER_MAP[type]
  if (!folder) return NextResponse.json({ error: 'File type not allowed' }, { status: 400 })
  if (size > MAX_SIZE) return NextResponse.json({ error: 'File exceeds 500 MB limit' }, { status: 400 })

  // Build path: keep original name (sanitised) prefixed with timestamp
  const ext      = name.split('.').pop()?.toLowerCase() ?? ''
  const stem     = name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase()
  const fileName = `${Date.now()}-${stem}.${ext}`
  const path     = `${folder}/${fileName}`

  const admin = createAdminClient()
  const { data, error } = await admin.storage
    .from('media')
    .createSignedUploadUrl(path)

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Could not create upload URL' }, { status: 500 })
  }

  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`

  return NextResponse.json({
    signedUrl: data.signedUrl,
    path,
    publicUrl,
    folder,
    fileName,
  })
}
