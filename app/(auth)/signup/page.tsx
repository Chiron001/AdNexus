'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle2, Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react'

const STARS = [
  { top: '4%',  left: '80%', delay: '0.5s', dur: '8.5s', w: 120 },
  { top: '20%', left: '93%', delay: '2.8s', dur: '6.0s', w: 85  },
  { top: '2%',  left: '42%', delay: '5.0s', dur: '9.0s', w: 145 },
  { top: '32%', left: '66%', delay: '1.2s', dur: '7.5s', w: 100 },
  { top: '12%', left: '16%', delay: '3.8s', dur: '8.2s', w: 110 },
  { top: '44%', left: '86%', delay: '6.5s', dur: '5.8s', w: 75  },
  { top: '8%',  left: '57%', delay: '4.4s', dur: '7.0s', w: 130 },
]

const PLAN_META: Record<string, { label: string; price: string; accent: string; border: string }> = {
  growth: { label: 'Growth', price: '₹2,999/mo', accent: 'text-blue-300',   border: 'border-blue-500/30'   },
  agency: { label: 'Professional', price: '₹9,999/mo', accent: 'text-purple-300', border: 'border-purple-500/30' },
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="flex-shrink-0">
      <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/>
      <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/>
      <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/>
      <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z"/>
    </svg>
  )
}

function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 21 21" aria-hidden="true" className="flex-shrink-0">
      <path fill="#f25022" d="M1 1h9v9H1z"/>
      <path fill="#00a4ef" d="M1 11h9v9H1z"/>
      <path fill="#7fba00" d="M11 1h9v9h-9z"/>
      <path fill="#ffb900" d="M11 11h9v9h-9z"/>
    </svg>
  )
}

function SignupForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const plan         = searchParams.get('plan') ?? 'free'
  const planMeta     = PLAN_META[plan]

  const [view,        setView]        = useState<'options' | 'email'>('options')
  const [fullName,    setFullName]    = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [showPw,      setShowPw]      = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [loading,     setLoading]     = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'azure' | null>(null)

  async function handleOAuth(provider: 'google' | 'azure') {
    setOauthLoading(provider)
    const supabase = createClient()
    const next = plan !== 'free' ? `?next=/settings?plan=${plan}` : ''
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback${next}` },
    })
  }

  async function handleSignup(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } },
    })

    if (signUpError) { setError(signUpError.message); setLoading(false); return }

    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id, email,
        full_name: fullName,
        company_name: companyName || null,
        plan: 'free',
      })
    }

    if (plan !== 'free' && planMeta) {
      try {
        const res  = await fetch('/api/subscriptions/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan }),
        })
        const json = await res.json() as { payment_link?: string }
        if (json.payment_link) { window.location.href = json.payment_link; return }
      } catch { /* fall through to dashboard */ }
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-12 bg-zinc-950"
      style={{
        backgroundImage: [
          'radial-gradient(ellipse 80% 60% at 25% -10%, rgba(59,130,246,0.11) 0%, transparent 55%)',
          'radial-gradient(ellipse 60% 50% at 88% 92%, rgba(139,92,246,0.09) 0%, transparent 55%)',
          'radial-gradient(ellipse 40% 40% at 12% 65%, rgba(59,130,246,0.05) 0%, transparent 50%)',
        ].join(', '),
      }}
    >
      {/* ── Night sky ─────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="night-star-field" />
        {STARS.map((s, i) => (
          <div key={i} className="shooting-star" style={{ top: s.top, left: s.left, width: `${s.w}px`, animationDuration: s.dur, animationDelay: s.delay }} />
        ))}
        <div className="aurora-orb w-[400px] h-[400px] bg-blue-600/7   -top-16 left-8"    style={{ animation: 'orbFloat2 22s ease-in-out infinite' }} />
        <div className="aurora-orb w-[340px] h-[340px] bg-purple-600/6 bottom-12 right-8" style={{ animation: 'orbFloat1 28s ease-in-out infinite' }} />
      </div>

      {/* ── Card ──────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-sm animate-fade-up">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <span className="text-white font-black text-base">A</span>
            </div>
            <span className="text-2xl font-black text-white tracking-tight">Adnexusone</span>
          </div>
          <p className="text-zinc-500 text-sm">AI-powered ad account diagnostics</p>
        </div>

        {/* Plan banner */}
        {planMeta && (
          <div className={`flex items-center gap-3 bg-white/[0.04] border ${planMeta.border} rounded-xl px-4 py-3 mb-4`}>
            <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${planMeta.accent}`} />
            <p className="text-sm text-zinc-300">
              Signing up for <strong className={planMeta.accent}>{planMeta.label}</strong>
              <span className="text-zinc-500"> — {planMeta.price}</span>
            </p>
          </div>
        )}

        <div
          className="bg-zinc-900/80 backdrop-blur-2xl border border-zinc-800/60 rounded-2xl p-8"
          style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.03) inset, 0 32px 64px -12px rgba(0,0,0,0.75)' }}
        >
          {view === 'options' ? (
            <>
              <div className="mb-7 text-center">
                <h1 className="text-xl font-bold text-white">Create your account</h1>
                <p className="text-zinc-500 text-sm mt-1">
                  {planMeta ? `Activate ${planMeta.label} after sign up` : 'Start diagnosing your ads in 2 minutes'}
                </p>
              </div>

              <div className="space-y-3">
                {/* Google */}
                <button
                  onClick={() => handleOAuth('google')}
                  disabled={!!oauthLoading}
                  className="w-full flex items-center gap-4 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.09] hover:border-white/[0.16] text-white text-sm font-medium py-3 px-5 rounded-xl transition-all disabled:opacity-50"
                >
                  {oauthLoading === 'google' ? <Loader2 className="w-[18px] h-[18px] animate-spin flex-shrink-0" /> : <GoogleIcon />}
                  <span>Continue with Google</span>
                </button>

                {/* Microsoft */}
                <button
                  onClick={() => handleOAuth('azure')}
                  disabled={!!oauthLoading}
                  className="w-full flex items-center gap-4 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.09] hover:border-white/[0.16] text-white text-sm font-medium py-3 px-5 rounded-xl transition-all disabled:opacity-50"
                >
                  {oauthLoading === 'azure' ? <Loader2 className="w-[18px] h-[18px] animate-spin flex-shrink-0" /> : <MicrosoftIcon />}
                  <span>Continue with Microsoft</span>
                </button>

                {/* Divider */}
                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-800" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 bg-zinc-900/80 text-xs text-zinc-600">or</span>
                  </div>
                </div>

                {/* Email */}
                <button
                  onClick={() => setView('email')}
                  className="w-full flex items-center gap-4 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.09] hover:border-white/[0.16] text-white text-sm font-medium py-3 px-5 rounded-xl transition-all"
                >
                  <Mail className="w-[18px] h-[18px] flex-shrink-0 text-zinc-400" />
                  <span>Continue with Email</span>
                </button>
              </div>

              <p className="text-center text-sm text-zinc-600 mt-7">
                Already have an account?{' '}
                <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">Sign in</Link>
              </p>
            </>
          ) : (
            <>
              {/* Back + heading */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => { setView('options'); setError(null) }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all flex-shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-base font-bold text-white leading-tight">Sign up with email</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">Fill in your details to get started</p>
                </div>
              </div>

              <form onSubmit={handleSignup} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="fullName" className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Name</label>
                    <input
                      id="fullName" type="text" placeholder="Rahul Sharma"
                      value={fullName} onChange={e => setFullName(e.target.value)} required
                      className="w-full bg-zinc-800/60 border border-zinc-700/60 text-white placeholder:text-zinc-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/40 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="companyName" className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                      Company <span className="text-zinc-600 normal-case font-normal">(opt.)</span>
                    </label>
                    <input
                      id="companyName" type="text" placeholder="Your Brand"
                      value={companyName} onChange={e => setCompanyName(e.target.value)}
                      className="w-full bg-zinc-800/60 border border-zinc-700/60 text-white placeholder:text-zinc-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/40 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Email</label>
                  <input
                    id="email" type="email" autoComplete="email" placeholder="you@example.com"
                    value={email} onChange={e => setEmail(e.target.value)} required
                    className="w-full bg-zinc-800/60 border border-zinc-700/60 text-white placeholder:text-zinc-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/40 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Password</label>
                  <div className="relative">
                    <input
                      id="password" type={showPw ? 'text' : 'password'}
                      autoComplete="new-password" placeholder="Min 8 characters"
                      value={password} onChange={e => setPassword(e.target.value)} minLength={8} required
                      className="w-full bg-zinc-800/60 border border-zinc-700/60 text-white placeholder:text-zinc-600 rounded-xl px-4 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/40 transition-all"
                    />
                    <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
                    <span className="flex-shrink-0 mt-0.5">⚠</span><span>{error}</span>
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm font-semibold py-2.5 rounded-xl transition-all shadow-lg shadow-purple-500/20 disabled:opacity-60 mt-1">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Creating account…' : planMeta ? `Create account & pay ${planMeta.price}` : 'Create free account'}
                </button>
              </form>

              <p className="text-center text-sm text-zinc-600 mt-5">
                Already have an account?{' '}
                <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">Sign in</Link>
              </p>
            </>
          )}
        </div>

        <p className="text-center text-xs text-zinc-700 mt-5">
          By continuing you agree to our{' '}
          <span className="text-zinc-600 hover:text-zinc-500 cursor-pointer">Terms</span>
          {' '}·{' '}
          <span className="text-zinc-600 hover:text-zinc-500 cursor-pointer">Privacy</span>
        </p>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}
