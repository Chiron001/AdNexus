import { createAdminClient } from '@/lib/supabase/server'

const PLAN_PRICE = { free: 19, growth: 99, agency: 499 } as const

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  }).format(n)
}

const EVENT_BADGE: Record<string, string> = {
  'subscription.charged':   'bg-green-100 text-green-700',
  'subscription.cancelled': 'bg-yellow-100 text-yellow-700',
  'payment.failed':         'bg-red-100 text-red-700',
  'plan.upgraded':          'bg-blue-100 text-blue-700',
  'plan.downgraded':        'bg-orange-100 text-orange-700',
  'plan.override':          'bg-zinc-100 text-zinc-600',
}

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

  const byPlan = {
    growth: (profiles ?? []).filter(p => p.plan === 'growth').length,
    agency: (profiles ?? []).filter(p => p.plan === 'agency').length,
  }
  const mrr = byPlan.growth * PLAN_PRICE.growth + byPlan.agency * PLAN_PRICE.agency

  // Group charges by YYYY-MM, last 6 months
  const monthMap: Record<string, number> = {}
  charges.forEach(e => {
    const d   = new Date(e.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthMap[key] = (monthMap[key] ?? 0) + (e.amount_inr ?? 0)
  })
  const months   = Object.entries(monthMap).sort(([a], [b]) => a.localeCompare(b)).slice(-6)
  const maxMonth = Math.max(...months.map(([, v]) => v), 1)

  // Event type counts
  const eventCounts = (events ?? []).reduce((acc, e) => {
    acc[e.event_type] = (acc[e.event_type] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Billing</h1>
        <p className="text-sm text-zinc-500 mt-1">Revenue and subscription overview</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <p className="text-xs text-zinc-500 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">{fmt(totalRevenue)}</p>
          <p className="text-[11px] text-zinc-400 mt-1">{charges.length} successful payments</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <p className="text-xs text-zinc-500 mb-1">Est. MRR</p>
          <p className="text-2xl font-bold text-purple-600">{fmt(mrr)}</p>
          <p className="text-[11px] text-zinc-400 mt-1">based on active plans</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <p className="text-xs text-zinc-500 mb-1">Paid Subscribers</p>
          <p className="text-2xl font-bold text-zinc-800">
            {byPlan.growth} <span className="text-sm font-normal text-zinc-400">growth</span>
            {' '}·{' '}
            {byPlan.agency} <span className="text-sm font-normal text-zinc-400">professional</span>
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">{byPlan.growth + byPlan.agency} total paid</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Monthly revenue bar chart */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <h2 className="text-sm font-semibold text-zinc-700 mb-5">Monthly Revenue</h2>
          {months.length === 0 ? (
            <p className="text-sm text-zinc-400">No revenue data yet</p>
          ) : (
            <div className="flex items-end gap-2 h-36">
              {months.map(([month, amount]) => {
                const height = Math.max(Math.round((amount / maxMonth) * 100), 2)
                const label  = new Date(month + '-01').toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
                return (
                  <div key={month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] text-zinc-500 leading-none">{fmt(amount)}</span>
                    <div
                      className="w-full rounded-t-md bg-purple-500"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-[9px] text-zinc-400">{label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Event summary */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <h2 className="text-sm font-semibold text-zinc-700 mb-4">Event Summary</h2>
          {Object.keys(eventCounts).length === 0 ? (
            <p className="text-sm text-zinc-400">No events yet</p>
          ) : (
            <div className="space-y-2.5">
              {Object.entries(eventCounts).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${EVENT_BADGE[type] ?? 'bg-zinc-100 text-zinc-600'}`}>
                    {type.replace('.', ' › ')}
                  </span>
                  <span className="text-sm font-medium text-zinc-700">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent events table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100">
          <h2 className="text-sm font-semibold text-zinc-700">Recent Events</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="text-left px-5 py-2.5 text-xs font-medium text-zinc-500">Event</th>
              <th className="text-left px-5 py-2.5 text-xs font-medium text-zinc-500">Plan</th>
              <th className="text-left px-5 py-2.5 text-xs font-medium text-zinc-500">Amount</th>
              <th className="text-left px-5 py-2.5 text-xs font-medium text-zinc-500">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {(events ?? []).map((e, i) => (
              <tr key={i} className="hover:bg-zinc-50">
                <td className="px-5 py-3">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${EVENT_BADGE[e.event_type] ?? 'bg-zinc-100 text-zinc-600'}`}>
                    {e.event_type.replace('.', ' › ')}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-zinc-600">{{ free: 'Basic', growth: 'Growth', agency: 'Professional', custom: 'Custom' }[e.plan ?? ''] ?? (e.plan ?? '—')}</td>
                <td className="px-5 py-3 text-xs font-medium text-zinc-700">
                  {e.amount_inr != null ? fmt(e.amount_inr) : '—'}
                </td>
                <td className="px-5 py-3 text-xs text-zinc-400">
                  {new Date(e.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
              </tr>
            ))}
            {(events ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-sm text-zinc-400">No events yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
