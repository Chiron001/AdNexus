'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Loader2, Mail, Eye, EyeOff, ArrowLeft, ArrowRight, Lock, Check, Sparkles, User,
  Building2, Globe2, Phone, ChevronDown, Rocket, Megaphone, Briefcase, UserRound,
  Gift, Timer, CheckCircle2, RefreshCw,
} from 'lucide-react'
import { SiMeta, SiGoogleads } from 'react-icons/si'
import { FaAmazon } from 'react-icons/fa'
import { COUNTRY_NAMES } from '@/lib/utils/currency'
import { AuthShell, NightPanel, ErrorBox, GoogleIcon, MicrosoftIcon, EMAIL_RE, useMounted } from '../_auth-ui'

type Step = 'account' | 'business' | 'ads' | 'verify' | 'success'
type Platform = 'meta' | 'google' | 'amazon'

const FORM_STEPS: Step[] = ['account', 'business', 'ads']

const PLAN_LABEL: Record<string, string> = { growth: 'Growth', agency: 'Professional', professional: 'Professional', basic: 'Basic' }

const ROLES = [
  { key: 'founder',    label: 'Founder / owner',   icon: Rocket },
  { key: 'marketer',   label: 'In-house marketer', icon: Megaphone },
  { key: 'agency',     label: 'Agency',            icon: Briefcase },
  { key: 'freelancer', label: 'Freelancer',        icon: UserRound },
]

const INDUSTRIES = [
  'Skincare', 'Beauty', 'Fashion & Apparel', 'Footwear', 'Jewellery', 'Eyewear',
  'Health & Wellness', 'Supplements', 'Fitness', 'Food & Beverage', 'Home & Living',
  'Electronics', 'Baby & Kids', 'Pet Care', 'Marketing agency', 'Other',
]

const PLATFORMS: { key: Platform; label: string; icon: typeof SiMeta; color: string }[] = [
  { key: 'meta',   label: 'Meta Ads',   icon: SiMeta,      color: '#0081FB' },
  { key: 'google', label: 'Google Ads', icon: SiGoogleads, color: '#4285F4' },
  { key: 'amazon', label: 'Amazon Ads', icon: FaAmazon,    color: '#FF9900' },
]

// Monthly spend buckets in the currency the visitor actually thinks in
const SPEND_IN  = ['Not yet', 'Under ₹1L', '₹1L – 5L', '₹5L – 25L', '₹25L+']
const SPEND_USD = ['Not yet', 'Under $5k', '$5k – 25k', '$25k – 100k', '$100k+']

const SOURCES = ['Google search', 'Instagram / Facebook', 'LinkedIn', 'YouTube', 'Friend or colleague', 'Agency or partner', 'Blog / article', 'Other']

const COUNTRIES = Object.entries(COUNTRY_NAMES).sort(([, a], [, b]) => a.localeCompare(b))

const TZ_COUNTRY: Record<string, string> = {
  'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN', 'Europe/London': 'GB', 'Asia/Singapore': 'SG',
  'Asia/Dubai': 'AE', 'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU', 'America/New_York': 'US',
  'America/Chicago': 'US', 'America/Denver': 'US', 'America/Los_Angeles': 'US', 'America/Toronto': 'CA',
}

/* Score 0–4 plus the rules shown under the field */
function passwordCheck(pw: string) {
  const rules = [
    { ok: pw.length >= 8,                            label: '8+ characters' },
    { ok: /[a-z]/.test(pw) && /[A-Z]/.test(pw),      label: 'Upper & lower case' },
    { ok: /\d/.test(pw),                             label: 'A number' },
    { ok: /[^A-Za-z0-9]/.test(pw),                   label: 'A symbol' },
  ]
  return { rules, score: rules.filter(r => r.ok).length }
}
const STRENGTH = [
  { label: 'Too weak', color: '#EF4444' }, { label: 'Weak', color: '#F97316' },
  { label: 'Fair', color: '#EAB308' },     { label: 'Good', color: '#22C55E' },
  { label: 'Strong', color: '#10B981' },
]

