'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FileText, Download, Lock, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

interface AdAccount {
  id: string
  platform: string
  account_name: string | null
}

const PLATFORM_LABELS: Record<string, string> = {
  meta:   'Meta Ads',
  google: 'Google Ads',
  amazon: 'Amazon Ads',
}

export default function ReportsPage() {
  const [plan,        setPlan]        = useState<'free' | 'basic' | 'growth' | 'professional' | 'agency' | 'custom'>('free')
  const [adAccounts,  setAdAccounts]  = useState<AdAccount[]>([])
  const [downloading, setDownloading] = useState<string | null>(null)
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [profileRes, accountsRes] = await Promise.all([
        supabase.from('profiles').select('plan').eq('id', user.id).single(),
        supabase.from('ad_accounts').select('id, platform, account_name').eq('user_id', user.id),
      ])

      if (profileRes.data)  setPlan(profileRes.data.plan)
      if (accountsRes.data) setAdAccounts(accountsRes.data)
      setLoading(false)
    }
    load()
  }, [])

  async function handleDownload(accountId: string) {
    setDownloading(accountId)
    try {
      const res = await fetch('/api/reports/generate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ account_id: accountId }),
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        toast.error(data.error ?? 'Failed to generate report')
        return
      }

      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `adnexusone-audit-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Report downloaded!')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setDownloading(null)
    }
  }

  const canDownload = plan === 'growth' || plan === 'agency'

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Audit Reports</h2>
        <p className="text-zinc-500 mt-1 text-sm">Download a branded PDF report of your ad account health.</p>
      </div>

      {/* Upgrade banner — free plan only */}
      {!canDownload && !loading && (
        <div className="flex items-center gap-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl px-5 py-4">
          <div className="w-10 h-10 bg-orange-500/15 ring-1 ring-orange-500/25 rounded-xl flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-orange-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-sm">PDF reports are a Growth plan feature</p>
            <p className="text-sm text-orange-300/70 mt-0.5">
              Upgrade to Growth (₹2,999/month) to download detailed audit reports.
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/settings?tab=billing'}
            className="shrink-0 flex items-center gap-1.5 bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Upgrade
          </button>
        </div>
      )}

      {/* Account report cards */}
      {!loading && adAccounts.length > 0 && (
        <div className="space-y-3">
          {adAccounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between gap-4 bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 rounded-2xl px-5 py-4 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-800 ring-1 ring-zinc-700/50 rounded-xl flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-zinc-400" />
                </div>
                <div>
                  <p className="font-medium text-white">
                    {PLATFORM_LABELS[account.platform] ?? account.platform} Audit Report
                  </p>
                  <p className="text-sm text-zinc-500">{account.account_name}</p>
                </div>
              </div>

              {canDownload ? (
                <button
                  disabled={downloading === account.id}
                  onClick={() => handleDownload(account.id)}
                  className="shrink-0 flex items-center gap-1.5 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  {downloading === account.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {downloading === account.id ? 'Generating…' : 'Download PDF'}
                </button>
              ) : (
                <button
                  disabled
                  className="shrink-0 flex items-center gap-1.5 border border-zinc-800 text-zinc-600 text-sm font-medium px-4 py-2 rounded-lg cursor-not-allowed opacity-60"
                >
                  <Lock className="w-4 h-4" />
                  Locked
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && adAccounts.length === 0 && (
        <div className="border-2 border-dashed border-zinc-800 bg-zinc-900/30 backdrop-blur-sm rounded-2xl py-14 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-zinc-800/80 ring-1 ring-zinc-700/40 rounded-2xl flex items-center justify-center mb-4">
            <FileText className="w-7 h-7 text-zinc-600" />
          </div>
          <p className="text-zinc-400 font-medium text-sm">No accounts connected</p>
          <p className="text-zinc-600 text-sm mt-1">Connect an ad account to generate reports.</p>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-[72px] bg-zinc-900/40 border border-zinc-800/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

    </div>
  )
}
