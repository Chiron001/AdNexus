'use client'

import Link from 'next/link'
import { Zap, ArrowRight } from 'lucide-react'

const USER_URL = process.env.NEXT_PUBLIC_USER_URL ?? ''
const BG_IMAGE = `url('/images/cta-bg.webp')`

const FOOTER_STARS = Array.from({ length: 28 }, (_, i) => ({
  x: (i * 37 + 11) % 100, y: (i * 23 + 7) % 100,
  r: i % 3 === 0 ? 1 : 0.6,
  op: 0.1 + (i % 5) * 0.08,
  dur: `${2.5 + (i % 5) * 0.8}s`,
  del: `${(i % 7) * 0.4}s`,
}))

const BRAND_SOCIALS = [
  { label:'LinkedIn',  href:'https://www.linkedin.com/company/adnexusone/', svg:<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><path d="M2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg> },
  { label:'Instagram', href:'https://www.instagram.com/ecommerce_analyst/',  svg:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg> },
]

const LEGAL_LINKS = [
  { l: 'Privacy',  h: '/privacy'  },
  { l: 'Terms',    h: '/terms'    },
  { l: 'Refund',   h: '/refund'   },
  { l: 'Cookies',  h: '/cookies'  },
]

/* ── CTA content — no background of its own ─────── */
function CTAContent() {
  return (
    <section className="relative pt-20 sm:pt-28 pb-0 px-5 sm:px-6">
      {/* Dark overlay fading in from above */}
      <div className="absolute inset-0 pointer-events-none" style={{ background:'linear-gradient(180deg, #080808 0%, rgba(8,8,8,0.94) 6%, rgba(2,3,12,0.48) 22%, rgba(2,3,12,0.18) 45%, rgba(2,3,12,0.22) 60%, rgba(1,2,12,0.72) 82%, rgba(1,2,12,0.97) 100%)' }} />
      {FOOTER_STARS.map((s, i) => (
        <div key={i} className="star-twinkle absolute pointer-events-none" style={{
          left:`${s.x}%`, top:`${s.y}%`, width:`${s.r * 2}px`, height:`${s.r * 2}px`,
          borderRadius:'50%', background:'#fff',
          ['--star-op' as string]: s.op, ['--star-dur' as string]: s.dur, ['--star-delay' as string]: s.del,
          opacity: s.op,
        }}/>
      ))}
      <div className="relative max-w-3xl mx-auto text-center pb-32 sm:pb-40">
        <p className="text-[11px] font-bold text-orange-400/80 uppercase tracking-widest mb-4">Get started today</p>
        <h2 className="text-[1.7rem] sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
          Be unstoppable<br/>
          <span className="text-gradient animate-gradient">with Adnexusone</span>
        </h2>
        <p className="text-gray-400 text-lg sm:text-xl mb-10 max-w-lg mx-auto leading-relaxed">The only platform built to keep D2C ad accounts healthy and performing at their peak.</p>
        <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3 mb-5">
          <div className="flex items-stretch bg-white/[0.06] border border-white/10 rounded-xl overflow-hidden w-full sm:max-w-md">
            <input type="email" placeholder="Enter your work email" className="flex-1 px-5 py-3.5 bg-transparent text-sm text-white placeholder-gray-600 outline-none min-w-0"/>
            <Link href={`${USER_URL}/signup`} className="btn-blue flex items-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold whitespace-nowrap transition-colors">
              Get started <ArrowRight className="w-3.5 h-3.5" aria-hidden="true"/>
            </Link>
          </div>
        </div>
        <p className="text-xs text-gray-400">30-day free trial. No charge until day 30. Cancel anytime.</p>
      </div>
    </section>
  )
}

/* ── Footer content — no background of its own ──── */
function FooterContent() {
  return (
    <footer className="pt-20 pb-14 px-5 sm:px-6 relative overflow-hidden" style={{ marginTop: '-4px' }}>
      {/* Overlays */}
      <div className="absolute inset-0 pointer-events-none" style={{ background:'linear-gradient(180deg, rgba(1,2,12,0.97) 0%, rgba(1,2,14,0.94) 18%, rgba(2,3,16,0.80) 42%, rgba(2,4,16,0.72) 62%, rgba(2,4,16,0.86) 82%, rgba(1,3,14,0.97) 100%)', zIndex:0 }}/>
      <div className="absolute pointer-events-none" style={{ bottom:'20%', left:'28%', width:'280px', height:'280px', borderRadius:'50%', background:'radial-gradient(circle, rgba(60,100,180,0.12) 0%, transparent 70%)', filter:'blur(50px)' }}/>
      <div className="absolute pointer-events-none" style={{ bottom:'20%', right:'28%', width:'280px', height:'280px', borderRadius:'50%', background:'radial-gradient(circle, rgba(60,100,180,0.10) 0%, transparent 70%)', filter:'blur(50px)' }}/>
      <div className="absolute pointer-events-none" style={{ bottom:0, left:'20%', right:'20%', height:'140px', background:'radial-gradient(ellipse, rgba(40,80,140,0.18) 0%, transparent 70%)', filter:'blur(35px)' }}/>

      <div className="relative" style={{ zIndex:1 }}>
        {/* Nav grid — 50/50 split */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
          {/* Brand block — 50% */}
          <div className="flex flex-col justify-between max-w-sm">
            <div>
              <Link href="/" className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25"><Zap className="w-5 h-5 text-white"/></div>
                <span className="text-base font-bold text-white">Adnexusone</span>
              </Link>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">We help D2C brands and agencies find what's quietly draining their ad budget — across Meta, Google, and Amazon.</p>
            </div>
            <div className="flex gap-2">
              {BRAND_SOCIALS.map(({ label, href, svg }) => (
                <a key={label} href={href} aria-label={label} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-white/[0.08] border border-white/[0.12] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.16] transition-all">{svg}</a>
              ))}
            </div>
          </div>

          {/* Nav columns — 50%: Platform, Company, Resources */}
          <div className="grid grid-cols-3 gap-6">
            {[
              { title:'Platform', links:[{l:'Overview',h:'/platform'},{l:'Meta Ads',h:'/platform#meta'},{l:'Google Ads',h:'/platform#google'},{l:'Amazon Ads',h:'/platform#amazon'},{l:'AI Diagnostics',h:'/platform#ai'}] },
              { title:'Company',  links:[{l:'Features',h:'/#features'},{l:'Customers',h:'/customers'},{l:'Pricing',h:'/pricing'},{l:'Contact us',h:'/contact'},{l:'Resources',h:'/#resources'}] },
              { title:'Resources',links:[{l:'Case Studies',h:'/customers'},{l:'Blog',h:'#'},{l:'Guides',h:'#'},{l:'Help Center',h:'#'}] },
            ].map(({ title, links }) => (
              <div key={title}>
                <p className="text-[11px] font-bold text-gray-200 uppercase tracking-widest mb-4">{title}</p>
                <ul className="space-y-2.5">{links.map(({ l, h }) => <li key={l}><Link href={h} className="text-sm text-gray-400 hover:text-white transition-colors">{l}</Link></li>)}</ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom section */}
        <div className="flex flex-col overflow-x-hidden">
          {/* ADNEXUSONE watermark */}
          <div className="order-1 sm:order-2 overflow-x-hidden pb-4 sm:mt-6" style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)' }}>
            <p className="text-center font-black select-none pointer-events-none leading-none"
              style={{
                fontSize: 'clamp(2rem, 14vw, 11rem)',
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(148,130,255,0.28) 40%, rgba(96,165,250,0.24) 70%, rgba(255,255,255,0.20) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >ADNEXUSONE</p>
          </div>

          {/* Copyright + legal links */}
          <div className="order-2 sm:order-1 border-t border-white/[0.12] pt-5 mt-5 sm:mt-0">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center gap-2.5 sm:gap-0 sm:justify-between">
              <p className="text-xs text-gray-400 text-center sm:text-left">© 2026 Adnexusone. All rights reserved.</p>
              <div className="flex flex-wrap justify-center gap-5">
                {LEGAL_LINKS.map(({ l, h }) => (
                  <Link key={l} href={h} className="text-xs text-gray-400 hover:text-gray-200 transition-colors">{l}</Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ── LandingBottom — ONE shared background for CTA + Footer ─
   Use this instead of <LandingCTA /><LandingFooter /> on all pages.
   Single background image = no seam, proper fixed parallax on desktop,
   smooth scroll on mobile. ─────────────────────────────────── */
export function LandingBottom() {
  return (
    <div
      className="bg-fixed"
      style={{
        backgroundImage: BG_IMAGE,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundColor: '#020308',
      }}
    >
      <CTAContent />
      <FooterContent />
    </div>
  )
}

/* ── Legacy exports — kept so existing single-use imports don't break ─ */
export function LandingCTA() {
  return (
    <div
      className="bg-fixed"
      style={{ backgroundImage: BG_IMAGE, backgroundSize: 'cover', backgroundPosition: 'center center', backgroundColor: '#020308' }}
    >
      <CTAContent />
    </div>
  )
}

export function LandingFooter() {
  return (
    <div
      className="bg-fixed"
      style={{ backgroundImage: BG_IMAGE, backgroundSize: 'cover', backgroundPosition: 'center center', backgroundColor: '#020308' }}
    >
      <FooterContent />
    </div>
  )
}
