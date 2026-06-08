export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { fetchSubscription } from '@/lib/razorpay/client'
import { getPlanLimits, PLAN_DISPLAY } from '@/lib/config/plans'
import { apiErrorResponse } from '@/lib/utils/errors'

export async function GET() {
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

    const limits  = getPlanLimits(profile.plan)
    const display = PLAN_DISPLAY[profile.plan]

    let subscriptionStatus: string | null = null
    let nextBillingDate: string | null    = null

    if (profile.razorpay_customer_id && profile.plan !== 'free') {
      try {
        const sub = await fetchSubscription(profile.razorpay_customer_id)
        subscriptionStatus = sub.status
        if (sub.current_end) {
          nextBillingDate = new Date(sub.current_end * 1000).toISOString()
        }
      } catch {
        // Razorpay fetch failed — return what we have from the DB
      }
    }

    return Response.json({
      plan:                     profile.plan,
      plan_display:             display,
      plan_expires_at:          profile.plan_expires_at,
      razorpay_subscription_id: profile.razorpay_customer_id,
      subscription_status:      subscriptionStatus,
      next_billing_date:        nextBillingDate,
      limits,
    })
  } catch (error) {
    return apiErrorResponse(error, 'billing/status')
  }
}
