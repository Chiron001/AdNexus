import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyWebhookSignature } from '@/lib/razorpay/client'
import { sendPaymentFailedAlert } from '@/lib/email/alerts'

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-razorpay-signature') ?? ''
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!

    if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      return Response.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(rawBody) as {
      event: string
      payload: {
        subscription?: { entity: { id: string; notes: Record<string, string> } }
        payment?: { entity: { id: string; email: string; amount: number } }
      }
    }

    const supabase = createAdminClient()

    if (event.event === 'subscription.charged') {
      const sub = event.payload.subscription?.entity
      if (!sub) return Response.json({ ok: true })

      const userId = sub.notes.user_id
      const plan = sub.notes.plan as 'growth' | 'agency'

      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + 1)

      await supabase
        .from('profiles')
        .update({
          plan,
          plan_expires_at: expiresAt.toISOString(),
          razorpay_customer_id: sub.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
    }

    if (event.event === 'subscription.cancelled') {
      const sub = event.payload.subscription?.entity
      if (!sub) return Response.json({ ok: true })

      const userId = sub.notes.user_id

      // Plan expires at current period end — keep active until then
      // Downgrade handled by checking plan_expires_at on each request
      await supabase
        .from('profiles')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', userId)
    }

    if (event.event === 'payment.failed') {
      const payment = event.payload.payment?.entity
      if (payment?.email) {
        await sendPaymentFailedAlert(payment.email, payment.amount / 100)
      }
    }

    return Response.json({ ok: true })
  } catch (error) {
    console.error('[webhooks/razorpay] error:', error)
    return Response.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
