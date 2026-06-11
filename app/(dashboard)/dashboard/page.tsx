import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertTriangle,
  Link2,
  TrendingUp,
  IndianRupee,
  Plus,
  CheckCircle2,
} from 'lucide-react'
import { formatINR, formatRelativeTime } from '@/lib/utils/format'
import { SyncButton } from '@/components/shared/SyncButton'

type RecommendationWithIssue = Tables<'recommendations'> & {
  diagnostic_issues: { title: string; platform: string; severity: string } | null
}

type SyncLogWithAccount = Tables<'sync_logs'> & {
  ad_accounts: { platform: string; account_name: string | null } | null
}

const PLATFORM_BG: Record<string, string> = {
  meta:   'bg-blue-600',
  google: 'bg-green-600',
  amazon: 'bg-orange-500',
}

const PLATFORM_LABELS: Record<string, string> = {
  meta:   'Meta Ads',
  google: 'Google Ads',
  amazon: 'Amazon Ads',
}

const SEVERITY_CLS: Record<string, string> = {
  critical: 'bg-red-500/15 text-red-400 border border-red-500/20',
  high:     'bg-orange-500/15 text-orange-400 border border-orange-500/20',
  medium:   'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20',
  low:      'bg-zinc-800 text-zinc-400 border border-zinc-700',
}

function HealthScoreRing({ score }: { score: number }) {
  const { cls, shadow } =
    score >= 80 ? { cls: 'text-emerald-400', shadow: 'drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]'  } :
    score >= 60 ? { cls: 'text-yellow-400',  shadow: 'drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]'  } :
    score >= 40 ? { cls: 'text-amber-400',   shadow: 'drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]'  } :
    score >= 20 ? { cls: 'text-orange-400',  shadow: 'drop-shadow-[0_0_10px_rgba(251,146,60,0.5)]'  } :
                  { cls: 'text-red-400',     shadow: 'drop-shadow-[0_0_10px_rgba(248,113,113,0.5)]' }

  return <div className={`text-4xl font-bold ${cls} ${shadow}`}>{score}</div>
}

