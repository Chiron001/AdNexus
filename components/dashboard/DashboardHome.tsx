import Link from 'next/link'
import type { Tables } from '@/types/database'
import {
  AlertTriangle, ArrowRight, ArrowUpRight, ArrowDownRight, Sparkles, CheckCircle2, Check,
  Plus, RefreshCw, Wand2, Wallet, TrendingUp, Gauge, ShieldAlert, Clock, Lock,
} from 'lucide-react'
import { SiMeta, SiGoogleads } from 'react-icons/si'
import { FaAmazon } from 'react-icons/fa'
import { formatRelativeTime } from '@/lib/utils/format'
import { currencySymbol } from '@/lib/utils/currency'
import { SyncButton } from '@/components/shared/SyncButton'
import { Greeting } from '@/components/dashboard/Greeting'
import { Sparkline, PerformanceChart, type DayPoint } from '@/components/dashboard/DashboardCharts'

type RecommendationWithIssue = Tables<'recommendations'> & {
  diagnostic_issues: { title: string; platform: string; severity: string } | null
}

type SyncLogWithAccount = Tables<'sync_logs'> & {
  ad_accounts: { platform: string; account_name: string | null } | null
}

const PLATFORM = {
  meta:   { label: 'Meta Ads',   icon: SiMeta,      color: '#0081FB' },
  google: { label: 'Google Ads', icon: SiGoogleads, color: '#4285F4' },
  amazon: { label: 'Amazon Ads', icon: FaAmazon,    color: '#FF9900' },
} as const

const SEVERITY = {
  critical: { label: 'Critical', color: '#F87171', cls: 'bg-red-500/15 text-red-300' },
  high:     { label: 'High',     color: '#FB923C', cls: 'bg-orange-500/15 text-orange-300' },
  medium:   { label: 'Medium',   color: '#FACC15', cls: 'bg-yellow-500/15 text-yellow-200' },
  low:      { label: 'Low',      color: 'rgba(255,255,255,.35)', cls: 'bg-white/[0.08] text-white/60' },
} as const

const CARD = 'rounded-2xl bg-white/[0.035] border border-white/[0.08]'

function PlatformIcon({ platform, size = 'md' }: { platform: string; size?: 'sm' | 'md' }) {
  const p = PLATFORM[platform as keyof typeof PLATFORM]
  const box = size === 'sm' ? 'w-7 h-7 rounded-lg' : 'w-9 h-9 rounded-xl'
  if (!p) return <span className={`${box} bg-white/10`} />
  const Icon = p.icon
  return <span className={`${box} bg-white flex items-center justify-center shrink-0`}><Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} style={{ color: p.color }} /></span>
}

/* Same scoring the dashboard has always used: start at 100, deduct per open issue */
function healthScore(issues: { severity: string }[]) {
  const n = (s: string) => issues.filter(i => i.severity === s).length
  return Math.max(0, 100 - Math.min(n('critical'), 2) * 25 - Math.min(n('high'), 3) * 15 - Math.min(n('medium'), 3) * 8)
}

function scoreMeta(score: number) {
  if (score >= 80) return { label: 'Healthy',         color: '#34D399' }
  if (score >= 60) return { label: 'Needs a look',    color: '#FACC15' }
  if (score >= 40) return { label: 'Needs attention', color: '#FB923C' }
  return                 { label: 'At risk',          color: '#F87171' }
}

function ScoreRing({ score, size = 132, stroke = 10 }: { score: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r
  const { color } = scoreMeta(score)
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} />
    </svg>
  )
}

