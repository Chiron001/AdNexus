'use client'
import React from 'react'
import Link from 'next/link'
import { ArrowRight, Star, TrendingUp, CheckCircle2, Quote } from 'lucide-react'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingCTA, LandingFooter } from '@/components/landing/LandingFooter'

const STATS = [
  { value: '340+', label: 'D2C brands using AdNexus' },
  { value: '₹18Cr+', label: 'monthly ad spend monitored' },
  { value: '3.4×', label: 'avg ROAS improvement' },
  { value: '92%', label: 'brands renew after 90 days' },
]

const TESTIMONIALS = [
  {
    quote: 'We had a broken Facebook Pixel for 3 weeks and had no idea. AdNexus caught it on the first sync. That one fix alone recovered ₹38K in misattributed spend and our ROAS jumped from 1.9× to 3.2× within two weeks.',
    name: 'Priya Sharma',
    role: 'Head of Growth',
    brand: 'D2C Skincare Brand',
    avatar: 'P',
    avatarColor: 'bg-pink-600',
    platform: 'Meta Ads',
    platformColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    metric: 'ROAS: 1.9× → 3.2×',
    stars: 5,
  },
  {
    quote: 'We manage 14 D2C brands. Before AdNexus, one person spent 6 hours per week just checking accounts manually. Now AdNexus surfaces every critical issue automatically and we send audit reports to clients in minutes.',
    name: 'Ananya Iyer',
    role: 'Founder',
    brand: 'Performance Marketing Agency',
    avatar: 'A',
    avatarColor: 'bg-purple-600',
    platform: 'Multi-platform',
    platformColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    metric: '6 hrs/week saved per AM',
    stars: 5,
  },
  {
    quote: 'Amazon ACOS was at 38% on our auto campaigns. AdNexus flagged 84 search terms with zero sales and ₹1.2L in wasted spend. We negated them, restructured the campaigns, and ACOS dropped to 21% in 3 weeks.',
    name: 'Rohan Desai',
    role: 'Head of E-commerce',
    brand: 'Home Decor D2C',
    avatar: 'R',
    avatarColor: 'bg-orange-600',
    platform: 'Amazon Ads',
    platformColor: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    metric: 'ACOS: 38% → 21%',
    stars: 5,
  },
  {
    quote: 'The real-time alert caught our budget exhausting at 2pm on a sale day — peak hour was still 4 hours away. We increased the budget immediately and captured traffic we would have completely missed. That day alone was worth the subscription.',
    name: 'Neha Joshi',
    role: 'Growth Manager',
    brand: 'Baby Products D2C',
    avatar: 'N',
    avatarColor: 'bg-teal-600',
    platform: 'Meta Ads',
    platformColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    metric: 'Peak-hour budget saved',
    stars: 5,
  },
  {
    quote: 'Ask AI is genuinely useful — not generic advice. I asked why our CPA spiked last week and it pulled from our actual account data and told me it was audience overlap between two ad sets that started cannibalising each other 6 days ago.',
    name: 'Vikram Nair',
    role: 'Head of Marketing',
    brand: 'D2C Wellness Brand',
    avatar: 'V',
    avatarColor: 'bg-cyan-700',
    platform: 'Meta Ads',
    platformColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    metric: 'CPA root cause in 30 sec',
    stars: 5,
  },
  {
    quote: 'Platform health score went from 58 to 84 in 45 days. We just fixed the issues in order — AdNexus ranked them by impact and we worked through the list. Systematic, not guesswork.',
    name: 'Shreya Kapoor',
    role: 'Performance Marketer',
    brand: 'Food & Snacks D2C',
    avatar: 'S',
    avatarColor: 'bg-emerald-700',
    platform: 'Google + Meta',
    platformColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    metric: 'Health score: 58 → 84',
    stars: 5,
  },
  {
    quote: 'We were scaling Google Shopping without realising non-brand ROAS was 1.3×. AdNexus exposed the brand/non-brand split and we restructured campaigns. Non-brand ROAS is now 2.8× and we know exactly where growth is coming from.',
    name: 'Karan Malhotra',
    role: 'Co-founder',
    brand: 'D2C Fitness Brand',
    avatar: 'K',
    avatarColor: 'bg-blue-700',
    platform: 'Google Ads',
    platformColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    metric: 'Non-brand ROAS: 1.3× → 2.8×',
    stars: 5,
  },
  {
    quote: 'The AI-generated audit reports are client-ready without editing. I used to spend 2 hours formatting a monthly report — now I click generate, review it in 5 minutes, and send. Clients comment that our reporting quality has gone up.',
    name: 'Meera Pillai',
    role: 'Agency Director',
    brand: 'Performance Marketing Agency',
    avatar: 'M',
    avatarColor: 'bg-rose-700',
    platform: 'Multi-platform',
    platformColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    metric: 'Report time: 2 hrs → 5 min',
    stars: 5,
  },
  {
    quote: "AdNexus flagged creative fatigue on our top-performing ad set before CTR tanked. The AI brief gave us a specific angle to test — we ran it, CTR doubled, and ROAS held. Without the early warning we would've wasted 10 more days on dead creative.",
    name: 'Rahul Mehta',
    role: 'Performance Lead',
    brand: 'Fashion D2C',
    avatar: 'R',
    avatarColor: 'bg-indigo-700',
    platform: 'Meta Ads',
    platformColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    metric: 'CTR 2× after AI brief',
    stars: 5,
  },
]

