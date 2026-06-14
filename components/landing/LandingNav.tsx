'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  Zap, ChevronDown, Menu, X, ArrowRight,
  Cpu, Activity, Bell, FileText, Shield,
  Globe, ShoppingBag, Briefcase, Heart, Plane,
  BookOpen, MessageSquare, PlayCircle, Users,
  ChevronRight, LayoutGrid, Star, TrendingUp,
} from 'lucide-react'

type MenuKey = 'platform' | 'industries' | 'resources' | null

const USER_URL = process.env.NEXT_PUBLIC_USER_URL ?? ''

export function LandingNav() {
  const [activeMenu, setActiveMenu] = useState<MenuKey>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
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

  return (
    <>
      {/* ── Header ─────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(5,5,7,0.98)' : 'rgba(5,5,7,0.88)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: scrolled ? '0 1px 0 rgba(255,255,255,0.05), 0 4px 24px rgba(0,0,0,0.4)' : '0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        {/* Utility bar — collapses on scroll */}
        <div
          className="hidden lg:block overflow-hidden transition-all duration-300"
          style={{ height: scrolled ? '0px' : '36px' }}
        >
          <div className="max-w-7xl mx-auto px-6 h-9 flex items-center justify-between border-b border-white/[0.04]">
            <div className="flex items-center gap-6">
              {[
                { label: 'Partners',   href: '#'           },
                { label: 'Help Center',href: '/help-center' },
                { label: 'Contact Us', href: '/contact'     },
              ].map(({ label, href }) => (
                <Link key={label} href={href} className="text-xs text-gray-500 hover:text-gray-300 transition-colors duration-150">
                  {label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-gray-500">
                <span className="text-green-400 font-medium">New:</span> Amazon Ads diagnostics live
              </span>
            </div>
          </div>
        </div>

        {/* Main nav */}
        <div className="border-b border-white/[0.05]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-[15px] font-bold text-white tracking-tight">Adnexusone</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-0.5 flex-1">
              {([
                { key: 'platform',   label: 'Platform'   },
                { key: 'industries', label: 'Industries' },
              ] as { key: MenuKey; label: string }[]).map(({ key, label }) => (
                <button
                  key={key}
                  onMouseEnter={() => openMenu(key)}
                  onMouseLeave={closeMenu}
                  className={`flex items-center gap-1 px-4 py-2 text-sm rounded-lg transition-all duration-150 ${
                    activeMenu === key ? 'text-white bg-white/[0.08]' : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  {label}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeMenu === key ? 'rotate-180' : ''}`} />
                </button>
              ))}
              <Link href="/customers" className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/[0.05] rounded-lg transition-all duration-150">
                Customers
              </Link>
              <Link href="/ai-engine" className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg transition-all duration-150 font-semibold text-purple-400/90 hover:text-purple-300 hover:bg-purple-500/[0.08]">
                <Cpu className="w-3.5 h-3.5" />
                Adnexusone AI
                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded-full ml-0.5">New</span>
              </Link>
              <button
                onMouseEnter={() => openMenu('resources')}
                onMouseLeave={closeMenu}
                className={`flex items-center gap-1 px-4 py-2 text-sm rounded-lg transition-all duration-150 ${
                  activeMenu === 'resources' ? 'text-white bg-white/[0.08]' : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                Resources
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeMenu === 'resources' ? 'rotate-180' : ''}`} />
              </button>
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-3 shrink-0">
              <Link href={`${USER_URL}/login`} className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-2">
                Sign in
              </Link>
              <Link
                href={`${USER_URL}/signup`}
                className="btn-blue flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg"
              >
                Get started free
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Mobile controls */}
            <div className="flex lg:hidden items-center gap-2.5">
              <Link href={`${USER_URL}/signup`} className="btn-blue px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg">
                Free trial
              </Link>
              <button
                onClick={() => setMobileOpen(true)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.06] border border-white/[0.08] text-gray-300 hover:bg-white/[0.10] transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Platform mega menu ─────────────────────── */}
        <div
          className={`mega-menu ${activeMenu === 'platform' ? 'open' : ''}`}
          style={{ background: 'rgba(5,5,7,0.99)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
          onMouseEnter={keepOpen}
          onMouseLeave={closeMenu}
        >
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-4 gap-8">

              {/* Overview */}
              <div>
                <p className="text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-4">Overview</p>
                {[
                  { icon: LayoutGrid, label: 'Platform Overview', desc: 'The complete ad health OS for D2C brands', color: 'text-blue-400', bg: 'bg-blue-500/10', href: '/platform' },
                  { icon: Cpu, label: 'Adnexusone AI', desc: 'AI-written insights & fix recommendations', color: 'text-purple-400', bg: 'bg-purple-500/10', href: '/ai-engine' },
                ].map(({ icon: Icon, label, desc, color, bg, href }) => (
                  <Link key={label} href={href} className="group flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.05] transition-colors mb-1">
                    <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white mb-0.5">{label}</p>
                      <p className="text-xs text-gray-500 leading-snug">{desc}</p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Capabilities */}
              <div>
                <p className="text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-4">Capabilities</p>
                <div className="space-y-0.5">
                  {[
                    { icon: Activity,   label: 'Diagnostic Engine', desc: '30 checks per sync',   color: 'text-cyan-400',   href: '/platform/diagnostic-engine' },
                    { icon: Bell,       label: 'Real-time Alerts',  desc: 'Instant email alerts', color: 'text-amber-400',  href: '/platform/alerts' },
                    { icon: FileText,   label: 'Audit Reports',     desc: 'White-label PDFs',     color: 'text-green-400',  href: '/platform/audit-reports' },
                    { icon: Shield,     label: 'Health Scoring',    desc: 'Per-platform score',   color: 'text-rose-400',   href: '/platform/health-scoring' },
                    { icon: TrendingUp, label: 'Revenue Impact',    desc: 'Rupee cost per issue', color: 'text-blue-400',   href: '/platform/revenue-impact' },
                  ].map(({ icon: Icon, label, desc, color, href }) => (
                    <Link key={label} href={href} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.05] transition-colors group">
                      <Icon className={`w-4 h-4 ${color} shrink-0`} />
                      <div>
                        <p className="text-sm text-white">{label}</p>
                        <p className="text-xs text-gray-600">{desc}</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-700 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Channels */}
              <div>
                <p className="text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-4">Channels</p>
                <div className="space-y-1">
                  {[
                    {
                      label: 'Meta Ads', desc: 'Facebook & Instagram', href: '/platform/meta',
                      bg: 'bg-[#1877F2]/10 border border-[#1877F2]/20',
                      logo: (
                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      ),
                    },
                    {
                      label: 'Google Ads', desc: 'Search & Shopping', href: '/platform/google',
                      bg: 'bg-white/5 border border-white/10',
                      logo: (
                        <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                      ),
                    },
                    {
                      label: 'Amazon Ads', desc: 'Sponsored Products', href: '/platform/amazon',
                      bg: 'bg-[#FF9900]/10 border border-[#FF9900]/20',
                      logo: (
                        <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.438-2.186 1.438-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.7-3.182v.685zm3.186 7.705a.66.66 0 01-.76.074c-1.068-.886-1.258-1.295-1.845-2.137-1.763 1.795-3.012 2.332-5.301 2.332C6.783 18.064 5 16.31 5 13.436c0-2.24 1.213-3.764 2.94-4.508 1.497-.659 3.589-.775 5.188-.955v-.357c0-.654.051-1.428-.333-1.996-.336-.51-.979-.72-1.545-.72-1.051 0-1.99.539-2.218 1.657-.047.247-.23.491-.477.503l-2.67-.288c-.225-.051-.475-.232-.41-.576C6.109 3.61 8.862 3 11.312 3c1.254 0 2.891.333 3.879 1.282 1.254 1.178 1.134 2.75 1.134 4.463v4.039c0 1.213.503 1.746.977 2.401.166.233.202.511-.01.682l-1.148.928zm2.856 5.037c-2.888 1.883-7.059 2.888-10.651 2.888-5.025 0-9.551-1.854-12.975-4.954-.268-.242-.03-.572.293-.384 3.695 2.149 8.253 3.44 12.968 3.44 3.179 0 6.676-.66 9.893-2.026.484-.207.891.316.472.636z" fill="#FF9900"/>
                        </svg>
                      ),
                    },
                  ].map(({ logo, label, desc, bg, href }) => (
                    <Link key={label} href={href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.05] transition-colors group">
                      <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                        {logo}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{label}</p>
                        <p className="text-xs text-gray-500">{desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Start free */}
              <div>
                <p className="text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-4">Start today</p>
                <div className="p-5 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-purple-600/5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="relative flex h-2 w-2">
                      <span className="ping-ring text-green-400" />
                      <span className="w-2 h-2 rounded-full bg-green-400" />
                    </span>
                    <span className="text-xs text-green-400 font-medium">Free diagnostic available</span>
                  </div>
                  <p className="text-sm font-semibold text-white mb-1">Run a free scan now</p>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">See your ad health score and top issues in under 2 minutes. No credit card.</p>
                  <Link href="/signup" className="btn-blue flex items-center justify-center gap-1.5 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl w-full">
                    Start free scan <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Industries mega menu ───────────────────── */}
        <div
          className={`mega-menu ${activeMenu === 'industries' ? 'open' : ''}`}
          style={{ background: 'rgba(5,5,7,0.99)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
          onMouseEnter={keepOpen}
          onMouseLeave={closeMenu}
        >
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-4 gap-8">
              <div className="col-span-3 grid grid-cols-3 gap-2">
                <p className="col-span-3 text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-2">Industries we serve</p>
                {[
                  { icon: ShoppingBag, label: 'D2C E-commerce',      desc: 'Brands selling direct to consumer', color: 'text-blue-400',   bg: 'bg-blue-500/10',   href: '/industries/d2c-ecommerce' },
                  { icon: Globe,       label: 'Fashion & Lifestyle',  desc: 'Apparel, beauty, accessories',      color: 'text-pink-400',   bg: 'bg-pink-500/10',   href: '/industries/fashion-lifestyle' },
                  { icon: Heart,       label: 'Health & Wellness',    desc: 'Supplements and personal care',     color: 'text-red-400',    bg: 'bg-red-500/10',    href: '/industries/health-wellness' },
                  { icon: Briefcase,   label: 'Performance Agencies', desc: 'Agencies managing multiple brands', color: 'text-purple-400', bg: 'bg-purple-500/10', href: '/industries/performance-agencies' },
                  { icon: Plane,       label: 'Travel & Lifestyle',   desc: 'Travel, hospitality, experiences',  color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   href: '/industries/travel-lifestyle' },
                  { icon: Users,       label: 'Enterprise Brands',    desc: 'Large multi-channel spenders',      color: 'text-amber-400',  bg: 'bg-amber-500/10',  href: '/industries/enterprise-brands' },
                ].map(({ icon: Icon, label, desc, color, bg, href }) => (
                  <Link key={label} href={href} className="group flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.05] transition-colors">
                    <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white mb-0.5">{label}</p>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-4">Customer story</p>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}
                  </div>
                  <p className="text-sm text-gray-300 mb-4 leading-relaxed">"Recovered 3.2x ROAS in 30 days. A broken pixel was costing us 38K per month."</p>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-600/20 flex items-center justify-center text-xs font-bold text-blue-300">D</div>
                    <div>
                      <p className="text-xs font-medium text-white">D2C Skincare Brand</p>
                      <p className="text-xs text-gray-600">Meta Ads — Growth plan</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Resources mega menu ───────────────────── */}
        <div
          className={`mega-menu ${activeMenu === 'resources' ? 'open' : ''}`}
          style={{ background: 'rgba(5,5,7,0.99)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
          onMouseEnter={keepOpen}
          onMouseLeave={closeMenu}
        >
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-4 gap-8">
              <div className="col-span-2 grid grid-cols-2 gap-2">
                <p className="col-span-2 text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-2">Learn and grow</p>
                {[
                  { icon: BookOpen,       label: 'Blog',           desc: 'Insights and tips',       color: 'text-blue-400',   bg: 'bg-blue-500/10',   href: '/blog' },
                  { icon: PlayCircle,     label: 'Platform Tour',  desc: 'See Adnexusone in action',   color: 'text-green-400',  bg: 'bg-green-500/10',  href: '/platform-tour' },
                  { icon: FileText,       label: 'Case Studies',   desc: 'Real brand results',      color: 'text-purple-400', bg: 'bg-purple-500/10', href: '/case-studies' },
                  { icon: MessageSquare,  label: 'Help Center',    desc: 'Docs and support',        color: 'text-amber-400',  bg: 'bg-amber-500/10',  href: '/help-center' },
                ].map(({ icon: Icon, label, desc, color, bg, href }) => (
                  <Link key={label} href={href} className="group flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.05] transition-colors">
                    <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{label}</p>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                  </Link>
                ))}
              </div>

              <div>
                <p className="text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-4">Featured</p>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-900/30 to-purple-900/20 border border-blue-500/15">
                  <span className="inline-block px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-md mb-3">Guide</span>
                  <p className="text-sm font-semibold text-white mb-2 leading-snug">How to diagnose Meta ad fatigue before it kills your ROAS</p>
                  <p className="text-xs text-gray-500 mb-4">The 6 signals to watch every week.</p>
                  <Link href="#" className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                    Read guide <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-4">Tools</p>
                <div className="space-y-1">
                  {[
                    { label: 'Free Account Diagnostic', badge: 'Free', href: '/signup',  badgeColor: 'bg-green-500/15 text-green-400' },
                    { label: 'ROAS Calculator',          badge: 'New',  href: '/tools/roas-calculator',     badgeColor: 'bg-blue-500/15 text-blue-400' },
                    { label: 'Ad Health Scorecard',      badge: '',     href: '/tools/ad-health-scorecard', badgeColor: '' },
                  ].map(({ label, badge, href, badgeColor }) => (
                    <Link key={label} href={href} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.05] transition-colors group">
                      <p className="text-sm text-gray-300 group-hover:text-white transition-colors">{label}</p>
                      {badge && <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${badgeColor}`}>{badge}</span>}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Menu Overlay ─────────────────────── */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden transition-opacity duration-300 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Full-screen panel — slides in from left, InsiderOne style */}
        <div
          className={`absolute inset-0 flex flex-col transition-transform duration-[360ms] ease-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
          style={{ background: '#040407' }}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-5 h-16 border-b border-white/[0.08] shrink-0">
            <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-[15px] font-bold text-white tracking-tight">Adnexusone</span>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.06] border border-white/[0.08] text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav links — large uppercase with dividers */}
          <nav className="flex-1 overflow-y-auto">

            {/* Platform */}
            <div className="border-b border-white/[0.07]">
              <button
                onClick={() => setMobileExpanded(mobileExpanded === 'Platform' ? null : 'Platform')}
                className="w-full flex items-center justify-between px-5 py-5 group"
              >
                <span className="text-[1.55rem] font-black uppercase tracking-tight text-white group-hover:text-blue-300 transition-colors">Platform</span>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${mobileExpanded === 'Platform' ? 'rotate-180 text-blue-400' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${mobileExpanded === 'Platform' ? 'max-h-[600px]' : 'max-h-0'}`}>
                <div className="px-5 pb-6">
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3">OVERVIEW</p>
                  {[
                    { icon: LayoutGrid, label: 'Platform Overview', desc: 'The complete ad health OS for D2C brands', color: 'text-blue-400',   bg: 'bg-blue-500/10' },
                    { icon: Cpu,        label: 'Adnexusone AI',         desc: 'AI-written insights & fix recommendations',       color: 'text-purple-400', bg: 'bg-purple-500/10', href: '/ai-engine' },
                  ].map(({ icon: Icon, label, desc, color, bg, href }) => (
                    <Link key={label} href={href ?? '/platform'} onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3.5 py-3 rounded-xl hover:bg-white/[0.04] px-2 -mx-2 transition-colors">
                      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                      </div>
                    </Link>
                  ))}
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-5 mb-3">CAPABILITIES</p>
                  {[
                    { icon: Activity,   label: 'Diagnostic Engine', desc: '30 checks per sync',   color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   href: '/platform/diagnostic-engine' },
                    { icon: Bell,       label: 'Real-time Alerts',  desc: 'Instant email alerts', color: 'text-amber-400',  bg: 'bg-amber-500/10',  href: '/platform/alerts' },
                    { icon: FileText,   label: 'Audit Reports',     desc: 'White-label PDFs',     color: 'text-green-400',  bg: 'bg-green-500/10',  href: '/platform/audit-reports' },
                    { icon: Shield,     label: 'Health Scoring',    desc: 'Per-platform score',   color: 'text-rose-400',   bg: 'bg-rose-500/10',   href: '/platform/health-scoring' },
                  ].map(({ icon: Icon, label, desc, color, bg, href }) => (
                    <Link key={label} href={href} onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3.5 py-3 rounded-xl hover:bg-white/[0.04] px-2 -mx-2 transition-colors">
                      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Industries */}
            <div className="border-b border-white/[0.07]">
              <button
                onClick={() => setMobileExpanded(mobileExpanded === 'Industries' ? null : 'Industries')}
                className="w-full flex items-center justify-between px-5 py-5 group"
              >
                <span className="text-[1.55rem] font-black uppercase tracking-tight text-white group-hover:text-blue-300 transition-colors">Industries</span>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${mobileExpanded === 'Industries' ? 'rotate-180 text-blue-400' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${mobileExpanded === 'Industries' ? 'max-h-[700px]' : 'max-h-0'}`}>
                <div className="px-5 pb-6">
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3">INDUSTRIES WE SERVE</p>
                  {[
                    { icon: ShoppingBag, label: 'D2C E-commerce',      desc: 'Brands selling direct to consumer', color: 'text-blue-400',   bg: 'bg-blue-500/10',   href: '/industries/d2c-ecommerce' },
                    { icon: Globe,       label: 'Fashion & Lifestyle',  desc: 'Apparel, beauty, accessories',      color: 'text-pink-400',   bg: 'bg-pink-500/10',   href: '/industries/fashion-lifestyle' },
                    { icon: Heart,       label: 'Health & Wellness',    desc: 'Supplements and personal care',     color: 'text-red-400',    bg: 'bg-red-500/10',    href: '/industries/health-wellness' },
                    { icon: Briefcase,   label: 'Performance Agencies', desc: 'Agencies managing multiple brands', color: 'text-purple-400', bg: 'bg-purple-500/10', href: '/industries/performance-agencies' },
                    { icon: Plane,       label: 'Travel & Lifestyle',   desc: 'Travel, hospitality, experiences',  color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   href: '/industries/travel-lifestyle' },
                    { icon: Users,       label: 'Enterprise Brands',    desc: 'Large multi-channel spenders',      color: 'text-amber-400',  bg: 'bg-amber-500/10',  href: '/industries/enterprise-brands' },
                  ].map(({ icon: Icon, label, desc, color, bg, href }) => (
                    <Link key={label} href={href} onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3.5 py-3 rounded-xl hover:bg-white/[0.04] px-2 -mx-2 transition-colors">
                      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Adnexusone AI — direct link */}
            <Link href="/ai-engine" onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-5 py-5 border-b border-white/[0.07] group">
              <span className="text-[1.55rem] font-black uppercase tracking-tight text-purple-400 group-hover:text-purple-300 transition-colors flex items-center gap-3">
                Adnexusone AI
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full">New</span>
                <Cpu className="w-5 h-5 text-purple-400" />
              </div>
            </Link>

            {/* Customers — direct link */}
            <Link href="/customers" onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-5 py-5 border-b border-white/[0.07] group">
              <span className="text-[1.55rem] font-black uppercase tracking-tight text-white group-hover:text-blue-300 transition-colors">Customers</span>
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </Link>

            {/* Resources */}
            <div className="border-b border-white/[0.07]">
              <button
                onClick={() => setMobileExpanded(mobileExpanded === 'Resources' ? null : 'Resources')}
                className="w-full flex items-center justify-between px-5 py-5 group"
              >
                <span className="text-[1.55rem] font-black uppercase tracking-tight text-white group-hover:text-blue-300 transition-colors">Resources</span>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${mobileExpanded === 'Resources' ? 'rotate-180 text-blue-400' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${mobileExpanded === 'Resources' ? 'max-h-[450px]' : 'max-h-0'}`}>
                <div className="px-5 pb-6">
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3">LEARN & GROW</p>
                  {[
                    { icon: BookOpen,      label: 'Blog',          desc: 'Insights and tips for ad performance', color: 'text-blue-400',   bg: 'bg-blue-500/10',   href: '/blog' },
                    { icon: PlayCircle,    label: 'Platform Tour',  desc: 'See Adnexusone in action',                color: 'text-green-400',  bg: 'bg-green-500/10',  href: '/platform-tour' },
                    { icon: FileText,      label: 'Case Studies',   desc: 'Real brand results and stories',       color: 'text-purple-400', bg: 'bg-purple-500/10', href: '/case-studies' },
                    { icon: MessageSquare, label: 'Help Center',    desc: 'Docs, guides and support',             color: 'text-amber-400',  bg: 'bg-amber-500/10',  href: '/help-center' },
                  ].map(({ icon: Icon, label, desc, color, bg, href }) => (
                    <Link key={label} href={href} onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3.5 py-3 rounded-xl hover:bg-white/[0.04] px-2 -mx-2 transition-colors">
                      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing — direct link */}
            <Link href="/#pricing" onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-5 py-5 border-b border-white/[0.07] group">
              <span className="text-[1.55rem] font-black uppercase tracking-tight text-white group-hover:text-blue-300 transition-colors">Pricing</span>
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </Link>
          </nav>

          {/* Bottom CTAs */}
          <div className="px-5 py-6 border-t border-white/[0.08] space-y-3 shrink-0">
            <Link href={`${USER_URL}/login`} onClick={() => setMobileOpen(false)}
              className="block text-center text-sm font-medium text-gray-400 hover:text-white transition-colors py-2">
              Login
            </Link>
            <Link href={`${USER_URL}/signup`} onClick={() => setMobileOpen(false)}
              className="btn-blue flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-2xl text-[15px] shadow-lg shadow-blue-500/20 transition-opacity hover:opacity-90">
              Get started free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/platform" onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center w-full py-4 border border-white/[0.15] text-white text-[15px] font-semibold rounded-2xl hover:bg-white/[0.05] transition-colors">
              Platform Tour
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
