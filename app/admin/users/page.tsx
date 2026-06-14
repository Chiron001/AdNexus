import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'

const PLAN_BADGE: Record<string, string> = {
  free:   'bg-zinc-100 text-zinc-600',
  growth: 'bg-blue-100 text-blue-700',
  agency: 'bg-purple-100 text-purple-700',
}

const PLAN_LABEL: Record<string, string> = {
  free: 'Basic', growth: 'Growth', agency: 'Professional', custom: 'Custom',
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
          <h1 className="text-2xl font-bold text-zinc-900">Users</h1>
          <p className="text-sm text-zinc-500 mt-1">{users?.length ?? 0} results</p>
        </div>
      </div>

      {/* Filters — native form GET so it works without JS */}
      <form method="GET" className="flex gap-3 mb-6">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search name or email..."
          className="bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <select
          name="plan"
          defaultValue={plan}
          className="bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">All plans</option>
          <option value="free">Basic</option>
          <option value="growth">Growth</option>
          <option value="agency">Professional</option>
        </select>
        <button
          type="submit"
          className="bg-zinc-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors"
        >
          Search
        </button>
        {(search || plan) && (
          <Link
            href="/admin/users"
            className="text-sm text-zinc-500 hover:text-zinc-700 px-3 py-2"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">User</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">Plan</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">Joined</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">Last Active</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {(users ?? []).map(u => (
              <tr key={u.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-700 shrink-0">
                      {initials(u.full_name, u.email)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-zinc-800 truncate">{u.full_name ?? '—'}</p>
                      <p className="text-xs text-zinc-400 truncate">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${PLAN_BADGE[u.plan]}`}>
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
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${u.onboarding_completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {u.onboarding_completed ? 'Active' : 'Setup'}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))}
            {(users ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-sm text-zinc-400">
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
