'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SiMeta, SiGoogleads } from 'react-icons/si'
import { FaAmazon } from 'react-icons/fa'
import { BrandMark } from './LandingNav'
import { Ridges, NightGlow } from './io-art'

const USER_URL = process.env.NEXT_PUBLIC_USER_URL ?? ''

const BRAND_SOCIALS = [
  { label:'LinkedIn',  href:'https://www.linkedin.com/company/adnexusone/', svg:<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><path d="M2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg> },
  { label:'Instagram', href:'https://www.instagram.com/ecommerce_analyst/',  svg:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg> },
]

const LEGAL_LINKS = [
  { l: 'Privacy',  h: '/privacy'  },
  { l: 'Terms',    h: '/terms'    },
  { l: 'Refund',   h: '/refund'   },
  { l: 'Cookies',  h: '/cookies'  },
]

const FOOTER_COLS = [
  { title:'Platform', links:[{l:'Platform Overview',h:'/platform'},{l:'Adnexusone AI',h:'/ai-engine'},{l:'Diagnostic Engine',h:'/platform/diagnostic-engine'},{l:'Health Scoring',h:'/platform/health-scoring'},{l:'Revenue Impact',h:'/platform/revenue-impact'},{l:'Real-time Alerts',h:'/platform/alerts'},{l:'Audit Reports',h:'/platform/audit-reports'}] },
  { title:'Channels', links:[{l:'Meta Ads',h:'/platform/meta'},{l:'Google Ads',h:'/platform/google'},{l:'Amazon Ads',h:'/platform/amazon'}] },
  { title:'Industries', links:[{l:'D2C E-commerce',h:'/industries/d2c-ecommerce'},{l:'Fashion & Lifestyle',h:'/industries/fashion-lifestyle'},{l:'Health & Wellness',h:'/industries/health-wellness'},{l:'Performance Agencies',h:'/industries/performance-agencies'},{l:'Travel & Lifestyle',h:'/industries/travel-lifestyle'},{l:'Enterprise Brands',h:'/industries/enterprise-brands'}] },
  { title:'Resources', links:[{l:'Blog',h:'/blog'},{l:'Case Studies',h:'/case-studies'},{l:'Platform Tour',h:'/platform-tour'},{l:'Help Center',h:'/help-center'},{l:'ROAS Calculator',h:'/tools/roas-calculator'},{l:'Ad Health Scorecard',h:'/tools/ad-health-scorecard'}] },
  { title:'Company', links:[{l:'Customers',h:'/customers'},{l:'Pricing',h:'/pricing'},{l:'Contact us',h:'/contact'}] },
]

/* ── CTA — "You've seen the results" with rippling water ── */
function CTAContent() {
  return (
    <section className="relative overflow-hidden text-white" style={{ background: 'var(--io-night)' }}>
      <NightGlow />
      <Ridges className="absolute left-0 right-0 bottom-[220px] sm:bottom-[260px] w-full h-[110px] sm:h-[150px]" id="cta" />
      {/* Water — reflected glow + ripples */}
      <div className="absolute left-0 right-0 bottom-0 h-[222px] sm:h-[262px] overflow-hidden" style={{ background: 'linear-gradient(180deg, #120E2C 0%, #0B0A14 100%)' }}>
        <div className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-[50%] io-breathe" style={{ background: 'radial-gradient(closest-side, rgba(124,92,255,.55), rgba(59,91,253,.15) 60%, transparent)', filter: 'blur(20px)' }} />
        {[0, 1.75, 3.5, 5.25].map(d => (
          <span key={d} className="io-ripple" style={{ top: '45%', animationDelay: `${d}s` }} />
        ))}
      </div>

      <div className="relative max-w-3xl mx-auto px-5 sm:px-6 text-center pt-28 sm:pt-40 pb-[360px] sm:pb-[440px]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60 mb-5">Get started today</p>
        <h2 className="io-display text-[2rem] sm:text-5xl lg:text-[3.5rem] font-semibold leading-[1.08] mb-5">
          You&apos;ve seen the results.<br />
          <span className="io-grad-text" style={{ backgroundImage: 'linear-gradient(90deg, #8FA6FF, #C4B5FD)' }}>Now it&apos;s your turn.</span>
        </h2>
        <p className="text-white/70 text-base sm:text-lg mb-9 max-w-lg mx-auto leading-relaxed">Connect your ad accounts and see what&apos;s quietly draining your budget — in the next 2 minutes.</p>
        <form action={`${USER_URL}/signup`} className="io-email max-w-md mx-auto">
          <input type="email" name="email" placeholder="Enter your work email" aria-label="Work email" />
          <button type="submit" className="io-btn io-btn-primary !py-3">Get started <ArrowRight className="io-arrow w-3.5 h-3.5" /></button>
        </form>
        <p className="text-xs text-white/50 mt-4">30-day free trial. No charge until day 30. Cancel anytime.</p>
      </div>
    </section>
  )
}

/* ── Footer ─────────────────────────────────────── */
function FooterContent() {
  return (
    <footer className="relative text-white overflow-hidden" style={{ background: 'var(--io-night)' }}>
      <div className="max-w-[1310px] mx-auto px-5 sm:px-6 pt-16 sm:pt-20">
        {/* Top row — channel badges + newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-10 pb-14 border-b border-white/10">
          <div>
            <BrandMark size="lg" />
            <p className="text-sm text-white/60 leading-relaxed mt-5 max-w-sm">We help D2C brands and agencies find what&apos;s quietly draining their ad budget — across Meta, Google, and Amazon.</p>
            <div className="flex items-center gap-2 mt-6">
              {[
                { icon: <SiMeta size={16} />, c: '#0081FB', l: 'Meta Ads' },
                { icon: <SiGoogleads size={16} />, c: '#4285F4', l: 'Google Ads' },
                { icon: <FaAmazon size={16} />, c: '#FF9900', l: 'Amazon Ads' },
              ].map(({ icon, c, l }) => (
                <span key={l} title={l} className="w-10 h-10 rounded-full bg-white flex items-center justify-center" style={{ color: c }}>{icon}</span>
              ))}
              <span className="text-xs text-white/50 ml-2">Native OAuth integrations</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-white/80 mb-4">Join D2C marketers getting weekly ad-diagnostics insights in their inbox.</p>
            <form action="/contact" className="flex flex-col sm:flex-row gap-2">
              <input type="email" name="email" placeholder="Business email" aria-label="Business email" className="flex-1 min-w-0 rounded-full bg-white/[0.06] border border-white/15 px-5 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/40 transition-colors" />
              <select name="role" aria-label="Your role" defaultValue="" className="rounded-full bg-white/[0.06] border border-white/15 px-5 py-3 text-sm text-white/70 outline-none focus:border-white/40 sm:w-44">
                <option value="" disabled>I&apos;m a…</option>
                <option className="text-black">Brand marketer</option>
                <option className="text-black">Agency</option>
                <option className="text-black">Founder</option>
              </select>
              <button type="submit" className="io-btn io-btn-primary">Subscribe</button>
            </form>
            <p className="text-[11px] text-white/40 mt-3">By subscribing you agree to our <Link href="/privacy" className="underline hover:text-white/70">Privacy Policy</Link>.</p>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 py-14">
          {FOOTER_COLS.map(({ title, links }) => (
            <div key={title}>
              <p className="text-[11px] font-semibold text-white uppercase tracking-[0.16em] mb-4">{title}</p>
              <ul className="space-y-2.5">
                {links.map(({ l, h }) => <li key={l}><Link href={h} className="io-underline text-sm text-white/55 hover:text-white transition-colors">{l}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-[1310px] mx-auto px-5 sm:px-6 py-8 flex flex-col sm:flex-row items-center gap-4 sm:justify-between border-t border-white/10">
        <p className="text-xs text-white/50">© 2026 Adnexusone. All rights reserved.</p>
        <div className="flex items-center gap-2">
          {BRAND_SOCIALS.map(({ label, href, svg }) => (
            <a key={label} href={href} aria-label={label} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-colors">{svg}</a>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-5">
          {LEGAL_LINKS.map(({ l, h }) => (
            <Link key={l} href={h} className="io-underline text-xs text-white/50 hover:text-white transition-colors">{l}</Link>
          ))}
        </div>
      </div>

      {/* Giant faint wordmark — fades downward and is cropped by the page edge */}
      <div className="overflow-hidden select-none pointer-events-none" aria-hidden="true" style={{ height: 'clamp(2rem, 8.6vw, 10rem)' }}>
        <p className="io-display text-center font-black leading-[0.82] whitespace-nowrap"
          style={{
            fontSize: 'clamp(2.4rem, 11.6vw, 13.5rem)',
            letterSpacing: '-0.03em',
            background: 'linear-gradient(180deg, rgba(255,255,255,.075) 0%, rgba(255,255,255,.035) 55%, rgba(255,255,255,0) 100%)',
            WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>ADNEXUSONE</p>
      </div>
    </footer>
  )
}

/* ── LandingBottom — CTA + Footer, used on all marketing pages ── */
export function LandingBottom() {
  return (
    <>
      <CTAContent />
      <FooterContent />
    </>
  )
}

/* ── Legacy exports — kept so existing single-use imports don't break ─ */
export function LandingCTA() {
  return <CTAContent />
}

export function LandingFooter() {
  return <FooterContent />
}
