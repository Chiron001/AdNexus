export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyWebhookSignature } from '@/lib/razorpay/client'
import { sendPaymentFailedAlert } from '@/lib/email/alerts'
import type { BillingEventType } from '@/types/database'

interface RazorpaySubscriptionEntity {
  id: string
  status: string
  current_end?: number   // Unix timestamp — end of current billing cycle
  notes: Record<string, string>
}

interface RazorpayPaymentEntity {
  id: string
  email: string
  amount: number
}

interface RazorpayWebhookEvent {
  event: string
  payload: {
    subscription?: { entity: RazorpaySubscriptionEntity }
    payment?:      { entity: RazorpayPaymentEntity }
  }
}

async function logBillingEvent(params: {
  supabase: ReturnType<typeof createAdminClient>
  userId: string
  eventType: BillingEventType
  plan?: string
  amountInr?: number
  subscriptionId?: string
  paymentId?: string
  periodStart?: string
  periodEnd?: string
  metadata?: Record<string, unknown>
}) {
  const { supabase, userId, eventType, ...rest } = params
  await supabase.from('billing_events').insert({
    user_id:                   userId,
    event_type:                eventType,
    plan:                      rest.plan ?? null,
    amount_inr:                rest.amountInr ?? null,
    razorpay_subscription_id:  rest.subscriptionId ?? null,
    razorpay_payment_id:       rest.paymentId ?? null,
    period_start:              rest.periodStart ?? null,
    period_end:                rest.periodEnd ?? null,
    metadata:                  (rest.metadata ?? {}) as import('@/types/database').Json,
  })
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-razorpay-signature') ?? ''
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!

    if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      return Response.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(rawBody) as RazorpayWebhookEvent
    const supabase = createAdminClient()

    // ── subscription.charged ─────────────────────────────────
    if (event.event === 'subscription.charged') {
      const sub = event.payload.subscription?.entity
      if (!sub) return Response.json({ ok: true })

      const userId   = sub.notes.user_id
      const plan     = sub.notes.plan as 'growth' | 'agency'
      const payment  = event.payload.payment?.entity

      const periodStart = new Date()
      const periodEnd   = new Date()
      periodEnd.setMonth(periodEnd.getMonth() + 1)

      await supabase
        .from('profiles')
        .update({
          plan,
          plan_expires_at:      periodEnd.toISOString(),
          razorpay_customer_id: sub.id,
          updated_at:           new Date().toISOString(),
        })
        .eq('id', userId)

      await logBillingEvent({
        supabase,
        userId,
        eventType:      'subscription.charged',
        plan,
        amountInr:      payment ? payment.amount / 100 : undefined,
        subscriptionId: sub.id,
        paymentId:      payment?.id,
        periodStart:    periodStart.toISOString(),
        periodEnd:      periodEnd.toISOString(),
      })
    }

    // ── subscription.cancelled ───────────────────────────────
    // Razorpay sends current_end (Unix timestamp) = last day of paid period.
    // User keeps access until that date; cron/expire route downgrades after.
    if (event.event === 'subscription.cancelled') {
      const sub = event.payload.subscription?.entity
      if (!sub) return Response.json({ ok: true })

      const userId = sub.notes.user_id
      const plan   = sub.notes.plan

      // Use Razorpay's current_end if available, otherwise keep existing expiry
      const periodEnd = sub.current_end
        ? new Date(sub.current_end * 1000)
        : null

      await supabase.from('profiles').update({
        updated_at: new Date().toISOString(),
        ...(periodEnd ? { plan_expires_at: periodEnd.toISOString() } : {}),
      }).eq('id', userId)

      await logBillingEvent({
        supabase,
        userId,
        eventType:      'subscription.cancelled',
        plan,
        subscriptionId: sub.id,
        periodEnd:      periodEnd?.toISOString(),
        metadata:       { status: sub.status },
      })
    }

    // ── payment.failed ───────────────────────────────────────
    if (event.event === 'payment.failed') {
      const payment = event.payload.payment?.entity
      const sub     = event.payload.subscription?.entity

      if (payment?.email) {
        await sendPaymentFailedAlert(payment.email, payment.amount / 100)
      }

      if (sub?.notes?.user_id) {
        await logBillingEvent({
          supabase,
          userId:         sub.notes.user_id,
          eventType:      'payment.failed',
          plan:           sub.notes.plan,
          amountInr:      payment ? payment.amount / 100 : undefined,
          subscriptionId: sub.id,
          paymentId:      payment?.id,
          metadata:       { payment_email: payment?.email },
        })
      }
    }

    return Response.json({ ok: true })
  } catch (error) {
    console.error('[webhooks/razorpay] error:', error)
    return Response.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
