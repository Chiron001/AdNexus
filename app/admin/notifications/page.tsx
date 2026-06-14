import { createAdminClient } from '@/lib/supabase/server'
import { BroadcastForm } from '@/components/admin/BroadcastForm'

const CARD = 'rounded-xl bg-white/[0.04] border border-white/[0.08]'

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
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        <p className="text-sm text-zinc-500 mt-1">{count ?? 0} total in-app notifications sent</p>
      </div>

      {/* Broadcast form */}
      <div className={`${CARD} p-6 mb-6`}>
        <h2 className="text-sm font-semibold text-zinc-300 mb-1">Broadcast Notification</h2>
        <p className="text-xs text-zinc-500 mb-5">Sends an in-app notification to selected users</p>
        <BroadcastForm />
      </div>

      {/* Recent */}
      {(recent ?? []).length > 0 && (
        <div className={`${CARD} p-5`}>
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">Recently Sent</h2>
          <div className="divide-y divide-white/[0.07]">
            {(recent ?? []).map((n, i) => (
              <div key={i} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-300">{n.title}</p>
                  <p className="text-xs text-zinc-500 capitalize mt-0.5">{n.type.replace('_', ' ')}</p>
                </div>
                <span className="text-xs text-zinc-500 shrink-0 ml-4">
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
