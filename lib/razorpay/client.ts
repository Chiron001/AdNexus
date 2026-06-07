import Razorpay from 'razorpay'
import crypto from 'crypto'

let _razorpay: Razorpay | null = null
function getRazorpay(): Razorpay {
  if (!_razorpay) {
    _razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID ?? '',
      key_secret: process.env.RAZORPAY_KEY_SECRET ?? '',
    })
  }
  return _razorpay
}

export const PLAN_IDS = {
  growth: process.env.RAZORPAY_PLAN_GROWTH_ID ?? '',
  agency: process.env.RAZORPAY_PLAN_AGENCY_ID ?? '',
} as const

export type PlanId = keyof typeof PLAN_IDS

export async function createSubscription(
  userId: string,
  planId: PlanId,
  customerEmail: string
): Promise<{ id: string; short_url: string }> {
  const subscription = await getRazorpay().subscriptions.create({
    plan_id: PLAN_IDS[planId],
    customer_notify: 1,
    quantity: 1,
    total_count: 12,
    notes: {
      user_id: userId,
      plan: planId,
      email: customerEmail,
    },
  })
  return subscription as { id: string; short_url: string }
}

export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(signature, 'hex')
  )
}
