'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  CreditCard, FileText, BarChart3, Zap, Shield,
  ChevronRight, Bell, Building2, Calendar,
  CheckCircle2, AlertCircle, Link2, AlertTriangle,
  Clock, ArrowUpRight,
} from 'lucide-react'

/* ── Constants ───────────────────────────────────── */
const PLAN_META = {
  free:   { label: 'Basic',        price: 19,  color: 'text-zinc-300',   badge: 'bg-zinc-800 text-zinc-400 border border-zinc-700',           ring: 'border-zinc-600' },
  growth: { label: 'Growth',       price: 99,  color: 'text-blue-300',   badge: 'bg-blue-500/15 text-blue-300 border border-blue-500/25',     ring: 'border-blue-500/50' },
  agency: { label: 'Professional', price: 499, color: 'text-purple-300', badge: 'bg-purple-500/15 text-purple-300 border border-purple-500/25', ring: 'border-purple-500/50' },
  custom: { label: 'Custom',       price: 0,   color: 'text-emerald-300',badge: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25', ring: 'border-emerald-500/50' },
} as const

const PLAN_LIMITS = {
  free:   { accounts: 1,  checks: 10, unlimited: false },
  growth: { accounts: 5,  checks: -1, unlimited: true  },
  agency: { accounts: 50, checks: -1, unlimited: true  },
  custom: { accounts: -1, checks: -1, unlimited: true  },
} as const

const EVENT_LABEL: Record<string, string> = {
  'subscription.charged':   'Subscription payment',
  'subscription.cancelled': 'Subscription cancelled',
  'payment.failed':         'Payment failed',
  'plan.upgraded':          'Plan upgraded',
  'plan.downgraded':        'Plan downgraded',
  'plan.override':          'Manual plan change',
}

type Tab = 'overview' | 'invoices' | 'usage'
type PlanKey = keyof typeof PLAN_META

type Profile = {
  full_name: string | null
  company_name: string | null
  plan: string
  created_at: string
  email?: string
}

type BillingEvent = {
  id: string
  event_type: string
  plan: string | null
  amount_inr: number | null
  created_at: string
}

/* ── Sub-components ──────────────────────────────── */
function DarkCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 rounded-2xl ${className}`}>
      {children}
    </div>
  )
}

function EventBadge({ type }: { type: string }) {
  if (type === 'subscription.charged') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 className="w-3 h-3" /> Paid
      </span>
    )
  }
  if (type === 'payment.failed') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
        <AlertCircle className="w-3 h-3" /> Failed
      </span>
    )
  }
  if (type === 'plan.upgraded') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
        <ArrowUpRight className="w-3 h-3" /> Upgraded
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
      <Clock className="w-3 h-3" /> {type.split('.')[1] ?? type}
    </span>
  )
}

function UsageMeter({ label, used, limit, icon: Icon, color }: {
  label: string
  used: number
  limit: number
  icon: React.ElementType
  color: string
}) {
  const unlimited = limit === -1
  const pct = unlimited ? 0 : Math.min((used / Math.max(limit, 1)) * 100, 100)
  const nearLimit = !unlimited && pct >= 80

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-zinc-500" />
          <p className="text-sm text-zinc-300">{label}</p>
        </div>
        <p className="text-sm font-semibold text-white">
          {used}
          {unlimited
            ? <span className="text-xs font-normal text-zinc-500 ml-1"> / unlimited</span>
            : <span className="text-zinc-500"> / {limit}</span>
          }
        </p>
      </div>
      {!unlimited && (
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${nearLimit ? 'bg-amber-500' : color}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      {unlimited && (
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div className={`h-full w-full rounded-full opacity-30 ${color}`} />
        </div>
      )}
    </div>
  )
}

/* ── Page ────────────────────────────────────────── */
export default function BillingPage() {
  const [tab, setTab] = useState<Tab>('overview')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const [events, setEvents] = useState<BillingEvent[]>([])
  const [accountCount, setAccountCount] = useState(0)
  const [issueCount, setIssueCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserEmail(user.email ?? '')

      const [
        { data: p },
        { data: ev },
        { count: ac },
        { count: ic },
      ] = await Promise.all([
        supabase.from('profiles').select('full_name, company_name, plan, created_at').eq('id', user.id).single(),
        supabase.from('billing_events').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(25),
        supabase.from('ad_accounts').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('diagnostic_issues').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      ])

      setProfile(p)
      setEvents(ev ?? [])
      setAccountCount(ac ?? 0)
      setIssueCount(ic ?? 0)
      setLoading(false)
    }
    load()
  }, [])

  const plan = ((profile?.plan ?? 'free') as PlanKey) in PLAN_META
    ? (profile?.plan as PlanKey)
    : 'free'
  const meta   = PLAN_META[plan]
  const limits = PLAN_LIMITS[plan]

  const totalPaid = events
    .filter(e => e.event_type === 'subscription.charged')
    .reduce((s, e) => s + (e.amount_inr ?? 0), 0)
  const paidCount = events.filter(e => e.event_type === 'subscription.charged').length
  const lastCharge = events.find(e => e.event_type === 'subscription.charged')

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—'

  const nextBillingDate = profile?.created_at
    ? (() => {
        const d = new Date(profile.created_at)
        d.setMonth(d.getMonth() + Math.ceil((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 30)) + 1)
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      })()
    : '—'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Billing &amp; Account</h2>
        <p className="text-zinc-500 mt-1 text-sm">Manage your subscription, invoices, and usage.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-zinc-800/80">
        {(['overview', 'invoices', 'usage'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? 'border-purple-500 text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {t === 'overview' ? 'Overview' : t === 'invoices' ? 'Invoices' : 'Usage'}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ─────────────────────────────── */}
      {tab === 'overview' && (
        <div className="space-y-5">

          {/* Top 3 stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Current plan */}
            <DarkCard className={`p-5 border-l-2 ${meta.ring.replace('border-', 'border-l-')}`}>
              <p className="text-[11px] font-semibold text-zinc-600 uppercase tracking-widest mb-2">Current Plan</p>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-2xl font-black ${meta.color}`}>{meta.label}</span>
              </div>
              <p className="text-sm text-zinc-500 mb-3">
                {meta.price > 0 ? `$${meta.price}/month` : 'Contact for pricing'}
              </p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.badge}`}>
                Active
              </span>
            </DarkCard>

            {/* Next billing */}
            <DarkCard className="p-5">
              <p className="text-[11px] font-semibold text-zinc-600 uppercase tracking-widest mb-2">Next Billing</p>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-base font-bold text-white">{nextBillingDate}</span>
              </div>
              <p className="text-xs text-zinc-600 mt-2">Renews automatically · Cancel anytime</p>
            </DarkCard>

            {/* Account status */}
            <DarkCard className="p-5">
              <p className="text-[11px] font-semibold text-zinc-600 uppercase tracking-widest mb-2">Account Status</p>
              <div className="flex items-center gap-2 mb-1">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                </span>
                <span className="text-base font-bold text-white">Active</span>
              </div>
              <p className="text-xs text-zinc-600 mt-2">Member since {memberSince}</p>
            </DarkCard>
          </div>

          {/* Total paid + last payment */}
          <div className="grid sm:grid-cols-2 gap-4">
            <DarkCard className="p-5">
              <p className="text-[11px] font-semibold text-zinc-600 uppercase tracking-widest mb-3">Total Paid</p>
              <p className="text-3xl font-black text-white">${totalPaid.toLocaleString('en-US')}</p>
              <p className="text-xs text-zinc-600 mt-1.5">{paidCount} successful {paidCount === 1 ? 'payment' : 'payments'}</p>
            </DarkCard>

            <DarkCard className="p-5">
              <p className="text-[11px] font-semibold text-zinc-600 uppercase tracking-widest mb-3">Last Payment</p>
              {lastCharge ? (
                <>
                  <p className="text-3xl font-black text-white">${(lastCharge.amount_inr ?? 0).toLocaleString('en-US')}</p>
                  <p className="text-xs text-zinc-600 mt-1.5">
                    {new Date(lastCharge.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </>
              ) : (
                <p className="text-zinc-600 text-sm mt-2">No payments yet</p>
              )}
            </DarkCard>
          </div>

          {/* Billing details */}
          <DarkCard className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-zinc-500" />
                <h3 className="text-base font-semibold text-white">Billing Details</h3>
              </div>
              <Link href="/settings" className="text-xs text-purple-400 hover:text-purple-300 transition-colors font-medium">
                Edit details
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
              {[
                { label: 'Name',           value: profile?.full_name    || '—' },
                { label: 'Email',          value: userEmail              || '—' },
                { label: 'Company',        value: profile?.company_name  || '—' },
                { label: 'Billing cycle',  value: 'Monthly'               },
                { label: 'Plan',           value: meta.label              },
                { label: 'Currency',       value: 'USD'                   },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <p className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">{label}</p>
                  <p className="text-sm text-zinc-200">{value}</p>
                </div>
              ))}
            </div>
          </DarkCard>

          {/* Plan features */}
          <DarkCard className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-zinc-500" />
                <h3 className="text-base font-semibold text-white">Plan Details</h3>
              </div>
              <Link href="/settings" className="inline-flex items-center gap-0.5 text-xs text-purple-400 hover:text-purple-300 transition-colors font-medium">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-8">
              {[
                { label: 'Ad accounts',       value: limits.accounts === -1 ? 'Unlimited' : `Up to ${limits.accounts}` },
                { label: 'Diagnostic checks', value: limits.checks === -1 ? 'Unlimited' : `${limits.checks}/month` },
                { label: 'AI recommendations', value: plan !== 'free' ? 'Included' : 'Not included' },
                { label: 'White-label reports', value: plan === 'agency' || plan === 'custom' ? 'Included' : 'Not included' },
                { label: 'API access',         value: plan === 'agency' || plan === 'custom' ? 'Included' : 'Not included' },
                { label: 'Priority support',   value: plan === 'agency' || plan === 'custom' ? 'Included' : 'Not included' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2.5 border-b border-zinc-800/50 last:border-0">
                  <p className="text-sm text-zinc-400">{label}</p>
                  <p className={`text-sm font-medium ${value === 'Not included' ? 'text-zinc-700' : value === 'Unlimited' || value === 'Included' ? 'text-emerald-400' : 'text-white'}`}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
            {plan === 'free' && (
              <div className="mt-5 pt-5 border-t border-zinc-800/60 flex items-center justify-between">
                <p className="text-sm text-zinc-400">Ready to upgrade?</p>
                <Link
                  href="/settings"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 px-4 py-2 rounded-lg transition-all"
                >
                  <Zap className="w-3.5 h-3.5" /> Upgrade plan
                </Link>
              </div>
            )}
          </DarkCard>

          {/* Billing notifications */}
          <DarkCard className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <Bell className="w-4 h-4 text-zinc-500" />
              <h3 className="text-base font-semibold text-white">Billing Notifications</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ml-auto">All on</span>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Invoice generated',  desc: 'Get notified when your monthly invoice is ready' },
                { label: 'Payment confirmed',  desc: 'Confirmation receipt after each successful charge' },
                { label: 'Payment failed',     desc: 'Immediate alert if a charge attempt fails' },
                { label: 'Plan changes',       desc: 'Notifications for upgrades, downgrades & cancellations' },
              ].map(({ label, desc }) => (
                <div key={label} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-zinc-200 font-medium">{label}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">{desc}</p>
                  </div>
                  <button
                    className="relative w-10 h-5.5 flex-shrink-0"
                    style={{ width: '40px', height: '22px' }}
                    aria-label={`Toggle ${label}`}
                  >
                    <span className="absolute inset-0 rounded-full bg-purple-600" />
                    <span className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all" />
                  </button>
                </div>
              ))}
            </div>
          </DarkCard>
        </div>
      )}

      {/* ── INVOICES ─────────────────────────────── */}
      {tab === 'invoices' && (
        <div className="space-y-4">
          {events.length === 0 ? (
            <DarkCard className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-zinc-600" />
              </div>
              <p className="text-zinc-300 font-semibold mb-1">No billing history yet</p>
              <p className="text-zinc-600 text-sm max-w-xs">Your invoices and payment records will appear here once your first billing cycle completes.</p>
              <Link href="/settings" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors">
                View plans <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </DarkCard>
          ) : (
            <DarkCard>
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/60">
                <p className="text-sm font-semibold text-white">Billing History</p>
                <p className="text-xs text-zinc-600">{events.length} {events.length === 1 ? 'record' : 'records'}</p>
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block">
                <div className="grid grid-cols-[1fr_130px_110px_110px] gap-4 px-5 py-3 text-[11px] font-bold text-zinc-600 uppercase tracking-widest border-b border-zinc-800/40">
                  <span>Description</span>
                  <span>Date</span>
                  <span>Amount</span>
                  <span>Status</span>
                </div>
                <div className="divide-y divide-zinc-800/40">
                  {events.map(ev => (
                    <div key={ev.id} className="grid grid-cols-[1fr_130px_110px_110px] gap-4 px-5 py-4 items-center hover:bg-white/[0.02] transition-colors">
                      <div>
                        <p className="text-sm font-medium text-white">{EVENT_LABEL[ev.event_type] ?? ev.event_type}</p>
                        <p className="text-xs text-zinc-600 mt-0.5 capitalize">{ev.plan ? `${ev.plan} plan` : '—'}</p>
                      </div>
                      <p className="text-sm text-zinc-400">
                        {new Date(ev.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-sm font-semibold text-white">
                        {ev.amount_inr != null && ev.amount_inr > 0 ? `$${ev.amount_inr.toLocaleString('en-US')}` : '—'}
                      </p>
                      <EventBadge type={ev.event_type} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile list */}
              <div className="sm:hidden divide-y divide-zinc-800/40">
                {events.map(ev => (
                  <div key={ev.id} className="px-5 py-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-white">{EVENT_LABEL[ev.event_type] ?? ev.event_type}</p>
                      <EventBadge type={ev.event_type} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>{new Date(ev.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span className="font-semibold text-white">
                        {ev.amount_inr != null && ev.amount_inr > 0 ? `$${ev.amount_inr.toLocaleString('en-US')}` : '—'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </DarkCard>
          )}
        </div>
      )}

      {/* ── USAGE ────────────────────────────────── */}
      {tab === 'usage' && (
        <div className="space-y-5">
          <DarkCard className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-4 h-4 text-zinc-500" />
              <h3 className="text-base font-semibold text-white">Current Usage</h3>
              <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.badge}`}>
                {meta.label}
              </span>
            </div>

            <div className="space-y-6">
              <UsageMeter
                label="Ad accounts connected"
                used={accountCount}
                limit={limits.accounts}
                icon={Link2}
                color="bg-blue-500"
              />
              <UsageMeter
                label="Diagnostic issues tracked"
                used={issueCount}
                limit={limits.checks}
                icon={AlertTriangle}
                color="bg-amber-500"
              />
              <UsageMeter
                label="AI recommendations"
                used={plan !== 'free' ? issueCount : 0}
                limit={plan !== 'free' ? -1 : 0}
                icon={Zap}
                color="bg-purple-500"
              />
            </div>
          </DarkCard>

          {/* Entitlements grid */}
          <DarkCard className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <CreditCard className="w-4 h-4 text-zinc-500" />
              <h3 className="text-base font-semibold text-white">Plan Entitlements</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label: 'Ad accounts',      limit: limits.accounts === -1 ? 'Unlimited' : `${limits.accounts}` },
                { label: 'Diagnostic checks',limit: limits.checks === -1 ? 'Unlimited / month' : `${limits.checks} / month` },
                { label: 'Platforms',        limit: plan === 'free' ? 'Meta only' : 'Meta, Google & Amazon' },
                { label: 'Data retention',   limit: plan === 'free' ? '30 days' : plan === 'growth' ? '90 days' : '365 days' },
                { label: 'Sync frequency',   limit: plan === 'free' ? 'Manual (24h cooldown)' : plan === 'growth' ? 'Auto daily' : 'Auto every 15 min' },
                { label: 'Team seats',       limit: plan === 'agency' || plan === 'custom' ? '3+' : '1' },
              ].map(({ label, limit }) => (
                <div key={label} className="flex items-center justify-between py-2.5 border-b border-zinc-800/40 last:border-0">
                  <p className="text-sm text-zinc-500">{label}</p>
                  <p className="text-sm font-medium text-white text-right">{limit}</p>
                </div>
              ))}
            </div>
          </DarkCard>

          {/* Upgrade nudge */}
          {plan === 'free' && (
            <DarkCard className="p-6 border-purple-500/25 bg-purple-500/[0.03]">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white mb-1">Unlock more with Growth — $99/mo</p>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    5 ad accounts · Unlimited diagnostic checks · AI-written fix instructions · Google &amp; Amazon support · Daily auto-syncs
                  </p>
                  <Link
                    href="/settings"
                    className="inline-flex items-center gap-1.5 mt-4 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 px-4 py-2 rounded-lg transition-all shadow-lg shadow-purple-500/20"
                  >
                    <Zap className="w-3.5 h-3.5" /> Upgrade now
                  </Link>
                </div>
              </div>
            </DarkCard>
          )}
        </div>
      )}
    </div>
  )
}
