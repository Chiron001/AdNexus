import { createAdminClient } from '@/lib/supabase/server'

const PLAN_PRICE: Record<string, number> = {
  basic: 1800, growth: 8999, professional: 46999, agency: 46999, custom: 0,
}

function fmtInr(n: number) {
  return '₹' + n.toLocaleString('en-IN')
}

const EVENT_BADGE: Record<string, string> = {
  'subscription.charged':   'bg-emerald-500/20 text-emerald-400',
  'subscription.cancelled': 'bg-yellow-500/20 text-yellow-400',
  'payment.failed':         'bg-red-500/20 text-red-400',
  'plan.upgraded':          'bg-blue-500/20 text-blue-400',
  'plan.downgraded':        'bg-orange-500/20 text-orange-400',
  'plan.override':          'bg-zinc-700 text-zinc-400',
}

const CARD = 'rounded-xl bg-white/[0.04] border border-white/[0.08]'

export default async function AdminBillingPage() {
  const admin = createAdminClient()

  const [{ data: events }, { data: profiles }] = await Promise.all([
    admin
      .from('billing_events')
      .select('event_type, plan, amount_inr, created_at')
      .order('created_at', { ascending: false })
      .limit(50),
    admin.from('profiles').select('plan'),
  ])

  const charges      = (events ?? []).filter(e => e.event_type === 'subscription.charged')
  const totalRevenue = charges.reduce((s, e) => s + (e.amount_inr ?? 0), 0)

  const byPlan: Record<string, number> = {}
  for (const p of profiles ?? []) {
    byPlan[p.plan] = (byPlan[p.plan] ?? 0) + 1
  }

  const mrr = Object.entries(byPlan).reduce((s, [plan, count]) => {
    return s + (PLAN_PRICE[plan] ?? 0) * count
  }, 0)

  const paidCount = (byPlan.basic ?? 0) + (byPlan.growth ?? 0) + (byPlan.professional ?? 0) + (byPlan.agency ?? 0) + (byPlan.custom ?? 0)

  // Group charges by YYYY-MM, last 6 months
  const monthMap: Record<string, number> = {}
  charges.forEach(e => {
    const d   = new Date(e.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthMap[key] = (monthMap[key] ?? 0) + (e.amount_inr ?? 0)
  })
  const months   = Object.entries(monthMap).sort(([a], [b]) => a.localeCompare(b)).slice(-6)
  const maxMonth = Math.max(...months.map(([, v]) => v), 1)

  const eventCounts = (events ?? []).reduce((acc, e) => {
    acc[e.event_type] = (acc[e.event_type] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  const PLAN_LABEL: Record<string, string> = {
    free: 'Free', basic: 'Basic', growth: 'Growth', professional: 'Professional', agency: 'Professional', custom: 'Custom',
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="text-sm text-zinc-500 mt-1">Revenue and subscription overview</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className={`${CARD} p-5`}>
          <p className="text-xs text-zinc-500 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-emerald-400">{fmtInr(totalRevenue)}</p>
          <p className="text-[11px] text-zinc-600 mt-1">{charges.length} successful payments</p>
        </div>
        <div className={`${CARD} p-5`}>
          <p className="text-xs text-zinc-500 mb-1">Est. MRR</p>
          <p className="text-2xl font-bold text-purple-400">{fmtInr(mrr)}</p>
          <p className="text-[11px] text-zinc-600 mt-1">based on active plans</p>
        </div>
        <div className={`${CARD} p-5`}>
          <p className="text-xs text-zinc-500 mb-1">Paid Subscribers</p>
          <p className="text-2xl font-bold text-white">{paidCount}</p>
          <div className="flex flex-wrap gap-x-3 mt-1">
            {[['basic','teal'],['growth','blue'],['professional','purple'],['custom','emerald']].map(([plan, color]) =>
              (byPlan[plan] ?? 0) > 0 ? (
                <span key={plan} className={`text-[11px] font-medium text-${color}-400`}>
                  {byPlan[plan]} {plan}
                </span>
              ) : null
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Monthly revenue bar chart */}
        <div className={`${CARD} p-5`}>
          <h2 className="text-sm font-semibold text-zinc-300 mb-5">Monthly Revenue</h2>
          {months.length === 0 ? (
            <p className="text-sm text-zinc-600">No revenue data yet</p>
          ) : (
            <div className="flex items-end gap-2 h-36">
              {months.map(([month, amount]) => {
                const height = Math.max(Math.round((amount / maxMonth) * 100), 2)
                const label  = new Date(month + '-01').toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
                return (
                  <div key={month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] text-zinc-500 leading-none">{fmtInr(amount)}</span>
                    <div className="w-full rounded-t-md bg-purple-500/70" style={{ height: `${height}%` }} />
                    <span className="text-[9px] text-zinc-500">{label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Event summary */}
        <div className={`${CARD} p-5`}>
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">Event Summary</h2>
          {Object.keys(eventCounts).length === 0 ? (
            <p className="text-sm text-zinc-600">No events yet</p>
          ) : (
            <div className="space-y-2.5">
              {Object.entries(eventCounts).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${EVENT_BADGE[type] ?? 'bg-zinc-700 text-zinc-400'}`}>
                    {type.replace('.', ' › ')}
                  </span>
                  <span className="text-sm font-medium text-zinc-300">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent events table */}
      <div className={`${CARD} overflow-hidden`}>
        <div className="px-5 py-4 border-b border-white/[0.07]">
          <h2 className="text-sm font-semibold text-zinc-300">Recent Events</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.03]">
              <th className="text-left px-5 py-2.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Event</th>
              <th className="text-left px-5 py-2.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Plan</th>
              <th className="text-left px-5 py-2.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Amount</th>
              <th className="text-left px-5 py-2.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {(events ?? []).map((e, i) => (
              <tr key={i} className="hover:bg-white/[0.03] transition-colors">
                <td className="px-5 py-3">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${EVENT_BADGE[e.event_type] ?? 'bg-zinc-700 text-zinc-400'}`}>
                    {e.event_type.replace('.', ' › ')}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-zinc-400">
                  {PLAN_LABEL[e.plan ?? ''] ?? (e.plan ?? '—')}
                </td>
                <td className="px-5 py-3 text-xs font-medium text-zinc-300">
                  {e.amount_inr != null ? fmtInr(e.amount_inr) : '—'}
                </td>
                <td className="px-5 py-3 text-xs text-zinc-500">
                  {new Date(e.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
              </tr>
            ))}
            {(events ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-sm text-zinc-600">No events yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
