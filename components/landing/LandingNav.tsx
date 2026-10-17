'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  Zap, ChevronDown, Menu, X, ArrowRight,
  Cpu, Activity, Bell, FileText, Shield,
  Globe, ShoppingBag, Briefcase, Heart, Plane,
  BookOpen, MessageSquare, PlayCircle, Users,
  LayoutGrid, Star, TrendingUp, Calculator, Gauge,
} from 'lucide-react'
import { SiMeta, SiGoogleads } from 'react-icons/si'
import { FaAmazon } from 'react-icons/fa'
import { SiteEffects } from './SiteEffects'

type MenuKey = 'platform' | 'industries' | 'resources' | null

const USER_URL = process.env.NEXT_PUBLIC_USER_URL ?? ''

/* ── Menu data (shared by desktop dropdowns + mobile panel) ── */
const PLATFORM_OVERVIEW = [
  { icon: LayoutGrid, label: 'Platform Overview', desc: 'The complete ad health OS for D2C brands', href: '/platform' },
  { icon: Cpu,        label: 'Adnexusone AI',     desc: 'AI-written insights & fix recommendations', href: '/ai-engine' },
]
const PLATFORM_CAPS = [
  { icon: Activity,   label: 'Diagnostic Engine', desc: '30 checks per sync',    href: '/platform/diagnostic-engine' },
  { icon: Bell,       label: 'Real-time Alerts',  desc: 'Instant email alerts',  href: '/platform/alerts' },
  { icon: FileText,   label: 'Audit Reports',     desc: 'White-label PDFs',      href: '/platform/audit-reports' },
  { icon: Shield,     label: 'Health Scoring',    desc: 'Per-platform score',    href: '/platform/health-scoring' },
  { icon: TrendingUp, label: 'Revenue Impact',    desc: 'Dollar cost per issue', href: '/platform/revenue-impact' },
]
const CHANNELS = [
  { label: 'Meta Ads',   desc: 'Facebook & Instagram', href: '/platform/meta',   icon: <SiMeta size={16} aria-hidden="true" />,      color: '#0081FB' },
  { label: 'Google Ads', desc: 'Search & Shopping',    href: '/platform/google', icon: <SiGoogleads size={16} aria-hidden="true" />, color: '#4285F4' },
  { label: 'Amazon Ads', desc: 'Sponsored Products',   href: '/platform/amazon', icon: <FaAmazon size={16} aria-hidden="true" />,    color: '#FF9900' },
]
const INDUSTRIES = [
  { icon: ShoppingBag, label: 'D2C E-commerce',       desc: 'Brands selling direct to consumer', href: '/industries/d2c-ecommerce' },
  { icon: Globe,       label: 'Fashion & Lifestyle',  desc: 'Apparel, beauty, accessories',      href: '/industries/fashion-lifestyle' },
  { icon: Heart,       label: 'Health & Wellness',    desc: 'Supplements and personal care',     href: '/industries/health-wellness' },
  { icon: Briefcase,   label: 'Performance Agencies', desc: 'Agencies managing multiple brands', href: '/industries/performance-agencies' },
  { icon: Plane,       label: 'Travel & Lifestyle',   desc: 'Travel, hospitality, experiences',  href: '/industries/travel-lifestyle' },
  { icon: Users,       label: 'Enterprise Brands',    desc: 'Large multi-channel spenders',      href: '/industries/enterprise-brands' },
]
const RESOURCES = [
  { icon: BookOpen,      label: 'Blog',          desc: 'Insights and tips',        href: '/blog' },
  { icon: PlayCircle,    label: 'Platform Tour', desc: 'See Adnexusone in action', href: '/platform-tour' },
  { icon: FileText,      label: 'Case Studies',  desc: 'Real brand results',       href: '/case-studies' },
  { icon: MessageSquare, label: 'Help Center',   desc: 'Docs and support',         href: '/help-center' },
]
const TOOLS = [
  { icon: Gauge,      label: 'Free Account Diagnostic', badge: 'Free', href: `${USER_URL}/signup` },
  { icon: Calculator, label: 'ROAS Calculator',         badge: 'New',  href: '/tools/roas-calculator' },
  { icon: Shield,     label: 'Ad Health Scorecard',     badge: '',     href: '/tools/ad-health-scorecard' },
]

