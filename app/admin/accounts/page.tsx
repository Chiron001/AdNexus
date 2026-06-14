import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'

const PLATFORM_LABEL: Record<string, string> = { meta: 'Meta', google: 'Google', amazon: 'Amazon' }
const PLATFORM_CLS: Record<string, string> = {
  meta:   'bg-blue-500/20 text-blue-400',
  google: 'bg-red-500/20 text-red-400',
  amazon: 'bg-orange-500/20 text-orange-400',
}
const STATUS_CLS: Record<string, string> = {
  active:       'bg-emerald-500/20 text-emerald-400',
  expired:      'bg-yellow-500/20 text-yellow-400',
  disconnected: 'bg-red-500/20 text-red-400',
}
const PLAN_CLS: Record<string, string> = {
  free:         'bg-zinc-700 text-zinc-400',
  basic:        'bg-teal-500/20 text-teal-400',
  growth:       'bg-blue-500/20 text-blue-400',
  professional: 'bg-purple-500/20 text-purple-400',
  agency:       'bg-purple-500/20 text-purple-400',
  custom:       'bg-emerald-500/20 text-emerald-400',
}

const CARD = 'rounded-xl bg-white/[0.04] border border-white/[0.08]'

function timeAgo(iso: string | null) {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 60)  return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)  return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default async function AdminAccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string; status?: string }>
}) {
  const { platform = '', status = '' } = await searchParams
  const admin = createAdminClient()

  let query = admin
    .from('ad_accounts')
    .select('id, user_id, platform, account_id, account_name, status, last_synced_at, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  if (platform && platform !== 'all') query = query.eq('platform', platform as 'meta' | 'google' | 'amazon')
  if (status   && status   !== 'all') query = query.eq('status',   status   as 'active' | 'expired' | 'disconnected')

  const { data: accounts } = await query
  const { data: allAccounts } = await admin.from('ad_accounts').select('platform, status')

  const userIds = [...new Set((accounts ?? []).map(a => a.user_id))]
  const { data: profiles } = userIds.length > 0
    ? await admin.from('profiles').select('id, email, full_name, plan').in('id', userIds)
    : { data: [] }
  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))

  const accountIds = (accounts ?? []).map(a => a.id)
  const { data: issues } = accountIds.length > 0
    ? await admin.from('diagnostic_issues')
        .select('ad_account_id, severity')
        .in('ad_account_id', accountIds)
        .eq('status', 'open')
    : { data: [] }

  const issuesByAccount: Record<string, { total: number; critical: number }> = {}
  for (const issue of issues ?? []) {
    if (!issuesByAccount[issue.ad_account_id]) issuesByAccount[issue.ad_account_id] = { total: 0, critical: 0 }
    issuesByAccount[issue.ad_account_id].total++
    if (issue.severity === 'critical') issuesByAccount[issue.ad_account_id].critical++
  }

  const all = allAccounts ?? []
  const stats = {
    total:        all.length,
    active:       all.filter(a => a.status === 'active').length,
    meta:         all.filter(a => a.platform === 'meta').length,
    google:       all.filter(a => a.platform === 'google').length,
    amazon:       all.filter(a => a.platform === 'amazon').length,
    expired:      all.filter(a => a.status === 'expired').length,
    disconnected: all.filter(a => a.status === 'disconnected').length,
  }

  const inputCls = 'rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50'
  const inputStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Connected Accounts</h1>
        <p className="text-sm text-zinc-500 mt-1">All ad accounts across all users</p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-7 gap-3 mb-6">
        {[
          { label: 'Total',        value: stats.total,        cls: 'text-zinc-200'   },
          { label: 'Active',       value: stats.active,       cls: 'text-emerald-400'},
          { label: 'Expired',      value: stats.expired,      cls: 'text-yellow-400' },
          { label: 'Disconnected', value: stats.disconnected, cls: 'text-red-400'    },
          { label: 'Meta',         value: stats.meta,         cls: 'text-blue-400'   },
          { label: 'Google',       value: stats.google,       cls: 'text-red-400'    },
          { label: 'Amazon',       value: stats.amazon,       cls: 'text-orange-400' },
        ].map(s => (
          <div key={s.label} className={`${CARD} p-4 text-center`}>
            <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <form method="GET" className="flex gap-3 mb-5 items-center">
        <select name="platform" defaultValue={platform} className={inputCls} style={inputStyle}>
          <option value=""       style={{ background: '#0f0f1a' }}>All platforms</option>
          <option value="meta"   style={{ background: '#0f0f1a' }}>Meta</option>
          <option value="google" style={{ background: '#0f0f1a' }}>Google</option>
          <option value="amazon" style={{ background: '#0f0f1a' }}>Amazon</option>
        </select>
        <select name="status" defaultValue={status} className={inputCls} style={inputStyle}>
          <option value=""             style={{ background: '#0f0f1a' }}>All statuses</option>
          <option value="active"       style={{ background: '#0f0f1a' }}>Active</option>
          <option value="expired"      style={{ background: '#0f0f1a' }}>Expired</option>
          <option value="disconnected" style={{ background: '#0f0f1a' }}>Disconnected</option>
        </select>
        <button type="submit" className="text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors" style={{ background: 'rgba(124,58,237,0.8)' }}>
          Filter
        </button>
        {(platform || status) && (
          <Link href="/admin/accounts" className="text-sm text-zinc-500 hover:text-zinc-300 px-3 py-2 transition-colors">Clear</Link>
        )}
        <span className="ml-auto text-sm text-zinc-500">{accounts?.length ?? 0} results</span>
      </form>

      {/* Table */}
      <div className={`${CARD} overflow-hidden`}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.07] bg-white/[0.03]">
              {['Account', 'User', 'Platform', 'Status', 'Last Sync', 'Open Issues', 'Connected'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {(accounts ?? []).map(acc => {
              const user      = profileMap[acc.user_id]
              const issueStat = issuesByAccount[acc.id] ?? { total: 0, critical: 0 }
              return (
                <tr key={acc.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-zinc-200 truncate max-w-[180px]">
                      {acc.account_name ?? acc.account_id}
                    </p>
                    <p className="text-[11px] text-zinc-600 font-mono">{acc.account_id}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    {user ? (
                      <Link href={`/admin/users/${user.id}`} className="group">
                        <p className="text-xs font-medium text-purple-400 group-hover:text-purple-300 truncate max-w-[160px] transition-colors">
                          {user.email}
                        </p>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${PLAN_CLS[user.plan] ?? 'bg-zinc-700 text-zinc-400'}`}>
                          {user.plan}
                        </span>
                      </Link>
                    ) : (
                      <span className="text-xs text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PLATFORM_CLS[acc.platform] ?? 'bg-zinc-700 text-zinc-400'}`}>
                      {PLATFORM_LABEL[acc.platform] ?? acc.platform}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_CLS[acc.status] ?? 'bg-zinc-700 text-zinc-400'}`}>
                      {acc.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-zinc-500">{timeAgo(acc.last_synced_at)}</td>
                  <td className="px-5 py-3.5">
                    {issueStat.total > 0 ? (
                      <span className={`text-xs font-semibold ${issueStat.critical > 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                        {issueStat.total}{issueStat.critical > 0 && ` (${issueStat.critical} critical)`}
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-zinc-500">
                    {new Date(acc.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              )
            })}
            {(accounts ?? []).length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm text-zinc-600">No accounts found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
