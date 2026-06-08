import { createAdminClient } from '@/lib/supabase/server'

const PLAN_PRICE = { free: 0, growth: 2999, agency: 9999 } as const

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n)
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
}

export default async function AdminDashboardPage() {
  const admin = createAdminClient()

  const [{ data: profiles }, { data: events }] = await Promise.all([
    admin.from('profiles').select('plan, created_at'),
    admin.from('billing_events')
      .select('event_type, plan, amount_inr, created_at')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const all = profiles ?? []
  const byPlan = {
    free:   all.filter(p => p.plan === 'free').length,
    growth: all.filter(p => p.plan === 'growth').length,
    agency: all.filter(p => p.plan === 'agency').length,
  }
  const total      = all.length
  const activePaid = byPlan.growth + byPlan.agency
  const mrr        = byPlan.growth * PLAN_PRICE.growth + byPlan.agency * PLAN_PRICE.agency
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const newThis7d  = all.filter(p => new Date(p.created_at) > sevenDaysAgo).length

  const STATS = [
    { label: 'Est. MRR',      value: fmt(mrr),           sub: 'monthly recurring',  accent: 'text-green-600'  },
    { label: 'Total Users',   value: String(total),      sub: 'all time',           accent: 'text-blue-600'   },
    { label: 'Active Paid',   value: String(activePaid), sub: 'growth + agency',    accent: 'text-purple-600' },
    { label: 'New This Week', value: String(newThis7d),  sub: 'last 7 days',        accent: 'text-orange-600' },
  ]

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Overview</h1>
        <p className="text-sm text-zinc-500 mt-1">Platform snapshot</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {STATS.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-zinc-200 p-5">
            <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.accent}`}>{s.value}</p>
            <p className="text-[11px] text-zinc-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Plan breakdown */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <h2 className="text-sm font-semibold text-zinc-700 mb-4">Plan Breakdown</h2>
          {(['agency', 'growth', 'free'] as const).map(plan => {
            const count = byPlan[plan]
            const pct   = total > 0 ? Math.round((count / total) * 100) : 0
            const bar   = { agency: 'bg-purple-500', growth: 'bg-blue-500', free: 'bg-zinc-300' }[plan]
            const lbl   = { agency: 'Agency', growth: 'Growth', free: 'Free' }[plan]
            return (
              <div key={plan} className="mb-3 last:mb-0">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-600 font-medium">{lbl}</span>
                  <span className="text-zinc-400">{count} ({pct}%)</span>
                </div>
                <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div className={`h-full ${bar} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Recent billing events */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <h2 className="text-sm font-semibold text-zinc-700 mb-4">Recent Billing Events</h2>
          {(events ?? []).length === 0 ? (
            <p className="text-sm text-zinc-400">No events yet</p>
          ) : (
            <div className="space-y-2.5">
              {(events ?? []).map((e, i) => {
                const meta = EVENT_META[e.event_type] ?? { label: e.event_type, cls: 'bg-zinc-100 text-zinc-600' }
                return (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.cls}`}>
                        {meta.label}
                      </span>
                      <span className="text-xs text-zinc-500 capitalize">{e.plan ?? '—'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {e.amount_inr != null && (
                        <span className="text-xs font-medium text-zinc-700">{fmt(e.amount_inr)}</span>
                      )}
                      <span className="text-[11px] text-zinc-400">{timeAgo(e.created_at)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
