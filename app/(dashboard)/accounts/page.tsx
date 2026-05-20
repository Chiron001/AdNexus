'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { CheckCircle2, AlertCircle, RefreshCw, Loader2 } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/format'

const platformInfo = {
  meta: {
    name: 'Meta Ads',
    description: 'Facebook, Instagram & Audience Network',
    color: 'bg-blue-600',
    authPath: '/api/auth/meta',
  },
  google: {
    name: 'Google Ads',
    description: 'Search, Shopping, Display & YouTube',
    color: 'bg-green-600',
    authPath: '/api/auth/google',
  },
  amazon: {
    name: 'Amazon Ads',
    description: 'Sponsored Products, Brands & Display',
    color: 'bg-orange-500',
    authPath: '/api/auth/amazon',
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
  const [accounts, setAccounts] = useState<AdAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [authUrls, setAuthUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    loadData()
  }, [])

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

    // Fetch OAuth URLs from server
    const res = await fetch('/api/auth/urls')
    if (res.ok) {
      const urls = await res.json() as Record<string, string>
      setAuthUrls(urls)
    }
    setLoading(false)
  }

  async function handleSync(accountId: string, platform: string) {
    setSyncing(accountId)
    try {
      const res = await fetch(`/api/sync/${platform}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_id: accountId }),
      })
      const data = await res.json() as { success?: boolean; campaigns_synced?: number; issues_found?: number; error?: string }

      if (!res.ok) {
        toast.error(data.error ?? 'Sync failed')
        return
      }

      toast.success(`Sync complete — ${data.campaigns_synced} campaigns, ${data.issues_found} issues found`)
      await loadData()
    } catch {
      toast.error('Sync failed. Check your connection.')
    } finally {
      setSyncing(null)
    }
  }

  const connectedPlatforms = new Set(accounts.map((a) => a.platform))

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Connected Accounts</h2>
        <p className="text-gray-500 mt-1">Connect your ad platforms to start getting diagnostics.</p>
      </div>

      {/* Active connections */}
      {accounts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Active Connections</h3>
          {accounts.map((account) => {
            const info = platformInfo[account.platform as Platform]
            const isSyncing = syncing === account.id
            return (
              <Card key={account.id}>
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 ${info?.color ?? 'bg-gray-500'} rounded-xl flex items-center justify-center text-white text-lg font-bold`}>
                        {account.platform.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{info?.name ?? account.platform}</p>
                        <p className="text-sm text-gray-500">{account.account_name || account.account_id}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {account.status === 'active' ? (
                            <span className="flex items-center gap-1 text-xs text-green-600">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-red-600">
                              <AlertCircle className="w-3.5 h-3.5" /> {account.status}
                            </span>
                          )}
                          {account.last_synced_at && (
                            <span className="text-xs text-gray-400">
                              · Synced {formatRelativeTime(account.last_synced_at)}
                            </span>
                          )}
                          {!account.last_synced_at && (
                            <span className="text-xs text-orange-500">· Never synced</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      disabled={isSyncing}
                      onClick={() => handleSync(account.id, account.platform)}
                    >
                      {isSyncing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3.5 h-3.5" />
                      )}
                      {isSyncing ? 'Syncing…' : 'Sync Now'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Connect new platform */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Connect a Platform</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(Object.keys(platformInfo) as Platform[]).map((platform) => {
            const info = platformInfo[platform]
            const isConnected = connectedPlatforms.has(platform)
            const authUrl = authUrls[platform] ?? '#'

            return (
              <Card
                key={platform}
                className={isConnected ? 'opacity-60' : 'hover:shadow-md transition-shadow cursor-pointer'}
              >
                <CardContent className="pt-6 pb-6 flex flex-col items-center text-center">
                  <div className={`w-16 h-16 ${info.color} rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-4`}>
                    {platform.charAt(0).toUpperCase()}
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{info.name}</h4>
                  <p className="text-xs text-gray-500 mb-5">{info.description}</p>
                  {isConnected ? (
                    <Badge className="bg-green-100 text-green-700">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Connected
                    </Badge>
                  ) : loading ? (
                    <Button className="w-full" disabled>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Loading…
                    </Button>
                  ) : (
                    <Button className="w-full" asChild>
                      <a href={authUrl}>Connect {info.name}</a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
