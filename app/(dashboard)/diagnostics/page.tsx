import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatRelativeTime } from '@/lib/utils/format'
import { AlertTriangle, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { EmptyState } from '@/components/shared/EmptyState'

const SEVERITY_CLS: Record<string, string> = {
  critical: 'bg-red-500/15 text-red-400 border border-red-500/20',
  high:     'bg-orange-500/15 text-orange-400 border border-orange-500/20',
  medium:   'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20',
  low:      'bg-zinc-800 text-zinc-400 border border-zinc-700',
}

const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }

export default async function DiagnosticsPage({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string; severity?: string; status?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params         = await searchParams
  const platformFilter = params.platform ?? 'all'
  const severityFilter = params.severity ?? 'all'
  const statusFilter   = params.status   ?? 'open'

  let query = supabase.from('diagnostic_issues').select('*').eq('user_id', user.id)
  if (statusFilter !== 'all') query = query.eq('status', statusFilter as 'open' | 'dismissed' | 'fixed')
  if (platformFilter !== 'all') query = query.eq('platform', platformFilter)
  if (severityFilter !== 'all') query = query.eq('severity', severityFilter as 'critical' | 'high' | 'medium' | 'low')

  const { data: issues } = await query

  const sorted = [...(issues ?? [])].sort((a, b) => {
    const sd = (severityOrder[a.severity as keyof typeof severityOrder] ?? 99) -
               (severityOrder[b.severity as keyof typeof severityOrder] ?? 99)
    return sd !== 0 ? sd : (b.estimated_impact_inr ?? 0) - (a.estimated_impact_inr ?? 0)
  })

  function filterLink(key: string, value: string) {
    const p = new URLSearchParams({ platform: platformFilter, severity: severityFilter, status: statusFilter, [key]: value })
    return `/diagnostics?${p.toString()}`
  }

  function pill(active: boolean) {
    return `px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
      active ? 'bg-blue-600 text-white' : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
    }`
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold text-white">Diagnostics</h2>
        <p className="text-zinc-500 mt-1 text-sm">Issues ranked by severity and revenue impact.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-zinc-600 font-medium">Platform:</span>
          {['all', 'meta', 'google', 'amazon'].map(p => (
            <Link key={p} href={filterLink('platform', p)} className={pill(platformFilter === p)}>{p}</Link>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-zinc-600 font-medium">Severity:</span>
          {['all', 'critical', 'high', 'medium', 'low'].map(s => (
            <Link key={s} href={filterLink('severity', s)} className={pill(severityFilter === s)}>{s}</Link>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-zinc-600 font-medium">Status:</span>
          {['open', 'dismissed', 'fixed', 'all'].map(s => (
            <Link key={s} href={filterLink('status', s)} className={pill(statusFilter === s)}>{s}</Link>
          ))}
        </div>
      </div>

      {/* Issues list */}
      {sorted.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="No issues found"
          description="Either your accounts are healthy or no sync has run yet. Connect an account and trigger a sync to see diagnostics."
        />
      ) : (
        <div className="space-y-3">
          {sorted.map((issue) => (
            <div
              key={issue.id}
              className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`capitalize text-xs ${SEVERITY_CLS[issue.severity]}`}>
                      {issue.severity}
                    </Badge>
                    <span className="text-xs border border-zinc-700 text-zinc-400 px-2 py-0.5 rounded-full capitalize">
                      {issue.platform}
                    </span>
                    <span className="text-xs border border-zinc-700 text-zinc-400 px-2 py-0.5 rounded-full">
                      {issue.affected_entity_type}
                    </span>
                  </div>
                  <h4 className="font-semibold text-white mt-2">{issue.title}</h4>
                  {issue.description && (
                    <p className="text-sm text-zinc-500 mt-1 leading-relaxed">{issue.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-xs text-zinc-600">
                    {issue.affected_entity_name && (
                      <span>📁 {issue.affected_entity_name}</span>
                    )}
                    {issue.estimated_impact_inr != null && (
                      <span className="text-orange-400 font-medium">
                        ₹{issue.estimated_impact_inr.toLocaleString('en-IN')} at risk
                      </span>
                    )}
                    <span>{formatRelativeTime(issue.detected_at)}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-zinc-500 hover:text-white hover:bg-zinc-800 shrink-0"
                  asChild
                >
                  <Link href="/recommendations">
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
