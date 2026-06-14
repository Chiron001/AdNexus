'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { EmptyState } from '@/components/shared/EmptyState'
import { UpgradeWall } from '@/components/shared/UpgradeWall'
import { toast } from 'sonner'
import { Lightbulb, Clock, CheckCircle2, Loader2 } from 'lucide-react'
import type { PlanTier } from '@/lib/config/plans'

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

const EFFORT_CLS: Record<string, string> = {
  quick_win: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  medium:    'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20',
  complex:   'bg-purple-500/15 text-purple-400 border border-purple-500/20',
}

const EFFORT_LABELS: Record<string, string> = {
  quick_win: '⚡ Quick Win',
  medium:    '🔧 Medium Effort',
  complex:   '🏗 Complex',
}

const SEVERITY_CLS: Record<string, string> = {
  critical: 'bg-red-500/15 text-red-400 border border-red-500/20',
  high:     'bg-orange-500/15 text-orange-400 border border-orange-500/20',
  medium:   'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20',
  low:      'bg-zinc-800 text-zinc-400 border border-zinc-700',
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading,  setLoading]  = useState(true)
  const [sort,     setSort]     = useState<'impact' | 'effort'>('impact')
  const [applying, setApplying] = useState<string | null>(null)
  const [plan,     setPlan]     = useState<PlanTier>('free')

  const loadRecommendations = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
    setPlan((profile?.plan as PlanTier) ?? 'free')

    const { data } = await supabase
      .from('recommendations')
      .select(`*, diagnostic_issues(title, platform, severity, estimated_impact_inr, affected_entity_name)`)
      .eq('user_id', user.id)
      .eq('status', 'pending')

    setRecommendations((data as Recommendation[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { loadRecommendations() }, [loadRecommendations])

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
      setRecommendations(prev => prev.filter(r => r.id !== recId))
    } catch {
      toast.error('Failed to update. Please try again.')
    } finally {
      setApplying(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <div className="h-8 w-48 bg-zinc-800/60 rounded-lg animate-pulse" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 bg-zinc-900/40 border border-zinc-800/60 rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (plan === 'free') {
    return (
      <UpgradeWall
        feature="AI Recommendations"
        requiredPlan="growth"
        currentPlan={plan}
        bullets={[
          'AI-generated fixes for every issue detected',
          'Plain-English action steps — no jargon',
          'Estimated ₹ revenue impact per recommendation',
          'Effort level and time-to-implement for each fix',
          'Recommendations generated on every sync automatically',
        ]}
      />
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">Recommendations</h2>
          <p className="text-zinc-500 mt-1 text-sm">AI-generated fixes ranked by revenue impact.</p>
        </div>
        <div className="flex gap-2 text-sm">
          <button
            onClick={() => setSort('impact')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${sort === 'impact' ? 'bg-blue-600 text-white' : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
          >
            By Impact
          </button>
          <button
            onClick={() => setSort('effort')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${sort === 'effort' ? 'bg-blue-600 text-white' : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
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
            <Link
              href="/accounts"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-purple-500/20"
            >
              Go to Accounts →
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {sorted.map((rec) => {
            const issue = rec.diagnostic_issues
            const steps = Array.isArray(rec.action_steps) ? rec.action_steps as string[] : []
            const effort = rec.effort_level

            return (
              <div
                key={rec.id}
                className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-700 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {issue?.severity && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${SEVERITY_CLS[issue.severity]}`}>
                          {issue.severity}
                        </span>
                      )}
                      {issue?.platform && (
                        <span className="text-xs border border-zinc-700 text-zinc-400 px-2 py-0.5 rounded-full capitalize">
                          {issue.platform} Ads
                        </span>
                      )}
                      {effort && EFFORT_CLS[effort] && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${EFFORT_CLS[effort]}`}>
                          {EFFORT_LABELS[effort] ?? effort}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-white leading-snug">{rec.title}</h3>
                    {issue?.affected_entity_name && (
                      <p className="text-xs text-zinc-600 mt-1">📁 {issue.affected_entity_name}</p>
                    )}
                  </div>

                  {(issue?.estimated_impact_inr ?? 0) > 0 && (
                    <div className="flex-shrink-0 bg-orange-500/10 border border-orange-500/20 px-3 py-2 rounded-xl text-right">
                      <p className="text-xs text-zinc-500">Revenue at risk</p>
                      <p className="font-bold text-orange-400 text-lg">
                        ₹{issue!.estimated_impact_inr!.toLocaleString('en-IN')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Explanation */}
                {rec.explanation && (
                  <p className="text-sm text-zinc-400 leading-relaxed mb-4">{rec.explanation}</p>
                )}

                {/* Action steps */}
                {steps.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Action Steps</p>
                    {steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-xl border border-zinc-700/40">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                          {idx + 1}
                        </span>
                        <p className="text-sm text-zinc-300 flex-1 leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60">
                  <div className="flex items-center gap-3 text-xs text-zinc-600">
                    {rec.time_to_implement && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {rec.time_to_implement}
                      </span>
                    )}
                    {rec.estimated_impact && (
                      <span className="text-emerald-400 font-medium">{rec.estimated_impact}</span>
                    )}
                  </div>
                  <button
                    disabled={applying === rec.id}
                    onClick={() => handleMarkDone(rec.id)}
                    className="flex items-center gap-1.5 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
                  >
                    {applying === rec.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    Mark as Done
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
