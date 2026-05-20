import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

type RecommendationWithIssue = Tables<'recommendations'> & {
  diagnostic_issues: { title: string; platform: string; severity: string } | null
}

type SyncLogWithAccount = Tables<'sync_logs'> & {
  ad_accounts: { platform: string; account_name: string | null } | null
}
import {
  AlertTriangle,
  Link2,
  TrendingUp,
  IndianRupee,
  Plus,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react'
import { formatINR, formatRelativeTime } from '@/lib/utils/format'

const platformColors: Record<string, string> = {
  meta: 'bg-blue-600',
  google: 'bg-green-600',
  amazon: 'bg-orange-500',
}

const platformLabels: Record<string, string> = {
  meta: 'Meta Ads',
  google: 'Google Ads',
  amazon: 'Amazon Ads',
}

const severityColors: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-600',
}

function HealthScoreRing({ score }: { score: number }) {
  const color =
    score >= 80 ? 'text-green-600' :
    score >= 60 ? 'text-yellow-600' :
    score >= 40 ? 'text-amber-600' :
    score >= 20 ? 'text-orange-600' : 'text-red-600'

  return (
    <div className={`text-4xl font-bold ${color}`}>{score}</div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, company_name')
    .eq('id', user.id)
    .single()

  const { data: adAccounts } = await supabase
    .from('ad_accounts')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')

  const { data: openIssues } = await supabase
    .from('diagnostic_issues')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'open')
    .order('estimated_impact_inr', { ascending: false })

  const { data: topRecommendationsRaw } = await supabase
    .from('recommendations')
    .select(`*, diagnostic_issues(title, platform, severity)`)
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(5)

  const topRecommendations = topRecommendationsRaw as RecommendationWithIssue[] | null

  const { data: recentSyncsRaw } = await supabase
    .from('sync_logs')
    .select(`*, ad_accounts(platform, account_name)`)
    .in('ad_account_id', (adAccounts || []).map(a => a.id))
    .order('started_at', { ascending: false })
    .limit(10)

  const recentSyncs = recentSyncsRaw as SyncLogWithAccount[] | null

  const hasAccounts = (adAccounts?.length ?? 0) > 0

  const issueCounts = {
    critical: openIssues?.filter(i => i.severity === 'critical').length ?? 0,
    high: openIssues?.filter(i => i.severity === 'high').length ?? 0,
    medium: openIssues?.filter(i => i.severity === 'medium').length ?? 0,
    low: openIssues?.filter(i => i.severity === 'low').length ?? 0,
  }

  const totalImpactInr = openIssues?.reduce((sum, i) => sum + (i.estimated_impact_inr ?? 0), 0) ?? 0

  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Good morning, {firstName} 👋
        </h2>
        <p className="text-gray-500 mt-1">
          {hasAccounts
            ? 'Here&apos;s what needs your attention today.'
            : 'Connect your first ad account to get started.'}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Ad Accounts</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{adAccounts?.length ?? 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Link2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Open Issues</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{openIssues?.length ?? 0}</p>
                {issueCounts.critical > 0 && (
                  <p className="text-xs text-red-600 mt-1">{issueCounts.critical} critical</p>
                )}
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Revenue at Risk</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatINR(totalImpactInr)}</p>
                <p className="text-xs text-gray-400 mt-1">estimated / month</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                <IndianRupee className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Recommendations</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{topRecommendations?.length ?? 0}</p>
                <p className="text-xs text-gray-400 mt-1">pending review</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {!hasAccounts ? (
        /* Empty state — no accounts connected */
        <Card className="border-dashed border-2">
          <CardContent className="py-16 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <Link2 className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Connect your first ad account
            </h3>
            <p className="text-gray-500 max-w-md mb-6">
              Link Meta Ads, Google Ads, or Amazon Ads. AdNexus will automatically scan for issues,
              calculate your health score, and give you AI-powered recommendations in minutes.
            </p>
            <Button asChild size="lg">
              <Link href="/accounts">
                <Plus className="w-4 h-4 mr-2" />
                Connect Ad Account
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Platform Health Cards */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Platform Health</h3>
            {adAccounts?.map((account) => {
              const accountIssues = openIssues?.filter(i => i.ad_account_id === account.id) ?? []
              const critical = accountIssues.filter(i => i.severity === 'critical').length
              const high = accountIssues.filter(i => i.severity === 'high').length
              const medium = accountIssues.filter(i => i.severity === 'medium').length
              const score = Math.max(0,
                100 - Math.min(critical, 2) * 25 - Math.min(high, 3) * 15 - Math.min(medium, 3) * 8
              )

              return (
                <Card key={account.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${platformColors[account.platform] || 'bg-gray-500'} rounded-lg flex items-center justify-center text-white text-sm font-bold`}>
                          {account.platform.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {platformLabels[account.platform]}
                          </p>
                          <p className="text-sm text-gray-500">{account.account_name}</p>
                        </div>
                      </div>
                      <HealthScoreRing score={score} />
                    </div>

                    <div className="flex items-center gap-3 mt-4">
                      {critical > 0 && <Badge className="bg-red-100 text-red-700">{critical} critical</Badge>}
                      {high > 0 && <Badge className="bg-orange-100 text-orange-700">{high} high</Badge>}
                      {medium > 0 && <Badge className="bg-yellow-100 text-yellow-700">{medium} medium</Badge>}
                      {accountIssues.length === 0 && (
                        <span className="text-sm text-green-600 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> No issues detected
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-400">
                        {account.last_synced_at
                          ? `Synced ${formatRelativeTime(account.last_synced_at)}`
                          : 'Never synced'}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/diagnostics">View Issues</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Top Recommendations */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Top Recommendations</h3>
            {topRecommendations && topRecommendations.length > 0 ? (
              <div className="space-y-3">
                {topRecommendations.map((rec) => {
                  const issue = rec.diagnostic_issues as { title: string; platform: string; severity: string } | null
                  return (
                    <Card key={rec.id} className="hover:shadow-sm transition-shadow">
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-start gap-2">
                          <Badge className={cn(severityColors[issue?.severity ?? 'low'], 'text-xs flex-shrink-0 capitalize')}>
                            {issue?.severity}
                          </Badge>
                          <p className="text-sm font-medium text-gray-900 leading-snug">{rec.title}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 capitalize">{issue?.platform} Ads</p>
                        <Button variant="link" size="sm" className="px-0 h-auto mt-1 text-blue-600" asChild>
                          <Link href="/recommendations">View fix →</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/recommendations">View all recommendations</Link>
                </Button>
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <p className="text-sm text-gray-500">Recommendations will appear after your first sync.</p>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            <h3 className="text-base font-semibold text-gray-900 pt-2">Recent Activity</h3>
            {recentSyncs && recentSyncs.length > 0 ? (
              <div className="space-y-2">
                {recentSyncs.slice(0, 5).map((sync) => {
                  const account = sync.ad_accounts as { platform: string; account_name: string } | null
                  return (
                    <div key={sync.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm text-gray-900 capitalize">
                          {account?.platform} sync — {sync.status}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatRelativeTime(sync.started_at)} · {sync.campaigns_synced} campaigns
                        </p>
                      </div>
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        sync.status === 'completed' ? 'bg-green-500' :
                        sync.status === 'failed' ? 'bg-red-500' : 'bg-yellow-400'
                      )} />
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No sync activity yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
