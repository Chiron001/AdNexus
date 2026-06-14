'use client'

import { useState } from 'react'
import { RefreshCw, Loader2, Clock, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface SyncResponse {
  success?: boolean
  campaigns_synced?: number
  issues_found?: number
  recommendations_generated?: number
  error?: string
  upgrade_required?: boolean
  checksUsed?: number
  checksLimit?: number
  retryAfterMs?: number
}

export function SyncButton({ accountId, platform }: { accountId: string; platform: string }) {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSync() {
    setLoading(true)
    try {
      const res = await fetch(`/api/sync/${platform}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ account_id: accountId }),
      })
      const data = await res.json() as SyncResponse

      if (res.status === 429) {
        if (data.checksUsed !== undefined && data.checksLimit !== undefined) {
          toast.error(`Monthly limit reached (${data.checksUsed}/${data.checksLimit} syncs used). Upgrade to sync more.`, {
            duration: 6000,
            action: { label: 'Upgrade', onClick: () => router.push('/settings?tab=billing') },
          })
        } else if (data.retryAfterMs) {
          const mins = Math.ceil(data.retryAfterMs / 60_000)
          toast.error(`Please wait ${mins} minute${mins === 1 ? '' : 's'} before syncing again.`, { duration: 5000 })
        } else {
          toast.error(data.error ?? 'Sync limit reached. Upgrade to continue.')
        }
        return
      }

      if (!res.ok || !data.success) {
        toast.error(data.error ?? 'Sync failed')
        return
      }

      const recPart = (data.recommendations_generated ?? 0) > 0
        ? ` · ${data.recommendations_generated} recommendations`
        : ''
      toast.success(`Synced ${data.campaigns_synced ?? 0} campaigns · ${data.issues_found ?? 0} issues${recPart}`)
      router.refresh()
    } catch {
      toast.error('Sync failed — check your connection')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleSync}
      disabled={loading}
      className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
      {loading ? 'Syncing…' : 'Sync'}
    </button>
  )
}

// Compact icon-only version used in certain dashboards
export function SyncIconButton({ accountId, platform }: { accountId: string; platform: string }) {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)
  const [blocked, setBlocked] = useState(false)

  async function handleSync() {
    setLoading(true)
    try {
      const res = await fetch(`/api/sync/${platform}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ account_id: accountId }),
      })
      const data = await res.json() as SyncResponse

      if (res.status === 429) {
        setBlocked(true)
        setTimeout(() => setBlocked(false), 3000)
        toast.error(data.error ?? 'Sync limit reached.')
        return
      }

      if (!res.ok || !data.success) { toast.error(data.error ?? 'Sync failed'); return }
      toast.success(`Synced · ${data.issues_found ?? 0} issues`)
      router.refresh()
    } catch {
      toast.error('Sync failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleSync}
      disabled={loading}
      title={blocked ? 'Sync limit reached' : 'Sync now'}
      className="p-2 rounded-lg border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white disabled:opacity-50 transition-colors"
    >
      {loading  ? <Loader2 className="w-4 h-4 animate-spin" />  :
       blocked   ? <AlertTriangle className="w-4 h-4 text-orange-400" /> :
                  <RefreshCw className="w-4 h-4" />}
    </button>
  )
}
