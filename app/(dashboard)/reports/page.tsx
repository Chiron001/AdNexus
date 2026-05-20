'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, Lock, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AdAccount {
  id: string
  platform: string
  account_name: string | null
}

export default function ReportsPage() {
  const [plan, setPlan] = useState<'free' | 'growth' | 'agency'>('free')
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([])
  const [downloading, setDownloading] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [profileRes, accountsRes] = await Promise.all([
        supabase.from('profiles').select('plan').eq('id', user.id).single(),
        supabase.from('ad_accounts').select('id, platform, account_name').eq('user_id', user.id),
      ])

      if (profileRes.data) setPlan(profileRes.data.plan)
      if (accountsRes.data) setAdAccounts(accountsRes.data)
      setLoading(false)
    }
    load()
  }, [])

  async function handleDownload(accountId: string) {
    setDownloading(accountId)
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_id: accountId }),
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        toast.error(data.error ?? 'Failed to generate report')
        return
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `adnexus-audit-${new Date().toISOString().split('T')[0]}.pdf`
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
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Audit Reports</h2>
        <p className="text-gray-500 mt-1">Download a branded PDF report of your ad account health.</p>
      </div>

      {!canDownload && !loading && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-5 pb-5 flex items-center gap-4">
            <Lock className="w-8 h-8 text-orange-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-orange-900">PDF reports are a Growth plan feature</p>
              <p className="text-sm text-orange-700 mt-0.5">
                Upgrade to Growth (₹2,999/month) to download detailed audit reports.
              </p>
            </div>
            <Button
              className="ml-auto flex-shrink-0 bg-orange-600 hover:bg-orange-700"
              onClick={() => window.location.href = '/settings?tab=billing'}
            >
              Upgrade to Growth
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && adAccounts.length > 0 && (
        <div className="space-y-3">
          {adAccounts.map((account) => (
            <Card key={account.id}>
              <CardContent className="pt-5 pb-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {account.platform.charAt(0).toUpperCase() + account.platform.slice(1)} Ads Audit Report
                    </p>
                    <p className="text-sm text-gray-500">{account.account_name}</p>
                  </div>
                </div>
                {canDownload ? (
                  <Button
                    variant="outline"
                    className="gap-1.5"
                    disabled={downloading === account.id}
                    onClick={() => handleDownload(account.id)}
                  >
                    {downloading === account.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    {downloading === account.id ? 'Generating…' : 'Download PDF'}
                  </Button>
                ) : (
                  <Button variant="outline" disabled className="gap-1.5 opacity-50">
                    <Lock className="w-4 h-4" />
                    Locked
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && adAccounts.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Connect an ad account to generate reports.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
