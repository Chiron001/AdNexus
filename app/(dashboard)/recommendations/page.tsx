'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { toast } from 'sonner'
import { Lightbulb, Clock, CheckCircle2, Loader2, Sparkles } from 'lucide-react'

interface DiagnosticIssue {
  title: string
  platform: string
  severity: string
  estimated_impact_inr: number | null
  affected_entity_name: string | null
}

interface Recommendation {
  id: string
  title: string
  explanation: string | null
  action_steps: unknown
  estimated_impact: string | null
  effort_level: string | null
  time_to_implement: string | null
  status: string
  diagnostic_issues: DiagnosticIssue | null
}

const effortColors: Record<string, string> = {
  quick_win: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  complex: 'bg-purple-100 text-purple-700',
}

const effortLabels: Record<string, string> = {
  quick_win: '⚡ Quick Win',
  medium: '🔧 Medium Effort',
  complex: '🏗 Complex',
}

const severityColors: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-600',
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<'impact' | 'effort'>('impact')
  const [applying, setApplying] = useState<string | null>(null)

  const loadRecommendations = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('recommendations')
      .select(`*, diagnostic_issues(title, platform, severity, estimated_impact_inr, affected_entity_name)`)
      .eq('user_id', user.id)
      .eq('status', 'pending')

    setRecommendations((data as Recommendation[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    loadRecommendations()
  }, [loadRecommendations])

  const sorted = [...recommendations].sort((a, b) => {
    if (sort === 'effort') {
      const order = { quick_win: 0, medium: 1, complex: 2 }
      return (order[a.effort_level as keyof typeof order] ?? 99) -
             (order[b.effort_level as keyof typeof order] ?? 99)
    }
    return (b.diagnostic_issues?.estimated_impact_inr ?? 0) - (a.diagnostic_issues?.estimated_impact_inr ?? 0)
  })

  async function handleMarkDone(recId: string) {
    setApplying(recId)
    try {
      const res = await fetch(`/api/recommendations/${recId}/apply`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed')
      toast.success('Marked as done!')
      setRecommendations((prev) => prev.filter((r) => r.id !== recId))
    } catch {
      toast.error('Failed to update. Please try again.')
    } finally {
      setApplying(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recommendations</h2>
          <p className="text-gray-500 mt-1">AI-generated fixes ranked by revenue impact.</p>
        </div>
        <div className="flex gap-2 text-sm">
          <button
            onClick={() => setSort('impact')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${sort === 'impact' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            By Impact
          </button>
          <button
            onClick={() => setSort('effort')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${sort === 'effort' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Quick Wins First
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="No recommendations yet"
          description="Recommendations are AI-generated after a sync runs and issues are detected. Go to Accounts and click Sync Now to get started."
          action={
            <Button asChild>
              <Link href="/accounts">Go to Accounts →</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {sorted.map((rec) => {
            const issue = rec.diagnostic_issues
            const steps = Array.isArray(rec.action_steps) ? rec.action_steps as string[] : []
            const effort = rec.effort_level

            return (
              <Card key={rec.id} className="hover:shadow-sm transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        {issue?.severity && (
                          <Badge className={`capitalize text-xs ${severityColors[issue.severity] ?? ''}`}>
                            {issue.severity}
                          </Badge>
                        )}
                        {issue?.platform && (
                          <Badge variant="outline" className="capitalize text-xs">
                            {issue.platform} Ads
                          </Badge>
                        )}
                        {effort && effortColors[effort] && (
                          <Badge className={`text-xs ${effortColors[effort]}`}>
                            {effortLabels[effort] ?? effort}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base leading-snug">{rec.title}</CardTitle>
                      {issue?.affected_entity_name && (
                        <p className="text-xs text-gray-400 mt-1">📁 {issue.affected_entity_name}</p>
                      )}
                    </div>
                    {(issue?.estimated_impact_inr ?? 0) > 0 && (
                      <div className="text-right flex-shrink-0 bg-orange-50 px-3 py-2 rounded-lg">
                        <p className="text-xs text-gray-400">Revenue at risk</p>
                        <p className="font-bold text-orange-600 text-lg">
                          ₹{(issue!.estimated_impact_inr!).toLocaleString('en-IN')}
                        </p>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0 space-y-4">
                  {rec.explanation && (
                    <p className="text-sm text-gray-600 leading-relaxed">{rec.explanation}</p>
                  )}

                  {steps.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Action Steps</p>
                      {steps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                            {idx + 1}
                          </span>
                          <p className="text-sm text-gray-700 flex-1 leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      {rec.time_to_implement && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {rec.time_to_implement}
                        </span>
                      )}
                      {rec.estimated_impact && (
                        <span className="text-green-600 font-medium">{rec.estimated_impact}</span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-green-700 border-green-200 hover:bg-green-50"
                      disabled={applying === rec.id}
                      onClick={() => handleMarkDone(rec.id)}
                    >
                      {applying === rec.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      Mark as Done
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
