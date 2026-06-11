'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { CheckCircle2, AlertCircle, RefreshCw, Loader2, ExternalLink, ArrowRight, Zap, Clock } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/format'

const platformInfo = {
  meta: {
    name:        'Meta Ads',
    description: 'Connect Facebook & Instagram ad accounts to diagnose creative fatigue, pixel issues, and budget waste.',
    color:       'bg-blue-600',
    shadow:      'shadow-blue-500/25',
    ring:        'ring-blue-500/30',
    letter:      'M',
    checks:      ['Creative fatigue detection', 'Pixel & conversion tracking', 'Audience overlap', 'Budget pacing'],
  },
  google: {
    name:        'Google Ads',
    description: 'Connect Search, Shopping, and Display campaigns to identify keyword waste, quality score drops, and bid issues.',
    color:       'bg-green-600',
    shadow:      'shadow-green-500/25',
    ring:        'ring-green-500/30',
    letter:      'G',
    checks:      ['Keyword cannibalization', 'Quality Score monitoring', 'Search term waste', 'Shopping ROAS split'],
  },
  amazon: {
    name:        'Amazon Ads',
    description: 'Connect Sponsored Products and Sponsored Brands to monitor ACOS, search term efficiency, and zero-sale ASINs.',
    color:       'bg-orange-500',
    shadow:      'shadow-orange-500/25',
    ring:        'ring-orange-500/30',
    letter:      'A',
    checks:      ['ACOS benchmarking', 'Zero-sale ASIN detection', 'Search term negatives', 'Bid efficiency'],
  },
} as const

type Platform = keyof typeof platformInfo

interface AdAccount {
  id: string
  platform: string
  account_id: string
  account_name: string | null
  status: string
  last_synced_at: string | null
}

