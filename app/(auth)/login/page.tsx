'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Loader2, Mail, Eye, EyeOff, ArrowLeft, ArrowRight, Lock, Check, Sparkles,
  AlertTriangle, Cpu, Wand2, CheckCircle2, TrendingDown,
} from 'lucide-react'
import { SiMeta, SiGoogleads } from 'react-icons/si'
import { FaAmazon } from 'react-icons/fa'
import { AuthShell, NightPanel, ErrorBox, GoogleIcon, MicrosoftIcon, EMAIL_RE, useMounted } from '../_auth-ui'

type Step = 'start' | 'password' | 'link' | 'success'
type Method = 'google' | 'azure' | 'email'

const LAST_METHOD = 'adn:last-auth'
const LAST_EMAIL  = 'adn:last-email'

/* ── Brand-panel content ─────────────────────────── */
const FEED = [
  { icon: SiMeta,      color: '#0081FB', title: 'Creative fatigue detected', meta: 'CTR down 38% on 3 ads',          impact: '$510/mo' },
  { icon: SiGoogleads, color: '#4285F4', title: 'Wasted search terms',       meta: '41 queries with zero conversions', impact: '$380/mo' },
  { icon: FaAmazon,    color: '#FF9900', title: 'ACOS creeping up',          meta: '+22% in 7 days on Brand – Exact',  impact: '$250/mo' },
  { icon: SiMeta,      color: '#0081FB', title: 'Pixel not firing',          meta: 'Purchases under-reported on checkout', impact: '$460/mo' },
  { icon: SiGoogleads, color: '#4285F4', title: 'Budget-limited winner',     meta: 'Top campaign capped by 11am daily', impact: '$290/mo' },
]

function LastUsed() {
  return (
    <span className="absolute -top-2 right-4 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-md"
      style={{ background: 'linear-gradient(90deg,var(--io-accent),var(--io-accent-2))' }}>
      Last used
    </span>
  )
}

function readStore(key: string) {
  try { return localStorage.getItem(key) } catch { return null }
}

function greeting() {
  const h = new Date().getHours()
  if (h < 5)  return 'Burning the midnight oil?'
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

/* ── Animated health-score ring ──────────────────── */
function MiniRing({ score }: { score: number }) {
  const r = 34, c = 2 * Math.PI * r
  return (
    <svg width="84" height="84" viewBox="0 0 84 84" className="-rotate-90">
      <defs>
        <linearGradient id="login-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8FA6FF" /><stop offset="1" stopColor="#C4B5FD" />
        </linearGradient>
      </defs>
      <circle cx="42" cy="42" r={r} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="7" />
      <circle cx="42" cy="42" r={r} fill="none" stroke="url(#login-ring)" strokeWidth="7" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)}
        style={{ transition: 'stroke-dashoffset 1.6s cubic-bezier(0.165, 0.84, 0.44, 1)' }} />
    </svg>
  )
}

