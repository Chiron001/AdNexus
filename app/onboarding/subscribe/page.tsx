'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckoutButton } from '@/components/billing/CheckoutButton'
import {
  Zap, Brain, Shield, Check, CreditCard, Lock, LogOut, Plug, Activity, Wand2, RotateCcw,
} from 'lucide-react'
import { SiMeta, SiGoogleads } from 'react-icons/si'
import { FaAmazon } from 'react-icons/fa'
import { BrandMark } from '@/components/landing/LandingNav'
import { Ridges, NightGlow } from '@/components/landing/io-art'

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


type PlanKey = typeof PLANS[number]['key']

// Signup records the plan picked on the pricing page as plan_intent
const INTENT_PLAN: Record<string, PlanKey> = { basic: 'basic', growth: 'growth', agency: 'professional', professional: 'professional' }

const JOURNEY = ['Create account', 'Choose plan', 'Connect ad accounts', 'First health score']

const NEXT_STEPS = [
  { icon: Plug,     title: 'Connect your ad accounts', desc: 'Meta, Google or Amazon — read access in a few clicks.' },
  { icon: Activity, title: 'Get your health score',    desc: 'Your first diagnostic runs as soon as data syncs.' },
  { icon: Wand2,    title: 'Fix what matters first',   desc: 'Issues ranked by revenue impact, with the fix spelled out.' },
]

