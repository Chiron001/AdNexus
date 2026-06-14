import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: adminUser } = await admin.from('admin_users').select('role').eq('id', user.id).single()
  if (!adminUser) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json() as { plan?: string }
  const plan = body.plan
  const validPlans = ['free', 'growth', 'agency', 'custom'] as const
  if (!plan || !validPlans.includes(plan as typeof validPlans[number])) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  // Update profile
  const { error: updateError } = await admin
    .from('profiles')
    .update({ plan: plan as typeof validPlans[number], updated_at: new Date().toISOString() })
    .eq('id', id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  // Log billing event
  await admin.from('billing_events').insert({
    user_id:    id,
    event_type: 'plan.override',
    plan,
    metadata:   { changed_by: user.id, changed_by_email: user.email },
  })

  return NextResponse.json({ ok: true, plan })
}
