import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { razorpay, planFromRazorpayId } from '@/lib/razorpay'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { subscription_id } = await req.json() as { subscription_id: string }
  if (!subscription_id) return NextResponse.json({ error: 'Missing subscription_id' }, { status: 400 })

  // Verify subscription exists in Razorpay and belongs to this user
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sub = await (razorpay.subscriptions as any).fetch(subscription_id)
  if (!sub || sub.notes?.user_id !== user.id) {
    return NextResponse.json({ error: 'Subscription not found or mismatch' }, { status: 403 })
  }

  const planKey = planFromRazorpayId(sub.plan_id)
  if (!planKey) return NextResponse.json({ error: 'Unknown plan' }, { status: 400 })

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  if (planKey === 'ai') {
    await admin.from('profiles').update({
      has_ai_addon: true,
      razorpay_ai_subscription_id: subscription_id,
      subscription_status: sub.status,
    }).eq('id', user.id)
    return NextResponse.json({ ok: true, plan: 'ai' })
  }

  await admin.from('profiles').update({
    plan: planKey,
    razorpay_subscription_id: subscription_id,
    subscription_status: sub.status,
  }).eq('id', user.id)

  return NextResponse.json({ ok: true, plan: planKey })
}
