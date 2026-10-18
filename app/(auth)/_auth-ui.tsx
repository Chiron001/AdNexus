'use client'

import { useRef, useSyncExternalStore } from 'react'
import { ArrowLeft, ShieldCheck, Star, AlertTriangle } from 'lucide-react'
import { BrandMark } from '@/components/landing/LandingNav'
import { Ridges, NightGlow } from '@/components/landing/io-art'

/* Shared frame for the login and signup pages: dark brand panel on the
   left (desktop only), cream canvas with the form card on the right. */

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/* False during prerender and hydration, true afterwards — for values that
   only exist in the browser (localStorage, URL, timezone, clock) */
const noopSubscribe = () => () => {}
export function useMounted() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false)
}

const TWINKLES = [
  { top: '8%',  left: '12%', d: '0s'   }, { top: '14%', left: '58%', d: '1.2s' },
  { top: '22%', left: '84%', d: '2.4s' }, { top: '6%',  left: '36%', d: '.6s'  },
  { top: '30%', left: '22%', d: '3.1s' }, { top: '18%', left: '72%', d: '1.8s' },
  { top: '38%', left: '92%', d: '.3s'  }, { top: '11%', left: '90%', d: '2.9s' },
]

export function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="flex-shrink-0">
      <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/>
      <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/>
      <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/>
      <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z"/>
    </svg>
  )
}

export function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 21 21" aria-hidden="true" className="flex-shrink-0">
      <path fill="#f25022" d="M1 1h9v9H1z"/>
      <path fill="#00a4ef" d="M1 11h9v9H1z"/>
      <path fill="#7fba00" d="M11 1h9v9h-9z"/>
      <path fill="#ffb900" d="M11 11h9v9h-9z"/>
    </svg>
  )
}

/* Re-keyed on every failure so the shake replays */
export function ErrorBox({ error, shakeKey }: { error: string | null; shakeKey: number }) {
  if (!error) return null
  return (
    <div key={shakeKey} role="alert" className="io-shake flex items-start gap-2.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-[13px] px-4 py-3">
      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" /><span>{error}</span>
    </div>
  )
}

/* ── Left: dark brand panel ──────────────────────── */
export function NightPanel({ id, children }: { id: string; children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null)

  // Widgets drift toward the cursor, same feel as the homepage hero
  function onMove(e: React.PointerEvent<HTMLElement>) {
    if (e.pointerType !== 'mouse' || !ref.current) return
    const b = ref.current.getBoundingClientRect()
    const x = (e.clientX - b.left) / b.width - 0.5
    const y = (e.clientY - b.top) / b.height - 0.5
    ref.current.querySelectorAll<HTMLElement>('[data-depth]').forEach(el => {
      const d = Number(el.dataset.depth)
      el.style.translate = `${-x * d}px ${-y * d}px`
    })
  }

  return (
    <aside ref={ref} onPointerMove={onMove}
      className="relative hidden lg:flex lg:sticky lg:top-0 lg:h-screen flex-col overflow-hidden text-white" style={{ background: 'var(--io-night)' }}>
      <NightGlow />
      {TWINKLES.map((s, i) => <span key={i} className="io-twinkle" style={{ top: s.top, left: s.left, animationDelay: s.d }} />)}
      <Ridges className="absolute left-0 right-0 bottom-0 w-full h-[34%]" id={id} />

      <div className="relative z-10 flex flex-col h-full px-12 xl:px-16 py-10">
        <a href="https://adnexusone.com" className="io-fade self-start" aria-label="Adnexusone home"><BrandMark /></a>

        {/* Centred in the panel like the form card, sitting slightly above the middle */}
        <div className="my-auto pb-16 pt-6 w-full max-w-[540px] mx-auto grid gap-y-10">
          {children}
        </div>

        <div className="io-fade relative flex items-center gap-5 text-white/80 pt-10" style={{ animationDelay: '.8s' }}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">Trusted by 1,000+ D2C brands</p>
          <span className="h-4 w-px bg-white/20" />
          <span className="flex items-center gap-1 text-sm whitespace-nowrap"><Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" /> 4.9 rating</span>
        </div>
      </div>
    </aside>
  )
}

/* ── Page frame + form card ──────────────────────── */
export function AuthShell({ panel, wide = false, children }: { panel: React.ReactNode; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[1.08fr_1fr] io-canvas">
      {panel}

      <main className="relative flex flex-col min-h-screen px-5 sm:px-10 py-6 overflow-hidden">
        {/* Soft colour wash behind the card */}
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full io-breathe"
          style={{ background: 'radial-gradient(closest-side, rgba(124,58,237,.16), rgba(59,91,253,.08) 60%, transparent)' }} />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 -left-32 w-[460px] h-[460px] rounded-full io-breathe"
          style={{ background: 'radial-gradient(closest-side, rgba(59,91,253,.12), transparent)', animationDelay: '-3s' }} />

        <header className="relative flex items-center justify-between">
          <a href="https://adnexusone.com" className="lg:invisible" aria-label="Adnexusone home"><BrandMark dark /></a>
          <a href="https://adnexusone.com" className="io-link text-[var(--io-ink-soft)] hover:text-[var(--io-ink)] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to site
          </a>
        </header>

        <div className="relative flex-1 flex items-center justify-center py-10">
          <div className={`w-full ${wide ? 'max-w-[460px]' : 'max-w-[420px]'} io-pop`}>
            <div className="io-auth-ring rounded-[28px] shadow-[0_1px_2px_rgba(28,24,48,.04),0_30px_70px_-30px_rgba(28,24,48,.35)]">
              <div className="rounded-[28px] p-7 sm:p-9 min-h-[460px] flex flex-col">
                {children}
              </div>
            </div>
          </div>
        </div>

        <footer className="relative flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--io-ink-soft)]">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Secure, encrypted sign-in</span>
          <span>
            By continuing you agree to our{' '}
            <a href="https://adnexusone.com/terms" className="underline-offset-2 hover:underline hover:text-[var(--io-ink)]">Terms</a>
            {' '}&amp;{' '}
            <a href="https://adnexusone.com/privacy" className="underline-offset-2 hover:underline hover:text-[var(--io-ink)]">Privacy</a>
          </span>
        </footer>
      </main>
    </div>
  )
}
