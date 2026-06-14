import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'

const SYNC_TYPE_CLS: Record<string, string> = {
  manual:    'bg-blue-500/20 text-blue-400',
  scheduled: 'bg-zinc-700 text-zinc-400',
  initial:   'bg-emerald-500/20 text-emerald-400',
}
const STATUS_CLS: Record<string, string> = {
  completed: 'bg-emerald-500/20 text-emerald-400',
  running:   'bg-yellow-500/20 text-yellow-400',
  failed:    'bg-red-500/20 text-red-400',
}
const PLATFORM_CLS: Record<string, string> = {
  meta:   'bg-blue-500/20 text-blue-400',
  google: 'bg-red-500/20 text-red-400',
  amazon: 'bg-orange-500/20 text-orange-400',
}

const CARD = 'rounded-xl bg-white/[0.04] border border-white/[0.08]'

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
  if (ms < 1000)  return `${ms}ms`
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

  let query = admin
    .from('sync_logs')
    .select('id, ad_account_id, sync_type, status, campaigns_synced, issues_found, error_message, started_at, completed_at')
    .order('started_at', { ascending: false })
    .limit(150)

  if (type   && type   !== 'all') query = query.eq('sync_type', type   as 'manual' | 'scheduled' | 'initial')
  if (status && status !== 'all') query = query.eq('status',    status as 'completed' | 'running' | 'failed')

  const [{ data: logs }, { data: todayStats }] = await Promise.all([
    query,
    admin.from('sync_logs')
      .select('status, issues_found, sync_type')
      .gte('started_at', todayStart.toISOString()),
  ])

  const accountIds = [...new Set((logs ?? []).map(l => l.ad_account_id))]
  const { data: accounts } = accountIds.length > 0
    ? await admin.from('ad_accounts').select('id, platform, account_name, user_id').in('id', accountIds)
    : { data: [] }
  const accountMap = Object.fromEntries((accounts ?? []).map(a => [a.id, a]))

  const userIds = [...new Set((accounts ?? []).map(a => a.user_id))]
  const { data: profiles } = userIds.length > 0
    ? await admin.from('profiles').select('id, email').in('id', userIds)
    : { data: [] }
  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))

  const today = todayStats ?? []
  const statsToday = {
    total:  today.length,
    ok:     today.filter(s => s.status === 'completed').length,
    failed: today.filter(s => s.status === 'failed').length,
    manual: today.filter(s => s.sync_type === 'manual').length,
    issues: today.reduce((s, l) => s + (l.issues_found ?? 0), 0),
  }

  const inputCls = 'rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50'
  const inputStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Sync Activity</h1>
        <p className="text-sm text-zinc-500 mt-1">All sync runs across all user accounts</p>
      </div>

      {/* Today stats */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {[
          { label: "Today's syncs",   value: statsToday.total,  cls: 'text-zinc-200'   },
          { label: 'Completed',        value: statsToday.ok,     cls: 'text-emerald-400' },
          { label: 'Failed',           value: statsToday.failed, cls: statsToday.failed > 0 ? 'text-red-400' : 'text-zinc-600' },
          { label: 'Manual triggers',  value: statsToday.manual, cls: 'text-blue-400'   },
          { label: 'Issues flagged',   value: statsToday.issues, cls: statsToday.issues > 0 ? 'text-orange-400' : 'text-zinc-600' },
        ].map(s => (
          <div key={s.label} className={`${CARD} p-4 text-center`}>
            <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <form method="GET" className="flex gap-3 mb-5 items-center">
        <select name="type" defaultValue={type} className={inputCls} style={inputStyle}>
          <option value=""          style={{ background: '#0f0f1a' }}>All types</option>
          <option value="manual"    style={{ background: '#0f0f1a' }}>Manual</option>
          <option value="scheduled" style={{ background: '#0f0f1a' }}>Scheduled</option>
          <option value="initial"   style={{ background: '#0f0f1a' }}>Initial</option>
        </select>
        <select name="status" defaultValue={status} className={inputCls} style={inputStyle}>
          <option value=""           style={{ background: '#0f0f1a' }}>All statuses</option>
          <option value="completed"  style={{ background: '#0f0f1a' }}>Completed</option>
          <option value="running"    style={{ background: '#0f0f1a' }}>Running</option>
          <option value="failed"     style={{ background: '#0f0f1a' }}>Failed</option>
        </select>
        <button type="submit" className="text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors" style={{ background: 'rgba(124,58,237,0.8)' }}>
          Filter
        </button>
        {(type || status) && (
          <Link href="/admin/activity" className="text-sm text-zinc-500 hover:text-zinc-300 px-3 py-2 transition-colors">Clear</Link>
        )}
        <span className="ml-auto text-sm text-zinc-500">{logs?.length ?? 0} results (latest 150)</span>
      </form>

      {/* Table */}
      <div className={`${CARD} overflow-hidden`}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.07] bg-white/[0.03]">
              {['Time', 'User', 'Account', 'Platform', 'Type', 'Status', 'Campaigns', 'Issues', 'Duration'].map((h, i) => (
                <th key={h} className={`px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide ${i >= 6 ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {(logs ?? []).map(log => {
              const account = accountMap[log.ad_account_id]
              const user    = account ? profileMap[account.user_id] : null
              return (
                <tr key={log.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-5 py-3 text-xs text-zinc-500 whitespace-nowrap">
                    <p>{relTime(log.started_at)}</p>
                    <p className="text-[10px] text-zinc-600">
                      {new Date(log.started_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    {user ? (
                      <Link href={`/admin/users/${user.id}`} className="text-xs text-purple-400 hover:text-purple-300 truncate max-w-[140px] block transition-colors">
                        {user.email}
                      </Link>
                    ) : (
                      <span className="text-xs text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-zinc-400 truncate max-w-[140px]">
                    {account?.account_name ?? log.ad_account_id.slice(0, 8) + '…'}
                  </td>
                  <td className="px-5 py-3">
                    {account ? (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${PLATFORM_CLS[account.platform] ?? 'bg-zinc-700 text-zinc-400'}`}>
                        {account.platform}
                      </span>
                    ) : <span className="text-xs text-zinc-600">—</span>}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${SYNC_TYPE_CLS[log.sync_type] ?? 'bg-zinc-700 text-zinc-400'}`}>
                      {log.sync_type}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_CLS[log.status] ?? 'bg-zinc-700 text-zinc-400'}`}>
                      {log.status}
                    </span>
                    {log.status === 'failed' && log.error_message && (
                      <p className="text-[10px] text-red-400 mt-0.5 max-w-[140px] truncate" title={log.error_message}>
                        {log.error_message}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right text-xs text-zinc-400">{log.campaigns_synced ?? 0}</td>
                  <td className="px-5 py-3 text-right">
                    {(log.issues_found ?? 0) > 0
                      ? <span className="text-xs font-semibold text-orange-400">{log.issues_found}</span>
                      : <span className="text-xs text-zinc-600">0</span>}
                  </td>
                  <td className="px-5 py-3 text-right text-xs text-zinc-500 whitespace-nowrap">
                    {dur(log.started_at, log.completed_at)}
                  </td>
                </tr>
              )
            })}
            {(logs ?? []).length === 0 && (
              <tr>
                <td colSpan={9} className="px-5 py-12 text-center text-sm text-zinc-600">No sync activity found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
