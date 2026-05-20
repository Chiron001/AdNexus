import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatINR, formatRelativeTime } from '@/lib/utils/format'
import { AlertTriangle, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { EmptyState } from '@/components/shared/EmptyState'

const severityColors: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-gray-100 text-gray-600 border-gray-200',
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

  const params = await searchParams
  const platformFilter = params.platform || 'all'
  const severityFilter = params.severity || 'all'
  const statusFilter = params.status || 'open'

  let query = supabase
    .from('diagnostic_issues')
    .select('*')
    .eq('user_id', user.id)

  if (statusFilter !== 'all') query = query.eq('status', statusFilter as 'open' | 'dismissed' | 'fixed')
  if (platformFilter !== 'all') query = query.eq('platform', platformFilter)
  if (severityFilter !== 'all') query = query.eq('severity', severityFilter as 'critical' | 'high' | 'medium' | 'low')

  const { data: issues } = await query

  const sorted = [...(issues ?? [])].sort((a, b) => {
    const severityDiff =
      (severityOrder[a.severity as keyof typeof severityOrder] ?? 99) -
      (severityOrder[b.severity as keyof typeof severityOrder] ?? 99)
    if (severityDiff !== 0) return severityDiff
    return (b.estimated_impact_inr ?? 0) - (a.estimated_impact_inr ?? 0)
  })

  const filterLink = (key: string, value: string) => {
    const p = new URLSearchParams({
      platform: platformFilter,
      severity: severityFilter,
      status: statusFilter,
      [key]: value,
    })
    return `/diagnostics?${p.toString()}`
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Diagnostics</h2>
        <p className="text-gray-500 mt-1">Issues ranked by severity and revenue impact.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-1 text-sm">
          <span className="text-gray-500 mr-1">Platform:</span>
          {['all', 'meta', 'google', 'amazon'].map(p => (
            <Link key={p} href={filterLink('platform', p)}
              className={`px-3 py-1 rounded-full capitalize ${platformFilter === p ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {p}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-1 text-sm">
          <span className="text-gray-500 mr-1">Severity:</span>
          {['all', 'critical', 'high', 'medium', 'low'].map(s => (
            <Link key={s} href={filterLink('severity', s)}
              className={`px-3 py-1 rounded-full capitalize ${severityFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-1 text-sm">
          <span className="text-gray-500 mr-1">Status:</span>
          {['open', 'dismissed', 'fixed', 'all'].map(s => (
            <Link key={s} href={filterLink('status', s)}
              className={`px-3 py-1 rounded-full capitalize ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s}
            </Link>
          ))}
        </div>
      </div>

      {/* Issues */}
      {sorted.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="No issues found"
          description="Either your accounts are healthy or no sync has run yet. Connect an account and trigger a sync to see diagnostics."
        />
      ) : (
        <div className="space-y-3">
          {sorted.map((issue) => (
            <Card key={issue.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`capitalize text-xs ${severityColors[issue.severity]}`}>
                        {issue.severity}
                      </Badge>
                      <Badge variant="outline" className="capitalize text-xs">
                        {issue.platform}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {issue.affected_entity_type}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-gray-900 mt-2">{issue.title}</h4>
                    {issue.description && (
                      <p className="text-sm text-gray-500 mt-1">{issue.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                      {issue.affected_entity_name && (
                        <span>📁 {issue.affected_entity_name}</span>
                      )}
                      {issue.estimated_impact_inr && (
                        <span className="text-orange-600 font-medium">
                          ₹{issue.estimated_impact_inr.toLocaleString('en-IN')} at risk
                        </span>
                      )}
                      <span>{formatRelativeTime(issue.detected_at)}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/recommendations">
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
