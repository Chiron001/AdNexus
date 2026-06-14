import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/server'
import { planFromRazorpayId, RAZORPAY_PLANS } from '@/lib/razorpay'

function verifySignature(body: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) return true // allow if secret not configured (dev only)
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RazorpayEvent = Record<string, any>

export async function POST(req: Request) {
  const signature = req.headers.get('x-razorpay-signature') ?? ''
  const body = await req.text()

  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event: RazorpayEvent = JSON.parse(body)
  const admin = createAdminClient()

  try {
    switch (event.event) {

      case 'subscription.activated':
      case 'subscription.charged': {
        const sub = event.payload?.subscription?.entity
        if (!sub) break

        const userId   = sub.notes?.user_id as string | undefined
        const planKey  = planFromRazorpayId(sub.plan_id as string)
        if (!userId || !planKey) break

        const isAI       = sub.plan_id === RAZORPAY_PLANS.ai
        const isTrialing = event.event === 'subscription.activated' && sub.start_at && (sub.start_at as number) > Math.floor(Date.now() / 1000)
        const status     = isTrialing ? 'trialing' : 'active'
        const trialEndsAt = isTrialing ? new Date((sub.start_at as number) * 1000).toISOString() : null

        if (isAI) {
          await admin.from('profiles').update({
            has_ai_addon:                true,
            razorpay_ai_subscription_id: sub.id as string,
          }).eq('id', userId)
        } else {
          const dbPlan = planKey as 'basic' | 'growth' | 'professional'
          await admin.from('profiles').update({
            plan:                     dbPlan,
            razorpay_subscription_id: sub.id as string,
            subscription_status:      status,
            ...(trialEndsAt ? { trial_ends_at: trialEndsAt } : {}),
          }).eq('id', userId)
        }

        // Log billing event
        if (event.event === 'subscription.charged') {
          const payment = event.payload?.payment?.entity
          await admin.from('billing_events').insert({
            user_id:    userId,
            event_type: 'subscription.charged',
            plan:       isAI ? 'ai_addon' : planKey,
            amount_inr: payment?.amount ? Math.round((payment.amount as number) / 100) : null,
          })
        }
        break
      }

      case 'subscription.cancelled':
      case 'subscription.completed': {
        const sub = event.payload?.subscription?.entity
        if (!sub) break

        const userId  = sub.notes?.user_id as string | undefined
        const planKey = planFromRazorpayId(sub.plan_id as string)
        if (!userId || !planKey) break

        const isAI = sub.plan_id === RAZORPAY_PLANS.ai

        if (isAI) {
          await admin.from('profiles').update({
            has_ai_addon:               false,
            razorpay_ai_subscription_id: null,
          }).eq('id', userId)
        } else {
          await admin.from('profiles').update({
            plan:                     'free',
            razorpay_subscription_id: null,
            subscription_status:      'cancelled',
            trial_ends_at:            null,
          }).eq('id', userId)
        }

        await admin.from('billing_events').insert({
          user_id:    userId,
          event_type: 'subscription.cancelled',
          plan:       isAI ? 'ai_addon' : planKey,
          amount_inr: null,
        })
        break
      }

      case 'payment.failed': {
        const payment = event.payload?.payment?.entity
        const subId   = payment?.subscription_id as string | undefined
        if (!subId) break

        const { data: profile } = await admin
          .from('profiles')
          .select('id, plan')
          .eq('razorpay_subscription_id', subId)
          .maybeSingle()

        if (profile) {
          await admin.from('profiles').update({ subscription_status: 'past_due' }).eq('id', profile.id)
          await admin.from('billing_events').insert({
            user_id:    profile.id,
            event_type: 'payment.failed',
            plan:       profile.plan,
            amount_inr: payment?.amount ? Math.round((payment.amount as number) / 100) : null,
          })
        }
        break
      }
    }
  } catch (err) {
    console.error('Webhook error:', err)
    // Still return 200 so Razorpay doesn't retry infinitely
  }

  return NextResponse.json({ received: true })
}
