import Razorpay from 'razorpay'

export const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

// Razorpay Plan IDs — set in Vercel env vars
export const RAZORPAY_PLANS = {
  basic:        process.env.RAZORPAY_PLAN_BASIC!,        // ₹1,800/mo
  growth:       process.env.RAZORPAY_PLAN_GROWTH!,       // ₹8,999/mo
  ai:           process.env.RAZORPAY_PLAN_AI!,           // ₹6,499/mo (add-on)
  professional: process.env.RAZORPAY_PLAN_PROFESSIONAL!, // ₹46,999/mo
} as const

export type RazorpayPlanKey = keyof typeof RAZORPAY_PLANS

// Reverse map: Razorpay plan_id → internal plan tier
export function planFromRazorpayId(planId: string): 'basic' | 'growth' | 'professional' | 'ai' | null {
  for (const [key, id] of Object.entries(RAZORPAY_PLANS)) {
    if (id === planId) return key as 'basic' | 'growth' | 'professional' | 'ai'
  }
  return null
}

// 30-day trial offset in seconds
export const TRIAL_SECONDS = 30 * 24 * 60 * 60
