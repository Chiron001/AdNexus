import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'

const PLAN_PRICE = { free: 19, growth: 99, agency: 499, custom: 0 }

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
  'subscription.charged':   { label: 'Charged',    cls: 'bg-green-100 text-green-700'   },
  'subscription.cancelled': { label: 'Cancelled',  cls: 'bg-yellow-100 text-yellow-700' },
  'payment.failed':         { label: 'Failed',     cls: 'bg-red-100 text-red-700'       },
  'plan.upgraded':          { label: 'Upgraded',   cls: 'bg-blue-100 text-blue-700'     },
  'plan.downgraded':        { label: 'Downgraded', cls: 'bg-orange-100 text-orange-700' },
  'plan.override':          { label: 'Override',   cls: 'bg-purple-100 text-purple-700' },
}

const PLATFORM_COLOR: Record<string, string> = {
  meta:   'bg-blue-100 text-blue-700',
  google: 'bg-red-100 text-red-700',
  amazon: 'bg-orange-100 text-orange-700',
}

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
    admin.from('sync_logs')
      .select('status, issues_found')
      .gte('started_at', todayStart.toISOString()),
    admin.from('diagnostic_issues')
      .select('severity')
      .eq('status', 'open'),
    admin.from('billing_events')
      .select('event_type, plan, amount_inr, created_at')
      .order('created_at', { ascending: false })
      .limit(8),
    admin.from('profiles')
      .select('id, email, full_name, plan, created_at')
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  // Users
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

  // Accounts
  const allAccounts = accounts ?? []
  const byPlatform = {
    meta:   allAccounts.filter(a => a.platform === 'meta').length,
    google: allAccounts.filter(a => a.platform === 'google').length,
    amazon: allAccounts.filter(a => a.platform === 'amazon').length,
  }
  const activeAccounts = allAccounts.filter(a => a.status === 'active').length

  // Syncs today
  const syncs = todayLogs ?? []
  const syncsToday    = syncs.length
  const syncsOk       = syncs.filter(s => s.status === 'completed').length
  const issuesFoundToday = syncs.reduce((s, l) => s + (l.issues_found ?? 0), 0)

  // Open issues
  const allIssues    = openIssues ?? []
  const criticalCount = allIssues.filter(i => i.severity === 'critical').length
  const highCount     = allIssues.filter(i => i.severity === 'high').length

  const STATS = [
    { label: 'Est. MRR',        value: fmt(mrr),                  sub: 'monthly recurring revenue', accent: 'text-green-600',  href: '/admin/billing'  },
    { label: 'Total Users',     value: String(total),             sub: `+${newThis7d} this week`,    accent: 'text-blue-600',   href: '/admin/users'    },
    { label: 'Paid Users',      value: String(activePaid),        sub: 'growth + professional + custom',  accent: 'text-indigo-600', href: '/admin/users'    },
    { label: 'Ad Accounts',     value: String(allAccounts.length),sub: `${activeAccounts} active`,  accent: 'text-purple-600', href: '/admin/accounts' },
    { label: 'Syncs Today',     value: String(syncsToday),        sub: `${syncsOk} ok · ${issuesFoundToday} issues`, accent: 'text-orange-600', href: '/admin/activity' },
    { label: 'Open Issues',     value: String(allIssues.length),  sub: `${criticalCount} critical · ${highCount} high`, accent: criticalCount > 0 ? 'text-red-600' : 'text-zinc-600', href: '/admin/activity' },
  ]

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Overview</h1>
        <p className="text-sm text-zinc-500 mt-1">Platform snapshot — refreshes on every page load</p>
      </div>

      {/* 6-stat grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {STATS.map(s => (
          <Link key={s.label} href={s.href} className="bg-white rounded-xl border border-zinc-200 p-5 hover:border-zinc-300 hover:shadow-sm transition-all">
            <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.accent}`}>{s.value}</p>
            <p className="text-[11px] text-zinc-400 mt-1">{s.sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Plan breakdown */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <h2 className="text-sm font-semibold text-zinc-700 mb-4">Users by Plan</h2>
          {(['agency', 'growth', 'custom', 'free'] as const).map(plan => {
            const count = byPlan[plan]
            const pct   = total > 0 ? Math.round((count / total) * 100) : 0
            const bar   = { agency: 'bg-purple-500', growth: 'bg-blue-500', custom: 'bg-emerald-500', free: 'bg-zinc-300' }[plan]
            const lbl   = { agency: 'Professional', growth: 'Growth', custom: 'Custom', free: 'Basic' }[plan]
            return (
              <div key={plan} className="mb-3 last:mb-0">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-600 font-medium">{lbl}</span>
                  <span className="text-zinc-400">{count} ({pct}%)</span>
                </div>
                <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div className={`h-full ${bar} rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Accounts by platform */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <h2 className="text-sm font-semibold text-zinc-700 mb-4">Connected Accounts</h2>
          {(['meta', 'google', 'amazon'] as const).map(platform => {
            const count = byPlatform[platform]
            const pct   = allAccounts.length > 0 ? Math.round((count / allAccounts.length) * 100) : 0
            const bar   = { meta: 'bg-blue-500', google: 'bg-red-500', amazon: 'bg-orange-500' }[platform]
            const lbl   = { meta: 'Meta Ads', google: 'Google Ads', amazon: 'Amazon Ads' }[platform]
            return (
              <div key={platform} className="mb-3 last:mb-0">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-600 font-medium">{lbl}</span>
                  <span className="text-zinc-400">{count} ({pct}%)</span>
                </div>
                <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div className={`h-full ${bar} rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
          <div className="mt-4 pt-4 border-t border-zinc-100 flex justify-between text-xs">
            <span className="text-zinc-500">Active accounts</span>
            <span className="font-semibold text-green-600">{activeAccounts} / {allAccounts.length}</span>
          </div>
        </div>

        {/* Recent signups */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-700">Recent Signups</h2>
            <Link href="/admin/users" className="text-xs text-purple-600 hover:text-purple-800">View all →</Link>
          </div>
          <div className="space-y-3">
            {(recentSignups ?? []).map(u => {
              const name = u.full_name ?? u.email.split('@')[0]
              const initials = name.slice(0, 2).toUpperCase()
              const planCls = { free: 'bg-zinc-100 text-zinc-500', growth: 'bg-blue-100 text-blue-700', agency: 'bg-purple-100 text-purple-700', custom: 'bg-emerald-100 text-emerald-700' }[u.plan] ?? 'bg-zinc-100 text-zinc-500'
              return (
                <Link key={u.id} href={`/admin/users/${u.id}`} className="flex items-center gap-3 hover:bg-zinc-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                  <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-700 shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-zinc-700 truncate">{name}</p>
                    <p className="text-[10px] text-zinc-400">{timeAgo(u.created_at)}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${planCls}`}>{{ free: 'Basic', growth: 'Growth', agency: 'Professional', custom: 'Custom' }[u.plan] ?? u.plan}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent billing events */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-zinc-700">Recent Billing Events</h2>
          <Link href="/admin/billing" className="text-xs text-purple-600 hover:text-purple-800">View all →</Link>
        </div>
        {(billingEvents ?? []).length === 0 ? (
          <p className="text-sm text-zinc-400">No events yet</p>
        ) : (
          <div className="divide-y divide-zinc-100">
            {(billingEvents ?? []).map((e, i) => {
              const meta = EVENT_META[e.event_type] ?? { label: e.event_type, cls: 'bg-zinc-100 text-zinc-600' }
              return (
                <div key={i} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.cls}`}>{meta.label}</span>
                    <span className="text-xs text-zinc-500 capitalize">{e.plan ?? '—'}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {e.amount_inr != null && (
                      <span className="text-xs font-semibold text-zinc-700">{fmt(e.amount_inr)}</span>
                    )}
                    <span className="text-[11px] text-zinc-400 w-14 text-right">{timeAgo(e.created_at)}</span>
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
