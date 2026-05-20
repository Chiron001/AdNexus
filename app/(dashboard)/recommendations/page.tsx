import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'
import { Lightbulb, Clock, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

type RecommendationWithIssue = Tables<'recommendations'> & {
  diagnostic_issues: {
    title: string; platform: string; severity: string;
    estimated_impact_inr: number | null; affected_entity_name: string | null
  } | null
}

const effortColors = {
  quick_win: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  complex: 'bg-purple-100 text-purple-700',
}

const effortLabels = {
  quick_win: 'Quick Win',
  medium: 'Medium Effort',
  complex: 'Complex',
}

const severityColors: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-600',
}

export default async function RecommendationsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const sort = params.sort || 'impact'

  const { data: rawRecommendations } = await supabase
    .from('recommendations')
    .select(`
      *,
      diagnostic_issues(title, platform, severity, estimated_impact_inr, affected_entity_name)
    `)
    .eq('user_id', user.id)
    .eq('status', 'pending')

  const recommendations = rawRecommendations as RecommendationWithIssue[] | null

  const sorted = [...(recommendations ?? [])].sort((a, b) => {
    if (sort === 'effort') {
      const effortOrder = { quick_win: 0, medium: 1, complex: 2 }
      return (effortOrder[a.effort_level as keyof typeof effortOrder] ?? 99) -
             (effortOrder[b.effort_level as keyof typeof effortOrder] ?? 99)
    }
    const aImpact = a.diagnostic_issues?.estimated_impact_inr ?? 0
    const bImpact = b.diagnostic_issues?.estimated_impact_inr ?? 0
    return bImpact - aImpact
  })

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recommendations</h2>
          <p className="text-gray-500 mt-1">AI-generated fixes ranked by revenue impact.</p>
        </div>
        <div className="flex gap-2 text-sm">
          <Link href="?sort=impact"
            className={`px-3 py-1.5 rounded-lg ${sort === 'impact' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            By Impact
          </Link>
          <Link href="?sort=effort"
            className={`px-3 py-1.5 rounded-lg ${sort === 'effort' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            Quick Wins First
          </Link>
        </div>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="No recommendations yet"
          description="Recommendations are generated after a sync runs and issues are detected. Connect an account to get started."
        />
      ) : (
        <div className="space-y-4">
          {sorted.map((rec) => {
            const issue = rec.diagnostic_issues
            const steps = Array.isArray(rec.action_steps) ? rec.action_steps as string[] : []
            const effort = rec.effort_level as keyof typeof effortColors | null

            return (
              <Card key={rec.id} className="hover:shadow-sm transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        {issue?.severity && (
                          <Badge className={`capitalize text-xs ${severityColors[issue.severity]}`}>
                            {issue.severity}
                          </Badge>
                        )}
                        {issue?.platform && (
                          <Badge variant="outline" className="capitalize text-xs">
                            {issue.platform} Ads
                          </Badge>
                        )}
                        {effort && (
                          <Badge className={`text-xs ${effortColors[effort]}`}>
                            {effortLabels[effort]}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base">{rec.title}</CardTitle>
                    </div>
                    {issue?.estimated_impact_inr && (
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-400">Revenue at risk</p>
                        <p className="font-bold text-orange-600">
                          ₹{issue.estimated_impact_inr.toLocaleString('en-IN')}
                        </p>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0 space-y-4">
                  <p className="text-sm text-gray-600">{rec.explanation}</p>

                  {/* Action Steps */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Action Steps</p>
                    {steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg group">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-sm text-gray-700 flex-1">{step}</p>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2">
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
                    <form action={`/api/recommendations/${rec.id}/apply`} method="POST">
                      <Button type="submit" size="sm" variant="outline" className="gap-1.5 text-green-700 border-green-200 hover:bg-green-50">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mark as Done
                      </Button>
                    </form>
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