const CASE_SNIPPETS = [
  { industry: 'D2C Skincare', platform: 'Meta', before: '1.9× ROAS', after: '3.2× ROAS', issue: 'Broken Pixel', color: 'border-blue-500/20', dotColor: 'bg-blue-500', href: '/case-studies' },
  { industry: 'Fashion D2C', platform: 'Google', before: '1.3× non-brand', after: '2.8× non-brand', issue: 'Brand/Non-brand split', color: 'border-emerald-500/20', dotColor: 'bg-emerald-500', href: '/case-studies' },
  { industry: 'Home Decor', platform: 'Amazon', before: '38% ACOS', after: '21% ACOS', issue: 'Search term waste', color: 'border-orange-500/20', dotColor: 'bg-orange-500', href: '/case-studies' },
  { industry: 'Food & Snacks', platform: 'Multi', before: 'Health score 58', after: 'Health score 84', issue: 'Multiple issues', color: 'border-purple-500/20', dotColor: 'bg-purple-500', href: '/case-studies' },
]

const INDUSTRIES = [
  { label: 'D2C E-commerce', href: '/industries/d2c-ecommerce', color: 'bg-blue-500/10 border-blue-500/15' },
  { label: 'Fashion & Lifestyle', href: '/industries/fashion-lifestyle', color: 'bg-pink-500/10 border-pink-500/15' },
  { label: 'Health & Wellness', href: '/industries/health-wellness', color: 'bg-emerald-500/10 border-emerald-500/15' },
  { label: 'Performance Agencies', href: '/industries/performance-agencies', color: 'bg-purple-500/10 border-purple-500/15' },
  { label: 'Travel & Lifestyle', href: '/industries/travel-lifestyle', color: 'bg-cyan-500/10 border-cyan-500/15' },
  { label: 'Enterprise Brands', href: '/industries/enterprise-brands', color: 'bg-amber-500/10 border-amber-500/15' },
]

