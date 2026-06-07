export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSubscription } from '@/lib/razorpay/client'
import type { PlanId } from '@/lib/razorpay/client'
import { apiErrorResponse } from '@/lib/utils/errors'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { plan } = await request.json() as { plan: PlanId }
    if (plan !== 'growth' && plan !== 'agency') {
      return Response.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('email, plan')
      .eq('id', user.id)
      .single()

    if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 })

    if (profile.plan === plan) {
      return Response.json({ error: 'Already on this plan' }, { status: 400 })
    }

    const subscription = await createSubscription(user.id, plan, profile.email)

    return Response.json({
      subscription_id: subscription.id,
      payment_link: subscription.short_url,
    })
  } catch (error) {
    return apiErrorResponse(error, 'subscriptions/create')
  }
}
