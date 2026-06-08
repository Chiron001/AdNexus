import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'

const PLAN_BADGE: Record<string, string> = {
  free:   'bg-zinc-100 text-zinc-600',
  growth: 'bg-blue-100 text-blue-700',
  agency: 'bg-purple-100 text-purple-700',
}

const EVENT_COLOR: Record<string, string> = {
  'subscription.charged':   'text-green-600',
  'subscription.cancelled': 'text-yellow-600',
  'payment.failed':         'text-red-600',
  'plan.upgraded':          'text-blue-600',
  'plan.downgraded':        'text-orange-600',
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n)
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const admin  = createAdminClient()

  const [{ data: profile }, { data: accounts }, { data: events }] = await Promise.all([
    admin.from('profiles').select('*').eq('id', id).single(),
    admin.from('ad_accounts')
      .select('id, platform, account_name, account_id, status, created_at')
      .eq('user_id', id),
    admin.from('billing_events')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  if (!profile) notFound()

  const totalSpend = (events ?? [])
    .filter(e => e.event_type === 'subscription.charged')
    .reduce((s, e) => s + (e.amount_inr ?? 0), 0)

  const displayName = profile.full_name ?? profile.email
  const avatarText  = (profile.full_name ?? profile.email).slice(0, 2).toUpperCase()

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/admin/users" className="text-sm text-zinc-500 hover:text-zinc-700">
          ← Users
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-5 mb-6">
        {/* Profile card */}
        <div className="col-span-2 bg-white rounded-xl border border-zinc-200 p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-base font-bold text-purple-700 shrink-0">
              {avatarText}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h2 className="text-base font-bold text-zinc-800 truncate">{displayName}</h2>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${PLAN_BADGE[profile.plan]}`}>
                  {profile.plan}
                </span>
              </div>
              <p className="text-sm text-zinc-500">{profile.email}</p>
              {profile.phone_number && (
                <p className="text-sm text-zinc-400">{profile.phone_number}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-zinc-100">
            {[
              { label: 'Joined',         value: new Date(profile.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), cls: '' },
              { label: 'Industry',       value: profile.industry ?? '—',           cls: '' },
              { label: 'Onboarding',     value: profile.onboarding_completed ? 'Complete' : 'Pending', cls: profile.onboarding_completed ? 'text-green-600' : 'text-yellow-600' },
              { label: 'Plan Expires',   value: profile.plan_expires_at ? new Date(profile.plan_expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—', cls: '' },
              { label: 'WhatsApp',       value: profile.whatsapp_opted_in ? 'Opted in' : 'Off',  cls: profile.whatsapp_opted_in ? 'text-green-600' : 'text-zinc-400' },
              { label: 'Total Revenue',  value: fmt(totalSpend),                    cls: 'text-zinc-700 font-semibold' },
            ].map(row => (
              <div key={row.label}>
                <p className="text-[11px] text-zinc-400 mb-0.5">{row.label}</p>
                <p className={`text-sm ${row.cls || 'text-zinc-700'}`}>{row.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ad accounts */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <h3 className="text-sm font-semibold text-zinc-700 mb-3">
            Ad Accounts ({accounts?.length ?? 0})
          </h3>
          {(accounts ?? []).length === 0 ? (
            <p className="text-xs text-zinc-400">No accounts connected</p>
          ) : (
            <div className="space-y-3">
              {(accounts ?? []).map(acc => (
                <div key={acc.id} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-zinc-700 truncate">
                      {acc.account_name ?? acc.account_id}
                    </p>
                    <p className="text-[11px] text-zinc-400 capitalize">{acc.platform}</p>
                  </div>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0 ml-2 ${acc.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {acc.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Billing history */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5">
        <h3 className="text-sm font-semibold text-zinc-700 mb-4">Billing History</h3>
        {(events ?? []).length === 0 ? (
          <p className="text-sm text-zinc-400">No billing events</p>
        ) : (
          <div className="divide-y divide-zinc-100">
            {(events ?? []).map((e, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold capitalize ${EVENT_COLOR[e.event_type] ?? 'text-zinc-600'}`}>
                    {e.event_type.replace('.', ' › ')}
                  </span>
                  {e.plan && (
                    <span className="text-xs text-zinc-400 capitalize">{e.plan}</span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-right">
                  {e.amount_inr != null && (
                    <span className="text-sm font-medium text-zinc-700">{fmt(e.amount_inr)}</span>
                  )}
                  <span className="text-xs text-zinc-400">
                    {new Date(e.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
