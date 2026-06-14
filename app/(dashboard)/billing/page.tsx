'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckoutButton } from '@/components/billing/CheckoutButton'
import { Zap, Brain, Shield, Calendar, CheckCircle2, AlertCircle, Clock, ArrowUpRight, Sparkles } from 'lucide-react'

/* ── Types ─────────────────────────────────────────── */
type PlanKey = 'free' | 'basic' | 'growth' | 'professional' | 'agency' | 'custom'

type Profile = {
  plan: PlanKey
  has_ai_addon: boolean
  subscription_status: string | null
  trial_ends_at: string | null
  razorpay_subscription_id: string | null
  razorpay_ai_subscription_id: string | null
  full_name: string | null
  company_name: string | null
}

type BillingEvent = {
  id: string
  event_type: string
  plan: string | null
  amount_inr: number | null
  created_at: string
}

/* ── Constants ─────────────────────────────────────── */
const PLAN_META: Record<PlanKey, { label: string; priceInr: string; color: string; badge: string }> = {
  free:         { label: 'No Plan',      priceInr: '—',          color: 'text-zinc-400',   badge: 'bg-zinc-800 text-zinc-400 border border-zinc-700' },
  basic:        { label: 'Basic',        priceInr: '₹1,800/mo',  color: 'text-teal-400',   badge: 'bg-teal-500/15 text-teal-300 border border-teal-500/25' },
  growth:       { label: 'Growth',       priceInr: '₹8,999/mo',  color: 'text-blue-400',   badge: 'bg-blue-500/15 text-blue-300 border border-blue-500/25' },
  professional: { label: 'Professional', priceInr: '₹46,999/mo', color: 'text-purple-400', badge: 'bg-purple-500/15 text-purple-300 border border-purple-500/25' },
  agency:       { label: 'Professional', priceInr: '₹46,999/mo', color: 'text-purple-400', badge: 'bg-purple-500/15 text-purple-300 border border-purple-500/25' },
  custom:       { label: 'Custom',       priceInr: 'Custom',     color: 'text-emerald-400',badge: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25' },
}

const EVENT_LABEL: Record<string, string> = {
  'subscription.charged':   'Subscription payment',
  'subscription.cancelled': 'Subscription cancelled',
  'payment.failed':         'Payment failed',
  'plan.upgraded':          'Plan upgraded',
  'plan.downgraded':        'Plan downgraded',
  'plan.override':          'Manual plan change',
}

/* ── Helpers ───────────────────────────────────────── */
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function trialDaysLeft(trialEndsAt: string | null): number | null {
  if (!trialEndsAt) return null
  const diff = new Date(trialEndsAt).getTime() - Date.now()
  if (diff <= 0) return 0
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl bg-white/[0.04] border border-white/[0.08] ${className}`}>
      {children}
    </div>
  )
}

function EventBadge({ type }: { type: string }) {
  if (type === 'subscription.charged') return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
      <CheckCircle2 className="w-3 h-3" /> Paid
    </span>
  )
  if (type === 'payment.failed') return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">
      <AlertCircle className="w-3 h-3" /> Failed
    </span>
  )
  if (type === 'plan.upgraded') return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">
      <ArrowUpRight className="w-3 h-3" /> Upgraded
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
      <Clock className="w-3 h-3" /> {type.split('.')[1] ?? type}
    </span>
  )
}

/* ── Page ──────────────────────────────────────────── */
export default function BillingPage() {
  const [profile, setProfile]   = useState<Profile | null>(null)
  const [events, setEvents]     = useState<BillingEvent[]>([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState<'plans' | 'history'>('plans')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: p }, { data: ev }] = await Promise.all([
        supabase
          .from('profiles')
          .select('plan, has_ai_addon, subscription_status, trial_ends_at, razorpay_subscription_id, razorpay_ai_subscription_id, full_name, company_name')
          .eq('id', user.id)
          .single(),
        supabase
          .from('billing_events')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(30),
      ])

      setProfile(p as Profile)
      setEvents(ev ?? [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const plan        = (profile?.plan ?? 'free') as PlanKey
  const meta        = PLAN_META[plan] ?? PLAN_META.free
  const hasAI       = profile?.has_ai_addon ?? false
  const status      = profile?.subscription_status
  const daysLeft    = trialDaysLeft(profile?.trial_ends_at ?? null)
  const isTrialing  = status === 'trialing' && daysLeft !== null && daysLeft > 0
  const hasPlan     = plan !== 'free'
  const hasBasicSub = plan === 'basic' || plan === 'growth'

  const totalPaid = events
    .filter(e => e.event_type === 'subscription.charged')
    .reduce((s, e) => s + (e.amount_inr ?? 0), 0)

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage your subscription and add-ons</p>
      </div>

      {/* Trial banner */}
      {isTrialing && (
        <div className="rounded-xl p-4 bg-teal-500/10 border border-teal-500/25 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-teal-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-teal-300">
              {daysLeft} day{daysLeft !== 1 ? 's' : ''} left in your free trial
            </p>
            <p className="text-xs text-teal-500 mt-0.5">
              Your Basic plan trial ends {fmtDate(profile!.trial_ends_at!)}. No charge until then.
            </p>
          </div>
        </div>
      )}

      {/* Current status strip */}
      {hasPlan && (
        <Card className="p-4 flex items-center gap-4">
          <div className={`text-2xl font-black ${meta.color}`}>{meta.label}</div>
          <div className="flex-1">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${meta.badge}`}>
              {isTrialing ? 'Trial' : status === 'active' ? 'Active' : status ?? 'Active'}
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-white">{meta.priceInr}</p>
            {hasAI && (
              <p className="text-[11px] text-purple-400 font-medium">+ AI Add-on</p>
            )}
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/[0.07]">
        {(['plans', 'history'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t ? 'border-purple-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {t === 'plans' ? 'Plans & Add-ons' : 'Payment History'}
          </button>
        ))}
      </div>

      {/* ── PLANS TAB ─────────────────────────────── */}
      {tab === 'plans' && (
        <div className="space-y-4">

          {/* 3 main plans */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Basic */}
            <Card className={`p-5 flex flex-col ${plan === 'basic' ? 'border-teal-500/40' : ''}`}>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-teal-400" />
                <span className="text-sm font-bold text-white">Basic</span>
                {plan === 'basic' && <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/25">Current</span>}
              </div>
              <p className="text-2xl font-black text-teal-400 mt-2">₹1,800<span className="text-sm font-normal text-zinc-500">/mo</span></p>
              <p className="text-[11px] text-teal-600 font-medium mb-3">30-day free trial</p>
              <ul className="space-y-1.5 text-xs text-zinc-400 mb-5 flex-1">
                <li>✓ 2 ad accounts</li>
                <li>✓ 15 diagnostic checks/mo</li>
                <li>✓ Meta, Google & Amazon</li>
                <li>✗ AI (requires add-on)</li>
              </ul>
              {plan === 'basic' ? (
                <div className="text-xs text-center text-zinc-600 py-2">Your current plan</div>
              ) : !hasPlan ? (
                <CheckoutButton
                  plan="basic"
                  label="Start Free Trial"
                  className="w-full py-2 rounded-lg text-sm font-semibold text-white bg-teal-600 hover:bg-teal-500 transition-colors"
                />
              ) : null}
            </Card>

            {/* Growth */}
            <Card className={`p-5 flex flex-col ${plan === 'growth' ? 'border-blue-500/40' : ''}`}>
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-bold text-white">Growth</span>
                {plan === 'growth' && <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/25">Current</span>}
              </div>
              <p className="text-2xl font-black text-blue-400 mt-2">₹8,999<span className="text-sm font-normal text-zinc-500">/mo</span></p>
              <p className="text-[11px] text-zinc-600 mb-3">No trial</p>
              <ul className="space-y-1.5 text-xs text-zinc-400 mb-5 flex-1">
                <li>✓ 5 ad accounts</li>
                <li>✓ 30 diagnostic checks/mo</li>
                <li>✓ PDF reports</li>
                <li>✗ AI (requires add-on)</li>
              </ul>
              {plan === 'growth' ? (
                <div className="text-xs text-center text-zinc-600 py-2">Your current plan</div>
              ) : (plan === 'basic' || !hasPlan) ? (
                <CheckoutButton
                  plan="growth"
                  label={plan === 'basic' ? 'Upgrade to Growth' : 'Subscribe'}
                  className="w-full py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
                />
              ) : null}
            </Card>

            {/* Professional */}
            <Card className={`p-5 flex flex-col relative overflow-hidden ${plan === 'professional' || plan === 'agency' ? 'border-purple-500/40' : 'border-purple-500/20'}`}>
              <div className="absolute top-0 right-0 bg-purple-500/20 text-purple-300 text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                AI Included
              </div>
              <div className="flex items-center gap-2 mb-1">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-bold text-white">Professional</span>
                {(plan === 'professional' || plan === 'agency') && <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/25">Current</span>}
              </div>
              <p className="text-2xl font-black text-purple-400 mt-2">₹46,999<span className="text-sm font-normal text-zinc-500">/mo</span></p>
              <p className="text-[11px] text-zinc-600 mb-3">No trial</p>
              <ul className="space-y-1.5 text-xs text-zinc-400 mb-5 flex-1">
                <li>✓ 50 ad accounts</li>
                <li>✓ Unlimited checks</li>
                <li>✓ AI recommendations included</li>
                <li>✓ White-label + API access</li>
              </ul>
              {(plan === 'professional' || plan === 'agency') ? (
                <div className="text-xs text-center text-zinc-600 py-2">Your current plan</div>
              ) : (
                <CheckoutButton
                  plan="professional"
                  label="Subscribe"
                  className="w-full py-2 rounded-lg text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-colors"
                />
              )}
            </Card>
          </div>

          {/* AI Add-on */}
          {hasBasicSub && (
            <Card className={`p-5 ${hasAI ? 'border-yellow-500/30 bg-yellow-500/[0.03]' : ''}`}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/15 border border-yellow-500/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">AI Add-on</p>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">₹6,499/mo</span>
                    {hasAI && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">Active</span>}
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    AI-written fix instructions, campaign recommendations & anomaly detection. Works on Basic and Growth plans.
                  </p>
                </div>
                {!hasAI && (
                  <CheckoutButton
                    plan="ai"
                    label="Add AI"
                    className="shrink-0 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-yellow-600 hover:bg-yellow-500 transition-colors"
                  />
                )}
                {hasAI && (
                  <div className="shrink-0 flex items-center gap-1 text-emerald-400 text-sm font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> Active
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Summary */}
          {hasPlan && (
            <Card className="p-5">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Billing Summary</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">{meta.label} Plan</span>
                  <span className="text-white font-medium">{meta.priceInr}</span>
                </div>
                {hasAI && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">AI Add-on</span>
                    <span className="text-white font-medium">₹6,499/mo</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-white/[0.07] font-semibold">
                  <span className="text-zinc-300">Total / month</span>
                  <span className="text-white">
                    ₹{(
                      (plan === 'basic' ? 1800 : plan === 'growth' ? 8999 : plan === 'professional' || plan === 'agency' ? 46999 : 0)
                      + (hasAI ? 6499 : 0)
                    ).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
              <p className="text-xs text-zinc-600 mt-3">All amounts in INR · Billed monthly · Cancel anytime from Razorpay dashboard</p>
            </Card>
          )}
        </div>
      )}

      {/* ── HISTORY TAB ───────────────────────────── */}
      {tab === 'history' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <p className="text-xs text-zinc-500 mb-1">Total Paid</p>
              <p className="text-2xl font-black text-white">₹{totalPaid.toLocaleString('en-IN')}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-zinc-500 mb-1">Payments</p>
              <p className="text-2xl font-black text-white">
                {events.filter(e => e.event_type === 'subscription.charged').length}
              </p>
            </Card>
          </div>

          <Card>
            {events.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-zinc-500 text-sm">No payment history yet</p>
                <p className="text-xs text-zinc-600 mt-1">Your first charge will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {events.map(ev => (
                  <div key={ev.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{EVENT_LABEL[ev.event_type] ?? ev.event_type}</p>
                      <p className="text-xs text-zinc-600 mt-0.5 capitalize">{ev.plan ? `${ev.plan} plan` : '—'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {ev.amount_inr != null && ev.amount_inr > 0 && (
                        <p className="text-sm font-semibold text-white">₹{ev.amount_inr.toLocaleString('en-IN')}</p>
                      )}
                      <p className="text-xs text-zinc-600">{fmtDate(ev.created_at)}</p>
                    </div>
                    <EventBadge type={ev.event_type} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
