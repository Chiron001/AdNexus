import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

function checkAuth(req: NextRequest) {
  const cookie = req.cookies.get('admin_session')?.value
  return cookie && cookie === process.env.ADMIN_PASSWORD
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const admin = createAdminClient()

  const body = await req.json() as { plan?: string }
  const plan = body.plan
  const validPlans = ['free', 'basic', 'growth', 'professional', 'agency', 'custom']
  if (!plan || !validPlans.includes(plan)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  // Update profile
  const { error: updateError } = await admin
    .from('profiles')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update({ plan: plan as any, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  // Log billing event
  await admin.from('billing_events').insert({
    user_id:    id,
    event_type: 'plan.override',
    plan,
    metadata:   { changed_by: 'admin_panel' },
  })

  return NextResponse.json({ ok: true, plan })
}