/* ── Brand mark ─────────────────────────────────── */
export function BrandMark({ dark = false, size = 'md' }: { dark?: boolean; size?: 'md' | 'lg' }) {
  const box = size === 'lg' ? 'w-10 h-10 rounded-xl' : 'w-8 h-8 rounded-[10px]'
  return (
    <span className="flex items-center gap-2.5">
      <span className={`${box} flex items-center justify-center shadow-lg shadow-indigo-500/30`} style={{ background: 'linear-gradient(135deg, var(--io-accent), var(--io-accent-2))' }}>
        <Zap className={size === 'lg' ? 'w-5 h-5 text-white' : 'w-4 h-4 text-white'} />
      </span>
      <span className={`io-display font-bold tracking-tight ${size === 'lg' ? 'text-lg' : 'text-[17px]'} ${dark ? 'text-[var(--io-ink)]' : 'text-white'}`}>
        Adnexus<span className="font-medium opacity-70">one</span>
      </span>
    </span>
  )
}

/* ── Dropdown row ───────────────────────────────── */
function MenuItem({ icon: Icon, label, desc, href }: { icon: typeof Zap; label: string; desc: string; href: string }) {
  return (
    <Link href={href} className="group flex items-start gap-3 p-3 rounded-2xl hover:bg-[var(--io-canvas)] transition-colors">
      <span className="w-9 h-9 rounded-xl bg-[var(--io-canvas)] group-hover:bg-white flex items-center justify-center shrink-0 transition-colors">
        <Icon className="w-4 h-4 text-[var(--io-accent)]" />
      </span>
      <span>
        <span className="block text-sm font-semibold text-[var(--io-ink)] mb-0.5">{label}</span>
        <span className="block text-xs text-[var(--io-ink-soft)] leading-snug">{desc}</span>
      </span>
    </Link>
  )
}

function ColTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold text-[var(--io-ink-soft)] uppercase tracking-[0.14em] mb-3 px-3">{children}</p>
}

