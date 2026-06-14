import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { razorpay, RAZORPAY_PLANS, TRIAL_SECONDS } from '@/lib/razorpay'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await req.json() as { plan: 'basic' | 'growth' | 'professional' | 'ai' }

  const planId = RAZORPAY_PLANS[plan]
  if (!planId) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  // Fetch user profile for prefill
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name, phone_number, razorpay_subscription_id, razorpay_ai_subscription_id')
    .eq('id', user.id)
    .single()

  // Prevent duplicate subscriptions
  if (plan === 'ai' && profile?.razorpay_ai_subscription_id) {
    return NextResponse.json({ error: 'AI add-on already active' }, { status: 409 })
  }
  if (plan !== 'ai' && profile?.razorpay_subscription_id) {
    return NextResponse.json({ error: 'Already subscribed to a plan' }, { status: 409 })
  }

  const subParams: Record<string, unknown> = {
    plan_id:     planId,
    total_count: 120, // 10 years
    notes: {
      user_id:    user.id,
      plan_key:   plan,
    },
    notify_info: {
      notify_email: 1,
    },
  }

  // Basic plan gets 30-day free trial (first charge after 30 days)
  if (plan === 'basic') {
    subParams.start_at = Math.floor(Date.now() / 1000) + TRIAL_SECONDS
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscription = await razorpay.subscriptions.create(subParams as any)

  return NextResponse.json({
    subscription_id: subscription.id,
    key_id:          process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    user_name:       profile?.full_name ?? '',
    user_email:      profile?.email ?? user.email ?? '',
    user_phone:      profile?.phone_number ?? '',
  })
}