export default function CustomersPage() {
  return (
    <div className="min-h-screen text-white" style={{ background: '#070810' }}>
      <LandingNav />

      {/* Hero */}
      <section className="relative pt-36 pb-20 px-5 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -5%, rgba(99,102,241,0.13) 0%, transparent 55%)' }} />
        <div className="max-w-3xl mx-auto text-center relative">
          <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border mb-6 text-indigo-400 bg-indigo-500/10 border-indigo-500/20">
            <Star className="w-3 h-3 fill-indigo-400" /> Customer Stories
          </span>
          <h1 className="text-[2.2rem] sm:text-5xl font-extrabold tracking-tight leading-[1.05] mb-5">
            Brands that fixed what was<br /><span className="text-gradient animate-gradient">costing them the most</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed mb-10">
            Real results from D2C brands, agencies, and performance teams who use AdNexus to diagnose and fix their ad accounts — fast.
          </p>
          <Link href="/signup" className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-500/20 transition-all">
            Get your free diagnostic <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <div className="border-y border-white/[0.05] py-10 px-5 sm:px-6" style={{ background: 'rgba(4,5,14,0.7)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {STATS.map((s, i) => (
            <div key={i}>
              <p className="text-3xl font-black text-white mb-1">{s.value}</p>
              <p className="text-[11px] text-gray-500 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Case study snapshots */}
      <section className="py-20 px-5 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-8">Before & after — real accounts</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            {CASE_SNIPPETS.map((c, i) => (
              <div key={i} className={`bg-zinc-950/60 border rounded-2xl p-5 ${c.color}`}>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`w-1.5 h-1.5 rounded-full ${c.dotColor}`} />
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{c.platform} · {c.industry}</span>
                </div>
                <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">Issue found</p>
                <p className="text-xs font-semibold text-gray-300 mb-4">{c.issue}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-red-400">{c.before}</span>
                  <ArrowRight className="w-3 h-3 text-gray-600" />
                  <span className="text-sm font-bold text-emerald-400">{c.after}</span>
                </div>
              </div>
            ))}
          </div>
          <Link href="/case-studies" className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium">
            Read full case studies <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Testimonials grid */}
      <section className="pb-20 px-5 sm:px-6" style={{ background: 'rgba(4,5,14,0.4)' }}>
        <div className="max-w-6xl mx-auto pt-16">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-10">What customers say</p>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="break-inside-avoid bg-zinc-950/60 border border-white/[0.07] rounded-2xl p-6 hover:border-white/[0.12] transition-all">
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.stars)].map((_, j) => (
                    <Star key={j} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                {/* Quote */}
                <p className="text-sm text-gray-300 leading-relaxed mb-5">"{t.quote}"</p>
                {/* Metric badge */}
                <div className="mb-4">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-emerald-400">
                    <TrendingUp className="w-3 h-3" /> {t.metric}
                  </span>
                </div>
                {/* Person */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/[0.05]">
                  <div className={`w-8 h-8 rounded-full ${t.avatarColor} flex items-center justify-center text-xs font-black text-white shrink-0`}>{t.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{t.name}</p>
                    <p className="text-[10px] text-gray-500 truncate">{t.role} · {t.brand}</p>
                  </div>
                  <span className={`shrink-0 inline-flex text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${t.platformColor}`}>{t.platform}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries served */}
      <section className="py-20 px-5 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-8">Industries we work with</p>
          <div className="flex flex-wrap gap-3 mb-10">
            {INDUSTRIES.map((ind, i) => (
              <Link key={i} href={ind.href} className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold text-white hover:opacity-80 transition-opacity ${ind.color}`}>
                {ind.label} <ArrowRight className="w-3 h-3" />
              </Link>
            ))}
          </div>
          <div className="bg-zinc-950/60 border border-white/[0.07] rounded-2xl p-7 flex flex-col sm:flex-row items-center gap-6 justify-between">
            <div>
              <p className="text-base font-bold text-white mb-1">See what AdNexus finds in your account</p>
              <p className="text-sm text-gray-400">Free diagnostic. No credit card. Results in under 2 minutes.</p>
            </div>
            <Link href="/signup" className="shrink-0 inline-flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-500/20 transition-all">
              Run free diagnostic <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <LandingCTA />
      <LandingFooter />
    </div>
  )
}
