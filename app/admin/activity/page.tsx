import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'

const SYNC_TYPE_CLS: Record<string, string> = {
  manual:    'bg-blue-100 text-blue-700',
  scheduled: 'bg-zinc-100 text-zinc-600',
  initial:   'bg-green-100 text-green-700',
}
const STATUS_CLS: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  running:   'bg-yellow-100 text-yellow-700',
  failed:    'bg-red-100 text-red-600',
}
const PLATFORM_CLS: Record<string, string> = {
  meta:   'bg-blue-100 text-blue-700',
  google: 'bg-red-100 text-red-700',
  amazon: 'bg-orange-100 text-orange-700',
}

function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1)   return 'just now'
  if (m < 60)  return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)  return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function dur(start: string, end: string | null) {
  if (!end) return '—'
  const ms = new Date(end).getTime() - new Date(start).getTime()
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60000)}m`
}

export default async function AdminActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string }>
}) {
  const { type = '', status = '' } = await searchParams
  const admin = createAdminClient()

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  // Build query
  let query = admin
    .from('sync_logs')
    .select('id, ad_account_id, sync_type, status, campaigns_synced, issues_found, error_message, started_at, completed_at')
    .order('started_at', { ascending: false })
    .limit(150)

  if (type   && type   !== 'all') query = query.eq('sync_type', type as 'manual' | 'scheduled' | 'initial')
  if (status && status !== 'all') query = query.eq('status',    status as 'completed' | 'running' | 'failed')

  const [
    { data: logs },
    { data: todayStats },
  ] = await Promise.all([
    query,
    admin.from('sync_logs')
      .select('status, issues_found, sync_type')
      .gte('started_at', todayStart.toISOString()),
  ])

  // Join ad_accounts
  const accountIds = [...new Set((logs ?? []).map(l => l.ad_account_id))]
  const { data: accounts } = accountIds.length > 0
    ? await admin.from('ad_accounts').select('id, platform, account_name, user_id').in('id', accountIds)
    : { data: [] }
  const accountMap = Object.fromEntries((accounts ?? []).map(a => [a.id, a]))

  // Join profiles
  const userIds = [...new Set((accounts ?? []).map(a => a.user_id))]
  const { data: profiles } = userIds.length > 0
    ? await admin.from('profiles').select('id, email').in('id', userIds)
    : { data: [] }
  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))

  // Stats for today
  const today = todayStats ?? []
  const statsToday = {
    total:    today.length,
    ok:       today.filter(s => s.status === 'completed').length,
    failed:   today.filter(s => s.status === 'failed').length,
    manual:   today.filter(s => s.sync_type === 'manual').length,
    issues:   today.reduce((s, l) => s + (l.issues_found ?? 0), 0),
    successRate: today.length > 0
      ? Math.round((today.filter(s => s.status === 'completed').length / today.length) * 100)
      : 100,
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Sync Activity</h1>
        <p className="text-sm text-zinc-500 mt-1">All sync runs across all user accounts</p>
      </div>

      {/* Today stats */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {[
          { label: "Today's syncs",  value: statsToday.total,       cls: 'text-zinc-800'   },
          { label: 'Completed',      value: statsToday.ok,          cls: 'text-green-600'  },
          { label: 'Failed',         value: statsToday.failed,      cls: statsToday.failed > 0 ? 'text-red-600' : 'text-zinc-400' },
          { label: 'Manual triggers',value: statsToday.manual,      cls: 'text-blue-600'   },
          { label: 'Issues flagged', value: statsToday.issues,      cls: statsToday.issues > 0 ? 'text-orange-600' : 'text-zinc-400' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-zinc-200 p-4 text-center">
            <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <form method="GET" className="flex gap-3 mb-5">
        <select
          name="type"
          defaultValue={type}
          className="bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">All types</option>
          <option value="manual">Manual</option>
          <option value="scheduled">Scheduled</option>
          <option value="initial">Initial</option>
        </select>
        <select
          name="status"
          defaultValue={status}
          className="bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">All statuses</option>
          <option value="completed">Completed</option>
          <option value="running">Running</option>
          <option value="failed">Failed</option>
        </select>
        <button
          type="submit"
          className="bg-zinc-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors"
        >
          Filter
        </button>
        {(type || status) && (
          <Link href="/admin/activity" className="text-sm text-zinc-500 hover:text-zinc-700 px-3 py-2">Clear</Link>
        )}
        <span className="ml-auto text-sm text-zinc-400 self-center">{logs?.length ?? 0} results (latest 150)</span>
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">Time</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">User</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">Account</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">Platform</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">Type</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">Status</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500">Campaigns</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500">Issues</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {(logs ?? []).map(log => {
              const account = accountMap[log.ad_account_id]
              const user    = account ? profileMap[account.user_id] : null
              return (
                <tr key={log.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-5 py-3 text-xs text-zinc-500 whitespace-nowrap">
                    <p>{relTime(log.started_at)}</p>
                    <p className="text-[10px] text-zinc-400">
                      {new Date(log.started_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    {user ? (
                      <Link href={`/admin/users/${user.id}`} className="text-xs text-purple-600 hover:text-purple-800 truncate max-w-[140px] block">
                        {user.email}
                      </Link>
                    ) : (
                      <span className="text-xs text-zinc-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-zinc-600 truncate max-w-[140px]">
                    {account?.account_name ?? log.ad_account_id.slice(0, 8) + '…'}
                  </td>
                  <td className="px-5 py-3">
                    {account ? (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${PLATFORM_CLS[account.platform] ?? 'bg-zinc-100 text-zinc-600'}`}>
                        {account.platform}
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${SYNC_TYPE_CLS[log.sync_type] ?? ''}`}>
                      {log.sync_type}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_CLS[log.status] ?? ''}`}>
                      {log.status}
                    </span>
                    {log.status === 'failed' && log.error_message && (
                      <p className="text-[10px] text-red-500 mt-0.5 max-w-[140px] truncate" title={log.error_message}>
                        {log.error_message}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right text-xs text-zinc-600">{log.campaigns_synced ?? 0}</td>
                  <td className="px-5 py-3 text-right">
                    {(log.issues_found ?? 0) > 0 ? (
                      <span className="text-xs font-semibold text-orange-600">{log.issues_found}</span>
                    ) : (
                      <span className="text-xs text-zinc-400">0</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right text-xs text-zinc-500 whitespace-nowrap">
                    {dur(log.started_at, log.completed_at)}
                  </td>
                </tr>
              )
            })}
            {(logs ?? []).length === 0 && (
              <tr>
                <td colSpan={9} className="px-5 py-12 text-center text-sm text-zinc-400">
                  No sync activity found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