export default function SubscribePage() {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [selected, setSelected] = useState<PlanKey>('basic')
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

      const intent = INTENT_PLAN[String(user.user_metadata?.plan_intent ?? '')]
      if (intent) setSelected(intent)
      setUserName(profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || '')
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

  async function signOut() {
    await createClient().auth.signOut()
    router.replace('/login')
  }

  const trialEnd = new Date()
  trialEnd.setDate(trialEnd.getDate() + 30)
  const trialEndStr = trialEnd.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

  if (loading || activating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 io-canvas">
        <span className="relative w-14 h-14">
          <span className="absolute inset-0 rounded-full io-breathe" style={{ background: 'radial-gradient(closest-side, rgba(124,58,237,.35), transparent)', transform: 'scale(1.8)' }} />
          <span className="absolute inset-0 rounded-full border-[3px] border-[var(--io-line)] border-t-[var(--io-accent-2)] animate-spin" />
        </span>
        {activating && (
          <div className="text-center io-fade">
            <p className="io-display text-xl font-semibold text-[var(--io-ink)]">Activating your account…</p>
            <p className="text-sm text-[var(--io-ink-soft)] mt-1">This usually takes a few seconds</p>
          </div>
        )}
      </div>
    )
  }

  const activePlan = PLANS.find(p => p.key === selected)!
  const firstName  = userName.split(' ')[0]
  const greetName  = firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1) : ''

  return (
    <div className="min-h-screen io-canvas overflow-x-hidden">
      {/* ── Dark welcome band ───────────────────────── */}
      <section className="relative overflow-hidden text-white pb-44 sm:pb-48" style={{ background: 'var(--io-night)' }}>
        <NightGlow />
        <Ridges className="absolute left-0 right-0 bottom-0 w-full h-[55%]" id="onboard" />

        <div className="relative max-w-[1100px] mx-auto px-5 sm:px-6">
          <header className="flex items-center justify-between py-6">
            <BrandMark />
            <button onClick={signOut} className="io-link text-white/60 hover:text-white transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </header>

          {/* Journey */}
          <ol className="io-fade flex items-center justify-center gap-2 sm:gap-3 mt-6 mb-10 flex-wrap" style={{ animationDelay: '.05s' }}>
            {JOURNEY.map((label, i) => (
              <li key={label} className="flex items-center gap-2 sm:gap-3">
                <span className={`flex items-center gap-2 rounded-full pl-1 pr-3 py-1 text-xs font-semibold border ${
                  i === 1 ? 'bg-white text-[var(--io-ink)] border-white' : i === 0 ? 'border-white/20 text-white/85' : 'border-white/10 text-white/45'
                }`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${i <= 1 ? 'text-white' : 'border border-white/20'}`}
                    style={i <= 1 ? { background: 'linear-gradient(135deg,var(--io-accent),var(--io-accent-2))' } : undefined}>
                    {i === 0 ? <Check className="w-3 h-3" strokeWidth={3} /> : i + 1}
                  </span>
                  <span className={i === 1 ? '' : 'hidden sm:inline'}>{label}</span>
                </span>
                {i < JOURNEY.length - 1 && <span className={`w-4 sm:w-8 h-px ${i === 0 ? 'bg-white/40' : 'bg-white/15'}`} />}
              </li>
            ))}
          </ol>

          <div className="text-center max-w-2xl mx-auto">
            <h1 className="io-display text-[2.2rem] sm:text-[3rem] font-medium leading-[1.06] tracking-[-0.025em] mb-4">
              <span className="io-rise-line"><span style={{ animationDelay: '.1s' }}>{greetName ? `Welcome, ${greetName}.` : 'Welcome aboard.'}</span></span>
              <span className="io-rise-line"><span style={{ animationDelay: '.22s' }}>Pick a plan to <span className="io-grad-text" style={{ backgroundImage: 'linear-gradient(90deg,#8FA6FF,#C4B5FD)' }}>get started.</span></span></span>
            </h1>
            <p className="io-fade text-white/65 leading-relaxed" style={{ animationDelay: '.4s' }}>
              Basic is <span className="text-white font-semibold">free for 30 days</span> — your card won&apos;t be charged until {trialEndStr}.
            </p>
          </div>
        </div>
      </section>

      {/* ── Plans ───────────────────────────────────── */}
      <main className="relative z-10 max-w-[1100px] mx-auto px-5 sm:px-6 -mt-36 sm:-mt-40 pb-16">
        <div role="radiogroup" aria-label="Plans" className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {PLANS.map((plan, i) => {
            const on = selected === plan.key
            const Icon = plan.icon
            return (
              <button key={plan.key} role="radio" aria-checked={on} onClick={() => setSelected(plan.key)}
                className={`io-pop group relative text-left rounded-[24px] ${on ? 'io-auth-ring' : ''}`}
                style={{ animationDelay: `${0.35 + i * 0.1}s` }}>
                <div className={`relative h-full rounded-[24px] bg-white p-6 sm:p-7 border transition-all duration-500 ${
                  on ? 'border-transparent shadow-[0_30px_70px_-30px_rgba(59,91,253,.45)]'
                     : 'border-[var(--io-line)] shadow-[0_12px_32px_-18px_rgba(28,24,48,.18)] group-hover:-translate-y-1 group-hover:shadow-[0_24px_50px_-24px_rgba(28,24,48,.3)]'
                }`}>
                  {plan.trial && (
                    <span className="absolute -top-3 left-6 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-md"
                      style={{ background: 'linear-gradient(90deg,var(--io-accent),var(--io-accent-2))' }}>
                      {plan.trial}
                    </span>
                  )}

                  <div className="flex items-start justify-between mb-5">
                    <span className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors duration-300 ${on ? 'text-white' : 'bg-[var(--io-canvas)] text-[var(--io-ink)]'}`}
                      style={on ? { background: 'linear-gradient(135deg,var(--io-accent),var(--io-accent-2))' } : undefined}>
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${on ? 'text-white scale-100' : 'border-2 border-[var(--io-line)] scale-90'}`}
                      style={on ? { background: 'linear-gradient(135deg,var(--io-accent),var(--io-accent-2))' } : undefined}>
                      {on && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-[var(--io-ink-soft)]">{plan.label}</p>
                  <p className="io-display text-[2.1rem] font-semibold text-[var(--io-ink)] leading-tight mt-0.5">
                    {plan.price}<span className="text-sm font-medium text-[var(--io-ink-soft)]">{plan.period}</span>
                  </p>
                  <p className="text-xs text-[var(--io-ink-soft)] mt-1">{plan.trialNote}</p>

                  <span className="block h-px bg-[var(--io-line)] my-5" />

                  <ul className="space-y-2.5">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-[13px] text-[var(--io-ink)]">
                        <span className="w-4 h-4 mt-0.5 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                          <Check className="w-2.5 h-2.5 text-emerald-600" strokeWidth={3} />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </button>
            )
          })}
        </div>

        {/* ── Checkout summary ──────────────────────── */}
        <div className="io-fade mt-8 rounded-[24px] bg-white border border-[var(--io-line)] shadow-[0_12px_32px_-18px_rgba(28,24,48,.18)] p-5 sm:p-6 flex flex-col md:flex-row md:items-center gap-5" style={{ animationDelay: '.7s' }}>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] io-grad-text">Your plan</p>
            <p className="io-display text-xl font-semibold text-[var(--io-ink)] mt-1">
              {activePlan.label} · {activePlan.price}<span className="text-sm font-medium text-[var(--io-ink-soft)]">{activePlan.period}</span>
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-[var(--io-ink-soft)]">
              <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Secured by Razorpay</span>
              <span className="flex items-center gap-1.5">
                {activePlan.trial ? <CreditCard className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5" />}
                {activePlan.trial ? `No charge until ${trialEndStr}` : activePlan.trialNote}
              </span>
            </div>
          </div>
          <div className="md:w-[300px] flex-shrink-0">
            <CheckoutButton
              plan={selected}
              label={activePlan.cta}
              className="io-btn io-btn-primary w-full !py-[15px] disabled:opacity-60 disabled:pointer-events-none"
              onSuccess={handleSuccess}
            />
          </div>
        </div>

        {/* ── What happens next ─────────────────────── */}
        <div className="mt-14">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--io-ink-soft)] mb-6">What happens next</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {NEXT_STEPS.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="io-fade flex gap-3.5 rounded-2xl p-4" style={{ animationDelay: `${0.8 + i * 0.08}s` }}>
                <span className="w-10 h-10 rounded-xl bg-white border border-[var(--io-line)] flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Icon className="w-4 h-4 text-[var(--io-accent-2)]" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[var(--io-ink)]"><span className="text-[var(--io-ink-soft)] mr-1.5 tabular-nums">0{i + 1}</span>{title}</p>
                  <p className="text-[13px] text-[var(--io-ink-soft)] mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-3 mt-8 text-[var(--io-ink-soft)]">
            <SiMeta className="w-4 h-4" style={{ color: '#0081FB' }} />
            <SiGoogleads className="w-4 h-4" style={{ color: '#4285F4' }} />
            <FaAmazon className="w-4 h-4" style={{ color: '#FF9900' }} />
            <span className="text-xs">Works with Meta, Google and Amazon Ads</span>
          </div>
        </div>

        <p className="text-xs text-[var(--io-ink-soft)] mt-10 text-center">
          By subscribing you agree to our{' '}
          <a href="https://adnexusone.com/terms" className="underline-offset-2 hover:underline hover:text-[var(--io-ink)]">Terms</a>
          {' '}and{' '}
          <a href="https://adnexusone.com/privacy" className="underline-offset-2 hover:underline hover:text-[var(--io-ink)]">Privacy Policy</a>
        </p>
      </main>
    </div>
  )
}
