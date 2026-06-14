import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'

const PLAN_BADGE: Record<string, string> = {
  free:   'bg-zinc-700 text-zinc-400',
  growth: 'bg-blue-500/20 text-blue-400',
  agency: 'bg-purple-500/20 text-purple-400',
  custom: 'bg-emerald-500/20 text-emerald-400',
}

const PLAN_LABEL: Record<string, string> = {
  free: 'Free', growth: 'Growth', agency: 'Agency', custom: 'Custom',
}

function initials(name: string | null, email: string) {
  if (name) return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return email.slice(0, 2).toUpperCase()
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; plan?: string }>
}) {
  const { search = '', plan = '' } = await searchParams
  const admin = createAdminClient()

  let query = admin
    .from('profiles')
    .select('id, email, full_name, plan, created_at, last_active_at, onboarding_completed')
    .order('created_at', { ascending: false })
    .limit(100)

  if (plan && plan !== 'all') query = query.eq('plan', plan as 'free' | 'growth' | 'agency')
  if (search)                 query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)

  const { data: users } = await query

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-sm text-zinc-500 mt-1">{users?.length ?? 0} results</p>
        </div>
      </div>

      <form method="GET" className="flex gap-3 mb-6">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search name or email…"
          className="rounded-lg px-3 py-2 text-sm w-64 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        />
        <select
          name="plan"
          defaultValue={plan}
          className="rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <option value="" style={{ background: '#0f0f1a' }}>All plans</option>
          <option value="free"   style={{ background: '#0f0f1a' }}>Free</option>
          <option value="growth" style={{ background: '#0f0f1a' }}>Growth</option>
          <option value="agency" style={{ background: '#0f0f1a' }}>Agency</option>
        </select>
        <button
          type="submit"
          className="text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          style={{ background: 'rgba(124,58,237,0.8)' }}
        >
          Search
        </button>
        {(search || plan) && (
          <Link href="/admin/users" className="text-sm text-zinc-500 hover:text-zinc-300 px-3 py-2 transition-colors">
            Clear
          </Link>
        )}
      </form>

      <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}>
              <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">User</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Plan</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Joined</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Last Active</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((u, i) => (
              <tr
                key={u.id}
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: 'rgba(124,58,237,0.22)', color: '#a78bfa' }}
                    >
                      {initials(u.full_name, u.email)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-zinc-200 truncate">{u.full_name ?? '—'}</p>
                      <p className="text-xs text-zinc-500 truncate">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${PLAN_BADGE[u.plan] ?? 'bg-zinc-700 text-zinc-400'}`}>
                    {PLAN_LABEL[u.plan] ?? u.plan}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-xs text-zinc-500">
                  {new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-5 py-3.5 text-xs text-zinc-500">
                  {u.last_active_at
                    ? new Date(u.last_active_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                    : '—'}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${u.onboarding_completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {u.onboarding_completed ? 'Active' : 'Setup'}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link href={`/admin/users/${u.id}`} className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors">
                    View →
                  </Link>
                </td>
              </tr>
            ))}
            {(users ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center text-sm text-zinc-600">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