/* ── Left: dark brand panel ──────────────────────── */
function BrandPanel() {
  const [score, setScore] = useState(0)
  const [head,  setHead]  = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setScore(82), 600)
    const i = setInterval(() => setHead(h => h + 1), 3200)
    return () => { clearTimeout(t); clearInterval(i) }
  }, [])

  const rows = [0, 1, 2].map(k => ({ ...FEED[(head + k) % FEED.length], key: head + k }))

  return (
    <NightPanel id="login">
      <div>
      <div className="io-fade inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs text-white/80 mb-6" style={{ animationDelay: '.05s' }}>
        <Sparkles className="w-3.5 h-3.5 text-violet-300" /> AI-powered ad account diagnostics
      </div>
      <h2 className="io-display text-[2.6rem] xl:text-[3rem] font-medium leading-[1.06] tracking-[-0.025em] mb-5">
        <span className="io-rise-line"><span style={{ animationDelay: '.1s' }}>Your ad accounts,</span></span>
        <span className="io-rise-line"><span style={{ animationDelay: '.22s' }}>diagnosed while</span></span>
        <span className="io-rise-line"><span style={{ animationDelay: '.34s' }}>you <span className="io-grad-text" style={{ backgroundImage: 'linear-gradient(90deg,#8FA6FF,#C4B5FD)' }}>slept.</span></span></span>
      </h2>
      <p className="io-fade text-white/65 leading-relaxed" style={{ animationDelay: '.5s' }}>
        Sign in to see what changed across Meta, Google and Amazon Ads — ranked by revenue impact, with the fix spelled out.
      </p>
      </div>

      {/* Live insight feed */}
      <div className="relative">
        <div data-depth="14" className="io-pop rounded-3xl border border-white/12 p-4 backdrop-blur-xl" style={{ background: 'rgba(24,19,58,.62)', animationDelay: '.6s' }}>
          <div className="flex items-center justify-between px-1 mb-3">
            <span className="text-xs font-bold flex items-center gap-2">
              <span className="relative flex w-2 h-2"><span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-70" /><span className="relative w-2 h-2 rounded-full bg-emerald-400" /></span>
              What Adnexusone finds overnight
            </span>
            <span className="flex gap-1 text-white/50"><span className="io-dot" /><span className="io-dot" /><span className="io-dot" /></span>
          </div>
          <div className="space-y-2">
            {rows.map(({ icon: Icon, color, title, meta, impact, key }, i) => (
              <div key={key} className="io-feed-in flex items-center gap-3 rounded-2xl bg-white/[0.06] border border-white/[0.06] px-3 py-2.5"
                style={{ opacity: 1 - i * 0.22 }}>
                <span className="w-8 h-8 rounded-xl bg-white flex items-center justify-center flex-shrink-0"><Icon className="w-4 h-4" style={{ color }} /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold truncate">{title}</p>
                  <p className="text-[11px] text-white/55 truncate">{meta}</p>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-bold text-rose-300 tabular-nums whitespace-nowrap">
                  <TrendingDown className="w-3 h-3" />{impact}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Score orb */}
        <div data-depth="34" className="io-pop absolute -right-10 xl:-right-20 -top-12" style={{ animationDelay: '.9s' }}>
          <div className="io-float-a relative w-[104px] h-[104px] rounded-full border border-white/15 flex items-center justify-center shadow-[0_24px_60px_-20px_rgba(0,0,0,.7)]"
            style={{ background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,.16), rgba(255,255,255,.02) 60%), rgba(20,16,48,.85)', backdropFilter: 'blur(14px)' }}>
            <MiniRing score={score} />
            <div className="absolute text-center">
              <p className="io-display text-2xl font-semibold tabular-nums leading-none">{score}</p>
              <p className="text-[8px] uppercase tracking-[0.16em] text-white/55 mt-1">Health</p>
            </div>
          </div>
        </div>

        {/* AI fix chip */}
        <div data-depth="26" className="io-pop absolute -left-6 -bottom-7" style={{ animationDelay: '1.15s' }}>
          <div className="io-float-b flex items-center gap-2 rounded-full bg-white text-[var(--io-ink)] pl-1.5 pr-3.5 py-1.5 shadow-xl">
            <span className="w-7 h-7 rounded-full flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg,var(--io-accent),var(--io-accent-2))' }}><Cpu className="w-3.5 h-3.5" /></span>
            <span className="text-xs font-semibold">3 AI fixes ready</span>
          </div>
        </div>
        <div data-depth="40" className="io-pop absolute right-6 -bottom-9" style={{ animationDelay: '1.3s' }}>
          <div className="io-float-a flex items-center gap-2 rounded-full bg-white text-[var(--io-ink)] pl-1.5 pr-3.5 py-1.5 shadow-xl" style={{ animationDelay: '-2s' }}>
            <span className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-emerald-600" /></span>
            <span className="text-xs font-semibold">+$1,400/mo recovered</span>
          </div>
        </div>
      </div>
    </NightPanel>
  )
}

/* ── Page ────────────────────────────────────────── */
export default function LoginPage() {
  const router = useRouter()
  const [step,     setStep]     = useState<Step>('start')
  const mounted = useMounted()
  // null / undefined = untouched, so the remembered email and the callback error show through
  const [typedEmail, setEmail] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [capsOn,   setCapsOn]   = useState(false)
  const [rawError, setError]    = useState<string | null | undefined>(undefined)
  const [shakeKey, setShakeKey] = useState(0)
  const [loading,  setLoading]  = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'azure' | null>(null)
  const [cooldown, setCooldown] = useState(0)

  // Browser-only values, read after hydration so the prerendered HTML matches
  const hello      = mounted ? greeting() : 'Welcome back'
  const lastMethod = mounted ? readStore(LAST_METHOD) as Method | null : null
  const email      = typedEmail ?? (mounted ? readStore(LAST_EMAIL) ?? '' : '')
  const error      = rawError !== undefined ? rawError
    : mounted && new URLSearchParams(window.location.search).has('error') ? 'That sign-in didn’t go through. Please try again.' : null

  const emailValid = EMAIL_RE.test(email.trim())

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  function remember(method: Method) {
    try {
      localStorage.setItem(LAST_METHOD, method)
      if (method === 'email') localStorage.setItem(LAST_EMAIL, email.trim())
    } catch {}
  }

  function fail(message: string) {
    setError(message)
    setShakeKey(k => k + 1)
  }

  function go(next: Step) {
    setError(null)
    setStep(next)
  }

  async function handleOAuth(provider: 'google' | 'azure') {
    setOauthLoading(provider)
    remember(provider)
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (err) { setOauthLoading(null); fail(err.message) }
  }

  function handleEmail(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!emailValid) return fail('Enter a valid email address.')
    go('password')
  }

  async function handleLogin(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (err) { setLoading(false); return fail(err.message) }
    remember('email')
    setStep('success')
    setTimeout(() => { router.push('/dashboard'); router.refresh() }, 1100)
  }

  async function sendMagicLink() {
    if (!emailValid) return fail('Enter a valid email address.')
    setError(null)
    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback`, shouldCreateUser: false },
    })
    setLoading(false)
    if (err) return fail(err.message)
    remember('email')
    setCooldown(60)
    go('link')
  }

  return (
    <AuthShell panel={<BrandPanel />}>
      {step === 'start' && (
        <div key="start" className="io-step flex flex-col flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] io-grad-text mb-2">{hello}</p>
          <h1 className="io-display text-[1.6rem] sm:text-[1.9rem] font-semibold text-[var(--io-ink)] leading-tight">Sign in to Adnexusone</h1>
          <p className="text-sm text-[var(--io-ink-soft)] mt-1.5 mb-7">Pick up right where your campaigns left off.</p>

          <div className="space-y-3">
            <button onClick={() => handleOAuth('google')} disabled={!!oauthLoading} className="io-oauth">
              {lastMethod === 'google' && <LastUsed />}
              {oauthLoading === 'google' ? <Loader2 className="w-[18px] h-[18px] animate-spin" /> : <GoogleIcon />}
              Continue with Google
            </button>
            <button onClick={() => handleOAuth('azure')} disabled={!!oauthLoading} className="io-oauth">
              {lastMethod === 'azure' && <LastUsed />}
              {oauthLoading === 'azure' ? <Loader2 className="w-[18px] h-[18px] animate-spin" /> : <MicrosoftIcon />}
              Continue with Microsoft
            </button>
          </div>

          <div className="flex items-center gap-3 my-6">
            <span className="flex-1 h-px bg-[var(--io-line)]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--io-ink-soft)]/70">or with email</span>
            <span className="flex-1 h-px bg-[var(--io-line)]" />
          </div>

          <form onSubmit={handleEmail} noValidate className="space-y-3">
            <label htmlFor="email" className="sr-only">Work email</label>
            <div className="io-field relative">
              {lastMethod === 'email' && <LastUsed />}
              <Mail className="w-4 h-4 text-[var(--io-ink-soft)] flex-shrink-0" />
              <input id="email" type="email" autoComplete="email" placeholder="you@company.com"
                value={email} onChange={e => { setEmail(e.target.value); setError(null) }} />
              <span className={`w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center transition-all duration-300 ${emailValid ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              </span>
            </div>
            <ErrorBox error={error} shakeKey={shakeKey} />
            <button type="submit" className="io-btn io-btn-primary w-full !py-[15px]">
              Continue with email <ArrowRight className="io-arrow w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-sm text-[var(--io-ink-soft)] mt-auto pt-7">
            New to Adnexusone?{' '}
            <Link href="/signup" className="font-semibold text-[var(--io-accent)] hover:text-[var(--io-accent-2)] transition-colors">Create a free account</Link>
          </p>
        </div>
      )}

      {step === 'password' && (
        <div key="password" className="io-step flex flex-col flex-1">
          <button onClick={() => go('start')} className="io-link self-start text-[var(--io-ink-soft)] hover:text-[var(--io-ink)] mb-6">
            <ArrowLeft className="w-3.5 h-3.5" /> All sign-in options
          </button>
          <h1 className="io-display text-[1.6rem] sm:text-[1.9rem] font-semibold text-[var(--io-ink)] leading-tight">Enter your password</h1>

          {/* Account chip */}
          <div className="flex items-center gap-3 rounded-2xl bg-[var(--io-canvas)] border border-[var(--io-line)] pl-1.5 pr-3 py-1.5 mt-4 mb-6">
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold uppercase"
              style={{ background: 'linear-gradient(135deg,var(--io-accent),var(--io-accent-2))' }}>
              {email.trim()[0]}
            </span>
            <span className="text-sm font-medium text-[var(--io-ink)] truncate flex-1">{email.trim()}</span>
            <button onClick={() => go('start')} className="text-xs font-semibold text-[var(--io-accent)] hover:text-[var(--io-accent-2)]">Change</button>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-xs font-semibold text-[var(--io-ink-soft)]">Password</label>
              <button type="button" onClick={sendMagicLink} className="text-xs font-semibold text-[var(--io-accent)] hover:text-[var(--io-accent-2)]">
                Forgot password?
              </button>
            </div>
            <div className="io-field" data-invalid={!!error}>
              <Lock className="w-4 h-4 text-[var(--io-ink-soft)] flex-shrink-0" />
              <input id="password" type={showPw ? 'text' : 'password'} autoComplete="current-password" autoFocus
                placeholder="••••••••" required value={password}
                onChange={e => { setPassword(e.target.value); setError(null) }}
                onKeyUp={e => setCapsOn(e.getModifierState('CapsLock'))}
                onBlur={() => setCapsOn(false)} />
              <button type="button" onClick={() => setShowPw(v => !v)} aria-label={showPw ? 'Hide password' : 'Show password'}
                className="text-[var(--io-ink-soft)] hover:text-[var(--io-ink)] transition-colors">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {capsOn && (
              <p className="io-fade flex items-center gap-1.5 text-xs font-medium text-amber-700">
                <AlertTriangle className="w-3.5 h-3.5" /> Caps Lock is on
              </p>
            )}
            <ErrorBox error={error} shakeKey={shakeKey} />
            <button type="submit" disabled={loading} className="io-btn io-btn-primary w-full !py-[15px] disabled:opacity-60 disabled:pointer-events-none">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : <>Sign in <ArrowRight className="io-arrow w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-auto pt-7">
            <button onClick={sendMagicLink} disabled={loading}
              className="group w-full flex items-center gap-3 rounded-2xl border border-dashed border-[var(--io-line)] hover:border-[var(--io-accent)]/40 hover:bg-[var(--io-accent)]/[0.03] px-4 py-3 text-left transition-colors">
              <span className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0"><Wand2 className="w-4 h-4 text-[var(--io-accent-2)]" /></span>
              <span className="flex-1">
                <span className="block text-sm font-semibold text-[var(--io-ink)]">Email me a sign-in link</span>
                <span className="block text-xs text-[var(--io-ink-soft)]">Skip the password — one click from your inbox</span>
              </span>
              <ArrowRight className="w-4 h-4 text-[var(--io-ink-soft)] transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      )}

      {step === 'link' && (
        <div key="link" className="io-step flex flex-col flex-1 text-center items-center">
          <div className="relative mt-4 mb-7">
            <span className="absolute inset-0 rounded-full io-breathe" style={{ background: 'radial-gradient(closest-side, rgba(124,58,237,.35), transparent)', transform: 'scale(1.8)' }} />
            <span className="io-float-a relative w-20 h-20 rounded-[24px] flex items-center justify-center text-white shadow-[0_18px_40px_-14px_rgba(59,91,253,.7)]"
              style={{ background: 'linear-gradient(135deg,var(--io-accent),var(--io-accent-2))' }}>
              <Mail className="w-9 h-9" />
            </span>
          </div>
          <h1 className="io-display text-[1.6rem] sm:text-[1.9rem] font-semibold text-[var(--io-ink)] leading-tight">Check your inbox</h1>
          <p className="text-sm text-[var(--io-ink-soft)] mt-2 max-w-[300px]">
            We sent a secure sign-in link to <span className="font-semibold text-[var(--io-ink)]">{email.trim()}</span>. It expires in 1 hour.
          </p>

          <div className="grid grid-cols-2 gap-3 w-full mt-7">
            <a href="https://mail.google.com" target="_blank" rel="noreferrer" className="io-oauth"><GoogleIcon /> Gmail</a>
            <a href="https://outlook.office.com/mail" target="_blank" rel="noreferrer" className="io-oauth"><MicrosoftIcon /> Outlook</a>
          </div>
          <div className="w-full mt-3"><ErrorBox error={error} shakeKey={shakeKey} /></div>

          <p className="text-sm text-[var(--io-ink-soft)] mt-auto pt-7">
            Didn&apos;t get it?{' '}
            {cooldown > 0
              ? <span className="tabular-nums">Resend in {cooldown}s</span>
              : <button onClick={sendMagicLink} disabled={loading} className="font-semibold text-[var(--io-accent)] hover:text-[var(--io-accent-2)]">Resend link</button>}
            <span className="mx-2 text-[var(--io-line)]">|</span>
            <button onClick={() => go('password')} className="font-semibold text-[var(--io-ink)] hover:text-[var(--io-accent)]">Use password</button>
          </p>
        </div>
      )}

      {step === 'success' && (
        <div key="success" className="io-step flex flex-col flex-1 items-center justify-center text-center">
          <svg className="io-check w-24 h-24 mb-6" viewBox="0 0 56 56" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="login-check" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#3B5BFD" /><stop offset="1" stopColor="#7C3AED" />
              </linearGradient>
            </defs>
            <circle cx="28" cy="28" r="25" stroke="url(#login-check)" strokeWidth="3" />
            <path d="M17 28.5l7.5 7.5L39 21" stroke="url(#login-check)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h1 className="io-display text-[1.6rem] sm:text-[1.9rem] font-semibold text-[var(--io-ink)] leading-tight">You&apos;re in</h1>
          <p className="text-sm text-[var(--io-ink-soft)] mt-2">Loading your dashboard…</p>
          <div className="w-40 h-1 rounded-full bg-[var(--io-line)] mt-6 overflow-hidden">
            <div className="h-full io-progress" style={{ '--io-dur': '1.1s', background: 'linear-gradient(90deg,var(--io-accent),var(--io-accent-2))' } as React.CSSProperties} />
          </div>
        </div>
      )}
    </AuthShell>
  )
}
