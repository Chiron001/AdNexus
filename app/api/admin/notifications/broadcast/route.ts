export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import type { NotificationType } from '@/types/database'

function checkAuth(req: NextRequest) {
  const cookie = req.cookies.get('admin_session')?.value
  return cookie && cookie === process.env.ADMIN_PASSWORD
}

export async function POST(request: NextRequest) {
  try {
    if (!checkAuth(request)) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()

    const body = await request.json() as {
      title:  string
      body:   string
      target: 'all' | 'growth' | 'agency'
      type:   NotificationType
    }

    if (!body.title?.trim() || !body.body?.trim()) {
      return Response.json({ error: 'Title and body are required' }, { status: 400 })
    }

    let query = admin.from('profiles').select('id')
    if (body.target !== 'all') query = query.eq('plan', body.target)

    const { data: users, error: usersErr } = await query
    if (usersErr) throw usersErr
    if (!users || users.length === 0) return Response.json({ ok: true, count: 0 })

    const rows = users.map(u => ({
      user_id: u.id,
      type:    body.type,
      title:   body.title.trim(),
      body:    body.body.trim(),
      read:    false,
    }))

    const { error: insertErr } = await admin.from('notifications').insert(rows)
    if (insertErr) throw insertErr

    return Response.json({ ok: true, count: users.length })
  } catch (error) {
    console.error('[admin/notifications/broadcast]', error)
    return Response.json({ error: 'Failed to broadcast' }, { status: 500 })
  }
}
