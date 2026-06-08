import { createAdminClient } from '@/lib/supabase/server'
import { BroadcastForm } from '@/components/admin/BroadcastForm'

export default async function AdminNotificationsPage() {
  const admin = createAdminClient()

  const [{ count }, { data: recent }] = await Promise.all([
    admin.from('notifications').select('*', { count: 'exact', head: true }),
    admin
      .from('notifications')
      .select('type, title, created_at')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Notifications</h1>
        <p className="text-sm text-zinc-500 mt-1">{count ?? 0} total in-app notifications sent</p>
      </div>

      {/* Broadcast form */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-zinc-700 mb-1">Broadcast Notification</h2>
        <p className="text-xs text-zinc-400 mb-5">Sends an in-app notification to selected users</p>
        <BroadcastForm />
      </div>

      {/* Recent */}
      {(recent ?? []).length > 0 && (
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <h2 className="text-sm font-semibold text-zinc-700 mb-4">Recently Sent</h2>
          <div className="divide-y divide-zinc-100">
            {(recent ?? []).map((n, i) => (
              <div key={i} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-700">{n.title}</p>
                  <p className="text-xs text-zinc-400 capitalize mt-0.5">{n.type.replace('_', ' ')}</p>
                </div>
                <span className="text-xs text-zinc-400 shrink-0 ml-4">
                  {new Date(n.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
