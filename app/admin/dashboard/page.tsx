import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'

const PLAN_PRICE = { free: 0, growth: 99, agency: 499, custom: 0 }

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 60)  return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)  return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const EVENT_META: Record<string, { label: string; cls: string }> = {
  'subscription.charged':   { label: 'Charged',    cls: 'bg-emerald-500/20 text-emerald-400'  },
  'subscription.cancelled': { label: 'Cancelled',  cls: 'bg-yellow-500/20 text-yellow-400'    },
  'payment.failed':         { label: 'Failed',     cls: 'bg-red-500/20 text-red-400'          },
  'plan.upgraded':          { label: 'Upgraded',   cls: 'bg-blue-500/20 text-blue-400'        },
  'plan.downgraded':        { label: 'Downgraded', cls: 'bg-orange-500/20 text-orange-400'    },
  'plan.override':          { label: 'Override',   cls: 'bg-purple-500/20 text-purple-400'    },
}

// Tailwind-only card — no inline styles needed for hover states
const CARD = 'rounded-xl p-5 bg-white/[0.04] border border-white/[0.08] transition-all'

export default async function AdminDashboardPage() {
  const admin = createAdminClient()

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

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
  const byPlan = {
    free:   allProfiles.filter(p => p.plan === 'free').length,
    growth: allProfiles.filter(p => p.plan === 'growth').length,
    agency: allProfiles.filter(p => p.plan === 'agency').length,
    custom: allProfiles.filter(p => p.plan === 'custom').length,
  }
  const total      = allProfiles.length
  const activePaid = byPlan.growth + byPlan.agency + byPlan.custom
  const mrr        = byPlan.growth * PLAN_PRICE.growth + byPlan.agency * PLAN_PRICE.agency
  const newThis7d  = allProfiles.filter(p => new Date(p.created_at) > sevenDaysAgo).length

  const allAccounts    = accounts ?? []
  const byPlatform     = {
    meta:   allAccounts.filter(a => a.platform === 'meta').length,
    google: allAccounts.filter(a => a.platform === 'google').length,
    amazon: allAccounts.filter(a => a.platform === 'amazon').length,
  }
  const activeAccounts = allAccounts.filter(a => a.status === 'active').length

  const syncs            = todayLogs ?? []
  const syncsOk          = syncs.filter(s => s.status === 'completed').length
  const issuesFoundToday = syncs.reduce((s, l) => s + (l.issues_found ?? 0), 0)

  const allIssues     = openIssues ?? []
  const criticalCount = allIssues.filter(i => i.severity === 'critical').length
  const highCount     = allIssues.filter(i => i.severity === 'high').length

  const STATS = [
    { label: 'Est. MRR',    value: fmt(mrr),                  sub: 'monthly recurring revenue',              accent: 'text-emerald-400', href: '/admin/billing'  },
    { label: 'Total Users', value: String(total),             sub: `+${newThis7d} this week`,                accent: 'text-blue-400',    href: '/admin/users'    },
    { label: 'Paid Users',  value: String(activePaid),        sub: 'growth + agency + custom',               accent: 'text-indigo-400',  href: '/admin/users'    },
    { label: 'Ad Accounts', value: String(allAccounts.length),sub: `${activeAccounts} active`,              accent: 'text-purple-400',  href: '/admin/accounts' },
    { label: 'Syncs Today', value: String(syncs.length),      sub: `${syncsOk} ok · ${issuesFoundToday} issues`, accent: 'text-orange-400', href: '/admin/activity' },
    { label: 'Open Issues', value: String(allIssues.length),  sub: `${criticalCount} critical · ${highCount} high`, accent: criticalCount > 0 ? 'text-red-400' : 'text-zinc-600', href: '/admin/activity' },
  ]

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-sm text-zinc-500 mt-1">Platform snapshot — refreshes on every page load</p>
      </div>

      {/* 6-stat grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {STATS.map(s => (
          <Link
            key={s.label}
            href={s.href}
            className={`${CARD} hover:bg-white/[0.07] hover:border-white/[0.14]`}
          >
            <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.accent}`}>{s.value}</p>
            <p className="text-[11px] text-zinc-600 mt-1">{s.sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Plan breakdown */}
        <div className={CARD}>
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">Users by Plan</h2>
          {(['agency', 'growth', 'custom', 'free'] as const).map(plan => {
            const count = byPlan[plan]
            const pct   = total > 0 ? Math.round((count / total) * 100) : 0
            const bar   = { agency: 'bg-purple-500', growth: 'bg-blue-500', custom: 'bg-emerald-500', free: 'bg-zinc-600' }[plan]
            const lbl   = { agency: 'Agency', growth: 'Growth', custom: 'Custom', free: 'Free' }[plan]
            return (
              <div key={plan} className="mb-3 last:mb-0">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-zinc-400 font-medium">{lbl}</span>
                  <span className="text-zinc-500">{count} ({pct}%)</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                  <div className={`h-full ${bar} rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Accounts by platform */}
        <div className={CARD}>
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">Connected Accounts</h2>
          {(['meta', 'google', 'amazon'] as const).map(platform => {
            const count = byPlatform[platform]
            const pct   = allAccounts.length > 0 ? Math.round((count / allAccounts.length) * 100) : 0
            const bar   = { meta: 'bg-blue-500', google: 'bg-red-500', amazon: 'bg-orange-500' }[platform]
            const lbl   = { meta: 'Meta Ads', google: 'Google Ads', amazon: 'Amazon Ads' }[platform]
            return (
              <div key={platform} className="mb-3 last:mb-0">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-zinc-400 font-medium">{lbl}</span>
                  <span className="text-zinc-500">{count} ({pct}%)</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                  <div className={`h-full ${bar} rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
          <div className="mt-4 pt-4 flex justify-between text-xs border-t border-white/[0.07]">
            <span className="text-zinc-500">Active accounts</span>
            <span className="font-semibold text-emerald-400">{activeAccounts} / {allAccounts.length}</span>
          </div>
        </div>

        {/* Recent signups */}
        <div className={CARD}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-300">Recent Signups</h2>
            <Link href="/admin/users" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">View all →</Link>
          </div>
          <div className="space-y-1">
            {(recentSignups ?? []).map(u => {
              const name     = u.full_name ?? u.email.split('@')[0]
              const initials = name.slice(0, 2).toUpperCase()
              const planCls  = { free: 'bg-zinc-700 text-zinc-400', growth: 'bg-blue-500/20 text-blue-400', agency: 'bg-purple-500/20 text-purple-400', custom: 'bg-emerald-500/20 text-emerald-400' }[u.plan] ?? 'bg-zinc-700 text-zinc-400'
              const planLbl  = { free: 'Free', growth: 'Growth', agency: 'Agency', custom: 'Custom' }[u.plan] ?? u.plan
              return (
                <Link
                  key={u.id}
                  href={`/admin/users/${u.id}`}
                  className="flex items-center gap-3 -mx-2 px-2 py-1.5 rounded-lg transition-colors hover:bg-white/[0.05]"
                >
                  <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-400 shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-zinc-300 truncate">{name}</p>
                    <p className="text-[10px] text-zinc-600">{timeAgo(u.created_at)}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${planCls}`}>{planLbl}</span>
                </Link>
              )
            })}
            {(recentSignups ?? []).length === 0 && (
              <p className="text-xs text-zinc-600 py-4 text-center">No signups yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent billing */}
      <div className={CARD}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-zinc-300">Recent Billing Events</h2>
          <Link href="/admin/billing" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">View all →</Link>
        </div>
        {(billingEvents ?? []).length === 0 ? (
          <p className="text-sm text-zinc-600">No events yet</p>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {(billingEvents ?? []).map((e, i) => {
              const meta = EVENT_META[e.event_type] ?? { label: e.event_type, cls: 'bg-zinc-700 text-zinc-400' }
              return (
                <div key={i} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.cls}`}>{meta.label}</span>
                    <span className="text-xs text-zinc-500 capitalize">{e.plan ?? '—'}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {e.amount_inr != null && (
                      <span className="text-xs font-semibold text-zinc-300">{fmt(e.amount_inr)}</span>
                    )}
                    <span className="text-[11px] text-zinc-600 w-14 text-right">{timeAgo(e.created_at)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
