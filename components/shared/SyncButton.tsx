'use client'

import { useState } from 'react'
import { RefreshCw, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function SyncButton({ accountId, platform }: { accountId: string; platform: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSync() {
    setLoading(true)
    try {
      const res = await fetch(`/api/sync/${platform}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ account_id: accountId }),
      })
      const data = await res.json() as { success?: boolean; campaigns_synced?: number; issues_found?: number; error?: string }
      if (!res.ok || !data.success) {
        toast.error(data.error ?? 'Sync failed')
      } else {
        toast.success(`Synced ${data.campaigns_synced ?? 0} campaigns · ${data.issues_found ?? 0} issues found`)
        router.refresh()
      }
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
