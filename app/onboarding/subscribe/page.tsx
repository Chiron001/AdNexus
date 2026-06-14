'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckoutButton } from '@/components/billing/CheckoutButton'
import { Zap, Brain, Shield, CheckCircle2, CreditCard, Lock } from 'lucide-react'

const PLANS = [
  {
    key: 'basic' as const,
    label: 'Basic',
    price: '₹1,800',
    period: '/mo',
    trial: '30-day free trial',
    trialNote: 'No charge for 30 days. Card saved securely.',
    color: 'teal',
    icon: Shield,
    features: [
      '1 ad account (Meta, Google, or Amazon)',
      '15 diagnostic checks per month',
      'Issue detection & recommendations',
      'Add AI features for ₹6,499/mo extra',
    ],
    cta: 'Start Free Trial',
    highlight: true,
  },
  {
    key: 'growth' as const,
    label: 'Growth',
    price: '₹8,999',
    period: '/mo',
    trial: null,
    trialNote: 'Billed immediately. Cancel anytime.',
    color: 'blue',
    icon: Zap,
    features: [
      '5 ad accounts',
      '30 diagnostic checks per month',
      'PDF reports & WhatsApp alerts',
      'Add AI features for ₹6,499/mo extra',
    ],
    cta: 'Subscribe to Growth',
    highlight: false,
  },
  {
    key: 'professional' as const,
    label: 'Professional',
    price: '₹46,999',
    period: '/mo',
    trial: null,
    trialNote: 'Billed immediately. Cancel anytime.',
    color: 'purple',
    icon: Brain,
    features: [
      '50 ad accounts',
      'Unlimited diagnostic checks',
      'AI recommendations included',
      'White-label reports + API access',
    ],
    cta: 'Subscribe to Professional',
    highlight: false,
  },
]

const COLOR = {
  teal:   { border: 'border-teal-500/50',   ring: 'ring-teal-500/30',   badge: 'bg-teal-500/15 text-teal-300',   btn: 'bg-teal-600 hover:bg-teal-500',   icon: 'text-teal-400',   label: 'text-teal-400'   },
  blue:   { border: 'border-blue-500/40',   ring: 'ring-blue-500/20',   badge: 'bg-blue-500/15 text-blue-300',   btn: 'bg-blue-600 hover:bg-blue-500',   icon: 'text-blue-400',   label: 'text-blue-400'   },
  purple: { border: 'border-purple-500/40', ring: 'ring-purple-500/20', badge: 'bg-purple-500/15 text-purple-300', btn: 'bg-purple-600 hover:bg-purple-500', icon: 'text-purple-400', label: 'text-purple-400' },
}

export default function SubscribePage() {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [selected, setSelected] = useState<'basic' | 'growth' | 'professional'>('basic')
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState(false)

  useEffect(() => {
    async function check() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, plan')
        .eq('id', user.id)
        .single()

      // Already subscribed — send to dashboard
      if (profile?.plan && profile.plan !== 'free') {
        router.replace('/dashboard')
        return
      }

      setUserName(profile?.full_name ?? user.email?.split('@')[0] ?? '')
      setLoading(false)
    }
    check()
  }, [router])

  async function handleSuccess(subscriptionId: string) {
    setActivating(true)
    try {
      // Verify with Razorpay and update plan immediately — don't wait for webhook
      const res = await fetch('/api/billing/activate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ subscription_id: subscriptionId }),
      })
      if (res.ok) {
        router.push('/dashboard')
        return
      }
    } catch {
      // fall through to polling fallback
    }

    // Fallback: poll Supabase in case activate fails (e.g. Razorpay API delay)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/dashboard'); return }

    let attempts = 0
    const timer = setInterval(async () => {
      attempts++
      const { data } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single()
      if ((data?.plan && data.plan !== 'free') || attempts >= 15) {
        clearInterval(timer)
        router.push('/dashboard')
      }
    }, 2000)
  }

  const trialEnd = new Date()
  trialEnd.setDate(trialEnd.getDate() + 30)
  const trialEndStr = trialEnd.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (activating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 gap-5">
        <div className="w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
        <div className="text-center">
          <p className="text-white font-bold text-lg">Activating your account…</p>
          <p className="text-zinc-500 text-sm mt-1">This usually takes a few seconds</p>
        </div>
      </div>
    )
  }

  const activePlan = PLANS.find(p => p.key === selected)!
  const c = COLOR[activePlan.color as keyof typeof COLOR]

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{
        background: '#070810',
        backgroundImage: [
          'radial-gradient(ellipse 70% 50% at 20% 0%, rgba(124,58,237,0.10) 0%, transparent 60%)',
          'radial-gradient(ellipse 60% 50% at 85% 90%, rgba(37,99,235,0.07) 0%, transparent 60%)',
        ].join(', '),
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-black text-white tracking-tight">Adnexusone</span>
      </div>

      {/* Heading */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
          {userName ? `Welcome, ${userName.split(' ')[0]}!` : 'Welcome!'}
        </h1>
        <p className="text-zinc-400 text-sm max-w-md mx-auto">
          Choose your plan to get started. The Basic plan is <span className="text-teal-400 font-semibold">free for 30 days</span> — your card won&apos;t be charged until {trialEndStr}.
        </p>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mb-6">
        {PLANS.map(plan => {
          const pc = COLOR[plan.color as keyof typeof COLOR]
          const isSelected = selected === plan.key
          const Icon = plan.icon
          return (
            <button
              key={plan.key}
              onClick={() => setSelected(plan.key)}
              className={`relative text-left rounded-2xl p-5 transition-all border ${
                isSelected
                  ? `${pc.border} ring-2 ${pc.ring} bg-white/[0.06]`
                  : 'border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05]'
              }`}
            >
              {plan.trial && (
                <div className={`absolute -top-2.5 left-4 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${pc.badge}`}>
                  {plan.trial}
                </div>
              )}
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <CheckCircle2 className={`w-4 h-4 ${pc.icon}`} />
                </div>
              )}
              <Icon className={`w-5 h-5 ${pc.icon} mb-3`} />
              <p className={`text-sm font-bold ${pc.label}`}>{plan.label}</p>
              <p className="text-2xl font-black text-white mt-1">
                {plan.price}<span className="text-sm font-normal text-zinc-500">{plan.period}</span>
              </p>
              <ul className="mt-3 space-y-1.5">
                {plan.features.map(f => (
                  <li key={f} className="text-xs text-zinc-400 flex items-start gap-1.5">
                    <span className={`${pc.icon} mt-0.5 shrink-0`}>✓</span> {f}
                  </li>
                ))}
              </ul>
            </button>
          )
        })}
      </div>

      {/* Checkout */}
      <div className="w-full max-w-sm space-y-3">
        <CheckoutButton
          plan={selected}
          label={activePlan.cta}
          className={`w-full py-3 rounded-xl text-sm font-bold text-white transition-colors ${c.btn}`}
          onSuccess={handleSuccess}
        />

        <div className="flex items-center justify-center gap-4 text-[11px] text-zinc-600">
          <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Secured by Razorpay</span>
          <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> {activePlan.trialNote}</span>
        </div>
      </div>

      <p className="text-xs text-zinc-700 mt-6 text-center max-w-xs">
        By subscribing you agree to our{' '}
        <a href="/terms" className="text-zinc-600 hover:text-zinc-500 underline">Terms</a>
        {' '}and{' '}
        <a href="/privacy" className="text-zinc-600 hover:text-zinc-500 underline">Privacy Policy</a>
      </p>
    </div>
  )
}
