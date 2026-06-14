'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, CheckCircle2, Plug, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const PLAN_BADGE: Record<string, string> = {
  free:   'bg-zinc-800 text-zinc-400 border border-zinc-700',
  growth: 'bg-blue-500/15 text-blue-300 border border-blue-500/25',
  agency: 'bg-purple-500/15 text-purple-300 border border-purple-500/25',
}

function DarkCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 rounded-2xl ${className}`}>
      {children}
    </div>
  )
}

function DarkInput({
  id, value, onChange, placeholder, disabled,
}: { id: string; value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean }) {
  return (
    <input
      id={id}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 transition-colors"
    />
  )
}

export default function SettingsPage() {
  const [fullName,     setFullName]     = useState('')
  const [companyName,  setCompanyName]  = useState('')
  const [plan,         setPlan]         = useState('free')
  const [loading,      setLoading]      = useState(false)
  const [fetching,     setFetching]     = useState(true)
  const [upgradeLoading, setUpgradeLoading] = useState<'growth' | 'agency' | null>(null)

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
        setFullName(profile.full_name ?? '')
        setCompanyName(profile.company_name ?? '')
        setPlan(profile.plan ?? 'free')
      }
      setFetching(false)
    }
    loadProfile()
  }, [])

  async function handleUpgrade(targetPlan: 'growth' | 'agency') {
    setUpgradeLoading(targetPlan)
    try {
      const res = await fetch('/api/subscriptions/create', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ plan: targetPlan }),
      })
      const data = await res.json() as { payment_link?: string; error?: string }
      if (!res.ok || !data.payment_link) { toast.error(data.error ?? 'Failed to create subscription'); return }
      window.location.href = data.payment_link
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setUpgradeLoading(null)
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
    if (error) toast.error('Failed to save changes')
    else       toast.success('Profile updated successfully')
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-zinc-500 mt-1 text-sm">Manage your account and preferences.</p>
      </div>

      {/* Integrations shortcut */}
      <Link href="/settings/integrations">
        <div className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-600 transition-colors cursor-pointer group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/25 flex items-center justify-center">
              <Plug className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Platform Integrations</p>
              <p className="text-xs text-zinc-500 mt-0.5">Connect Meta Ads, Google Ads, and Amazon Ads</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
        </div>
      </Link>

      {/* Profile */}
      <DarkCard className="p-6">
        <div className="mb-5">
          <h3 className="text-base font-semibold text-white">Profile</h3>
          <p className="text-sm text-zinc-500 mt-0.5">Your name and company information.</p>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="fullName" className="text-sm font-medium text-zinc-300">Full name</label>
            <DarkInput id="fullName" value={fullName} onChange={setFullName} disabled={fetching} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="companyName" className="text-sm font-medium text-zinc-300">Company name</label>
            <DarkInput id="companyName" value={companyName} onChange={setCompanyName} placeholder="Your Brand / Agency" disabled={fetching} />
          </div>
          <button
            type="submit"
            disabled={loading || fetching}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </DarkCard>

      {/* Subscription Plan */}
      <DarkCard className="p-6">
        <div className="mb-5">
          <h3 className="text-base font-semibold text-white">Subscription Plan</h3>
          <p className="text-sm text-zinc-500 mt-0.5">Your current plan and billing details.</p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-medium text-white capitalize">{plan} Plan</p>
            <p className="text-sm text-zinc-500 mt-0.5">
              {plan === 'free'   && '1 platform · 10 issues · 5 AI recommendations/month'}
              {plan === 'growth' && 'All platforms · Unlimited issues · Unlimited recommendations'}
              {plan === 'agency' && 'Everything in Growth · 25 brand accounts · White-label reports'}
            </p>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${PLAN_BADGE[plan] ?? ''}`}>
            {plan}
          </span>
        </div>

        {plan === 'free' && (
          <>
            <div className="border-t border-zinc-800 my-5" />
            <div className="space-y-4">
              <p className="text-sm font-medium text-zinc-300">Upgrade to unlock more</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {/* Growth */}
                <div className="bg-zinc-800/50 border border-zinc-700/60 rounded-xl p-4">
                  <p className="font-semibold text-white">Growth</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    ₹2,999<span className="text-sm font-normal text-zinc-500">/mo</span>
                  </p>
                  <ul className="text-xs text-zinc-400 mt-3 space-y-1.5">
                    {['All 3 platforms', 'Unlimited issues', 'Unlimited AI recs', 'Email alerts', 'PDF audit reports'].map(f => (
                      <li key={f} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleUpgrade('growth')}
                    disabled={upgradeLoading === 'growth'}
                    className="w-full mt-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                  >
                    {upgradeLoading === 'growth' && <Loader2 className="w-4 h-4 animate-spin" />}
                    Upgrade to Growth
                  </button>
                </div>

                {/* Professional */}
                <div className="bg-purple-500/10 border border-purple-500/25 rounded-xl p-4">
                  <p className="font-semibold text-white">Professional</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    ₹9,999<span className="text-sm font-normal text-zinc-500">/mo</span>
                  </p>
                  <ul className="text-xs text-zinc-400 mt-3 space-y-1.5">
                    {['Everything in Growth', '25 brand accounts', 'White-label reports', 'Priority support'].map(f => (
                      <li key={f} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-purple-400 flex-shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleUpgrade('agency')}
                    disabled={upgradeLoading === 'agency'}
                    className="w-full mt-4 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                  >
                    {upgradeLoading === 'agency' && <Loader2 className="w-4 h-4 animate-spin" />}
                    Upgrade to Professional
                  </button>
                </div>

              </div>
            </div>
          </>
        )}
      </DarkCard>
    </div>
  )
}
