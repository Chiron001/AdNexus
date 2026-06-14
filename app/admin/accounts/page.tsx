import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'

const PLATFORM_LABEL: Record<string, string> = { meta: 'Meta', google: 'Google', amazon: 'Amazon' }
const PLATFORM_CLS: Record<string, string> = {
  meta:   'bg-blue-100 text-blue-700',
  google: 'bg-red-100 text-red-700',
  amazon: 'bg-orange-100 text-orange-700',
}
const STATUS_CLS: Record<string, string> = {
  active:       'bg-green-100 text-green-700',
  expired:      'bg-yellow-100 text-yellow-700',
  disconnected: 'bg-red-100 text-red-600',
}

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

  // Build filtered accounts query
  let query = admin
    .from('ad_accounts')
    .select('id, user_id, platform, account_id, account_name, status, last_synced_at, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  if (platform && platform !== 'all') query = query.eq('platform', platform as 'meta' | 'google' | 'amazon')
  if (status   && status   !== 'all') query = query.eq('status',   status   as 'active' | 'expired' | 'disconnected')

  const { data: accounts } = await query

  // Fetch all accounts for stats (no filters)
  const { data: allAccounts } = await admin.from('ad_accounts').select('platform, status')

  // Join profiles
  const userIds = [...new Set((accounts ?? []).map(a => a.user_id))]
  const { data: profiles } = userIds.length > 0
    ? await admin.from('profiles').select('id, email, full_name, plan').in('id', userIds)
    : { data: [] }
  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))

  // Issue counts per account
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

  // Stats
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

  const PLAN_CLS: Record<string, string> = {
    free:   'bg-zinc-100 text-zinc-500',
    growth: 'bg-blue-100 text-blue-700',
    agency: 'bg-purple-100 text-purple-700',
    custom: 'bg-emerald-100 text-emerald-700',
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Connected Accounts</h1>
        <p className="text-sm text-zinc-500 mt-1">All ad accounts across all users</p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-7 gap-3 mb-6">
        {[
          { label: 'Total',        value: stats.total,        cls: 'text-zinc-800'   },
          { label: 'Active',       value: stats.active,       cls: 'text-green-600'  },
          { label: 'Expired',      value: stats.expired,      cls: 'text-yellow-600' },
          { label: 'Disconnected', value: stats.disconnected, cls: 'text-red-600'    },
          { label: 'Meta',         value: stats.meta,         cls: 'text-blue-600'   },
          { label: 'Google',       value: stats.google,       cls: 'text-red-600'    },
          { label: 'Amazon',       value: stats.amazon,       cls: 'text-orange-600' },
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
          name="platform"
          defaultValue={platform}
          className="bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">All platforms</option>
          <option value="meta">Meta</option>
          <option value="google">Google</option>
          <option value="amazon">Amazon</option>
        </select>
        <select
          name="status"
          defaultValue={status}
          className="bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="disconnected">Disconnected</option>
        </select>
        <button
          type="submit"
          className="bg-zinc-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors"
        >
          Filter
        </button>
        {(platform || status) && (
          <Link href="/admin/accounts" className="text-sm text-zinc-500 hover:text-zinc-700 px-3 py-2">
            Clear
          </Link>
        )}
        <span className="ml-auto text-sm text-zinc-400 self-center">{accounts?.length ?? 0} results</span>
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">Account</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">User</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">Platform</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">Status</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">Last Sync</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">Open Issues</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">Connected</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {(accounts ?? []).map(acc => {
              const user   = profileMap[acc.user_id]
              const issueStat = issuesByAccount[acc.id] ?? { total: 0, critical: 0 }
              return (
                <tr key={acc.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-zinc-800 truncate max-w-[180px]">
                      {acc.account_name ?? acc.account_id}
                    </p>
                    <p className="text-[11px] text-zinc-400 font-mono">{acc.account_id}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    {user ? (
                      <Link href={`/admin/users/${user.id}`} className="group">
                        <p className="text-xs font-medium text-purple-600 group-hover:text-purple-800 truncate max-w-[160px]">
                          {user.email}
                        </p>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${PLAN_CLS[user.plan] ?? ''}`}>
                          {user.plan}
                        </span>
                      </Link>
                    ) : (
                      <span className="text-xs text-zinc-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PLATFORM_CLS[acc.platform] ?? 'bg-zinc-100 text-zinc-600'}`}>
                      {PLATFORM_LABEL[acc.platform] ?? acc.platform}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_CLS[acc.status] ?? 'bg-zinc-100 text-zinc-600'}`}>
                      {acc.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-zinc-500">{timeAgo(acc.last_synced_at)}</td>
                  <td className="px-5 py-3.5">
                    {issueStat.total > 0 ? (
                      <span className={`text-xs font-semibold ${issueStat.critical > 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                        {issueStat.total} {issueStat.critical > 0 && `(${issueStat.critical} critical)`}
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-400">—</span>
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
                <td colSpan={7} className="px-5 py-12 text-center text-sm text-zinc-400">
                  No accounts found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
