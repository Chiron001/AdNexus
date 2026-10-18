import Link from 'next/link'
import {
  IndianRupee, Users, BadgeCheck, Link2, RefreshCw, AlertTriangle, ArrowRight, ArrowUpRight,
} from 'lucide-react'
import { SiMeta, SiGoogleads } from 'react-icons/si'
import { FaAmazon } from 'react-icons/fa'
import { createAdminClient } from '@/lib/supabase/server'

// List price per month in INR (lib/razorpay.ts). 'agency' is the legacy name for
// Professional; 'custom' plans are set by hand and have no list price.
const PLAN_PRICE_INR: Record<string, number> = { basic: 1800, growth: 8999, professional: 46999, agency: 46999 }

const PLANS = [
  { key: 'professional', label: 'Professional', color: '#7C3AED' },
  { key: 'growth',       label: 'Growth',       color: '#3B5BFD' },
  { key: 'basic',        label: 'Basic',        color: '#22D3EE' },
  { key: 'custom',       label: 'Custom',       color: '#10B981' },
  { key: 'free',         label: 'Free',         color: 'rgba(255,255,255,.22)' },
] as const

const PLAN_BADGE: Record<string, { label: string; cls: string }> = {
  free:         { label: 'Free',   cls: 'bg-white/[0.08] text-white/60' },
  basic:        { label: 'Basic',  cls: 'bg-cyan-400/15 text-cyan-300' },
  growth:       { label: 'Growth', cls: 'bg-blue-500/15 text-blue-300' },
  professional: { label: 'Pro',    cls: 'bg-violet-500/15 text-violet-300' },
  agency:       { label: 'Pro',    cls: 'bg-violet-500/15 text-violet-300' },
  custom:       { label: 'Custom', cls: 'bg-emerald-500/15 text-emerald-300' },
}

const PLATFORMS = [
  { key: 'meta',   label: 'Meta Ads',   icon: SiMeta,      color: '#0081FB' },
  { key: 'google', label: 'Google Ads', icon: SiGoogleads, color: '#4285F4' },
  { key: 'amazon', label: 'Amazon Ads', icon: FaAmazon,    color: '#FF9900' },
] as const

const EVENT_META: Record<string, { label: string; cls: string }> = {
  'subscription.charged':   { label: 'Charged',    cls: 'bg-emerald-500/15 text-emerald-300' },
  'subscription.cancelled': { label: 'Cancelled',  cls: 'bg-yellow-500/15 text-yellow-300'   },
  'payment.failed':         { label: 'Failed',     cls: 'bg-red-500/15 text-red-300'         },
  'plan.upgraded':          { label: 'Upgraded',   cls: 'bg-blue-500/15 text-blue-300'       },
  'plan.downgraded':        { label: 'Downgraded', cls: 'bg-orange-500/15 text-orange-300'   },
  'plan.override':          { label: 'Override',   cls: 'bg-violet-500/15 text-violet-300'   },
}

function inr(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 60)  return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)  return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const CARD = 'rounded-2xl bg-white/[0.035] border border-white/[0.08]'

function CardHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-4">
      <h2 className="io-display text-[15px] font-semibold text-white">{title}</h2>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-xs font-semibold text-violet-300 hover:text-violet-200 transition-colors">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  )
}

