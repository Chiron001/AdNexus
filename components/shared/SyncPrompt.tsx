'use client'

import { useState } from 'react'
import { RefreshCw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Account {
  id: string
  platform: string
  account_name: string | null
}

const PLATFORM_COLORS: Record<string, string> = {
  meta:   'bg-blue-600',
  google: 'bg-green-600',
  amazon: 'bg-orange-500',
}
const PLATFORM_LABELS: Record<string, string> = {
  meta:   'Meta Ads',
  google: 'Google Ads',
  amazon: 'Amazon Ads',
}

export function SyncPrompt({ accounts }: { accounts: Account[] }) {
  const router = useRouter()
  const [syncingId, setSyncingId] = useState<string | null>(null)
  const [synced,    setSynced]    = useState<Set<string>>(new Set())
  const [failed,    setFailed]    = useState<Set<string>>(new Set())

  async function handleSync(account: Account) {
    setSyncingId(account.id)
    setFailed(prev => { const s = new Set(prev); s.delete(account.id); return s })

    try {
      const res = await fetch(`/api/sync/${account.platform}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ account_id: account.id }),
      })
      const data = await res.json() as { success?: boolean; campaigns_synced?: number; issues_found?: number; error?: string }

      if (!res.ok || !data.success) {
        toast.error(data.error ?? 'Sync failed — check your credentials in Settings → Integrations')
        setFailed(prev => new Set(prev).add(account.id))
      } else {
        const count = data.campaigns_synced ?? 0
        if (count === 0) {
          toast.warning(`Sync complete — no campaign data found in the last 2 years. Check if campaigns are active in Meta Ads Manager.`)
        } else {
          toast.success(`Synced ${count} campaigns · ${data.issues_found ?? 0} issues found`)
        }
        setSynced(prev => new Set(prev).add(account.id))
        setTimeout(() => router.refresh(), 800)
      }
    } catch {
      toast.error('Network error — please try again')
      setFailed(prev => new Set(prev).add(account.id))
    } finally {
      setSyncingId(null)
    }
  }

  async function handleSyncAll() {
    for (const account of accounts) {
      if (!synced.has(account.id)) {
        await handleSync(account)
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="w-14 h-14 bg-zinc-800 border border-zinc-700 rounded-2xl flex items-center justify-center mb-5">
        <RefreshCw className="w-6 h-6 text-zinc-400" />
      </div>

      <h3 className="text-lg font-semibold text-white mb-2">Sync your ad data</h3>
      <p className="text-sm text-zinc-400 max-w-sm mb-8">
        Your {accounts.length > 1 ? `${accounts.length} accounts are` : 'account is'} connected but no campaign data has been pulled yet.
        Run a sync to populate your analytics.
      </p>

      {/* Per-account sync rows */}
      <div className="w-full max-w-sm space-y-3 mb-6">
        {accounts.map((account) => {
          const isSyncing = syncingId === account.id
          const isDone    = synced.has(account.id)
          const isErr     = failed.has(account.id)

          return (
            <div
              key={account.id}
              className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 ${PLATFORM_COLORS[account.platform] ?? 'bg-zinc-700'} rounded-lg flex items-center justify-center text-white text-sm font-bold`}>
                  {account.platform.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-white">{PLATFORM_LABELS[account.platform] ?? account.platform}</p>
                  <p className="text-xs text-zinc-500 truncate max-w-[150px]">{account.account_name ?? account.id}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {isErr  && <AlertCircle  className="w-4 h-4 text-red-400" />}
                <button
                  onClick={() => handleSync(account)}
                  disabled={isSyncing || isDone}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                    isDone
                      ? 'bg-emerald-500/15 text-emerald-400 cursor-default border border-emerald-500/20'
                      : isErr
                      ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/20'
                      : 'bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-60 disabled:cursor-not-allowed'
                  }`}
                >
                  {isSyncing
                    ? <><Loader2 className="w-3 h-3 animate-spin" /> Syncing…</>
                    : isDone
                    ? 'Synced'
                    : isErr
                    ? 'Retry'
                    : 'Sync Now'
                  }
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {accounts.length > 1 && (
        <button
          onClick={handleSyncAll}
          disabled={syncingId !== null || accounts.every(a => synced.has(a.id))}
          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed border border-zinc-700 text-zinc-300 text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Sync All Platforms
        </button>
      )}

      <p className="text-xs text-zinc-600 mt-6">
        After syncing, the page will refresh automatically with your data.
      </p>
    </div>
  )
}
