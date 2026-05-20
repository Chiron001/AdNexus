'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [plan, setPlan] = useState('free')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, company_name, plan')
        .eq('id', user.id)
        .single()

      if (profile) {
        setFullName(profile.full_name || '')
        setCompanyName(profile.company_name || '')
        setPlan(profile.plan || 'free')
      }
      setFetching(false)
    }
    loadProfile()
  }, [])

  async function handleUpgrade(plan: 'growth' | 'agency') {
    setLoading(true)
    try {
      const res = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json() as { payment_link?: string; error?: string }
      if (!res.ok || !data.payment_link) {
        toast.error(data.error ?? 'Failed to create subscription')
        return
      }
      window.location.href = data.payment_link
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, company_name: companyName, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    setLoading(false)
    if (error) {
      toast.error('Failed to save changes')
    } else {
      toast.success('Profile updated successfully')
    }
  }

  const planColors: Record<string, string> = {
    free: 'bg-gray-100 text-gray-700',
    growth: 'bg-blue-100 text-blue-700',
    agency: 'bg-purple-100 text-purple-700',
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-500 mt-1">Manage your account and preferences.</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your name and company information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={fetching}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company name</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your Brand / Agency"
                disabled={fetching}
              />
            </div>
            <Button type="submit" disabled={loading || fetching}>
              {loading ? 'Saving…' : 'Save changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plan</CardTitle>
          <CardDescription>Your current plan and billing details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 capitalize">{plan} Plan</p>
              <p className="text-sm text-gray-500 mt-0.5">
                {plan === 'free' && '1 platform · 10 issues · 5 AI recommendations/month'}
                {plan === 'growth' && 'All platforms · Unlimited issues · Unlimited recommendations'}
                {plan === 'agency' && 'Everything in Growth · 25 brand accounts · White-label reports'}
              </p>
            </div>
            <Badge className={`capitalize ${planColors[plan] || ''}`}>{plan}</Badge>
          </div>

          {plan === 'free' && (
            <>
              <Separator />
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-900">Upgrade to unlock more</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="border rounded-lg p-4">
                    <p className="font-semibold text-gray-900">Growth</p>
                    <p className="text-2xl font-bold mt-1">₹2,999<span className="text-sm font-normal text-gray-500">/mo</span></p>
                    <ul className="text-xs text-gray-500 mt-2 space-y-1">
                      <li>✓ All 3 platforms</li>
                      <li>✓ Unlimited issues</li>
                      <li>✓ Unlimited AI recs</li>
                      <li>✓ Email alerts</li>
                      <li>✓ PDF audit reports</li>
                    </ul>
                    <Button className="w-full mt-3" size="sm" onClick={() => handleUpgrade('growth')}>
                      Upgrade
                    </Button>
                  </div>
                  <div className="border rounded-lg p-4 border-purple-200">
                    <p className="font-semibold text-gray-900">Agency</p>
                    <p className="text-2xl font-bold mt-1">₹9,999<span className="text-sm font-normal text-gray-500">/mo</span></p>
                    <ul className="text-xs text-gray-500 mt-2 space-y-1">
                      <li>✓ Everything in Growth</li>
                      <li>✓ 25 brand accounts</li>
                      <li>✓ White-label reports</li>
                      <li>✓ Priority support</li>
                    </ul>
                    <Button className="w-full mt-3 bg-purple-600 hover:bg-purple-700" size="sm" onClick={() => handleUpgrade('agency')}>
                      Upgrade
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
