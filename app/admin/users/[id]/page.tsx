import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { PlanChangeForm } from '@/components/admin/PlanChangeForm'

const CARD = 'rounded-xl bg-white/[0.04] border border-white/[0.08]'

const PLAN_BADGE: Record<string, string> = {
  free:         'bg-zinc-700 text-zinc-400',
  basic:        'bg-teal-500/20 text-teal-400',
  growth:       'bg-blue-500/20 text-blue-400',
  professional: 'bg-purple-500/20 text-purple-400',
  agency:       'bg-purple-500/20 text-purple-400',
  custom:       'bg-emerald-500/20 text-emerald-400',
}
const EVENT_COLOR: Record<string, string> = {
  'subscription.charged':    'text-emerald-400',
  'subscription.cancelled':  'text-yellow-400',
  'payment.failed':          'text-red-400',
  'plan.upgraded':           'text-blue-400',
  'plan.downgraded':         'text-orange-400',
  'plan.override':           'text-purple-400',
}
const PLATFORM_CLS: Record<string, string> = {
  meta:   'bg-blue-500/20 text-blue-400',
  google: 'bg-red-500/20 text-red-400',
  amazon: 'bg-orange-500/20 text-orange-400',
}
const SYNC_STATUS_CLS: Record<string, string> = {
  completed: 'bg-emerald-500/20 text-emerald-400',
  running:   'bg-yellow-500/20 text-yellow-400',
  failed:    'bg-red-500/20 text-red-400',
}
const SEVERITY_CLS: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400',
  high:     'bg-orange-500/20 text-orange-400',
  medium:   'bg-yellow-500/20 text-yellow-400',
  low:      'bg-zinc-700 text-zinc-400',
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}
function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
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

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const admin  = createAdminClient()

  const [
    { data: profile },
    { data: accounts },
    { data: billingEvents },
  ] = await Promise.all([
    admin.from('profiles').select('*').eq('id', id).single(),
    admin.from('ad_accounts')
      .select('id, platform, account_name, account_id, status, last_synced_at, created_at')
      .eq('user_id', id),
    admin.from('billing_events')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  if (!profile) notFound()

  const accountIds = (accounts ?? []).map(a => a.id)
  const { data: syncLogs } = accountIds.length > 0
    ? await admin.from('sync_logs')
        .select('id, ad_account_id, sync_type, status, campaigns_synced, issues_found, error_message, started_at, completed_at')
        .in('ad_account_id', accountIds)
        .order('started_at', { ascending: false })
        .limit(20)
    : { data: [] }

  const accountMap = Object.fromEntries((accounts ?? []).map(a => [a.id, a]))

  const { data: openIssues } = await admin
    .from('diagnostic_issues')
    .select('id, platform, issue_type, severity, title, estimated_impact_inr, detected_at, ad_account_id')
    .eq('user_id', id)
    .eq('status', 'open')
    .order('detected_at', { ascending: false })
    .limit(15)

  const totalSpend = (billingEvents ?? [])
    .filter(e => e.event_type === 'subscription.charged')
    .reduce((s, e) => s + (e.amount_inr ?? 0), 0)

  const issuesBySeverity = (openIssues ?? []).reduce((acc, i) => {
    acc[i.severity] = (acc[i.severity] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  const displayName = profile.full_name ?? profile.email
  const avatarText  = (profile.full_name ?? profile.email).slice(0, 2).toUpperCase()

  return (
    <div className="p-8 max-w-5xl">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/admin/users" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">← Users</Link>
      </div>

      {/* Top row: profile + plan change + quick stats */}
      <div className="grid grid-cols-3 gap-5 mb-5">
        {/* Profile */}
        <div className={`col-span-2 ${CARD} p-5`}>
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-base font-bold text-purple-400 shrink-0">
              {avatarText}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h2 className="text-base font-bold text-white truncate">{displayName}</h2>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${PLAN_BADGE[profile.plan] ?? 'bg-zinc-700 text-zinc-400'}`}>
                  {profile.plan}
                </span>
              </div>
              <p className="text-sm text-zinc-400">{profile.email}</p>
              {profile.phone_number && <p className="text-sm text-zinc-500">{profile.phone_number}</p>}
            </div>
          </div>

          {/* Plan change */}
          <div className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-lg border border-white/[0.06] mb-4">
            <span className="text-xs font-medium text-zinc-400">Change plan:</span>
            <PlanChangeForm userId={id} currentPlan={profile.plan} />
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/[0.06]">
            {[
              { label: 'Joined',        value: new Date(profile.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }), cls: '' },
              { label: 'Industry',      value: profile.industry ?? '—', cls: '' },
              { label: 'Onboarding',    value: profile.onboarding_completed ? 'Complete' : 'Pending', cls: profile.onboarding_completed ? 'text-emerald-400' : 'text-yellow-400' },
              { label: 'Plan Expires',  value: profile.plan_expires_at ? new Date(profile.plan_expires_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—', cls: '' },
              { label: 'WhatsApp',      value: profile.whatsapp_opted_in ? 'Opted in' : 'Off', cls: profile.whatsapp_opted_in ? 'text-emerald-400' : 'text-zinc-500' },
              { label: 'Total Revenue', value: fmt(totalSpend), cls: 'text-zinc-200 font-semibold' },
            ].map(row => (
              <div key={row.label}>
                <p className="text-[11px] text-zinc-500 mb-0.5">{row.label}</p>
                <p className={`text-sm ${row.cls || 'text-zinc-300'}`}>{row.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: ad accounts + issue summary */}
        <div className="space-y-4">
          {/* Ad accounts */}
          <div className={`${CARD} p-4`}>
            <h3 className="text-sm font-semibold text-zinc-300 mb-3">Ad Accounts ({accounts?.length ?? 0})</h3>
            {(accounts ?? []).length === 0 ? (
              <p className="text-xs text-zinc-500">None connected</p>
            ) : (
              <div className="space-y-2.5">
                {(accounts ?? []).map(acc => (
                  <div key={acc.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-zinc-300 truncate">{acc.account_name ?? acc.account_id}</p>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${PLATFORM_CLS[acc.platform] ?? 'bg-zinc-700 text-zinc-400'}`}>
                        {acc.platform}
                      </span>
                    </div>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0 ${acc.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {acc.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Issue summary */}
          <div className={`${CARD} p-4`}>
            <h3 className="text-sm font-semibold text-zinc-300 mb-3">
              Open Issues ({openIssues?.length ?? 0})
            </h3>
            {(openIssues ?? []).length === 0 ? (
              <p className="text-xs text-emerald-400 font-medium">No open issues</p>
            ) : (
              <div className="space-y-1.5">
                {(['critical', 'high', 'medium', 'low'] as const).map(sev => {
                  const count = issuesBySeverity[sev] ?? 0
                  if (!count) return null
                  return (
                    <div key={sev} className="flex items-center justify-between">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${SEVERITY_CLS[sev]}`}>{sev}</span>
                      <span className="text-xs font-semibold text-zinc-300">{count}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Open issues list */}
      {(openIssues ?? []).length > 0 && (
        <div className={`${CARD} p-5 mb-5`}>
          <h3 className="text-sm font-semibold text-zinc-300 mb-4">Active Diagnostic Issues</h3>
          <div className="divide-y divide-white/[0.05]">
            {(openIssues ?? []).map(issue => {
              const acct = accountMap[issue.ad_account_id]
              return (
                <div key={issue.id} className="py-2.5 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 min-w-0">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize shrink-0 mt-0.5 ${SEVERITY_CLS[issue.severity]}`}>
                      {issue.severity}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-zinc-300">{issue.title}</p>
                      <p className="text-[10px] text-zinc-500 capitalize">
                        {issue.platform} · {acct?.account_name ?? 'unknown account'} · {relTime(issue.detected_at)}
                      </p>
                    </div>
                  </div>
                  {(issue.estimated_impact_inr ?? 0) > 0 && (
                    <span className="text-xs font-semibold text-orange-400 shrink-0">
                      {fmt(issue.estimated_impact_inr!)}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Sync logs */}
      {(syncLogs ?? []).length > 0 && (
        <div className={`${CARD} p-5 mb-5`}>
          <h3 className="text-sm font-semibold text-zinc-300 mb-4">Recent Syncs</h3>
          <div className="divide-y divide-white/[0.05]">
            {(syncLogs ?? []).map(log => {
              const acct = accountMap[log.ad_account_id]
              return (
                <div key={log.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${SYNC_STATUS_CLS[log.status] ?? 'bg-zinc-700 text-zinc-400'}`}>
                      {log.status}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs text-zinc-400 truncate">
                        {acct?.account_name ?? log.ad_account_id.slice(0, 8)}
                        {acct && <span className={`ml-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${PLATFORM_CLS[acct.platform]}`}>{acct.platform}</span>}
                      </p>
                      <p className="text-[10px] text-zinc-500">{relTime(log.started_at)} · {log.sync_type} · {dur(log.started_at, log.completed_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-zinc-500 shrink-0">
                    <span>{log.campaigns_synced ?? 0} campaigns</span>
                    {(log.issues_found ?? 0) > 0 && (
                      <span className="text-orange-400 font-semibold">{log.issues_found} issues</span>
                    )}
                    {log.error_message && (
                      <span className="text-red-400 text-[10px] max-w-[120px] truncate" title={log.error_message}>
                        {log.error_message}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Billing history */}
      <div className={`${CARD} p-5`}>
        <h3 className="text-sm font-semibold text-zinc-300 mb-4">Billing History</h3>
        {(billingEvents ?? []).length === 0 ? (
          <p className="text-sm text-zinc-500">No billing events</p>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {(billingEvents ?? []).map((e, i) => (
              <div key={i} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold capitalize ${EVENT_COLOR[e.event_type] ?? 'text-zinc-400'}`}>
                    {e.event_type.replace('.', ' › ')}
                  </span>
                  {e.plan && <span className="text-xs text-zinc-500 capitalize">{e.plan}</span>}
                </div>
                <div className="flex items-center gap-4 text-right">
                  {e.amount_inr != null && (
                    <span className="text-sm font-medium text-zinc-300">{fmt(e.amount_inr)}</span>
                  )}
                  <span className="text-xs text-zinc-500">
                    {new Date(e.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
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