export default async function AdminDashboardPage() {
  const admin = createAdminClient()

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [
    { data: profiles },
    { data: accounts },
    { data: todayLogs },
    { data: openIssues },
    { data: billingEvents },
    { data: recentSignups },
  ] = await Promise.all([
    admin.from('profiles').select('plan, created_at'),
    admin.from('ad_accounts').select('platform, status'),
    admin.from('sync_logs').select('status, issues_found').gte('started_at', todayStart.toISOString()),
    admin.from('diagnostic_issues').select('severity').eq('status', 'open'),
    admin.from('billing_events').select('event_type, plan, amount_inr, created_at').order('created_at', { ascending: false }).limit(8),
    admin.from('profiles').select('id, email, full_name, plan, created_at').order('created_at', { ascending: false }).limit(6),
  ])

  const allProfiles = profiles ?? []
  const planOf      = (p: string) => (p === 'agency' ? 'professional' : p)
  const byPlan      = Object.fromEntries(PLANS.map(p => [p.key, allProfiles.filter(u => planOf(u.plan) === p.key).length])) as Record<string, number>
  const total       = allProfiles.length
  const paid        = total - byPlan.free
  const mrr         = allProfiles.reduce((sum, u) => sum + (PLAN_PRICE_INR[u.plan] ?? 0), 0)
  const newThis7d   = allProfiles.filter(p => new Date(p.created_at) > sevenDaysAgo).length

  const allAccounts    = accounts ?? []
  const byPlatform     = Object.fromEntries(PLATFORMS.map(p => [p.key, allAccounts.filter(a => a.platform === p.key).length])) as Record<string, number>
  const activeAccounts = allAccounts.filter(a => a.status === 'active').length

  const syncs            = todayLogs ?? []
  const syncsOk          = syncs.filter(s => s.status === 'completed').length
  const issuesFoundToday = syncs.reduce((s, l) => s + (l.issues_found ?? 0), 0)

  const allIssues     = openIssues ?? []
  const criticalCount = allIssues.filter(i => i.severity === 'critical').length
  const highCount     = allIssues.filter(i => i.severity === 'high').length

  const STATS = [
    { label: 'Est. MRR',    value: inr(mrr),                   sub: 'list price of active plans',               icon: IndianRupee,   href: '/admin/billing'  },
    { label: 'Total users', value: String(total),              sub: `+${newThis7d} in the last 7 days`,         icon: Users,         href: '/admin/users'    },
    { label: 'Paid users',  value: String(paid),               sub: total ? `${Math.round((paid / total) * 100)}% of all users` : 'no users yet', icon: BadgeCheck, href: '/admin/users' },
    { label: 'Ad accounts', value: String(allAccounts.length), sub: `${activeAccounts} active`,                 icon: Link2,         href: '/admin/accounts' },
    { label: 'Syncs today', value: String(syncs.length),       sub: `${syncsOk} ok · ${issuesFoundToday} issues found`, icon: RefreshCw, href: '/admin/activity' },
    { label: 'Open issues', value: String(allIssues.length),   sub: `${criticalCount} critical · ${highCount} high`, icon: AlertTriangle, href: '/admin/activity', alert: criticalCount > 0 },
  ]

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="px-8 py-8 max-w-[1240px]">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] io-grad-text" style={{ backgroundImage: 'linear-gradient(90deg,#8FA6FF,#C4B5FD)' }}>Admin console</p>
          <h1 className="io-display text-[2rem] font-semibold text-white leading-tight mt-1">Overview</h1>
          <p className="text-sm text-white/50 mt-1">{today} · live data, refreshed on every load</p>
        </div>
        <Link href="/admin/users" className="io-btn io-btn-primary !py-2.5 !text-[13px]">
          Manage users <ArrowRight className="io-arrow w-3.5 h-3.5" />
        </Link>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {STATS.map(({ label, value, sub, icon: Icon, href, alert }) => (
          <Link key={label} href={href}
            className={`${CARD} group p-5 flex items-start gap-4 transition-colors hover:bg-white/[0.06] hover:border-white/[0.14]`}>
            <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${alert ? 'bg-red-500/15 text-red-300' : 'text-white'}`}
              style={alert ? undefined : { background: 'linear-gradient(135deg, var(--io-accent), var(--io-accent-2))' }}>
              <Icon className="w-[18px] h-[18px]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-white/50">{label}</p>
              <p className={`io-display text-[1.75rem] font-semibold leading-tight tabular-nums mt-0.5 ${alert ? 'text-red-300' : 'text-white'}`}>{value}</p>
              <p className="text-xs text-white/40 mt-0.5 truncate">{sub}</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors shrink-0" />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        {/* Plan breakdown */}
        <div className={CARD}>
          <CardHeader title="Users by plan" />
          <div className="px-5 pb-5">
            <div className="flex h-2.5 rounded-full overflow-hidden bg-white/[0.06] mb-5">
              {total > 0 && PLANS.map(p => byPlan[p.key] > 0 && (
                <span key={p.key} style={{ width: `${(byPlan[p.key] / total) * 100}%`, background: p.color }} />
              ))}
            </div>
            <ul className="space-y-3">
              {PLANS.map(p => (
                <li key={p.key} className="flex items-center gap-3 text-[13px]">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.color }} />
                  <span className="flex-1 text-white/75">{p.label}</span>
                  <span className="text-white font-semibold tabular-nums">{byPlan[p.key]}</span>
                  <span className="w-11 text-right text-white/40 tabular-nums">{total ? Math.round((byPlan[p.key] / total) * 100) : 0}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Accounts by platform */}
        <div className={CARD}>
          <CardHeader title="Connected ad accounts" href="/admin/accounts" />
          <div className="px-5 pb-5 space-y-4">
            {PLATFORMS.map(({ key, label, icon: Icon, color }) => {
              const count = byPlatform[key]
              const pct   = allAccounts.length ? Math.round((count / allAccounts.length) * 100) : 0
              return (
                <div key={key}>
                  <div className="flex items-center gap-3 text-[13px] mb-2">
                    <span className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shrink-0"><Icon className="w-3.5 h-3.5" style={{ color }} /></span>
                    <span className="flex-1 text-white/75">{label}</span>
                    <span className="text-white font-semibold tabular-nums">{count}</span>
                    <span className="w-11 text-right text-white/40 tabular-nums">{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              )
            })}
            <div className="pt-4 flex justify-between text-[13px] border-t border-white/[0.07]">
              <span className="text-white/50">Active accounts</span>
              <span className="font-semibold text-emerald-300 tabular-nums">{activeAccounts} / {allAccounts.length}</span>
            </div>
          </div>
        </div>

        {/* Recent signups */}
        <div className={CARD}>
          <CardHeader title="Recent signups" href="/admin/users" />
          <div className="px-3 pb-3">
            {(recentSignups ?? []).map(u => {
              const name  = u.full_name?.trim() || u.email.split('@')[0]
              const badge = PLAN_BADGE[u.plan] ?? { label: u.plan, cls: 'bg-white/[0.08] text-white/60' }
              return (
                <Link key={u.id} href={`/admin/users/${u.id}`}
                  className="flex items-center gap-3 px-2 py-2 rounded-xl transition-colors hover:bg-white/[0.05]">
                  <span className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white uppercase shrink-0"
                    style={{ background: 'linear-gradient(135deg, var(--io-accent), var(--io-accent-2))' }}>
                    {name.slice(0, 2)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-white truncate capitalize">{name}</p>
                    <p className="text-[11px] text-white/40 truncate">{u.email} · {timeAgo(u.created_at)}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${badge.cls}`}>{badge.label}</span>
                </Link>
              )
            })}
            {(recentSignups ?? []).length === 0 && (
              <p className="text-sm text-white/40 py-6 text-center">No signups yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent billing */}
      <div className={CARD}>
        <CardHeader title="Recent billing events" href="/admin/billing" />
        {(billingEvents ?? []).length === 0 ? (
          <p className="text-sm text-white/40 px-5 pb-6">No billing events yet</p>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-[0.12em] text-white/35 border-y border-white/[0.07]">
                <th className="font-semibold px-5 py-2.5">Event</th>
                <th className="font-semibold px-5 py-2.5">Plan</th>
                <th className="font-semibold px-5 py-2.5 text-right">Amount</th>
                <th className="font-semibold px-5 py-2.5 text-right">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {(billingEvents ?? []).map((e, i) => {
                const meta = EVENT_META[e.event_type] ?? { label: e.event_type, cls: 'bg-white/[0.08] text-white/60' }
                return (
                  <tr key={i} className="hover:bg-white/[0.03] transition-colors">
                    <td className="px-5 py-3"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${meta.cls}`}>{meta.label}</span></td>
                    <td className="px-5 py-3 text-white/70 capitalize">{e.plan ?? '—'}</td>
                    <td className="px-5 py-3 text-right font-semibold text-white tabular-nums">{e.amount_inr != null ? inr(e.amount_inr) : '—'}</td>
                    <td className="px-5 py-3 text-right text-white/40">{timeAgo(e.created_at)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
