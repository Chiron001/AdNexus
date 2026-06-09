'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { CheckCircle2, AlertCircle, RefreshCw, Loader2 } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/format'

const platformInfo = {
  meta: {
    name:        'Meta Ads',
    description: 'Facebook, Instagram & Audience Network',
    color:       'bg-blue-600',
    authPath:    '/api/auth/meta',
  },
  google: {
    name:        'Google Ads',
    description: 'Search, Shopping, Display & YouTube',
    color:       'bg-green-600',
    authPath:    '/api/auth/google',
  },
  amazon: {
    name:        'Amazon Ads',
    description: 'Sponsored Products, Brands & Display',
    color:       'bg-orange-500',
    authPath:    '/api/auth/amazon',
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
  const [authUrls,  setAuthUrls]  = useState<Record<string, string>>({})

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
    if (res.ok) setAuthUrls(await res.json() as Record<string, string>)
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

  const connectedPlatforms = new Set(accounts.map(a => a.platform))

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-white">Connected Accounts</h2>
        <p className="text-zinc-500 mt-1 text-sm">Connect your ad platforms to start getting diagnostics.</p>
      </div>

      {/* Active connections */}
      {accounts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Active Connections</h3>
          {accounts.map((account) => {
            const info     = platformInfo[account.platform as Platform]
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
                        <span className="text-xs text-zinc-600">
                          · Synced {formatRelativeTime(account.last_synced_at)}
                        </span>
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

      {/* Connect a platform */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Connect a Platform</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(Object.keys(platformInfo) as Platform[]).map((platform) => {
            const info        = platformInfo[platform]
            const isConnected = connectedPlatforms.has(platform)
            const authUrl     = authUrls[platform] ?? '#'

            return (
              <div
                key={platform}
                className={`bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 rounded-2xl p-6 flex flex-col items-center text-center transition-all ${
                  isConnected ? 'opacity-60' : 'hover:border-zinc-700 cursor-pointer'
                }`}
              >
                <div className={`w-16 h-16 ${info.color} rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg`}>
                  {platform.charAt(0).toUpperCase()}
                </div>
                <h4 className="font-semibold text-white mb-1">{info.name}</h4>
                <p className="text-xs text-zinc-500 mb-5 leading-relaxed">{info.description}</p>

                {isConnected ? (
                  <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Connected
                  </span>
                ) : loading ? (
                  <button disabled className="w-full flex items-center justify-center gap-2 bg-zinc-800 text-zinc-500 text-sm font-medium px-4 py-2.5 rounded-xl cursor-not-allowed">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading…
                  </button>
                ) : (
                  <a
                    href={authUrl}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-opacity shadow-md shadow-purple-500/20"
                  >
                    Connect {info.name}
                  </a>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
