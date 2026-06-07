'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  Zap, ChevronDown, Menu, X, ArrowRight,
  LayoutGrid, Cpu, Activity, BarChart3, Bell, FileText,
  Globe, ShoppingBag, Briefcase, Plane, Sparkles, Heart,
  BookOpen, MessageSquare, PlayCircle, Users,
} from 'lucide-react'

type MenuKey = 'platform' | 'industries' | 'resources' | null

export function LandingNav() {
  const [activeMenu, setActiveMenu] = useState<MenuKey>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const openMenu = useCallback((key: MenuKey) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setActiveMenu(key)
  }, [])

  const closeMenu = useCallback(() => {
    timeoutRef.current = setTimeout(() => setActiveMenu(null), 150)
  }, [])

  const keepOpen = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  return (
    <>
      {/* Top utility bar */}
      <div className="hidden lg:block bg-[#050505] border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 h-9 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {['Partners', 'Help Center', 'Contact Us'].map((item) => (
              <a key={item} href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Login</Link>
            <span className="text-gray-700 text-xs">|</span>
            <span className="text-xs text-gray-500">English</span>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-[#080808]/95 backdrop-blur-xl shadow-lg shadow-black/40' : 'bg-[#080808]'
        } border-b border-white/[0.06]`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/40">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight text-white">AdNexus</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 flex-1" ref={menuRef}>
            {/* Platform */}
            <div
              className="relative"
              onMouseEnter={() => openMenu('platform')}
              onMouseLeave={closeMenu}
            >
              <button
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeMenu === 'platform' ? 'text-blue-400' : 'text-gray-300 hover:text-white'}`}
              >
                Platform
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeMenu === 'platform' ? 'rotate-180 text-blue-400' : ''}`} />
              </button>

              {/* Platform mega menu */}
              <div
                className={`mega-menu ${activeMenu === 'platform' ? 'open' : ''} absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[860px] bg-[#0C0C0E] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden`}
                onMouseEnter={keepOpen}
                onMouseLeave={closeMenu}
              >
                <div className="grid grid-cols-4 gap-0">
                  {/* Overview */}
                  <div className="p-6 border-r border-white/[0.05]">
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-4">Overview</p>
                    <div className="space-y-4">
                      <Link href="/platform" className="group flex gap-3" onClick={() => setActiveMenu(null)}>
                        <div className="w-9 h-9 rounded-lg bg-blue-600/15 border border-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600/25 transition-colors">
                          <LayoutGrid className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">Platform Overview</p>
                          <p className="text-xs text-gray-500 mt-0.5 leading-snug">Everything you need, all in one place</p>
                        </div>
                      </Link>
                      <Link href="/platform#integrations" className="group flex gap-3" onClick={() => setActiveMenu(null)}>
                        <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center flex-shrink-0 group-hover:bg-white/[0.08] transition-colors">
                          <Globe className="w-4 h-4 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">Integration Hub</p>
                          <p className="text-xs text-gray-500 mt-0.5 leading-snug">3 ad platforms connected instantly</p>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Capabilities */}
                  <div className="p-6 border-r border-white/[0.05]">
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-4">Capabilities</p>
                    <ul className="space-y-2.5">
                      {[
                        { icon: Cpu, label: 'AdNexus AI', href: '/platform#ai' },
                        { icon: Activity, label: 'Campaign Diagnostics', href: '/platform#diagnostics' },
                        { icon: BarChart3, label: 'Health Scoring', href: '/platform#health' },
                        { icon: Sparkles, label: 'Revenue Impact', href: '/platform#revenue' },
                        { icon: Bell, label: 'Alert Engine', href: '/platform#alerts' },
                        { icon: FileText, label: 'Audit Reports', href: '/platform#reports' },
                      ].map(({ icon: Icon, label, href }) => (
                        <li key={label}>
                          <Link href={href} className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-white transition-colors group" onClick={() => setActiveMenu(null)}>
                            <Icon className="w-3.5 h-3.5 text-gray-600 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                            {label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Channels */}
                  <div className="p-6 border-r border-white/[0.05]">
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-4">Channels</p>
                    <ul className="space-y-2.5">
                      {[
                        { label: 'Meta Ads', href: '/platform#meta' },
                        { label: 'Google Ads', href: '/platform#google' },
                        { label: 'Amazon Ads', href: '/platform#amazon' },
                        { label: 'Search Campaigns', href: '/platform#search' },
                        { label: 'Shopping Ads', href: '/platform#shopping' },
                        { label: 'Display Networks', href: '/platform#display' },
                      ].map(({ label, href }) => (
                        <li key={label}>
                          <Link href={href} className="text-sm text-gray-400 hover:text-white transition-colors" onClick={() => setActiveMenu(null)}>{label}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Why AdNexus */}
                  <div className="p-6 bg-white/[0.015]">
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-4">Why AdNexus</p>
                    <ul className="space-y-4">
                      {[
                        { label: 'Free Diagnostic', desc: 'Get your first account scan free', href: '/signup' },
                        { label: 'Why AdNexus', desc: 'What makes us different', href: '/platform#why' },
                        { label: 'Compare Tools', desc: 'vs Optmyzr, WordStream, others', href: '/platform#compare' },
                        { label: 'Migration Guide', desc: 'Switch in under 30 minutes', href: '/platform#migrate' },
                      ].map(({ label, desc, href }) => (
                        <li key={label}>
                          <Link href={href} className="group" onClick={() => setActiveMenu(null)}>
                            <p className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">{label}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Industries */}
            <div
              className="relative"
              onMouseEnter={() => openMenu('industries')}
              onMouseLeave={closeMenu}
            >
              <button className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeMenu === 'industries' ? 'text-blue-400' : 'text-gray-300 hover:text-white'}`}>
                Industries
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeMenu === 'industries' ? 'rotate-180 text-blue-400' : ''}`} />
              </button>

              <div
                className={`mega-menu ${activeMenu === 'industries' ? 'open' : ''} absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[620px] bg-[#0C0C0E] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden`}
                onMouseEnter={keepOpen}
                onMouseLeave={closeMenu}
              >
                <div className="flex">
                  {/* Featured story */}
                  <div className="w-52 flex-shrink-0 p-5 bg-gradient-to-br from-blue-900/30 to-purple-900/20 border-r border-white/[0.05]">
                    <p className="text-xs text-gray-500 mb-2">Success Story</p>
                    <div className="w-full aspect-video rounded-xl bg-gradient-to-br from-blue-800/40 to-blue-600/20 border border-white/[0.06] flex items-center justify-center mb-3">
                      <BarChart3 className="w-8 h-8 text-blue-400 opacity-60" />
                    </div>
                    <p className="text-xs font-semibold text-white">3.2x ROAS improvement in 30 days</p>
                    <p className="text-xs text-gray-500 mt-1">D2C Skincare Brand</p>
                  </div>

                  {/* Industry list */}
                  <div className="flex-1 p-6 grid grid-cols-2 gap-x-6 gap-y-4 content-start">
                    {[
                      { icon: ShoppingBag, label: 'Retail and E-commerce', desc: 'From first click to repeat purchase' },
                      { icon: Heart, label: 'Beauty and Cosmetics', desc: 'Precision, personalization, and style' },
                      { icon: Briefcase, label: 'D2C Brands', desc: 'Built for brands selling direct' },
                      { icon: Activity, label: 'Performance Agencies', desc: 'Manage 25 client accounts at once' },
                      { icon: Plane, label: 'Travel and Hospitality', desc: 'Drive bookings and ancillary revenue' },
                      { icon: Users, label: 'Health and Wellness', desc: 'Grow subscriptions and retention' },
                    ].map(({ icon: Icon, label, desc }) => (
                      <Link key={label} href="/customers" className="group" onClick={() => setActiveMenu(null)}>
                        <div className="flex items-start gap-2">
                          <Icon className="w-4 h-4 text-gray-600 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors leading-tight">{label}</p>
                            <p className="text-xs text-gray-500 mt-0.5 leading-snug">{desc}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Customers */}
            <Link href="/customers" className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white rounded-lg hover:bg-white/[0.04] transition-colors">
              Customers
            </Link>

            {/* Resources */}
            <div
              className="relative"
              onMouseEnter={() => openMenu('resources')}
              onMouseLeave={closeMenu}
            >
              <button className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeMenu === 'resources' ? 'text-blue-400' : 'text-gray-300 hover:text-white'}`}>
                Resources
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeMenu === 'resources' ? 'rotate-180 text-blue-400' : ''}`} />
              </button>

              <div
                className={`mega-menu ${activeMenu === 'resources' ? 'open' : ''} absolute top-full right-0 mt-2 w-[520px] bg-[#0C0C0E] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden`}
                onMouseEnter={keepOpen}
                onMouseLeave={closeMenu}
              >
                <div className="flex">
                  {/* Featured resource */}
                  <div className="w-48 flex-shrink-0 p-5 bg-gradient-to-br from-green-900/20 to-blue-900/20 border-r border-white/[0.05]">
                    <p className="text-xs text-gray-500 mb-2">Free Guide</p>
                    <div className="w-full aspect-video rounded-xl bg-gradient-to-br from-green-800/30 to-blue-800/20 border border-white/[0.06] flex items-center justify-center mb-3">
                      <FileText className="w-7 h-7 text-green-400 opacity-60" />
                    </div>
                    <p className="text-xs font-semibold text-white">The Complete Ad Account Audit Playbook 2026</p>
                  </div>

                  {/* Resource links */}
                  <div className="flex-1 p-6">
                    <div className="mb-5">
                      <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-3">Interactive Tools</p>
                      <ul className="space-y-2.5">
                        {[
                          { icon: Activity, label: 'Free Account Scan', desc: 'Get an instant health score' },
                          { icon: BarChart3, label: 'ROAS Calculator', desc: 'Model revenue improvement' },
                          { icon: FileText, label: 'Audit Template', desc: '30-point manual checklist' },
                        ].map(({ icon: Icon, label, desc }) => (
                          <li key={label}>
                            <Link href="/signup" className="group flex items-start gap-2.5" onClick={() => setActiveMenu(null)}>
                              <Icon className="w-3.5 h-3.5 text-gray-600 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">{label}</p>
                                <p className="text-xs text-gray-500">{desc}</p>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-3">Other Resources</p>
                      <ul className="space-y-2">
                        {[
                          { icon: BookOpen, label: 'Case Studies', href: '/customers' },
                          { icon: MessageSquare, label: 'Blog', href: '#resources' },
                          { icon: PlayCircle, label: 'Video Guides', href: '#resources' },
                          { icon: FileText, label: 'E-Books and Guides', href: '#resources' },
                        ].map(({ icon: Icon, label, href }) => (
                          <li key={label}>
                            <Link href={href} className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-white transition-colors group" onClick={() => setActiveMenu(null)}>
                              <Icon className="w-3.5 h-3.5 text-gray-600 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                              {label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            <Link href="/platform" className="px-4 py-2 text-sm font-medium border border-white/15 hover:border-white/30 text-white rounded-lg transition-colors hover:bg-white/[0.04]">
              Platform Tour
            </Link>
            <Link href="/signup" className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all shadow-lg shadow-blue-600/25 hover:-translate-y-0.5">
              Get started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-[#0C0C0C] border-t border-white/[0.06] max-h-[80vh] overflow-y-auto">
            <div className="px-4 py-4 space-y-1">
              {[
                { label: 'Platform', href: '/platform' },
                { label: 'Customers', href: '/customers' },
                { label: 'Pricing', href: '/#pricing' },
                { label: 'Resources', href: '/#resources' },
              ].map(({ label, href }) => (
                <Link key={label} href={href} onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm font-medium text-gray-300 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors">
                  {label}
                </Link>
              ))}
            </div>
            <div className="px-4 pb-4 pt-2 border-t border-white/[0.06] flex flex-col gap-2">
              <Link href="/login" className="block py-3 text-sm text-gray-400 text-center hover:text-white transition-colors" onClick={() => setMobileOpen(false)}>Sign in</Link>
              <Link href="/signup" className="block py-3 text-sm font-bold bg-blue-600 text-white rounded-xl text-center hover:bg-blue-500 transition-colors" onClick={() => setMobileOpen(false)}>Get started free</Link>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
