export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { cancelSubscription, fetchSubscription } from '@/lib/razorpay/client'
import { apiErrorResponse } from '@/lib/utils/errors'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, plan_expires_at, razorpay_customer_id')
      .eq('id', user.id)
      .single()

    if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 })
    if (profile.plan === 'free') {
      return Response.json({ error: 'No active paid subscription' }, { status: 400 })
    }
    if (!profile.razorpay_customer_id) {
      return Response.json({ error: 'No subscription ID on file' }, { status: 400 })
    }

    // Cancel at cycle end (user keeps access until plan_expires_at)
    await cancelSubscription(profile.razorpay_customer_id, true)

    // Fetch updated subscription to get the definitive period end
    let periodEnd: string | undefined
    try {
      const sub = await fetchSubscription(profile.razorpay_customer_id)
      if (sub.current_end) {
        periodEnd = new Date(sub.current_end * 1000).toISOString()
      }
    } catch {
      // If fetch fails, fall back to existing plan_expires_at
      periodEnd = profile.plan_expires_at ?? undefined
    }

    // Log the cancellation event
    const admin = createAdminClient()
    await admin.from('billing_events').insert({
      user_id:                  user.id,
      event_type:               'subscription.cancelled',
      plan:                     profile.plan,
      razorpay_subscription_id: profile.razorpay_customer_id,
      period_end:               periodEnd ?? null,
      metadata:                 { cancelled_by: 'user', cancel_at_cycle_end: true },
    })

    // Update plan_expires_at to the confirmed period end if we got it
    if (periodEnd) {
      await admin.from('profiles').update({
        plan_expires_at: periodEnd,
        updated_at:      new Date().toISOString(),
      }).eq('id', user.id)
    }

    return Response.json({
      ok:              true,
      plan_expires_at: periodEnd ?? profile.plan_expires_at,
      message:         'Subscription cancelled. You keep access until the end of your billing period.',
    })
  } catch (error) {
    return apiErrorResponse(error, 'billing/cancel')
  }
}
