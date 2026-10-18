'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ArrowRight, ShieldCheck, Mail } from 'lucide-react'
import { AuthShell, NightPanel, ErrorBox, useMounted } from '@/app/(auth)/_auth-ui'

/* Landing page for links in Supabase emails (magic link, signup confirmation).
   The email template points here with ?token_hash=…&type=…&next=…
   The token is only spent when the person clicks the button, so mail
   scanners (Outlook Safe Links, Gmail) that pre-open links can't burn it,
   and it works in any browser — no PKCE verifier needed. */

const OTP_TYPES: EmailOtpType[] = ['email', 'magiclink', 'signup', 'invite', 'recovery', 'email_change']

function safeNext(next: string | null) {
  // Only same-site paths, never protocol-relative URLs
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'
}

export default function ConfirmPage() {
  const router  = useRouter()
  const mounted = useMounted()
  const [error,    setError]    = useState<string | null>(null)
  const [shakeKey, setShakeKey] = useState(0)
  const [loading,  setLoading]  = useState(false)

  const query     = mounted ? new URLSearchParams(window.location.search) : null
  const tokenHash = query?.get('token_hash') ?? null
  const type      = query?.get('type') as EmailOtpType | null
  const next      = safeNext(query?.get('next') ?? null)
  const isSignup  = type === 'signup' || next.startsWith('/onboarding')
  const valid     = !!tokenHash && !!type && OTP_TYPES.includes(type)

  async function confirm() {
    if (!valid) return
    setError(null)
    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.verifyOtp({ token_hash: tokenHash!, type: type! })
    if (err) {
      setLoading(false)
      setShakeKey(k => k + 1)
      return setError(/expired|invalid/i.test(err.message)
        ? 'This link has expired or was already used. Request a new one from the sign-in page.'
        : err.message)
    }
    router.replace(next)
    router.refresh()
  }

  const panel = (
    <NightPanel id="confirm">
      <div>
        <h2 className="io-display text-[2.6rem] xl:text-[3rem] font-medium leading-[1.06] tracking-[-0.025em] mb-5">
          <span className="io-rise-line"><span style={{ animationDelay: '.1s' }}>One click and</span></span>
          <span className="io-rise-line"><span style={{ animationDelay: '.22s' }}>you&apos;re <span className="io-grad-text" style={{ backgroundImage: 'linear-gradient(90deg,#8FA6FF,#C4B5FD)' }}>in.</span></span></span>
        </h2>
        <p className="io-fade text-white/65 leading-relaxed" style={{ animationDelay: '.5s' }}>
          We ask for this click so email security scanners can&apos;t use your sign-in link before you do.
        </p>
      </div>
    </NightPanel>
  )

  return (
    <AuthShell panel={panel}>
      <div className="io-step flex flex-col flex-1 text-center items-center">
        <div className="relative mt-4 mb-7">
          <span className="absolute inset-0 rounded-full io-breathe" style={{ background: 'radial-gradient(closest-side, rgba(124,58,237,.35), transparent)', transform: 'scale(1.8)' }} />
          <span className="io-float-a relative w-20 h-20 rounded-[24px] flex items-center justify-center text-white shadow-[0_18px_40px_-14px_rgba(59,91,253,.7)]"
            style={{ background: 'linear-gradient(135deg,var(--io-accent),var(--io-accent-2))' }}>
            {valid || !mounted ? <ShieldCheck className="w-9 h-9" /> : <Mail className="w-9 h-9" />}
          </span>
        </div>

        {!mounted || valid ? (
          <>
            <h1 className="io-display text-[1.6rem] sm:text-[1.9rem] font-semibold text-[var(--io-ink)] leading-tight">
              {isSignup ? 'Confirm your email' : 'Confirm it’s you'}
            </h1>
            <p className="text-sm text-[var(--io-ink-soft)] mt-2 max-w-[300px]">
              {isSignup ? 'Activate your account and continue setting up your workspace.' : 'Finish signing in to your Adnexusone account.'}
            </p>
            <div className="w-full mt-8 space-y-3">
              <ErrorBox error={error} shakeKey={shakeKey} />
              <button onClick={confirm} disabled={loading || !mounted}
                className="io-btn io-btn-primary w-full !py-[15px] disabled:opacity-60 disabled:pointer-events-none">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing you in…</>
                  : <>{isSignup ? 'Activate my account' : 'Continue to Adnexusone'} <ArrowRight className="io-arrow w-4 h-4" /></>}
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="io-display text-[1.6rem] sm:text-[1.9rem] font-semibold text-[var(--io-ink)] leading-tight">This link isn&apos;t complete</h1>
            <p className="text-sm text-[var(--io-ink-soft)] mt-2 max-w-[300px]">
              It may have been cut off by your email app. Request a fresh link from the sign-in page.
            </p>
          </>
        )}

        <p className="text-sm text-[var(--io-ink-soft)] mt-auto pt-7">
          Link not working?{' '}
          <Link href="/login" className="font-semibold text-[var(--io-accent)] hover:text-[var(--io-accent-2)]">Back to sign in</Link>
        </p>
      </div>
    </AuthShell>
  )
}
