export const dynamic = 'force-dynamic'

// Called by middleware when plan_expires_at has passed.
// Downgrades the user to free and redirects them to their original destination.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const next = request.nextUrl.searchParams.get('next') ?? '/dashboard'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('profiles')
    .select('plan, plan_expires_at, razorpay_customer_id')
    .eq('id', user.id)
    .single()

  // Double-check it's actually expired before downgrading
  if (
    profile &&
    profile.plan !== 'free' &&
    profile.plan_expires_at &&
    new Date(profile.plan_expires_at) < new Date()
  ) {
    await admin.from('profiles').update({
      plan:           'free',
      plan_expires_at: null,
      updated_at:     new Date().toISOString(),
    }).eq('id', user.id)

    await admin.from('billing_events').insert({
      user_id:                  user.id,
      event_type:               'plan.downgraded',
      plan:                     'free',
      razorpay_subscription_id: profile.razorpay_customer_id,
      metadata:                 { reason: 'plan_expired', previous_plan: profile.plan },
    })
  }

  return NextResponse.redirect(new URL(next, request.url))
}