// Reusable dark card wrapper
function DarkCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 rounded-2xl ${className}`}>
      {children}
    </div>
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

  const hasAccounts    = (adAccounts?.length ?? 0) > 0
  const totalImpactInr = openIssues?.reduce((sum, i) => sum + (i.estimated_impact_inr ?? 0), 0) ?? 0
  const issueCounts    = {
    critical: openIssues?.filter(i => i.severity === 'critical').length ?? 0,
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  return (
    <div className="space-y-6 max-w-7xl">

      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-white">
          Good morning, {firstName} 👋
        </h2>
        <p className="text-zinc-500 mt-1 text-sm">
          {hasAccounts
            ? "Here's what needs your attention today."
            : 'Connect your first ad account to get started.'}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ad Accounts */}
        <DarkCard className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Ad Accounts</p>
              <p className="text-3xl font-bold text-white mt-1.5">{adAccounts?.length ?? 0}</p>
            </div>
            <div className="w-11 h-11 bg-blue-500/10 ring-1 ring-blue-500/25 rounded-xl flex items-center justify-center">
              <Link2 className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </DarkCard>

        {/* Open Issues */}
        <DarkCard className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Open Issues</p>
              <p className="text-3xl font-bold text-white mt-1.5">{openIssues?.length ?? 0}</p>
              {issueCounts.critical > 0 && (
                <p className="text-xs text-red-400 mt-1">{issueCounts.critical} critical</p>
              )}
            </div>
            <div className="w-11 h-11 bg-red-500/10 ring-1 ring-red-500/25 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
          </div>
        </DarkCard>

        {/* Revenue at Risk */}
        <DarkCard className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Revenue at Risk</p>
              <p className="text-2xl font-bold text-white mt-1.5">{formatINR(totalImpactInr)}</p>
              <p className="text-xs text-zinc-600 mt-1">estimated / month</p>
            </div>
            <div className="w-11 h-11 bg-orange-500/10 ring-1 ring-orange-500/25 rounded-xl flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-orange-400" />
            </div>
          </div>
        </DarkCard>

        {/* Recommendations */}
        <DarkCard className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Recommendations</p>
              <p className="text-3xl font-bold text-white mt-1.5">{topRecommendations?.length ?? 0}</p>
              <p className="text-xs text-zinc-600 mt-1">pending review</p>
            </div>
            <div className="w-11 h-11 bg-emerald-500/10 ring-1 ring-emerald-500/25 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </DarkCard>
      </div>

      {!hasAccounts ? (
        /* Empty state */
        <div className="border-2 border-dashed border-zinc-800 bg-zinc-900/30 backdrop-blur-sm rounded-2xl py-16 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-blue-500/10 ring-1 ring-blue-500/20 rounded-full flex items-center justify-center mb-6">
            <Link2 className="w-10 h-10 text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Connect your first ad account
          </h3>
          <p className="text-zinc-500 max-w-md mb-7 text-sm leading-relaxed">
            Link Meta Ads, Google Ads, or Amazon Ads. AdNexus will automatically scan for issues,
            calculate your health score, and give you AI-powered recommendations in minutes.
          </p>
          <Link
            href="/accounts"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25"
          >
            <Plus className="w-4 h-4" />
            Connect Ad Account
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Platform Health */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">Platform Health</h3>
            {adAccounts?.map((account) => {
              const accountIssues = openIssues?.filter(i => i.ad_account_id === account.id) ?? []
              const critical = accountIssues.filter(i => i.severity === 'critical').length
              const high     = accountIssues.filter(i => i.severity === 'high').length
              const medium   = accountIssues.filter(i => i.severity === 'medium').length
              const score    = Math.max(0,
                100 - Math.min(critical, 2) * 25 - Math.min(high, 3) * 15 - Math.min(medium, 3) * 8
              )

              return (
                <DarkCard key={account.id} className="p-5 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${PLATFORM_BG[account.platform] || 'bg-zinc-700'} rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-md`}>
                        {account.platform.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {PLATFORM_LABELS[account.platform] || account.platform}
                        </p>
                        <p className="text-sm text-zinc-500">{account.account_name}</p>
                      </div>
                    </div>
                    <HealthScoreRing score={score} />
                  </div>

                  <div className="flex items-center gap-2 mt-4 flex-wrap">
                    {critical > 0 && (
                      <Badge className={`${SEVERITY_CLS.critical} text-xs`}>{critical} critical</Badge>
                    )}
                    {high > 0 && (
                      <Badge className={`${SEVERITY_CLS.high} text-xs`}>{high} high</Badge>
                    )}
                    {medium > 0 && (
                      <Badge className={`${SEVERITY_CLS.medium} text-xs`}>{medium} medium</Badge>
                    )}
                    {accountIssues.length === 0 && (
                      <span className="text-sm text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> No issues detected
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800/60">
                    <p className="text-xs text-zinc-600">
                      {account.last_synced_at
                        ? `Synced ${formatRelativeTime(account.last_synced_at)}`
                        : <span className="text-orange-400">Never synced</span>}
                    </p>
                    <div className="flex items-center gap-2">
                      <SyncButton accountId={account.id} platform={account.platform} />
                      <Link
                        href="/diagnostics"
                        className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
                      >
                        View Issues
                      </Link>
                    </div>
                  </div>
                </DarkCard>
              )
            })}
          </div>

          {/* Sidebar: Recommendations + Activity */}
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">Top Recommendations</h3>

            {topRecommendations && topRecommendations.length > 0 ? (
              <div className="space-y-2.5">
                {topRecommendations.map((rec) => {
                  const issue = rec.diagnostic_issues
                  return (
                    <DarkCard key={rec.id} className="p-4 hover:border-zinc-700 transition-colors">
                      <div className="flex items-start gap-2 mb-2">
                        <Badge className={`${SEVERITY_CLS[issue?.severity ?? 'low']} text-[10px] flex-shrink-0 capitalize`}>
                          {issue?.severity}
                        </Badge>
                        <p className="text-sm font-medium text-zinc-100 leading-snug">{rec.title}</p>
                      </div>
                      <p className="text-xs text-zinc-600 capitalize">{issue?.platform} Ads</p>
                      <Link
                        href="/recommendations"
                        className="text-xs text-purple-400 hover:text-purple-300 transition-colors mt-1 inline-block"
                      >
                        View fix →
                      </Link>
                    </DarkCard>
                  )
                })}
                <Link
                  href="/recommendations"
                  className="flex items-center justify-center w-full bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
                >
                  View all recommendations
                </Link>
              </div>
            ) : (
              <DarkCard className="p-6 border-dashed text-center">
                <p className="text-sm text-zinc-500">Recommendations will appear after your first sync.</p>
              </DarkCard>
            )}

            {/* Recent Activity */}
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide pt-2">Recent Activity</h3>
            {recentSyncs && recentSyncs.length > 0 ? (
              <DarkCard className="overflow-hidden">
                <div className="divide-y divide-zinc-800/60">
                  {recentSyncs.slice(0, 5).map((sync) => {
                    const account = sync.ad_accounts
                    return (
                      <div key={sync.id} className="flex items-center justify-between px-4 py-3">
                        <div>
                          <p className="text-sm text-zinc-200 capitalize">
                            {account?.platform} sync
                            <span className={`ml-1.5 text-xs ${sync.status === 'completed' ? 'text-emerald-400' : sync.status === 'failed' ? 'text-red-400' : 'text-yellow-400'}`}>
                              {sync.status}
                            </span>
                          </p>
                          <p className="text-xs text-zinc-600 mt-0.5">
                            {formatRelativeTime(sync.started_at)} · {sync.campaigns_synced} campaigns
                          </p>
                        </div>
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          sync.status === 'completed' ? 'bg-emerald-500' :
                          sync.status === 'failed'    ? 'bg-red-500' : 'bg-yellow-400'
                        }`} />
                      </div>
                    )
                  })}
                </div>
              </DarkCard>
            ) : (
              <p className="text-sm text-zinc-600">No sync activity yet.</p>
            )}
          </div>

        </div>
      )}
    </div>
  )
}