function Delta({ now, before, invert = false }: { now: number; before: number; invert?: boolean }) {
  if (!before) return <span className="text-[11px] text-white/35">no prior data</span>
  const pct = Math.round(((now - before) / before) * 100)
  const good = invert ? pct <= 0 : pct >= 0
  const Icon = pct >= 0 ? ArrowUpRight : ArrowDownRight
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${good ? 'bg-emerald-400/10 text-emerald-300' : 'bg-red-400/10 text-red-300'}`}>
      <Icon className="w-3 h-3" />{Math.abs(pct)}%
    </span>
  )
}

function SectionHeader({ title, sub, href, cta }: { title: string; sub?: string; href?: string; cta?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-4">
      <div>
        <h2 className="io-display text-[15px] font-semibold text-white">{title}</h2>
        {sub && <p className="text-xs text-white/45 mt-0.5">{sub}</p>}
      </div>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-xs font-semibold text-violet-300 hover:text-violet-200 transition-colors shrink-0">
          {cta ?? 'View all'} <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  )
}

export type DashboardData = {
  profile: { full_name: string | null; company_name: string | null; country: string | null } | null
  email: string
  adAccounts: Tables<'ad_accounts'>[]
  issues: Tables<'diagnostic_issues'>[]
  recommendations: RecommendationWithIssue[]
  syncs: SyncLogWithAccount[]
  metricRows: { date: string; spend: number; revenue: number; conversions: number }[]
  days: string[]
}

/* 28 UTC days ending today: the last 14 are compared against the 14 before */
export function dashboardDays() {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  return Array.from({ length: 28 }, (_, i) => {
    const d = new Date(today)
    d.setUTCDate(d.getUTCDate() - 27 + i)
    return d.toISOString().slice(0, 10)
  })
}

export function DashboardHome({ profile, email, adAccounts, issues, recommendations: topRecommendations, syncs: recentSyncs, metricRows, days }: DashboardData) {
  const sym = currencySymbol(profile?.country)
  // Indian digit grouping for rupees (₹7,73,873), Western grouping otherwise
  const money = (n: number) => sym + new Intl.NumberFormat(sym === '₹' ? 'en-IN' : 'en-US', { maximumFractionDigits: 0 }).format(Math.round(n))

  const firstName = (profile?.full_name || email.split('@')[0] || '').split(' ')[0]
  const greetName = firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1) : ''

  if (adAccounts.length === 0) return <EmptyDashboard greetName={greetName} />

  // Daily series
  const byDay = new Map(days.map(d => [d, { spend: 0, revenue: 0, conversions: 0 }]))
  for (const m of metricRows ?? []) {
    const row = byDay.get(m.date)
    if (!row) continue
    row.spend += Number(m.spend) || 0
    row.revenue += Number(m.revenue) || 0
    row.conversions += Number(m.conversions) || 0
  }
  const series = days.map(d => ({ date: d, ...byDay.get(d)! }))
  const cur = series.slice(14), prev = series.slice(0, 14)
  const sum = (rows: typeof series, k: 'spend' | 'revenue' | 'conversions') => rows.reduce((s, r) => s + r[k], 0)
  const spendNow = sum(cur, 'spend'),   spendPrev = sum(prev, 'spend')
  const revNow   = sum(cur, 'revenue'), revPrev   = sum(prev, 'revenue')
  const roasNow  = spendNow ? revNow / spendNow : 0
  const roasPrev = spendPrev ? revPrev / spendPrev : 0
  const hasMetrics = series.some(r => r.spend > 0 || r.revenue > 0)
  const chartData: DayPoint[] = series.map(({ date, spend, revenue }) => ({ date, spend: Math.round(spend), revenue: Math.round(revenue) }))

  // Issues
  const totalImpact = issues.reduce((s, i) => s + (i.estimated_impact_inr ?? 0), 0)
  const sevCount = (s: string) => issues.filter(i => i.severity === s).length
  const accountScores = adAccounts.map(a => healthScore(issues.filter(i => i.ad_account_id === a.id)))
  const overall = Math.round(accountScores.reduce((s, v) => s + v, 0) / accountScores.length)
  const overallMeta = scoreMeta(overall)
  const topLeak = issues[0]
  const lastSync = adAccounts.map(a => a.last_synced_at).filter(Boolean).sort().at(-1) as string | undefined
  const neverSynced = !lastSync

  const KPIS = [
    { label: 'Ad spend',  sub: 'last 14 days', value: money(spendNow), delta: <Delta now={spendNow} before={spendPrev} invert />, spark: cur.map(r => r.spend),   color: '#3B5BFD', icon: Wallet },
    { label: 'Revenue',   sub: 'last 14 days', value: money(revNow),   delta: <Delta now={revNow} before={revPrev} />,              spark: cur.map(r => r.revenue), color: '#A99BFF', icon: TrendingUp },
    { label: 'ROAS',      sub: 'revenue ÷ spend', value: spendNow ? `${roasNow.toFixed(2)}x` : '—', delta: <Delta now={roasNow} before={roasPrev} />, spark: cur.map(r => (r.spend ? r.revenue / r.spend : 0)), color: '#34D399', icon: Gauge },
    { label: 'Revenue at risk', sub: 'per month, from open issues', value: money(totalImpact), delta: <span className="text-[11px] text-white/45">{issues.length} open issue{issues.length === 1 ? '' : 's'}</span>, spark: [], color: '#F87171', icon: ShieldAlert },
  ]

  return (
    <div className="max-w-[1400px] mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] io-grad-text" style={{ backgroundImage: 'linear-gradient(90deg,#8FA6FF,#C4B5FD)' }}>
            {profile?.company_name || 'Your workspace'}
          </p>
          <h1 className="io-display text-[1.75rem] sm:text-[2rem] font-semibold text-white leading-tight mt-1"><Greeting name={greetName} /></h1>
          <p className="text-sm text-white/50 mt-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> {lastSync ? `Data last synced ${formatRelativeTime(lastSync)}` : 'Waiting for the first sync'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/accounts" className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-[13px] font-semibold text-white/85 hover:bg-white/[0.06] transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add account
          </Link>
          <Link href="/diagnostics" className="io-btn io-btn-primary !py-2.5 !text-[13px]">
            Review issues <ArrowRight className="io-arrow w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* AI briefing + health */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.1] p-6 sm:p-7"
        style={{ background: 'radial-gradient(80% 120% at 100% 0%, rgba(124,58,237,.28), transparent 60%), radial-gradient(60% 100% at 0% 100%, rgba(59,91,253,.22), transparent 60%), #120F2A' }}>
        <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.08] border border-white/10 px-2.5 py-1 text-[11px] font-semibold text-violet-200">
              <Sparkles className="w-3.5 h-3.5" /> AI briefing
            </span>
            {neverSynced ? (
              <>
                <h2 className="io-display text-xl sm:text-2xl font-semibold text-white mt-3 leading-snug">Your first scan is on its way.</h2>
                <p className="text-sm text-white/60 mt-2 max-w-2xl">Run a sync on any connected account and we&apos;ll check every campaign, rank issues by the revenue they cost you and suggest fixes.</p>
              </>
            ) : issues.length === 0 ? (
              <>
                <h2 className="io-display text-xl sm:text-2xl font-semibold text-white mt-3 leading-snug">All clear — no open issues across {adAccounts.length} account{adAccounts.length === 1 ? '' : 's'}.</h2>
                <p className="text-sm text-white/60 mt-2 max-w-2xl">We&apos;ll keep scanning after every sync and flag anything that starts costing you money.</p>
              </>
            ) : (
              <>
                <h2 className="io-display text-xl sm:text-2xl font-semibold text-white mt-3 leading-snug">
                  {issues.length} open issue{issues.length === 1 ? ' is' : 's are'} costing you an estimated <span className="io-grad-text" style={{ backgroundImage: 'linear-gradient(90deg,#FCA5A5,#FDBA74)' }}>{money(totalImpact)}/month</span>.
                </h2>
                {topLeak && (
                  <p className="text-sm text-white/60 mt-2 max-w-2xl">
                    The biggest leak is <span className="text-white font-medium">{topLeak.title}</span>
                    {PLATFORM[topLeak.platform as keyof typeof PLATFORM] ? ` on ${PLATFORM[topLeak.platform as keyof typeof PLATFORM].label}` : ''}
                    {topLeak.estimated_impact_inr ? <> — about <span className="text-white font-medium">{money(topLeak.estimated_impact_inr)}/month</span>.</> : '.'}
                    {sevCount('critical') > 0 && <> {sevCount('critical')} critical issue{sevCount('critical') === 1 ? ' needs' : 's need'} attention first.</>}
                  </p>
                )}
              </>
            )}
            <div className="flex flex-wrap gap-2 mt-5">
              <Link href={neverSynced ? '/accounts' : '/diagnostics'} className="io-btn bg-white text-[var(--io-ink)] !py-2.5 !text-[13px]">
                {neverSynced ? 'Go to accounts' : 'See all issues'} <ArrowRight className="io-arrow w-3.5 h-3.5" />
              </Link>
              {!neverSynced && issues.length > 0 && (
                <Link href="/recommendations" className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-white/[0.08] transition-colors">
                  <Wand2 className="w-3.5 h-3.5" /> Get the fixes
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-5 lg:pl-8 lg:border-l border-white/10">
            <div className="relative">
              <ScoreRing score={neverSynced ? 0 : overall} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="io-display text-4xl font-semibold text-white tabular-nums">{neverSynced ? '—' : overall}</span>
                <span className="text-[10px] uppercase tracking-[0.16em] text-white/50">Health</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold" style={{ color: neverSynced ? 'rgba(255,255,255,.6)' : overallMeta.color }}>{neverSynced ? 'Not scored yet' : overallMeta.label}</p>
              {(['critical', 'high', 'medium'] as const).map(s => (
                <p key={s} className="flex items-center gap-2 text-xs text-white/60">
                  <span className="w-2 h-2 rounded-full" style={{ background: SEVERITY[s].color }} />
                  <span className="tabular-nums text-white font-semibold w-4">{sevCount(s)}</span> {SEVERITY[s].label.toLowerCase()}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {KPIS.map(({ label, sub, value, delta, spark, color, icon: Icon }, i) => (
          <div key={label} className={`${CARD} p-5`}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-white/55">{label}</p>
              <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}22`, color }}><Icon className="w-4 h-4" /></span>
            </div>
            <p className="io-display text-[1.7rem] font-semibold text-white tabular-nums leading-tight mt-1">{hasMetrics || i === 3 ? value : '—'}</p>
            <div className="flex items-center gap-2 mt-1">{hasMetrics || i === 3 ? delta : null}<span className="text-[11px] text-white/35 truncate">{sub}</span></div>
            {spark.length > 0 && hasMetrics ? <div className="mt-3 -mx-1"><Sparkline data={spark} color={color} id={`k${i}`} /></div> : <div className="mt-3 h-10" />}
          </div>
        ))}
      </div>

      {/* Performance + severity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className={`${CARD} xl:col-span-2`}>
          <div className="flex items-start justify-between px-5 pt-5">
            <div>
              <h2 className="io-display text-[15px] font-semibold text-white">Spend vs revenue</h2>
              <p className="text-xs text-white/45 mt-0.5">Last 28 days, all connected accounts</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-white/60">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#A99BFF]" /> Revenue</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#3B5BFD]" /> Spend</span>
            </div>
          </div>
          <div className="px-3 pb-4 pt-2">
            {hasMetrics ? <PerformanceChart data={chartData} sym={sym} /> : (
              <div className="h-[260px] flex flex-col items-center justify-center text-center">
                <RefreshCw className="w-6 h-6 text-white/30 mb-3" />
                <p className="text-sm text-white/60">No campaign data in the last 28 days yet.</p>
                <p className="text-xs text-white/40 mt-1">Sync an account to fill this chart.</p>
              </div>
            )}
          </div>
        </div>

        <div className={CARD}>
          <SectionHeader title="Issues by severity" sub={`${issues.length} open`} href="/diagnostics" />
          <div className="px-5 pb-5">
            <div className="flex h-3 rounded-full overflow-hidden bg-white/[0.06] mb-5">
              {issues.length > 0 && (['critical', 'high', 'medium', 'low'] as const).map(s => sevCount(s) > 0 && (
                <span key={s} style={{ width: `${(sevCount(s) / issues.length) * 100}%`, background: SEVERITY[s].color }} />
              ))}
            </div>
            <ul className="space-y-3">
              {(['critical', 'high', 'medium', 'low'] as const).map(s => {
                const impact = issues.filter(i => i.severity === s).reduce((a, i) => a + (i.estimated_impact_inr ?? 0), 0)
                return (
                  <li key={s} className="flex items-center gap-3 text-[13px]">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: SEVERITY[s].color }} />
                    <span className="flex-1 text-white/75">{SEVERITY[s].label}</span>
                    <span className="text-white/45 tabular-nums text-xs">{impact ? `${money(impact)}/mo` : ''}</span>
                    <span className="w-6 text-right text-white font-semibold tabular-nums">{sevCount(s)}</span>
                  </li>
                )
              })}
            </ul>
            {issues.length === 0 && (
              <p className="flex items-center gap-2 text-sm text-emerald-300 mt-5"><CheckCircle2 className="w-4 h-4" /> Nothing open right now</p>
            )}
          </div>
        </div>
      </div>

      {/* Money leaks + recommendations */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className={`${CARD} xl:col-span-2`}>
          <SectionHeader title="Biggest money leaks" sub="Open issues ranked by estimated monthly impact" href="/diagnostics" />
          {issues.length === 0 ? (
            <p className="px-5 pb-6 text-sm text-white/45">No leaks found{neverSynced ? ' yet — run your first sync.' : '. Nice work.'}</p>
          ) : (
            <div className="px-3 pb-3">
              {issues.slice(0, 5).map((issue, i) => {
                const sev = SEVERITY[issue.severity] ?? SEVERITY.low
                const share = totalImpact ? ((issue.estimated_impact_inr ?? 0) / totalImpact) * 100 : 0
                return (
                  <Link key={issue.id} href="/diagnostics" className="flex items-center gap-3.5 px-2 py-3 rounded-xl hover:bg-white/[0.04] transition-colors">
                    <span className="w-5 text-center text-xs font-semibold text-white/35 tabular-nums">{i + 1}</span>
                    <PlatformIcon platform={issue.platform} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-white truncate">{issue.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${sev.cls}`}>{sev.label}</span>
                        {issue.affected_entity_name && <span className="text-[11px] text-white/40 truncate">{issue.affected_entity_name}</span>}
                      </div>
                    </div>
                    <div className="w-36 hidden sm:block">
                      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.max(share, 3)}%`, background: sev.color }} />
                      </div>
                    </div>
                    <span className="w-28 text-right text-[13px] font-semibold text-white tabular-nums">
                      {issue.estimated_impact_inr ? `${money(issue.estimated_impact_inr)}/mo` : '—'}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        <div className={CARD}>
          <SectionHeader title="AI recommendations" sub="Fixes waiting for your review" href="/recommendations" />
          <div className="px-3 pb-3 space-y-1">
            {topRecommendations.length === 0 ? (
              <p className="px-2 pb-3 text-sm text-white/45">Recommendations appear after your first sync finds something to fix.</p>
            ) : topRecommendations.map(rec => {
              const issue = rec.diagnostic_issues
              const sev = SEVERITY[(issue?.severity ?? 'low') as keyof typeof SEVERITY] ?? SEVERITY.low
              return (
                <Link key={rec.id} href="/recommendations" className="flex items-start gap-3 px-2 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white" style={{ background: 'linear-gradient(135deg,var(--io-accent),var(--io-accent-2))' }}>
                    <Wand2 className="w-4 h-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-white leading-snug line-clamp-2">{rec.title}</p>
                    <p className="flex items-center gap-1.5 mt-1 text-[11px] text-white/45">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: sev.color }} />
                      {sev.label}{issue?.platform && PLATFORM[issue.platform as keyof typeof PLATFORM] ? ` · ${PLATFORM[issue.platform as keyof typeof PLATFORM].label}` : ''}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Platform health + activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className={`${CARD} xl:col-span-2`}>
          <SectionHeader title="Account health" sub="Score per connected ad account" href="/accounts" cta="Manage" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-5 pb-5">
            {adAccounts.map((account, idx) => {
              const accIssues = issues.filter(i => i.ad_account_id === account.id)
              const score = accountScores[idx]
              const meta = scoreMeta(score)
              const synced = !!account.last_synced_at
              return (
                <div key={account.id} className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-4">
                  <div className="flex items-center gap-3">
                    <PlatformIcon platform={account.platform} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-white truncate">{account.account_name || PLATFORM[account.platform as keyof typeof PLATFORM]?.label || account.platform}</p>
                      <p className="text-[11px] text-white/45">{synced ? `Synced ${formatRelativeTime(account.last_synced_at!)}` : <span className="text-orange-300">Never synced</span>}</p>
                    </div>
                    <div className="relative">
                      <ScoreRing score={synced ? score : 0} size={52} stroke={5} />
                      <span className="absolute inset-0 flex items-center justify-center text-[13px] font-semibold text-white tabular-nums">{synced ? score : '—'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-white/[0.06]">
                    <span className="text-xs" style={{ color: synced ? meta.color : 'rgba(255,255,255,.45)' }}>
                      {!synced ? 'Run a sync to score' : accIssues.length === 0 ? 'No open issues' : `${accIssues.length} open issue${accIssues.length === 1 ? '' : 's'}`}
                    </span>
                    <SyncButton accountId={account.id} platform={account.platform} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className={CARD}>
          <SectionHeader title="Recent activity" sub="Latest syncs" />
          <div className="px-5 pb-5">
            {recentSyncs.length === 0 ? (
              <p className="text-sm text-white/45">No sync activity yet.</p>
            ) : (
              <ol className="relative border-l border-white/[0.08] ml-1.5 space-y-4">
                {recentSyncs.map(sync => {
                  const ok = sync.status === 'completed', failed = sync.status === 'failed'
                  return (
                    <li key={sync.id} className="pl-4 relative">
                      <span className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-[#0B0A14] ${ok ? 'bg-emerald-400' : failed ? 'bg-red-400' : 'bg-yellow-300'}`} />
                      <p className="text-[13px] text-white">
                        {PLATFORM[sync.ad_accounts?.platform as keyof typeof PLATFORM]?.label ?? 'Account'} sync
                        <span className={`ml-1.5 text-xs ${ok ? 'text-emerald-300' : failed ? 'text-red-300' : 'text-yellow-200'}`}>{sync.status}</span>
                      </p>
                      <p className="text-[11px] text-white/40 mt-0.5">{formatRelativeTime(sync.started_at)} · {sync.campaigns_synced} campaigns</p>
                    </li>
                  )
                })}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── First-run dashboard: no ad accounts yet ───────── */
const CHECKLIST = [
  { label: 'Create your account', done: true },
  { label: 'Activate your plan',  done: true },
  { label: 'Connect an ad account', done: false },
  { label: 'Run your first sync',   done: false },
  { label: 'Review your first issues', done: false },
]

function EmptyDashboard({ greetName }: { greetName: string }) {
  const done = CHECKLIST.filter(c => c.done).length
  return (
    <div className="max-w-[1400px] mx-auto space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] io-grad-text" style={{ backgroundImage: 'linear-gradient(90deg,#8FA6FF,#C4B5FD)' }}>Getting started</p>
        <h1 className="io-display text-[1.75rem] sm:text-[2rem] font-semibold text-white leading-tight mt-1"><Greeting name={greetName} /></h1>
        <p className="text-sm text-white/50 mt-1">Connect an ad account and we&apos;ll run your first diagnosis.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Connect */}
        <div className="xl:col-span-2 relative overflow-hidden rounded-3xl border border-white/[0.1] p-6 sm:p-8"
          style={{ background: 'radial-gradient(80% 120% at 100% 0%, rgba(124,58,237,.3), transparent 60%), radial-gradient(60% 100% at 0% 100%, rgba(59,91,253,.24), transparent 60%), #120F2A' }}>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.08] border border-white/10 px-2.5 py-1 text-[11px] font-semibold text-violet-200">
            <Sparkles className="w-3.5 h-3.5" /> Next step
          </span>
          <h2 className="io-display text-2xl sm:text-[1.9rem] font-semibold text-white mt-3 leading-tight max-w-xl">
            Connect your ad account to find what&apos;s <span className="io-grad-text" style={{ backgroundImage: 'linear-gradient(90deg,#8FA6FF,#C4B5FD)' }}>draining your budget.</span>
          </h2>
          <p className="text-sm text-white/60 mt-2 max-w-xl">We check every campaign, rank issues by the revenue they cost you and write the fix in plain English.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-7">
            {(Object.entries(PLATFORM) as [keyof typeof PLATFORM, (typeof PLATFORM)[keyof typeof PLATFORM]][]).map(([key, p]) => {
              const Icon = p.icon
              return (
                <Link key={key} href="/accounts"
                  className="group rounded-2xl bg-white/[0.06] border border-white/[0.1] p-4 hover:bg-white/[0.1] hover:border-white/25 transition-colors">
                  <span className="w-10 h-10 rounded-xl bg-white flex items-center justify-center"><Icon className="w-5 h-5" style={{ color: p.color }} /></span>
                  <p className="text-sm font-semibold text-white mt-3">{p.label}</p>
                  <p className="flex items-center gap-1 text-xs text-violet-200 mt-1 font-semibold">
                    Connect <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </p>
                </Link>
              )
            })}
          </div>
          <p className="flex items-center gap-1.5 text-xs text-white/45 mt-5"><Lock className="w-3.5 h-3.5" /> We only read your campaign data — Adnexusone never changes your campaigns.</p>
        </div>

        {/* Checklist */}
        <div className={`${CARD} p-6`}>
          <div className="flex items-center justify-between">
            <h2 className="io-display text-[15px] font-semibold text-white">Setup checklist</h2>
            <span className="text-xs font-semibold text-white/60 tabular-nums">{done} of {CHECKLIST.length}</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden mt-3">
            <div className="h-full rounded-full" style={{ width: `${(done / CHECKLIST.length) * 100}%`, background: 'linear-gradient(90deg,var(--io-accent),var(--io-accent-2))' }} />
          </div>
          <ol className="mt-5 space-y-3.5">
            {CHECKLIST.map((c, i) => {
              const next = !c.done && CHECKLIST.findIndex(x => !x.done) === i
              return (
                <li key={c.label} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${c.done ? 'text-white' : next ? 'bg-white text-[var(--io-ink)]' : 'border border-white/20 text-white/40'}`}
                    style={c.done ? { background: 'linear-gradient(135deg,var(--io-accent),var(--io-accent-2))' } : undefined}>
                    {c.done ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : i + 1}
                  </span>
                  <span className={`text-[13px] flex-1 ${c.done ? 'text-white/50 line-through decoration-white/30' : next ? 'text-white font-semibold' : 'text-white/55'}`}>{c.label}</span>
                  {next && <Link href="/accounts" className="text-xs font-semibold text-violet-300 hover:text-violet-200">Start →</Link>}
                </li>
              )
            })}
          </ol>
        </div>
      </div>

      {/* Sample preview */}
      <div className={`${CARD} relative overflow-hidden`}>
        <div className="flex items-center justify-between px-5 pt-5">
          <div>
            <h2 className="io-display text-[15px] font-semibold text-white">What you&apos;ll see here</h2>
            <p className="text-xs text-white/45 mt-0.5">A preview with sample data — yours appears after the first sync</p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] rounded-full border border-white/15 px-2.5 py-1 text-white/55">Sample</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-5 opacity-80 select-none" aria-hidden="true">
          {[
            { label: 'Health score', value: '64', note: 'Needs attention', color: '#FB923C' },
            { label: 'Revenue at risk', value: '₹1.2L/mo', note: '12 open issues', color: '#F87171' },
            { label: 'ROAS', value: '3.4x', note: '+8% vs last 14 days', color: '#34D399' },
            { label: 'AI fixes ready', value: '7', note: '3 high impact', color: '#A99BFF' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-4">
              <p className="text-xs text-white/50">{s.label}</p>
              <p className="io-display text-2xl font-semibold text-white mt-1">{s.value}</p>
              <p className="text-[11px] mt-1" style={{ color: s.color }}>{s.note}</p>
            </div>
          ))}
          <div className="md:col-span-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] p-4 space-y-2.5">
            {[
              { p: 'meta' as const,   t: 'Creative fatigue on 3 ads', v: '₹51,000/mo', w: 82, c: '#F87171' },
              { p: 'meta' as const,   t: 'Pixel not firing on checkout', v: '₹46,000/mo', w: 74, c: '#F87171' },
              { p: 'google' as const, t: 'Search terms with zero conversions', v: '₹38,000/mo', w: 61, c: '#FB923C' },
              { p: 'amazon' as const, t: 'ACOS creeping up on Brand – Exact', v: '₹25,000/mo', w: 40, c: '#FACC15' },
            ].map(r => (
              <div key={r.t} className="flex items-center gap-3">
                <PlatformIcon platform={r.p} size="sm" />
                <span className="flex-1 text-[13px] text-white/80 truncate">{r.t}</span>
                <span className="w-40 hidden sm:block h-1.5 rounded-full bg-white/[0.06] overflow-hidden"><span className="block h-full rounded-full" style={{ width: `${r.w}%`, background: r.c }} /></span>
                <span className="w-24 text-right text-[13px] font-semibold text-white tabular-nums">{r.v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none" style={{ background: 'linear-gradient(180deg, transparent, rgba(11,10,20,.85))' }} />
      </div>

      <p className="flex items-center justify-center gap-1.5 text-xs text-white/40"><AlertTriangle className="w-3.5 h-3.5" /> Need help connecting? Head to <Link href="/settings/integrations" className="text-violet-300 hover:text-violet-200">Integrations</Link>.</p>
    </div>
  )
}
