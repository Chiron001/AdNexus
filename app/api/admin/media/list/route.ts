import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'

const FOLDERS = ['images', 'videos', 'documents'] as const

export async function GET() {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value
  if (!session || session !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin      = createAdminClient()
  const baseUrl    = process.env.NEXT_PUBLIC_SUPABASE_URL!

  const results = await Promise.all(
    FOLDERS.map(async folder => {
      const { data } = await admin.storage
        .from('media')
        .list(folder, { limit: 500, sortBy: { column: 'created_at', order: 'desc' } })

      return (data ?? [])
        .filter(f => f.name !== '.emptyFolderPlaceholder' && !f.name.startsWith('.'))
        .map(f => ({
          id:        `${folder}/${f.name}`,  // path as stable id
          name:      f.name,
          folder,
          path:      `${folder}/${f.name}`,
          url:       `${baseUrl}/storage/v1/object/public/media/${folder}/${f.name}`,
          size:      (f.metadata?.size as number) ?? 0,
          mimeType:  (f.metadata?.mimetype as string) ?? '',
          createdAt: f.created_at ?? '',
        }))
    })
  )

  return NextResponse.json({ files: results.flat() })
}