export default function AccountsPage() {
  const [accounts,  setAccounts]  = useState<AdAccount[]>([])
  const [loading,   setLoading]   = useState(true)
  const [syncing,   setSyncing]   = useState<string | null>(null)
  const [authUrls,  setAuthUrls]  = useState<Record<string, string | null>>({})
  const [connecting, setConnecting] = useState<Platform | null>(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('ad_accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setAccounts(data ?? [])

    const res = await fetch('/api/auth/urls')
    if (res.ok) setAuthUrls(await res.json() as Record<string, string | null>)
    setLoading(false)
  }

  async function handleSync(accountId: string, platform: string) {
    setSyncing(accountId)
    try {
      const res = await fetch(`/api/sync/${platform}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ account_id: accountId }),
      })
      const data = await res.json() as { success?: boolean; campaigns_synced?: number; issues_found?: number; error?: string }
      if (!res.ok) { toast.error(data.error ?? 'Sync failed'); return }
      toast.success(`Sync complete — ${data.campaigns_synced} campaigns, ${data.issues_found} issues found`)
      await loadData()
    } catch {
      toast.error('Sync failed. Check your connection.')
    } finally {
      setSyncing(null)
    }
  }

  function handleConnect(platform: Platform) {
    const url = authUrls[platform]
    if (url) {
      setConnecting(platform)
      window.location.href = url
    } else {
      toast.info(`${platformInfo[platform].name} integration is being activated. You'll be notified as soon as it's ready to connect.`, {
        duration: 5000,
      })
    }
  }

  const connectedPlatforms = new Set(accounts.map(a => a.platform))
  const allConfigured = Object.values(authUrls).some(u => u !== null)

  return (
    <div className="space-y-8 max-w-4xl">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Connected Accounts</h2>
        <p className="text-zinc-500 mt-1 text-sm">
          Connect your ad platforms to start getting automated diagnostics and health scores.
        </p>
      </div>

      {/* Info strip — only shown when no platforms are ready yet */}
      {!loading && !allConfigured && accounts.length === 0 && (
        <div className="flex items-start gap-3 bg-blue-500/[0.08] border border-blue-500/20 rounded-xl px-4 py-3.5">
          <Clock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-300 mb-0.5">Platform integrations are being activated</p>
            <p className="text-xs text-blue-400/70 leading-relaxed">
              Meta, Google, and Amazon Ads connections are being set up. You'll be able to connect your accounts once activation is complete — usually within 24 hours.
            </p>
          </div>
        </div>
      )}

      {/* Active connections */}
      {accounts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Active Connections</h3>
          {accounts.map((account) => {
            const info      = platformInfo[account.platform as Platform]
            const isSyncing = syncing === account.id
            return (
              <div
                key={account.id}
                className="flex items-center justify-between flex-wrap gap-4 bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 rounded-2xl px-5 py-4 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${info?.color ?? 'bg-zinc-700'} rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-md`}>
                    {account.platform.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{info?.name ?? account.platform}</p>
                    <p className="text-sm text-zinc-500">{account.account_name ?? account.account_id}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {account.status === 'active' ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-red-400">
                          <AlertCircle className="w-3.5 h-3.5" /> {account.status}
                        </span>
                      )}
                      {account.last_synced_at && (
                        <span className="text-xs text-zinc-600">· Synced {formatRelativeTime(account.last_synced_at)}</span>
                      )}
                      {!account.last_synced_at && (
                        <span className="text-xs text-orange-400">· Never synced</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  disabled={isSyncing}
                  onClick={() => handleSync(account.id, account.platform)}
                  className="flex items-center gap-1.5 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  {isSyncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  {isSyncing ? 'Syncing…' : 'Sync Now'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Connect platforms */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Connect a Platform</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(Object.keys(platformInfo) as Platform[]).map((platform) => {
            const info        = platformInfo[platform]
            const isConnected = connectedPlatforms.has(platform)
            const url         = authUrls[platform] ?? null
            const isReady     = !loading && url !== null
            const isConnecting = connecting === platform

            return (
              <div
                key={platform}
                className={`bg-zinc-900/60 backdrop-blur-sm border rounded-2xl p-6 flex flex-col transition-all duration-200 ${
                  isConnected
                    ? 'border-emerald-500/25 opacity-80'
                    : isReady
                    ? `border-zinc-800/80 hover:border-zinc-600 hover:${info.ring} cursor-pointer`
                    : 'border-zinc-800/50'
                }`}
              >
                {/* Icon + badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 ${info.color} rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg ${info.shadow}`}>
                    {info.letter}
                  </div>
                  {isConnected && (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Connected
                    </span>
                  )}
                  {!isConnected && !loading && (
                    <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${
                      isReady
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-zinc-800/80 text-zinc-500 border border-zinc-700/50'
                    }`}>
                      {isReady ? <><Zap className="w-2.5 h-2.5" /> Ready</> : <><Clock className="w-2.5 h-2.5" /> Coming soon</>}
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-white mb-1.5">{info.name}</h4>
                <p className="text-xs text-zinc-500 mb-4 leading-relaxed flex-1">{info.description}</p>

                {/* What gets checked */}
                <ul className="space-y-1.5 mb-5">
                  {info.checks.map((check) => (
                    <li key={check} className="flex items-center gap-2 text-xs text-zinc-400">
                      <div className={`w-1 h-1 rounded-full ${info.color}`} />
                      {check}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isConnected ? (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 justify-center py-2">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Account connected
                  </div>
                ) : loading ? (
                  <button disabled className="w-full flex items-center justify-center gap-2 bg-zinc-800 text-zinc-500 text-sm font-medium px-4 py-2.5 rounded-xl cursor-not-allowed">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect(platform)}
                    disabled={isConnecting}
                    className={`w-full flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all ${
                      isReady
                        ? `bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 text-white shadow-md shadow-purple-500/20 ${isConnecting ? 'opacity-70' : ''}`
                        : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300 border border-zinc-700/60'
                    }`}
                  >
                    {isConnecting
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Connecting…</>
                      : isReady
                      ? <>Connect {info.name} <ArrowRight className="w-3.5 h-3.5" /></>
                      : <>Notify me when ready</>
                    }
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* How OAuth works — shown before any connections */}
      {accounts.length === 0 && !loading && (
        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">How connecting works</p>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { step: '01', title: 'Click Connect', desc: 'You\'re redirected to the platform\'s official login page — Meta, Google, or Amazon.' },
              { step: '02', title: 'Authorise access', desc: 'Grant AdNexus read-only access to your ad account data. We cannot edit or spend your budget.' },
              { step: '03', title: 'Diagnostics run', desc: 'AdNexus runs 30+ checks on your account and shows you a health score within minutes.' },
            ].map((s) => (
              <div key={s.step} className="flex gap-3">
                <span className="text-2xl font-black text-zinc-800 leading-none shrink-0">{s.step}</span>
                <div>
                  <p className="text-sm font-semibold text-white mb-1">{s.title}</p>
                  <p className="text-xs text-zinc-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-zinc-800/60 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <p className="text-xs text-zinc-500">AdNexus requests <strong className="text-zinc-400">read-only</strong> permissions — we can never create, edit, pause, or spend on your campaigns.</p>
          </div>
        </div>
      )}
    </div>
  )
}