/* ── Left: setup timeline that follows the form ─── */
const TIMELINE = [
  { title: 'Create your account',       desc: 'Name, email and a password' },
  { title: 'Tell us about your business', desc: 'So benchmarks match your category' },
  { title: 'How you advertise',          desc: 'Platforms and monthly spend' },
  { title: 'Connect & get your score',   desc: 'First health score in about 2 minutes' },
]

function SignupPanel({ active }: { active: number }) {
  return (
    <NightPanel id="signup">
      <div>
        <div className="io-fade inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs text-white/80 mb-6" style={{ animationDelay: '.05s' }}>
          <Sparkles className="w-3.5 h-3.5 text-violet-300" /> Set up in about 2 minutes
        </div>
        <h2 className="io-display text-[2.6rem] xl:text-[3rem] font-medium leading-[1.06] tracking-[-0.025em] mb-5">
          <span className="io-rise-line"><span style={{ animationDelay: '.1s' }}>Find what&apos;s quietly</span></span>
          <span className="io-rise-line"><span style={{ animationDelay: '.22s' }}>draining your</span></span>
          <span className="io-rise-line"><span style={{ animationDelay: '.34s' }}><span className="io-grad-text" style={{ backgroundImage: 'linear-gradient(90deg,#8FA6FF,#C4B5FD)' }}>ad budget.</span></span></span>
        </h2>
        <p className="io-fade text-white/65 leading-relaxed" style={{ animationDelay: '.5s' }}>
          One account covers Meta, Google and Amazon Ads. We rank every issue by the revenue it&apos;s costing you and tell you how to fix it.
        </p>
      </div>

      <div className="relative">
        <div data-depth="14" className="io-pop rounded-3xl border border-white/12 p-5 backdrop-blur-xl" style={{ background: 'rgba(24,19,58,.62)', animationDelay: '.6s' }}>
          <p className="text-xs font-bold mb-4 px-1">Your setup</p>
          <ol className="relative">
            {TIMELINE.map((t, i) => {
              const done = i < active, now = i === active
              return (
                <li key={t.title} className="relative flex gap-3.5 pb-4 last:pb-0">
                  {i < TIMELINE.length - 1 && (
                    <span className="absolute left-[13px] top-7 bottom-0 w-px bg-white/12 overflow-hidden">
                      <span className="block w-full bg-gradient-to-b from-[#8FA6FF] to-[#C4B5FD] transition-all duration-700" style={{ height: done ? '100%' : '0%' }} />
                    </span>
                  )}
                  <span className={`relative w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold transition-all duration-500 ${done ? 'text-white' : now ? 'bg-white text-[var(--io-ink)]' : 'border border-white/20 text-white/45'}`}
                    style={done ? { background: 'linear-gradient(135deg,var(--io-accent),var(--io-accent-2))' } : undefined}>
                    {now && <span className="absolute inset-0 rounded-full bg-white/40 animate-ping" />}
                    <span className="relative">{done ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : i + 1}</span>
                  </span>
                  <div className={`pt-0.5 transition-opacity duration-500 ${done || now ? 'opacity-100' : 'opacity-50'}`}>
                    <p className="text-[13px] font-semibold">{t.title}</p>
                    <p className="text-[11px] text-white/55">{t.desc}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>

        <div data-depth="30" className="io-pop absolute -right-10 xl:-right-20 -top-8" style={{ animationDelay: '.9s' }}>
          <div className="io-float-a flex items-center gap-2 rounded-full bg-white text-[var(--io-ink)] pl-1.5 pr-3.5 py-1.5 shadow-xl">
            <span className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center"><Gift className="w-4 h-4 text-emerald-600" /></span>
            <span className="text-xs font-semibold">30-day free trial on Basic</span>
          </div>
        </div>
        <div data-depth="40" className="io-pop absolute -left-6 -bottom-7 flex gap-1.5" style={{ animationDelay: '1.15s' }}>
          {PLATFORMS.map(({ key, icon: Icon, color }, i) => (
            <span key={key} className="io-float-b w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-lg" style={{ animationDelay: `${-i}s` }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </span>
          ))}
        </div>
        <div data-depth="24" className="io-pop absolute right-6 -bottom-7" style={{ animationDelay: '1.3s' }}>
          <div className="io-float-a flex items-center gap-2 rounded-full border border-white/15 text-white pl-1.5 pr-3.5 py-1.5 shadow-xl" style={{ background: 'rgba(30,24,70,.85)', animationDelay: '-2s' }}>
            <span className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,var(--io-accent),var(--io-accent-2))' }}><Timer className="w-3.5 h-3.5" /></span>
            <span className="text-xs font-semibold">First score in ~2 min</span>
          </div>
        </div>
      </div>
    </NightPanel>
  )
}

/* ── Small form pieces ───────────────────────────── */
function Label({ htmlFor, children, optional }: { htmlFor?: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold text-[var(--io-ink-soft)] mb-1.5">
      {children}{optional && <span className="font-normal opacity-70"> (optional)</span>}
    </label>
  )
}

function Select({ id, value, onChange, icon: Icon, placeholder, children }: {
  id: string; value: string; onChange: (v: string) => void; icon: typeof Globe2; placeholder: string; children: React.ReactNode
}) {
  return (
    <div className="io-field relative">
      <Icon className="w-4 h-4 text-[var(--io-ink-soft)] flex-shrink-0" />
      <select id={id} value={value} onChange={e => onChange(e.target.value)}
        className={`flex-1 min-w-0 h-full bg-transparent outline-none appearance-none text-sm pr-6 cursor-pointer ${value ? 'text-[var(--io-ink)]' : 'text-[#9A96AB]'}`}>
        <option value="" disabled>{placeholder}</option>
        {children}
      </select>
      <ChevronDown className="w-4 h-4 text-[var(--io-ink-soft)] absolute right-3.5 pointer-events-none" />
    </div>
  )
}

function Choice({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} data-on={on} aria-pressed={on} className="io-choice">
      {children}
    </button>
  )
}

/* ── Page ────────────────────────────────────────── */
export default function SignupPage() {
  const router = useRouter()
  const mounted = useMounted()
  const [step, setStep] = useState<Step>('account')

  // account — null = untouched, so ?email= from the homepage hero shows through
  const [fullName, setFullName] = useState('')
  const [typedEmail, setEmail]  = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  // business
  const [company,  setCompany]  = useState('')
  const [role,     setRole]     = useState('')
  const [industry, setIndustry] = useState('')
  const [pickedCountry, setCountry] = useState<string | null>(null)
  const [phone,    setPhone]    = useState('')
  const [whatsapp, setWhatsapp] = useState(true)
  // ads
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [spend,     setSpend]     = useState('')
  const [source,    setSource]    = useState('')
  const [agreed,    setAgreed]    = useState(false)
  const [updates,   setUpdates]   = useState(true)

  const [error,    setError]    = useState<string | null>(null)
  const [shakeKey, setShakeKey] = useState(0)
  const [loading,  setLoading]  = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'azure' | null>(null)
  const [cooldown, setCooldown] = useState(0)

  // The homepage hero posts ?email=…, pricing links add ?plan=…; country is guessed from the timezone
  const query    = mounted ? new URLSearchParams(window.location.search) : null
  const email    = typedEmail ?? query?.get('email') ?? ''
  const planKey  = query?.get('plan') ?? ''
  const plan     = PLAN_LABEL[planKey] ? planKey : null
  const country  = pickedCountry ?? (mounted ? TZ_COUNTRY[Intl.DateTimeFormat().resolvedOptions().timeZone] ?? '' : '')

  const emailValid = EMAIL_RE.test(email.trim())
  const pw = passwordCheck(password)
  const stepIndex = Math.max(0, FORM_STEPS.indexOf(step))
  const panelIndex = step === 'verify' || step === 'success' ? 3 : stepIndex
  const spendOptions = country === 'IN' ? SPEND_IN : SPEND_USD

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

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
    const supabase = createClient()
    const next = plan ? `?next=${encodeURIComponent(`/settings?plan=${plan}`)}` : ''
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback${next}` },
    })
    if (err) { setOauthLoading(null); fail(err.message) }
  }

  function submitAccount(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (fullName.trim().length < 2) return fail('Please enter your full name.')
    if (!emailValid)                return fail('Enter a valid email address.')
    if (pw.score < 3)               return fail('Choose a stronger password — meet at least 3 of the 4 rules.')
    go('business')
  }

  function submitBusiness(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!company.trim()) return fail('Enter your company or brand name.')
    if (!role)           return fail('Tell us which best describes you.')
    if (!industry)       return fail('Pick your industry.')
    if (!country)        return fail('Pick your country — it sets your reporting currency.')
    if (phone && phone.replace(/\D/g, '').length < 8) return fail('That phone number looks too short.')
    go('ads')
  }

  async function submitAds(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!platforms.length) return fail('Pick at least one ad platform.')
    if (!spend)            return fail('Pick your approximate monthly ad spend.')
    if (!agreed)           return fail('Please accept the Terms and Privacy Policy to continue.')

    setError(null)
    setLoading(true)
    const supabase = createClient()
    const profile = {
      full_name: fullName.trim(),
      company_name: company.trim(),
      industry,
      country,
      phone_number: phone.trim() || null,
      whatsapp_opted_in: !!phone.trim() && whatsapp,
    }

    const { data, error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding/subscribe`,
        // Everything also lives in user metadata, so nothing is lost when email
        // confirmation delays the session (the signup trigger copies it to profiles)
        data: {
          ...profile,
          role,
          ad_platforms: platforms,
          monthly_ad_spend: spend,
          referral_source: source || null,
          marketing_opt_in: updates,
          plan_intent: plan,
        },
      },
    })

    if (err) { setLoading(false); return fail(err.message) }

    // Supabase hides existing accounts by returning a user with no identities
    if (data.user && data.user.identities?.length === 0) {
      setLoading(false)
      setStep('account')
      return fail('An account with this email already exists. Sign in instead.')
    }

    if (!data.session) { setLoading(false); setCooldown(60); return go('verify') }

    await supabase.from('profiles').update(profile).eq('id', data.user!.id)
    setStep('success')
    setTimeout(() => { router.push('/onboarding/subscribe'); router.refresh() }, 1300)
  }

  async function resend() {
    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding/subscribe` },
    })
    setLoading(false)
    if (err) return fail(err.message)
    setCooldown(60)
  }

  const togglePlatform = (p: Platform) =>
    setPlatforms(list => list.includes(p) ? list.filter(x => x !== p) : [...list, p])

  const firstName = fullName.trim().split(' ')[0]

  return (
    <AuthShell wide panel={<SignupPanel active={panelIndex} />}>
      {/* Step header — progress bars + back */}
      {stepIndex >= 0 && FORM_STEPS.includes(step) && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3 h-5">
            {step !== 'account'
              ? <button onClick={() => go(FORM_STEPS[stepIndex - 1])} className="io-link text-[var(--io-ink-soft)] hover:text-[var(--io-ink)]"><ArrowLeft className="w-3.5 h-3.5" /> Back</button>
              : <span className="text-xs font-semibold uppercase tracking-[0.16em] io-grad-text">Create your account</span>}
            <span className="text-xs font-semibold text-[var(--io-ink-soft)] tabular-nums">Step {stepIndex + 1} of 3</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {FORM_STEPS.map((s, i) => (
              <span key={s} className="h-1 rounded-full bg-[var(--io-line)] overflow-hidden">
                <span className="block h-full rounded-full transition-all duration-700"
                  style={{ width: i <= stepIndex ? '100%' : '0%', background: 'linear-gradient(90deg,var(--io-accent),var(--io-accent-2))' }} />
              </span>
            ))}
          </div>
        </div>
      )}

      {plan && FORM_STEPS.includes(step) && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-[var(--io-canvas)] border border-[var(--io-line)] px-3.5 py-2.5 mb-5 text-[13px] text-[var(--io-ink)]">
          <CheckCircle2 className="w-4 h-4 text-[var(--io-accent)] flex-shrink-0" />
          <span>Signing up for <strong>{PLAN_LABEL[plan]}</strong> — activate it after sign-up</span>
        </div>
      )}

      {step === 'account' && (
        <div key="account" className="io-step flex flex-col flex-1">
          <h1 className="io-display text-[1.6rem] sm:text-[1.9rem] font-semibold text-[var(--io-ink)] leading-tight">Start finding wasted spend</h1>
          <p className="text-sm text-[var(--io-ink-soft)] mt-1.5 mb-6">Free to start. Takes about 2 minutes.</p>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleOAuth('google')} disabled={!!oauthLoading} className="io-oauth">
              {oauthLoading === 'google' ? <Loader2 className="w-[18px] h-[18px] animate-spin" /> : <GoogleIcon />} Google
            </button>
            <button onClick={() => handleOAuth('azure')} disabled={!!oauthLoading} className="io-oauth">
              {oauthLoading === 'azure' ? <Loader2 className="w-[18px] h-[18px] animate-spin" /> : <MicrosoftIcon />} Microsoft
            </button>
          </div>

          <div className="flex items-center gap-3 my-5">
            <span className="flex-1 h-px bg-[var(--io-line)]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--io-ink-soft)]/70">or with email</span>
            <span className="flex-1 h-px bg-[var(--io-line)]" />
          </div>

          <form onSubmit={submitAccount} noValidate className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full name</Label>
              <div className="io-field">
                <User className="w-4 h-4 text-[var(--io-ink-soft)] flex-shrink-0" />
                <input id="fullName" autoComplete="name" placeholder="Rahul Sharma" value={fullName}
                  onChange={e => { setFullName(e.target.value); setError(null) }} />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Work email</Label>
              <div className="io-field">
                <Mail className="w-4 h-4 text-[var(--io-ink-soft)] flex-shrink-0" />
                <input id="email" type="email" autoComplete="email" placeholder="you@company.com" value={email}
                  onChange={e => { setEmail(e.target.value); setError(null) }} />
                <span className={`w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center transition-all duration-300 ${emailValid ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </span>
              </div>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="io-field">
                <Lock className="w-4 h-4 text-[var(--io-ink-soft)] flex-shrink-0" />
                <input id="password" type={showPw ? 'text' : 'password'} autoComplete="new-password" placeholder="Create a password"
                  value={password} onChange={e => { setPassword(e.target.value); setError(null) }} />
                <button type="button" onClick={() => setShowPw(v => !v)} aria-label={showPw ? 'Hide password' : 'Show password'}
                  className="text-[var(--io-ink-soft)] hover:text-[var(--io-ink)] transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && (
                <div className="io-fade mt-2.5">
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2, 3].map(i => (
                      <span key={i} className="flex-1 h-1 rounded-full transition-colors duration-300"
                        style={{ background: i < pw.score ? STRENGTH[pw.score].color : 'var(--io-line)' }} />
                    ))}
                    <span className="text-[11px] font-semibold w-14 text-right" style={{ color: STRENGTH[pw.score].color }}>{STRENGTH[pw.score].label}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2">
                    {pw.rules.map(r => (
                      <span key={r.label} className={`flex items-center gap-1.5 text-[11px] transition-colors ${r.ok ? 'text-emerald-600' : 'text-[var(--io-ink-soft)]'}`}>
                        <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors ${r.ok ? 'bg-emerald-500' : 'border border-[var(--io-line)]'}`}>
                          {r.ok && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                        </span>
                        {r.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <ErrorBox error={error} shakeKey={shakeKey} />
            <button type="submit" className="io-btn io-btn-primary w-full !py-[15px]">
              Continue <ArrowRight className="io-arrow w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-sm text-[var(--io-ink-soft)] mt-auto pt-6">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-[var(--io-accent)] hover:text-[var(--io-accent-2)] transition-colors">Sign in</Link>
          </p>
        </div>
      )}

      {step === 'business' && (
        <form key="business" onSubmit={submitBusiness} noValidate className="io-step flex flex-col flex-1">
          <h1 className="io-display text-[1.6rem] sm:text-[1.9rem] font-semibold text-[var(--io-ink)] leading-tight">
            {firstName ? `Nice to meet you, ${firstName}` : 'About your business'}
          </h1>
          <p className="text-sm text-[var(--io-ink-soft)] mt-1.5 mb-6">We use this to compare you against the right benchmarks.</p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="company">Company or brand name</Label>
              <div className="io-field">
                <Building2 className="w-4 h-4 text-[var(--io-ink-soft)] flex-shrink-0" />
                <input id="company" autoComplete="organization" placeholder="Your brand" autoFocus value={company}
                  onChange={e => { setCompany(e.target.value); setError(null) }} />
              </div>
            </div>

            <div>
              <Label>Which best describes you?</Label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map(({ key, label, icon: Icon }) => (
                  <Choice key={key} on={role === key} onClick={() => { setRole(key); setError(null) }}>
                    <Icon className="w-4 h-4 flex-shrink-0" /> {label}
                  </Choice>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Select id="industry" value={industry} onChange={v => { setIndustry(v); setError(null) }} icon={Sparkles} placeholder="Select…">
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </Select>
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Select id="country" value={country} onChange={v => { setCountry(v); setSpend(''); setError(null) }} icon={Globe2} placeholder="Select…">
                  {COUNTRIES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="phone" optional>Phone</Label>
              <div className="io-field">
                <Phone className="w-4 h-4 text-[var(--io-ink-soft)] flex-shrink-0" />
                <input id="phone" type="tel" autoComplete="tel" placeholder="+91 98765 43210" value={phone}
                  onChange={e => { setPhone(e.target.value); setError(null) }} />
              </div>
              {phone.trim() && (
                <label className="io-fade flex items-center gap-2.5 mt-2.5 cursor-pointer select-none text-[13px] text-[var(--io-ink)]">
                  <span className="io-switch" data-on={whatsapp}><input type="checkbox" className="sr-only" checked={whatsapp} onChange={e => setWhatsapp(e.target.checked)} /></span>
                  Send critical alerts on WhatsApp
                </label>
              )}
            </div>
          </div>

          <div className="mt-auto pt-6 space-y-3">
            <ErrorBox error={error} shakeKey={shakeKey} />
            <button type="submit" className="io-btn io-btn-primary w-full !py-[15px]">
              Continue <ArrowRight className="io-arrow w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {step === 'ads' && (
        <form key="ads" onSubmit={submitAds} noValidate className="io-step flex flex-col flex-1">
          <h1 className="io-display text-[1.6rem] sm:text-[1.9rem] font-semibold text-[var(--io-ink)] leading-tight">How do you advertise?</h1>
          <p className="text-sm text-[var(--io-ink-soft)] mt-1.5 mb-6">We&apos;ll set up the right checks before you connect anything.</p>

          <div className="space-y-5">
            <div>
              <Label>Ad platforms you use</Label>
              <div className="grid grid-cols-3 gap-2">
                {PLATFORMS.map(({ key, label, icon: Icon, color }) => {
                  const on = platforms.includes(key)
                  return (
                    <button key={key} type="button" onClick={() => { togglePlatform(key); setError(null) }} data-on={on} aria-pressed={on}
                      className="io-choice relative !flex-col !gap-2 !py-4">
                      <span className={`absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center transition-all ${on ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
                        style={{ background: 'linear-gradient(135deg,var(--io-accent),var(--io-accent-2))' }}>
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                      </span>
                      <Icon className="w-6 h-6" style={{ color }} />
                      <span className="text-xs">{label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <Label>Monthly ad spend</Label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 [&>*]:!px-1 [&>*]:!text-xs [&>*]:whitespace-nowrap">
                {spendOptions.map(s => (
                  <Choice key={s} on={spend === s} onClick={() => { setSpend(s); setError(null) }}>{s}</Choice>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="source" optional>How did you hear about us?</Label>
              <Select id="source" value={source} onChange={setSource} icon={Megaphone} placeholder="Select…">
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>

            <div className="space-y-2.5 pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-[13px] text-[var(--io-ink)]">
                <input type="checkbox" checked={agreed} onChange={e => { setAgreed(e.target.checked); setError(null) }} className="io-check-box mt-0.5" />
                <span>I agree to the <a href="https://adnexusone.com/terms" target="_blank" rel="noreferrer" className="font-semibold text-[var(--io-accent)] hover:underline">Terms</a> and <a href="https://adnexusone.com/privacy" target="_blank" rel="noreferrer" className="font-semibold text-[var(--io-accent)] hover:underline">Privacy Policy</a></span>
              </label>
              <label className="flex items-start gap-2.5 cursor-pointer text-[13px] text-[var(--io-ink-soft)]">
                <input type="checkbox" checked={updates} onChange={e => setUpdates(e.target.checked)} className="io-check-box mt-0.5" />
                <span>Send me product updates and ad-performance tips</span>
              </label>
            </div>
          </div>

          <div className="mt-auto pt-6 space-y-3">
            <ErrorBox error={error} shakeKey={shakeKey} />
            <button type="submit" disabled={loading} className="io-btn io-btn-primary w-full !py-[15px] disabled:opacity-60 disabled:pointer-events-none">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating your account…</> : <>Create account <ArrowRight className="io-arrow w-4 h-4" /></>}
            </button>
          </div>
        </form>
      )}

      {step === 'verify' && (
        <div key="verify" className="io-step flex flex-col flex-1 text-center items-center">
          <div className="relative mt-4 mb-7">
            <span className="absolute inset-0 rounded-full io-breathe" style={{ background: 'radial-gradient(closest-side, rgba(124,58,237,.35), transparent)', transform: 'scale(1.8)' }} />
            <span className="io-float-a relative w-20 h-20 rounded-[24px] flex items-center justify-center text-white shadow-[0_18px_40px_-14px_rgba(59,91,253,.7)]"
              style={{ background: 'linear-gradient(135deg,var(--io-accent),var(--io-accent-2))' }}>
              <Mail className="w-9 h-9" />
            </span>
          </div>
          <h1 className="io-display text-[1.6rem] sm:text-[1.9rem] font-semibold text-[var(--io-ink)] leading-tight">Confirm your email</h1>
          <p className="text-sm text-[var(--io-ink-soft)] mt-2 max-w-[320px]">
            We sent a confirmation link to <span className="font-semibold text-[var(--io-ink)]">{email.trim()}</span>. Click it to activate your account and connect your first ad account.
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
              : <button onClick={resend} disabled={loading} className="inline-flex items-center gap-1 font-semibold text-[var(--io-accent)] hover:text-[var(--io-accent-2)]"><RefreshCw className="w-3.5 h-3.5" /> Resend email</button>}
            <span className="mx-2 text-[var(--io-line)]">|</span>
            <button onClick={() => go('account')} className="font-semibold text-[var(--io-ink)] hover:text-[var(--io-accent)]">Wrong email?</button>
          </p>
        </div>
      )}

      {step === 'success' && (
        <div key="success" className="io-step flex flex-col flex-1 items-center justify-center text-center">
          <svg className="io-check w-24 h-24 mb-6" viewBox="0 0 56 56" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="signup-check" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#3B5BFD" /><stop offset="1" stopColor="#7C3AED" />
              </linearGradient>
            </defs>
            <circle cx="28" cy="28" r="25" stroke="url(#signup-check)" strokeWidth="3" />
            <path d="M17 28.5l7.5 7.5L39 21" stroke="url(#signup-check)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h1 className="io-display text-[1.6rem] sm:text-[1.9rem] font-semibold text-[var(--io-ink)] leading-tight">Welcome aboard{firstName ? `, ${firstName}` : ''}</h1>
          <p className="text-sm text-[var(--io-ink-soft)] mt-2">Setting up your workspace…</p>
          <div className="w-40 h-1 rounded-full bg-[var(--io-line)] mt-6 overflow-hidden">
            <div className="h-full io-progress" style={{ '--io-dur': '1.3s', background: 'linear-gradient(90deg,var(--io-accent),var(--io-accent-2))' } as React.CSSProperties} />
          </div>
        </div>
      )}
    </AuthShell>
  )
}
