'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Shield, Eye, EyeOff, Loader2, Lock, ArrowRight, AlertTriangle, Users, CreditCard,
  Activity, Inbox, FileText, Search, KeyRound,
} from 'lucide-react'
import { AuthShell, NightPanel, ErrorBox } from '@/app/(auth)/_auth-ui'

const AREAS = [
  { icon: Users,      label: 'Users' },
  { icon: CreditCard, label: 'Billing' },
  { icon: Activity,   label: 'Activity' },
  { icon: Inbox,      label: 'Inquiries' },
  { icon: FileText,   label: 'Blog' },
  { icon: Search,     label: 'SEO' },
]

function AdminPanel() {
  return (
    <NightPanel id="admin">
      <div>
        <div className="io-fade inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs text-white/80 mb-6" style={{ animationDelay: '.05s' }}>
          <Shield className="w-3.5 h-3.5 text-violet-300" /> Super admin
        </div>
        <h2 className="io-display text-[2.6rem] xl:text-[3rem] font-medium leading-[1.06] tracking-[-0.025em] mb-5">
          <span className="io-rise-line"><span style={{ animationDelay: '.1s' }}>Run Adnexusone</span></span>
          <span className="io-rise-line"><span style={{ animationDelay: '.22s' }}>from <span className="io-grad-text" style={{ backgroundImage: 'linear-gradient(90deg,#8FA6FF,#C4B5FD)' }}>one console.</span></span></span>
        </h2>
        <p className="io-fade text-white/65 leading-relaxed" style={{ animationDelay: '.5s' }}>
          Accounts, subscriptions, inquiries and site content — all behind one password.
        </p>
      </div>

      <div className="relative">
        <div data-depth="14" className="io-pop rounded-3xl border border-white/12 p-4 backdrop-blur-xl" style={{ background: 'rgba(24,19,58,.62)', animationDelay: '.6s' }}>
          <p className="text-xs font-bold mb-3 px-1">Inside the console</p>
          <div className="grid grid-cols-3 gap-2">
            {AREAS.map(({ icon: Icon, label }, i) => (
              <div key={label} className="io-feed-in flex flex-col items-center gap-2 rounded-2xl bg-white/[0.06] border border-white/[0.06] py-4"
                style={{ animationDelay: `${0.75 + i * 0.07}s` }}>
                <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,var(--io-accent),var(--io-accent-2))' }}>
                  <Icon className="w-4 h-4" />
                </span>
                <span className="text-xs font-semibold text-white/85">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div data-depth="30" className="io-pop absolute -right-8 xl:-right-14 -top-7" style={{ animationDelay: '1.1s' }}>
          <div className="io-float-a flex items-center gap-2 rounded-full bg-white text-[var(--io-ink)] pl-1.5 pr-3.5 py-1.5 shadow-xl">
            <span className="w-7 h-7 rounded-full bg-violet-50 flex items-center justify-center"><Lock className="w-3.5 h-3.5 text-[var(--io-accent-2)]" /></span>
            <span className="text-xs font-semibold">Restricted access</span>
          </div>
        </div>
      </div>
    </NightPanel>
  )
}

export default function AdminLoginPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const next         = searchParams.get('next') ?? '/admin/dashboard'

  const [password, setPassword] = useState('')
  const [show,     setShow]     = useState(false)
  const [capsOn,   setCapsOn]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [shakeKey, setShakeKey] = useState(0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!password.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch('/api/admin/auth', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ password }),
      })
      const data = await res.json() as { ok?: boolean; error?: string }
      if (res.ok && data.ok) {
        router.push(next)
        return
      }
      setError(data.error ?? 'Incorrect password')
      setShakeKey(k => k + 1)
      setPassword('')
    } catch {
      setError('Something went wrong. Try again.')
      setShakeKey(k => k + 1)
    }
    setLoading(false)
  }

  return (
    <AuthShell
      panel={<AdminPanel />}
      note={<span>Session lasts 7 days · httpOnly cookie</span>}
    >
      <div className="io-step flex flex-col flex-1">
        <span className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 shadow-[0_14px_30px_-12px_rgba(59,91,253,.7)]"
          style={{ background: 'linear-gradient(135deg,var(--io-accent),var(--io-accent-2))' }}>
          <KeyRound className="w-5 h-5" />
        </span>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] io-grad-text mb-2">Adnexusone super admin</p>
        <h1 className="io-display text-[1.6rem] sm:text-[1.9rem] font-semibold text-[var(--io-ink)] leading-tight">Admin access</h1>
        <p className="text-sm text-[var(--io-ink-soft)] mt-1.5 mb-7">Enter the admin password to open the console.</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label htmlFor="admin-password" className="block text-xs font-semibold text-[var(--io-ink-soft)]">Admin password</label>
          <div className="io-field" data-invalid={!!error}>
            <Lock className="w-4 h-4 text-[var(--io-ink-soft)] flex-shrink-0" />
            <input id="admin-password" type={show ? 'text' : 'password'} autoComplete="current-password" autoFocus
              placeholder="Enter admin password" value={password}
              onChange={e => { setPassword(e.target.value); setError(null) }}
              onKeyUp={e => setCapsOn(e.getModifierState('CapsLock'))}
              onBlur={() => setCapsOn(false)} />
            <button type="button" onClick={() => setShow(s => !s)} aria-label={show ? 'Hide password' : 'Show password'}
              className="text-[var(--io-ink-soft)] hover:text-[var(--io-ink)] transition-colors">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {capsOn && (
            <p className="io-fade flex items-center gap-1.5 text-xs font-medium text-amber-700">
              <AlertTriangle className="w-3.5 h-3.5" /> Caps Lock is on
            </p>
          )}
          <ErrorBox error={error} shakeKey={shakeKey} />
          <button type="submit" disabled={loading || !password.trim()}
            className="io-btn io-btn-primary w-full !py-[15px] disabled:opacity-50 disabled:pointer-events-none">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</> : <>Enter admin panel <ArrowRight className="io-arrow w-4 h-4" /></>}
          </button>
        </form>

        <p className="flex items-center justify-center gap-1.5 text-xs text-[var(--io-ink-soft)] mt-auto pt-7">
          <Shield className="w-3.5 h-3.5" /> Every sign-in attempt is checked on the server
        </p>
      </div>
    </AuthShell>
  )
}