export function LandingNav() {
  const [activeMenu, setActiveMenu] = useState<MenuKey>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const openMenu = useCallback((key: MenuKey) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setActiveMenu(key)
  }, [])

  const closeMenu = useCallback(() => {
    timeoutRef.current = setTimeout(() => setActiveMenu(null), 180)
  }, [])

  const keepOpen = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  const solid = scrolled || activeMenu !== null

  return (
    <>
      <SiteEffects />

      {/* ── Header ─────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-[background,box-shadow] duration-500"
        style={{
          background: solid ? 'rgba(11,10,20,0.86)' : 'transparent',
          backdropFilter: solid ? 'blur(18px) saturate(140%)' : 'none',
          WebkitBackdropFilter: solid ? 'blur(18px) saturate(140%)' : 'none',
          boxShadow: solid ? '0 1px 0 rgba(255,255,255,0.06)' : 'none',
        }}
      >
        {/* Utility bar — collapses on scroll */}
        <div
          className="hidden lg:block overflow-hidden transition-[height] duration-500"
          style={{ height: scrolled ? '0px' : '34px' }}
        >
          <div className="max-w-[1310px] mx-auto px-6 h-[34px] flex items-center justify-end gap-6">
            <span className="mr-auto flex items-center gap-2 text-xs text-white/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span><span className="text-white font-semibold">New:</span> Amazon Ads diagnostics are live</span>
              <Link href="/platform/amazon" className="text-white/80 hover:text-white underline underline-offset-2">Learn more</Link>
            </span>
            {[
              { label: 'Platform Tour', href: '/platform-tour' },
              { label: 'Customers',     href: '/customers' },
              { label: 'Help Center',   href: '/help-center' },
              { label: 'Contact Us',    href: '/contact' },
            ].map(({ label, href }) => (
              <Link key={label} href={href} className="io-underline text-xs text-white/60 hover:text-white transition-colors">{label}</Link>
            ))}
          </div>
        </div>

        {/* Main nav */}
        <div className="relative">
          <div className="max-w-[1310px] mx-auto px-4 sm:px-6 h-[68px] flex items-center justify-between gap-6">
            <Link href="/" className="shrink-0" aria-label="Adnexusone home">
              <BrandMark />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1 text-white/80">
              {([
                { key: 'platform',   label: 'Platform'   },
                { key: 'industries', label: 'Industries' },
              ] as { key: MenuKey; label: string }[]).map(({ key, label }) => (
                <button
                  key={key}
                  onMouseEnter={() => openMenu(key)}
                  onMouseLeave={closeMenu}
                  onFocus={() => openMenu(key)}
                  aria-expanded={activeMenu === key}
                  className={`io-header-link ${activeMenu === key ? 'bg-white/10 text-white' : 'hover:text-white hover:bg-white/[0.06]'}`}
                >
                  {label}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${activeMenu === key ? 'rotate-180' : ''}`} />
                </button>
              ))}
              <Link href="/customers" className="io-header-link hover:text-white hover:bg-white/[0.06]">Customers</Link>
              <Link href="/pricing" className="io-header-link hover:text-white hover:bg-white/[0.06]">Pricing</Link>
              <button
                onMouseEnter={() => openMenu('resources')}
                onMouseLeave={closeMenu}
                onFocus={() => openMenu('resources')}
                aria-expanded={activeMenu === 'resources'}
                className={`io-header-link ${activeMenu === 'resources' ? 'bg-white/10 text-white' : 'hover:text-white hover:bg-white/[0.06]'}`}
              >
                Resources
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${activeMenu === 'resources' ? 'rotate-180' : ''}`} />
              </button>
              <Link href="/ai-engine" className="io-header-link hover:bg-white/[0.06] text-white">
                <Cpu className="w-3.5 h-3.5 text-violet-300" />
                Adnexusone AI
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white ml-0.5" style={{ background: 'linear-gradient(90deg, var(--io-accent), var(--io-accent-2))' }}>NEW</span>
              </Link>
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              <Link href={`${USER_URL}/login`} className="text-sm text-white/80 hover:text-white transition-colors px-3 py-2">Sign in</Link>
              <Link href="/platform-tour" className="io-btn io-btn-ghost text-white !py-2.5 !px-4">Platform Tour</Link>
              <Link href={`${USER_URL}/signup`} className="io-btn io-btn-primary !py-2.5 !px-4">
                Get started free <ArrowRight className="io-arrow w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Mobile controls */}
            <div className="flex lg:hidden items-center gap-2">
              <Link href={`${USER_URL}/signup`} className="io-btn io-btn-primary !py-2.5 !px-4 !text-[13px]">Free trial</Link>
              <button
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 border border-white/15 text-white hover:bg-white/15 transition-colors"
              >
                <Menu className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* ── Platform dropdown ─────────────────────── */}
          <div className={`io-dropdown hidden lg:block ${activeMenu === 'platform' ? 'open' : ''}`} onMouseEnter={keepOpen} onMouseLeave={closeMenu}>
            <div className="bg-white rounded-[28px] p-6 shadow-[0_30px_80px_-20px_rgba(11,10,20,0.45)] grid grid-cols-[1fr_1fr_1fr_280px] gap-4">
              <div>
                <ColTitle>Overview</ColTitle>
                {PLATFORM_OVERVIEW.map(i => <MenuItem key={i.label} {...i} />)}
              </div>
              <div>
                <ColTitle>Capabilities</ColTitle>
                {PLATFORM_CAPS.slice(0, 3).map(i => <MenuItem key={i.label} {...i} />)}
              </div>
              <div>
                <ColTitle>Channels</ColTitle>
                {CHANNELS.map(({ label, desc, href, icon, color }) => (
                  <Link key={label} href={href} className="group flex items-center gap-3 p-3 rounded-2xl hover:bg-[var(--io-canvas)] transition-colors">
                    <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}14`, color }}>{icon}</span>
                    <span>
                      <span className="block text-sm font-semibold text-[var(--io-ink)]">{label}</span>
                      <span className="block text-xs text-[var(--io-ink-soft)]">{desc}</span>
                    </span>
                  </Link>
                ))}
                {PLATFORM_CAPS.slice(3).map(i => <MenuItem key={i.label} {...i} />)}
              </div>
              <div className="relative overflow-hidden rounded-[22px] p-6 text-white flex flex-col" style={{ background: 'radial-gradient(120% 80% at 100% 0%, rgba(124,58,237,.75), transparent 60%), radial-gradient(100% 80% at 0% 100%, rgba(59,91,253,.8), transparent 60%), #0B0A14' }}>
                <span className="inline-flex self-start items-center gap-1.5 text-[11px] font-semibold bg-white/15 rounded-full px-2.5 py-1 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Free diagnostic
                </span>
                <p className="io-display text-xl font-semibold leading-tight mb-2">Run a free scan in under 2 minutes</p>
                <p className="text-xs text-white/70 mb-5 leading-relaxed">See your ad health score and top issues. No credit card.</p>
                <Link href={`${USER_URL}/signup`} className="io-btn bg-white text-[var(--io-ink)] !py-2.5 mt-auto self-start">
                  Start free scan <ArrowRight className="io-arrow w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* ── Industries dropdown ───────────────────── */}
          <div className={`io-dropdown hidden lg:block ${activeMenu === 'industries' ? 'open' : ''}`} onMouseEnter={keepOpen} onMouseLeave={closeMenu}>
            <div className="bg-white rounded-[28px] p-6 shadow-[0_30px_80px_-20px_rgba(11,10,20,0.45)] grid grid-cols-[1fr_300px] gap-4">
              <div>
                <ColTitle>Industries we serve</ColTitle>
                <div className="grid grid-cols-3 gap-1">
                  {INDUSTRIES.map(i => <MenuItem key={i.label} {...i} />)}
                </div>
              </div>
              <div className="rounded-[22px] p-6 bg-[var(--io-canvas)] flex flex-col">
                <ColTitle>Customer story</ColTitle>
                <div className="flex mb-3 px-3">{[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}</div>
                <p className="io-display text-lg font-semibold text-[var(--io-ink)] leading-snug px-3 mb-4">&ldquo;Recovered 3.2x ROAS in 30 days. A broken pixel was costing us 38K per month.&rdquo;</p>
                <p className="text-xs text-[var(--io-ink-soft)] px-3 mb-4">D2C Skincare Brand · Meta Ads</p>
                <Link href="/case-studies" className="io-link text-[var(--io-accent)] px-3 mt-auto">Read the story <ArrowRight className="w-3.5 h-3.5" /></Link>
              </div>
            </div>
          </div>

          {/* ── Resources dropdown ────────────────────── */}
          <div className={`io-dropdown hidden lg:block ${activeMenu === 'resources' ? 'open' : ''}`} onMouseEnter={keepOpen} onMouseLeave={closeMenu}>
            <div className="bg-white rounded-[28px] p-6 shadow-[0_30px_80px_-20px_rgba(11,10,20,0.45)] grid grid-cols-[1fr_1fr_300px] gap-4">
              <div className="col-span-1">
                <ColTitle>Learn and grow</ColTitle>
                {RESOURCES.map(i => <MenuItem key={i.label} {...i} />)}
              </div>
              <div>
                <ColTitle>Free tools</ColTitle>
                {TOOLS.map(({ icon: Icon, label, badge, href }) => (
                  <Link key={label} href={href} className="group flex items-center gap-3 p-3 rounded-2xl hover:bg-[var(--io-canvas)] transition-colors">
                    <span className="w-9 h-9 rounded-xl bg-[var(--io-canvas)] group-hover:bg-white flex items-center justify-center shrink-0 transition-colors"><Icon className="w-4 h-4 text-[var(--io-accent)]" /></span>
                    <span className="text-sm font-semibold text-[var(--io-ink)] flex-1">{label}</span>
                    {badge && <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[var(--io-ink)] text-white">{badge}</span>}
                  </Link>
                ))}
              </div>
              <div className="relative overflow-hidden rounded-[22px] p-6 text-white flex flex-col" style={{ background: 'radial-gradient(100% 80% at 0% 0%, rgba(59,91,253,.85), transparent 60%), radial-gradient(100% 90% at 100% 100%, rgba(124,58,237,.8), transparent 60%), #0B0A14' }}>
                <span className="self-start text-[11px] font-semibold bg-white/15 rounded-full px-2.5 py-1 mb-4">Guide</span>
                <p className="io-display text-xl font-semibold leading-tight mb-2">How to diagnose Meta ad fatigue before it kills your ROAS</p>
                <p className="text-xs text-white/70 mb-5">The 6 signals to watch every week.</p>
                <Link href="/blog" className="io-link text-white mt-auto">Read guide <ArrowRight className="w-3.5 h-3.5" /></Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile menu ─────────────────────────────── */}
      <div className={`fixed inset-0 z-[60] lg:hidden transition-opacity duration-300 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div
          className={`absolute inset-0 flex flex-col io-canvas transition-transform duration-500 ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ transitionTimingFunction: 'var(--io-ease)' }}
        >
          <div className="flex items-center justify-between px-5 h-16 border-b border-[var(--io-line)] shrink-0">
            <Link href="/" onClick={() => setMobileOpen(false)} aria-label="Adnexusone home"><BrandMark dark /></Link>
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-[var(--io-line)] text-[var(--io-ink)]"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-5">
            {([
              { key: 'Platform',   groups: [{ title: 'Overview', items: PLATFORM_OVERVIEW }, { title: 'Capabilities', items: PLATFORM_CAPS }] },
              { key: 'Industries', groups: [{ title: 'Industries we serve', items: INDUSTRIES }] },
              { key: 'Resources',  groups: [{ title: 'Learn and grow', items: RESOURCES }] },
            ]).map(({ key, groups }) => (
              <div key={key} className="border-b border-[var(--io-line)]">
                <button
                  onClick={() => setMobileExpanded(mobileExpanded === key ? null : key)}
                  className="w-full flex items-center justify-between py-5"
                  aria-expanded={mobileExpanded === key}
                >
                  <span className="io-display text-2xl font-semibold text-[var(--io-ink)]">{key}</span>
                  <ChevronDown className={`w-5 h-5 text-[var(--io-ink-soft)] transition-transform duration-300 ${mobileExpanded === key ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-[max-height] duration-500 ${mobileExpanded === key ? 'max-h-[900px]' : 'max-h-0'}`}>
                  <div className="pb-5 -mx-3">
                    {groups.map(({ title, items }) => (
                      <div key={title} className="mb-2">
                        <ColTitle>{title}</ColTitle>
                        {items.map(i => (
                          <div key={i.label} onClick={() => setMobileOpen(false)}><MenuItem {...i} /></div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {[
              { label: 'Customers', href: '/customers' },
              { label: 'Pricing', href: '/pricing' },
              { label: 'Adnexusone AI', href: '/ai-engine' },
            ].map(({ label, href }) => (
              <Link key={label} href={href} onClick={() => setMobileOpen(false)} className="flex items-center justify-between py-5 border-b border-[var(--io-line)]">
                <span className={`io-display text-2xl font-semibold ${label === 'Adnexusone AI' ? 'io-grad-text' : 'text-[var(--io-ink)]'}`}>{label}</span>
                <ArrowRight className="w-5 h-5 text-[var(--io-ink-soft)]" />
              </Link>
            ))}
          </nav>

          <div className="px-5 py-5 border-t border-[var(--io-line)] grid grid-cols-2 gap-3 shrink-0">
            <Link href={`${USER_URL}/login`} onClick={() => setMobileOpen(false)} className="io-btn io-btn-ghost text-[var(--io-ink)] !py-3.5">Sign in</Link>
            <Link href={`${USER_URL}/signup`} onClick={() => setMobileOpen(false)} className="io-btn io-btn-primary !py-3.5">
              Get started <ArrowRight className="io-arrow w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
