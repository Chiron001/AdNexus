'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowRight, CheckCircle2, Activity, Bell, FileText,
  Cpu, Shield, TrendingUp, Star, ChevronRight, ChevronDown, Zap, BarChart3,
} from 'lucide-react'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingCTA, LandingFooter } from '@/components/landing/LandingFooter'

/* ── Scroll-reveal ─────────────────────────────── */
function useReveal(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('visible'); obs.disconnect() } },
      { threshold, rootMargin: '0px 0px -30px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return ref
}

/* ── Animated counter ──────────────────────────── */
function useCounter(target: number, duration = 1800) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        const start = Date.now()
        const tick = () => {
          const p = Math.min((Date.now() - start) / duration, 1)
          setCount(Math.round((1 - Math.pow(1 - p, 3)) * target))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [target, duration])
  return { ref, count }
}

/* ── Touch carousel ────────────────────────────── */
function Carousel({ items, renderItem, initialIndex = 0 }: {
  items: unknown[]
  renderItem: (item: unknown, i: number) => React.ReactNode
  initialIndex?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(initialIndex)

  const onScroll = useCallback(() => {
    const el = ref.current
    if (!el) return
    setActive(Math.round(el.scrollLeft / el.clientWidth))
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [onScroll])

  useEffect(() => {
    if (initialIndex === 0) return
    setTimeout(() => {
      const el = ref.current
      if (!el) return
      el.scrollLeft = initialIndex * el.clientWidth
    }, 50)
  }, [])

  const goTo = (i: number) => {
    if (!ref.current) return
    ref.current.scrollTo({ left: i * ref.current.clientWidth, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <div
        ref={ref}
        className="flex overflow-x-auto scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {items.map((item, i) => (
          <div key={i} className="w-full flex-shrink-0" style={{ scrollSnapAlign: 'start' }}>
            {renderItem(item, i)}
          </div>
        ))}
      </div>
      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-4 pb-1">
        {items.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? 'w-6 bg-blue-500' : 'w-1.5 bg-white/20'}`} />
        ))}
      </div>
    </div>
  )
}

/* ── Star fields (static) ──────────────────────── */
const GARDEN_STARS = Array.from({ length: 130 }, (_, i) => ({
  x: (i * 31 + 13) % 100,
  y: (i * 19 + 7) % 60,
  r: i % 7 === 0 ? 1.4 : i % 3 === 0 ? 0.9 : 0.6,
  op: 0.12 + (i % 6) * 0.07,
  dur: `${1.8 + (i % 5) * 0.65}s`,
  del: `${(i * 0.22) % 4}s`,
}))

const CTA_STARS = Array.from({ length: 100 }, (_, i) => ({
  x: (i * 37 + 5) % 100,
  y: (i * 23 + 9) % 65,
  r: i % 8 === 0 ? 1.4 : 0.7,
  op: 0.18 + (i % 5) * 0.1,
  dur: `${2 + (i % 4) * 0.9}s`,
  del: `${(i * 0.28) % 4}s`,
}))

const SCAN_CHECKS = [
  { text: 'Creative fatigue — Ad Set #4',       val: '₹42K', c: 'bg-red-500/15 text-red-400' },
  { text: 'Broken pixel tracking',              val: '₹38K', c: 'bg-red-500/15 text-red-400' },
  { text: 'Frequency cap exceeded — 3 sets',   val: '₹21K', c: 'bg-amber-500/15 text-amber-400' },
  { text: 'Keyword cannibalization — 14 pairs', val: '₹18K', c: 'bg-amber-500/15 text-amber-400' },
  { text: 'High ACOS — Auto campaigns',         val: '₹12K', c: 'bg-yellow-500/15 text-yellow-500' },
  { text: 'Zero-conversion ASINs',              val: '₹9K',  c: 'bg-yellow-500/15 text-yellow-500' },
  { text: 'Audience overlap — 6 ad sets',       val: '₹7K',  c: 'bg-yellow-500/15 text-yellow-500' },
  { text: 'Low quality score — 4 keywords',     val: '₹6K',  c: 'bg-zinc-500/15 text-zinc-400' },
  { text: 'Budget pacing off — Google Ads',     val: '₹5K',  c: 'bg-zinc-500/15 text-zinc-400' },
  { text: 'Landing page speed < 2s',            val: '₹4K',  c: 'bg-zinc-500/15 text-zinc-400' },
]

const AI_FIX_TEXT = 'Pause 3 fatigued creatives, upload 2 fresh variants with different visual angles, set frequency cap to 3/week. Expected: +0.8x ROAS recovery in 7 days.'

/* ── Particles (static, defined outside component) ─ */
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  left: `${(i * 19 + 7) % 100}%`,
  top:  `${(i * 13 + 11) % 100}%`,
  size: i % 4 === 0 ? 3 : 2,
  opacity: 0.05 + (i % 4) * 0.03,
  dur: `${4 + (i % 5)}s`,
  delay: `${((i * 0.4) % 4).toFixed(1)}s`,
}))

/* ── Hero tab data ─────────────────────────────── */
interface HeroPlatformEntry {
  color: string; score: number; scoreColor: string; issues: number; risk: string
  items: Array<{ tag: string; issue: string; val: string; c: string }>
}
type HeroTab = 'Meta' | 'Google' | 'Amazon'
const HERO_PLATFORM_DATA: Record<HeroTab, HeroPlatformEntry> = {
  Meta:   { color:'#2563eb', score:64, scoreColor:'text-amber-400', issues:12, risk:'₹1,17,000', items:[
    {tag:'Critical',issue:'Creative fatigue — Ad Set #4',    val:'₹42K',c:'bg-red-500/15 text-red-400'},
    {tag:'Critical',issue:'Broken pixel tracking',           val:'₹38K',c:'bg-red-500/15 text-red-400'},
    {tag:'High',    issue:'Frequency cap exceeded — 3 sets', val:'₹21K',c:'bg-amber-500/15 text-amber-400'},
  ]},
  Google: { color:'#16a34a', score:58, scoreColor:'text-red-400',   issues: 8, risk:'₹84,000', items:[
    {tag:'Critical',issue:'Conversion tracking broken',           val:'₹31K',c:'bg-red-500/15 text-red-400'},
    {tag:'High',    issue:'Keyword cannibalization — 14 pairs',   val:'₹28K',c:'bg-amber-500/15 text-amber-400'},
    {tag:'Medium',  issue:'Quality score below 4 — 11 keywords',  val:'₹16K',c:'bg-yellow-500/15 text-yellow-500'},
  ]},
  Amazon: { color:'#ea580c', score:71, scoreColor:'text-green-400', issues: 5, risk:'₹52,000', items:[
    {tag:'High',  issue:'ACOS above target — Auto campaigns', val:'₹22K',c:'bg-amber-500/15 text-amber-400'},
    {tag:'High',  issue:'Auto vs manual overlap — 8 ASINs',   val:'₹18K',c:'bg-amber-500/15 text-amber-400'},
    {tag:'Medium',issue:'Zero-conversion ASINs — 3 products', val:'₹12K',c:'bg-yellow-500/15 text-yellow-500'},
  ]},
}

/* ── Data ──────────────────────────────────────── */
const BRANDS = ['Nykaa','Mamaearth','boAt','WOW Skin','Lenskart','Bewakoof','Clovia','mCaffeine','Plum','The Moms Co','Sugar Cosmetics','Noise','Himalaya','Dabur','OZiva','Marico']

const PLATFORM_CARDS = [
  { name:'Meta Ads', letter:'M', gradient:'from-blue-600 to-blue-800', glow:'rgba(37,99,235,0.2)', desc:'Creative fatigue, audience overlap, pixel issues, budget drain — all detected and ranked by rupee impact.', checks:['Creative fatigue detection','Audience overlap analysis','Frequency cap violations','Pixel event tracking gaps','Budget pacing issues','Underperforming ad sets'] },
  { name:'Google Ads', letter:'G', gradient:'from-green-600 to-green-800', glow:'rgba(22,163,74,0.2)', desc:'Quality scores, impression share, keyword overlap, bid strategy health — all monitored every day.', checks:['Quality score monitoring','Impression share lost','Keyword cannibalization','Conversion tracking breaks','Zero-conversion keywords','Broad match overuse'] },
  { name:'Amazon Ads', letter:'A', gradient:'from-orange-500 to-orange-700', glow:'rgba(249,115,22,0.2)', desc:'ACOS creep, auto vs manual overlap, spend concentration, missing keyword coverage — all caught early.', checks:['High ACOS campaigns','Missing branded keywords','Spend concentration risk','Auto vs manual overlap','Zero-conversion ASINs','Bid adjustment gaps'] },
]

const FEATURE_CARDS = [
  { icon:Cpu,      color:'text-blue-400',   bg:'bg-blue-500/10 border-blue-500/20',   title:'Connect in 2 minutes',        desc:'One-click OAuth for Meta, Google, and Amazon Ads. No API keys. No manual exports. First scan runs immediately.' },
  { icon:Bell,     color:'text-amber-400',  bg:'bg-amber-500/10 border-amber-500/20', title:'30 checks every sync',        desc:'Creative fatigue, zero-conversion spend, broken tracking, keyword cannibalization, high ACOS — all caught automatically.' },
  { icon:Activity, color:'text-cyan-400',   bg:'bg-cyan-500/10 border-cyan-500/20',   title:'Daily health score',          desc:'One number per platform. Share in standups without the 2-hour audit. Know exactly where to focus today.' },
  { icon:Bell,     color:'text-rose-400',   bg:'bg-rose-500/10 border-rose-500/20',   title:'Instant email alerts',        desc:'Critical issues trigger an alert the moment they appear — with context and next steps so your team acts fast.' },
  { icon:FileText, color:'text-green-400',  bg:'bg-green-500/10 border-green-500/20', title:'Audit reports clients trust', desc:'One-click PDF reports with health scores, issue breakdowns, and AI recommendations. Client-ready in seconds.' },
  { icon:Shield,   color:'text-purple-400', bg:'bg-purple-500/10 border-purple-500/20',title:'Rupee impact on every issue',desc:'Every problem shows an estimated monthly cost based on your actual spend and performance data.' },
]

const CASE_STUDIES = [
  {
    metric:'3.2x', label:'ROAS improvement', brand:'D2C Skincare Brand', platform:'Meta Ads',
    quote:'Broken conversion tracking was costing us ₹38,000 per month. Adnexusone found it in the first scan. Fixed in one day.',
    gradientFrom:'#0d1a35', gradientTo:'#060810', glowColor:'rgba(37,99,235,0.7)', glowColor2:'rgba(124,58,237,0.4)', initial:'S',
  },
  {
    metric:'62%', label:'reduction in wasted spend', brand:'Fashion E-commerce', platform:'Google Ads',
    quote:'Keyword cannibalization was eating over a lakh per month. We had no idea our own campaigns were fighting each other.',
    gradientFrom:'#0a1f0d', gradientTo:'#060a06', glowColor:'rgba(22,163,74,0.7)', glowColor2:'rgba(5,150,105,0.4)', initial:'F',
  },
  {
    metric:'41%', label:'ACOS improvement', brand:'Health Supplements', platform:'Amazon Ads',
    quote:'Our auto campaigns were cannibalizing the manual ones. Adnexusone caught it immediately and the fix took 20 minutes.',
    gradientFrom:'#1f1005', gradientTo:'#0a0604', glowColor:'rgba(249,115,22,0.7)', glowColor2:'rgba(217,119,6,0.4)', initial:'H',
  },
]

const TESTIMONIALS = [
  { role:'Performance Marketer', company:'D2C Brand',           quote:'I used to spend 2 hours every Monday on manual audits. Adnexusone does the same in 2 minutes and catches things I missed.',                                       avatar:'P', color:'from-blue-600 to-indigo-600'   },
  { role:'Head of Growth',       company:'E-commerce Brand',    quote:'The revenue impact ranking is what sold me. I know exactly which problem to fix first and what it costs every day it sits unfixed.',                            avatar:'H', color:'from-purple-600 to-pink-600'   },
  { role:'Agency Founder',       company:'Performance Agency',  quote:'We manage 18 client accounts. Adnexusone lets us catch issues before clients notice. That has been huge for retention.',                                            avatar:'F', color:'from-emerald-600 to-teal-600'  },
  { role:'Growth Lead',          company:'Fashion D2C',         quote:'Our Meta spend was bleeding ₹40K/month on a fatigued creative. Adnexusone caught it on day one. The tool paid for itself in the first week.',                      avatar:'G', color:'from-rose-600 to-orange-600'  },
  { role:'Co-founder & CMO',     company:'Health Brand',        quote:'Keyword cannibalization on Google was something we never had time to audit. Now Adnexusone checks it every single day while we sleep.',                            avatar:'C', color:'from-cyan-600 to-blue-600'    },
  { role:'Media Buyer',          company:'D2C Accessories',     quote:'I recommended Adnexusone to every founder I know. Three months in, our ROAS is up 2.8x. The AI fixes are specific and they actually work.',                        avatar:'M', color:'from-violet-600 to-purple-600' },
  { role:'Digital Marketing Head',company:'Lifestyle Brand',   quote:'Amazon ACOS was 68% on our auto campaigns. Adnexusone flagged it in the first sync. Now we are at 32% — the margin difference is insane.',                         avatar:'D', color:'from-green-600 to-emerald-600' },
  { role:'Founder',              company:'Skincare Brand',      quote:'As a solo founder without a dedicated performance team, Adnexusone is like having a senior media buyer watching my accounts 24/7. Worth every rupee.',             avatar:'N', color:'from-amber-600 to-yellow-600'  },
]

/* ── Pricing plans ─────────────────────────────── */
const PRICING_PLANS = [
  {
    name: 'Free', price: '0', per: 'forever',
    desc: 'For brands getting started with ad diagnostics.',
    features: ['1 ad account', '10 diagnostic checks', 'Weekly digest email', 'Basic health score'],
    allFeatures: ['Meta Ads support', 'Manual scan trigger', 'Issue summary dashboard', 'Community support'],
    cta: 'Start for free', href: '/signup', highlight: false, custom: false,
  },
  {
    name: 'Growth', price: '2,999', per: 'per month',
    desc: 'For brands running serious ad budgets across platforms.',
    features: ['5 ad accounts', 'All 30 diagnostic checks', 'Daily auto-syncs', 'AI-written fixes'],
    allFeatures: ['Meta, Google & Amazon', 'PDF audit reports', 'Instant email alerts', 'Revenue impact per issue', '90-day issue history', 'Slack notifications'],
    cta: 'Start Growth plan', href: '/signup?plan=growth', highlight: true, custom: false,
  },
  {
    name: 'Professional', price: '9,999', per: 'per month',
    desc: 'For agencies managing multiple client ad accounts.',
    features: ['15 ad accounts', 'All Growth features', 'White-label PDFs', 'Priority support'],
    allFeatures: ['API access', 'Team collaboration', 'Client portal', 'Custom branding', 'Issue assignment', 'Multi-user roles', 'Dedicated onboarding', 'SLA commitment'],
    cta: 'Start Professional plan', href: '/signup?plan=agency', highlight: false, custom: false,
  },
  {
    name: 'Custom', price: 'Custom', per: 'contact for pricing',
    desc: 'For enterprise brands and large agencies with bespoke needs.',
    features: ['Unlimited ad accounts', 'All Professional features', 'Dedicated account manager', 'Custom integrations'],
    allFeatures: ['Custom SLA', 'On-premise option', 'Security audit', 'Team training', 'Custom reporting', 'Enterprise SSO', 'Priority engineering', 'Quarterly reviews'],
    cta: 'Contact us', href: '/contact', highlight: false, custom: true,
  },
]

/* ── Page ──────────────────────────────────────── */
export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const s1 = useReveal(), s2 = useReveal(), s3 = useReveal(), s4 = useReveal()
  const s5 = useReveal(), s6 = useReveal(), s7 = useReveal(), s8 = useReveal(), s9 = useReveal()
  const sAI = useReveal()
  const c1 = useCounter(30), c2 = useCounter(3), c3 = useCounter(62), c4 = useCounter(1000)
  const [heroTab, setHeroTab] = useState<HeroTab>('Meta')
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null)

  const [scanStep, setScanStep] = useState(0)
  const [aiTypedIdx, setAiTypedIdx] = useState(0)
  const heroData = HERO_PLATFORM_DATA[heroTab]

  const cinematicRef = useRef<HTMLDivElement>(null)
  const cinematicInnerRef = useRef<HTMLDivElement>(null)
  const cinematicSceneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    heroRef.current?.querySelectorAll('.hero-animate').forEach((el, i) => {
      ;(el as HTMLElement).style.animationDelay = `${i * 0.13}s`
    })
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const wrap = cinematicRef.current
      const scene = cinematicSceneRef.current
      if (!wrap || !scene) return
      const scrolled = -wrap.getBoundingClientRect().top
      const total = Math.max(wrap.offsetHeight - window.innerHeight, 1)
      const p = Math.max(0, Math.min(1, scrolled / (total * 0.88)))
      scene.style.transform = `scale(${1 + p * 0.3})`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setScanStep(p => (p + 1) % 10), 1400)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (aiTypedIdx >= AI_FIX_TEXT.length) {
      const t = setTimeout(() => setAiTypedIdx(0), 2200)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setAiTypedIdx(p => p + 1), 38)
    return () => clearTimeout(t)
  }, [aiTypedIdx])

  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden relative">
      <LandingNav />

      {/* Ambient aurora — sits behind all sections, scrolls with page */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="aurora-orb" style={{ width:'900px', height:'700px', top:'3%',  left:'12%',  background:'rgba(37,99,235,0.07)',   animation:'orbFloat1 20s ease-in-out infinite' }} />
        <div className="aurora-orb" style={{ width:'700px', height:'800px', top:'28%', right:'-6%', background:'rgba(124,58,237,0.055)', animation:'orbFloat2 26s -5s ease-in-out infinite' }} />
        <div className="aurora-orb" style={{ width:'600px', height:'600px', top:'58%', left:'-4%',  background:'rgba(5,150,105,0.045)',  animation:'orbFloat3 18s -3s ease-in-out infinite' }} />
        <div className="aurora-orb" style={{ width:'800px', height:'500px', top:'82%', right:'8%',  background:'rgba(37,99,235,0.05)',   animation:'orbFloat4 22s -9s ease-in-out infinite' }} />
      </div>
      {/* Grain texture — premium tactile feel */}
      <div className="noise-overlay" />
      {/* Fixed night star field — subtle depth layer */}
      <div className="night-star-field" />

      {/* ── Hero ───────────────────────────────────── */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-12 lg:pt-10 lg:pb-0"
        style={{ background:'radial-gradient(ellipse 130% 90% at 70% 50%, rgba(12,7,3,0.98) 0%, #080808 55%), radial-gradient(ellipse 60% 80% at 80% 25%, rgba(37,99,235,0.22) 0%, transparent 65%)' }}
      >
        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage:'linear-gradient(rgba(255,255,255,0.013) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.013) 1px, transparent 1px)', backgroundSize:'64px 64px' }} />

        {/* Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {PARTICLES.map((p, i) => (
            <div key={i} className="absolute rounded-full bg-blue-400 particle"
              style={{ left:p.left, top:p.top, width:p.size, height:p.size, opacity:p.opacity,
                ['--p-opacity' as string]:p.opacity, ['--p-dur' as string]:p.dur, ['--p-delay' as string]:p.delay }} />
          ))}
        </div>

        {/* Glow orbs */}
        <div className="absolute top-20 right-[10%] w-96 h-96 rounded-full opacity-[0.18] pointer-events-none" style={{ background:'radial-gradient(circle, rgba(37,99,235,1) 0%, transparent 70%)', filter:'blur(50px)' }} />
        <div className="absolute bottom-20 right-[30%] w-56 h-56 rounded-full opacity-[0.13] pointer-events-none" style={{ background:'radial-gradient(circle, rgba(124,58,237,1) 0%, transparent 70%)', filter:'blur(40px)' }} />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-6 w-full" ref={heroRef}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

            {/* Left */}
            <div>
              <div className="hero-animate animate-fade-up inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-xs font-semibold text-gray-400 mb-6 sm:mb-8">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="ping-ring text-green-400" />
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                </span>
                The leading Ad Account Diagnostics Platform
              </div>

              <h1 className="hero-animate animate-fade-up text-[2rem] sm:text-5xl lg:text-[4.2rem] font-extrabold tracking-tight leading-[1.06] mb-5">
                Move from spend
                <br />
                to{' '}
                <span className="text-gradient animate-gradient">unstoppable</span>
              </h1>

              <p className="hero-animate animate-fade-up text-base sm:text-lg text-gray-400 max-w-lg leading-relaxed mb-8">
                Stop guessing why your ROAS is dropping. Adnexusone runs 30 diagnostic checks across Meta, Google, and Amazon Ads, ranks every problem by rupee impact, and gives your team an AI-written fix in minutes.
              </p>

              <div className="hero-animate animate-fade-up flex flex-col sm:flex-row gap-3 mb-7">
                <div className="flex items-stretch bg-white/[0.05] border border-white/10 rounded-xl overflow-hidden w-full sm:max-w-md">
                  <input type="email" placeholder="Enter your work email" className="flex-1 px-4 py-3.5 bg-transparent text-sm text-white placeholder-gray-600 outline-none min-w-0" />
                  <Link href="/signup" className="btn-blue flex items-center gap-1.5 px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold whitespace-nowrap transition-colors">
                    Get started <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Social proof */}
              <div className="hero-animate animate-fade-up flex items-center gap-4">
                <div className="flex -space-x-2">
                  {['#2563eb','#7c3aed','#059669','#dc2626','#d97706'].map((color, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#080808] flex items-center justify-center text-[10px] font-bold text-white" style={{ background:color }}>
                      {['P','M','S','A','R'][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-0.5">
                    {[...Array(5)].map((_,i) => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}
                    <span className="text-xs font-bold text-white ml-1">4.9</span>
                  </div>
                  <p className="text-xs text-gray-500">Trusted by 1,000+ D2C brands</p>
                </div>
              </div>
            </div>

            {/* Right — floating UI (desktop only) */}
            <div className="relative hidden lg:block h-[520px]">
              <div className="animate-float absolute top-0 right-0 w-80 rounded-2xl border border-white/[0.09] overflow-hidden shadow-2xl shadow-black/70" style={{ background:'rgba(10,10,14,0.97)', backdropFilter:'blur(20px)' }}>
                {/* Diagnostic scan line */}
                <div className="scan-line" />
                <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                    <p className="text-xs font-semibold text-white">Issues by Impact</p>
                  </div>
                  <span className="text-[11px] text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded-md">12 open</span>
                </div>
                <div className="p-3 space-y-1.5">
                  {[
                    {tag:'Critical',issue:'Creative fatigue — Meta Ad Set #4',val:'₹42K/mo',c:'bg-red-500/15 text-red-400'},
                    {tag:'Critical',issue:'Broken conversion tracking — Google',val:'₹38K/mo',c:'bg-red-500/15 text-red-400'},
                    {tag:'High',issue:'ACOS above target — Amazon Auto',val:'₹21K/mo',c:'bg-amber-500/15 text-amber-400'},
                    {tag:'High',issue:'Quality score below 4 — 11 keywords',val:'₹16K/mo',c:'bg-amber-500/15 text-amber-400'},
                    {tag:'Medium',issue:'Frequency cap exceeded — 3 ad sets',val:'₹9K/mo',c:'bg-yellow-500/15 text-yellow-500'},
                  ].map(({ tag, issue, val, c }) => (
                    <div key={issue} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/[0.04] transition-colors">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${c}`}>{tag}</span>
                      <p className="text-xs text-gray-300 flex-1 truncate">{issue}</p>
                      <span className="text-xs font-bold text-red-400 shrink-0 tabular-nums">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="animate-float-delay absolute bottom-10 left-0 w-52 rounded-2xl border border-white/[0.09] p-4 shadow-2xl" style={{ background:'rgba(10,10,14,0.97)', backdropFilter:'blur(20px)' }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-gray-500 font-medium">Platform Health</p>
                  <span className="text-xs text-amber-400 font-semibold">⚠ Attention</span>
                </div>
                <div className="space-y-3">
                  {[{name:'Meta',score:64,color:'#f59e0b'},{name:'Google',score:58,color:'#ef4444'},{name:'Amazon',score:71,color:'#22c55e'}].map(({ name, score, color }) => (
                    <div key={name}>
                      <div className="flex justify-between mb-1"><span className="text-xs text-gray-400">{name}</span><span className="text-xs font-bold tabular-nums" style={{ color }}>{score}</span></div>
                      <div className="h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
                        <div className="h-full rounded-full" style={{ width:`${score}%`, background:color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="animate-float-slow absolute top-48 left-6 w-60 rounded-2xl border border-blue-500/20 p-4" style={{ background:'rgba(10,10,14,0.97)', backdropFilter:'blur(20px)', boxShadow:'0 0 40px rgba(37,99,235,0.15)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-md bg-purple-500/20 flex items-center justify-center"><Cpu className="w-3.5 h-3.5 text-purple-400" /></div>
                  <p className="text-xs font-bold text-white">AI Fix Ready</p>
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 bg-green-500/15 text-green-400 rounded font-bold">New</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">Pause 3 fatigued creatives, upload 2 fresh variants, set frequency cap to 3/week.</p>
                <button className="mt-3 w-full py-1.5 text-xs font-bold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg border border-blue-500/20 transition-colors">Apply fix</button>
              </div>
            </div>
          </div>

          {/* Mobile product preview card */}
          <div className="lg:hidden mt-8 rounded-2xl border border-white/[0.08] overflow-hidden animate-fade-up" style={{ background:'rgba(10,10,14,0.97)', animationDelay:'0.6s' }}>
            {/* Tabs */}
            <div className="flex gap-0 border-b border-white/[0.06]">
              {(['Meta','Google','Amazon'] as HeroTab[]).map((tab) => (
                <button key={tab} onClick={() => setHeroTab(tab)}
                  className={`flex-1 py-3 text-xs font-bold transition-colors ${heroTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                  style={heroTab === tab ? { borderBottom:`2px solid ${HERO_PLATFORM_DATA[tab].color}` } : {}}>
                  {tab}
                </button>
              ))}
            </div>
            {/* Score */}
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Account Health Score</p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-3xl font-black ${heroData.scoreColor}`}>{heroData.score}</span>
                  <span className="text-xs text-gray-600">/100</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-red-400 font-semibold">{heroData.issues} issues found</p>
                <p className="text-xs text-gray-600">{heroData.risk}/mo at risk</p>
              </div>
            </div>
            {/* Issues */}
            <div className="px-3 pb-3 space-y-1.5">
              {heroData.items.map(({ tag, issue, val, c }) => (
                <div key={issue} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ${c}`}>{tag}</span>
                  <p className="text-xs text-gray-300 flex-1 truncate">{issue}</p>
                  <span className="text-xs font-bold text-red-400 tabular-nums">{val}</span>
                </div>
              ))}
              <div className="pt-1">
                <Link href="/signup" className="flex items-center justify-center gap-1.5 w-full py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-bold rounded-xl border border-blue-500/20 transition-colors">
                  Fix all issues with AI <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none" style={{ background:'linear-gradient(to bottom, transparent, #010810)' }} />
      </section>

      {/* ── Cinematic scroll-zoom + 30 checks reveal ── */}
      <div ref={cinematicRef} className="relative" style={{ height: '120vh', background: '#010810' }}>
        <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', background: '#010810' }}>

          {/* Scalable sky scene */}
          <div ref={cinematicInnerRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: 1 }}>
            <div ref={cinematicSceneRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, transformOrigin: 'center center', willChange: 'transform' }}>
              {/* Sky gradient — deep night, no horizon elements */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #010810 0%, #010d0c 35%, #011008 60%, #010d06 80%, #010a05 100%)' }} />
              {/* Moonlight ambient */}
              <div style={{ position: 'absolute', top: '8%', left: '16%', width: '260px', height: '260px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(180,225,170,0.12) 0%, transparent 70%)', filter: 'blur(48px)', pointerEvents: 'none' }} />
              {/* Moon disc */}
              <div style={{ position: 'absolute', top: '11%', left: '19%', width: '40px', height: '40px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(240,248,220,0.92) 0%, rgba(175,210,155,0.45) 55%, transparent 100%)', filter: 'blur(2px)', pointerEvents: 'none' }} />
              {/* Stars */}
              {GARDEN_STARS.map((s, i) => (
                <div key={i} className="star-twinkle" style={{
                  position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
                  width: `${s.r * 2}px`, height: `${s.r * 2}px`, borderRadius: '50%',
                  background: '#e8f0e0', pointerEvents: 'none',
                  ['--star-op' as string]: s.op, ['--star-dur' as string]: s.dur, ['--star-delay' as string]: s.del,
                  opacity: s.op,
                }} />
              ))}
              {/* Horizon glow — subtle green ground light, no mountains */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', background: 'linear-gradient(180deg, transparent, rgba(4,18,10,0.6) 60%, rgba(2,12,6,0.95) 100%)', pointerEvents: 'none' }} />
            </div>

            {/* Soft edge vignette */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 110% 110% at 50% 40%, transparent 55%, rgba(1,6,8,0.5) 75%, rgba(1,4,6,0.88) 100%)', zIndex: 2 }} />

            {/* Bottom fade to page — tall enough to cover horizon glow */}
            <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: '42%', background: 'linear-gradient(180deg, transparent 0%, rgba(1,8,16,0.6) 45%, rgba(1,8,16,0.97) 80%, #010810 100%)', zIndex: 4 }} />
          </div>
        </div>
      </div>

      {/* ── 30 checks ──────────────────────────────── */}
      <section className="relative py-20 sm:py-28 px-5 sm:px-6 text-center overflow-hidden" style={{ background: 'linear-gradient(180deg, #010810 0%, #010d0c 35%, #060d08 65%, #080808 100%)' }}>
        {/* Stars — continuity from cinematic sky above */}
        {GARDEN_STARS.filter((_, i) => i % 3 === 0).map((s, i) => (
          <div key={i} className="star-twinkle absolute pointer-events-none" style={{
            left: `${s.x}%`, top: `${(s.y * 0.6)}%`,
            width: `${s.r * 2}px`, height: `${s.r * 2}px`, borderRadius: '50%',
            background: '#e8f0e0',
            ['--star-op' as string]: s.op, ['--star-dur' as string]: s.dur, ['--star-delay' as string]: s.del,
            opacity: s.op,
          }} />
        ))}
        {/* Soft moonlight carry-over from above */}
        <div className="absolute pointer-events-none" style={{ top: 0, left: '15%', width: '200px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(180,225,170,0.07) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="relative max-w-2xl mx-auto">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-5" style={{ color: 'rgba(120,220,160,0.8)' }}>Always watching</p>
          <h2 className="font-black text-white mb-6" style={{ fontSize: 'clamp(2rem, 6vw, 4.8rem)', letterSpacing: '-0.03em', lineHeight: 1.06 }}>
            30 checks.<br />Every night.
          </h2>
          <p className="text-sm sm:text-lg text-gray-400 leading-relaxed max-w-md mx-auto mb-10">While you sleep, Adnexusone is scanning your ad accounts for issues that cost you money.</p>
          <div className="flex gap-2 flex-nowrap justify-center">
            {[{ val:'30', label:'checks per account' },{ val:'3', label:'platforms monitored' },{ val:'2am', label:'runs every night' }].map(({ val, label }) => (
              <div key={val} className="px-3 py-2.5 rounded-full border text-center flex-1 max-w-[140px]" style={{ border:'1px solid rgba(120,220,160,0.2)', background:'rgba(8,28,16,0.5)' }}>
                <span className="block text-xl font-black" style={{ color:'rgba(160,240,190,0.9)' }}>{val}</span>
                <span className="block text-[0.7rem] text-gray-500 font-medium tracking-wide mt-0.5">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trusted by ─────────────────────────────── */}
      <section className="py-16 sm:py-20 overflow-hidden">
        <p className="text-center text-[10px] sm:text-[11px] uppercase tracking-widest text-gray-600 font-bold mb-7">Trusted by D2C brands across India</p>
        <div className="flex">
          <div className="animate-marquee flex gap-16 items-center whitespace-nowrap">
            {[...BRANDS, ...BRANDS].map((brand, i) => (
              <span key={i} className="text-xs font-bold text-gray-700 hover:text-gray-500 transition-colors cursor-default tracking-widest uppercase">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────── */}
      <section style={{ background:'radial-gradient(ellipse 80% 100% at 50% 50%, rgba(37,99,235,0.07) 0%, transparent 70%)' }}>
        <div className="max-w-5xl mx-auto px-5 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              { refData:c1, val:`${c1.count}+`, label:'Diagnostic checks per account' },
              { refData:c2, val:`${c2.count}`,   label:'Ad platforms fully supported' },
              { refData:c3, val:`${c3.count}%`,  label:'Avg wasted spend recovered' },
              { refData:c4, val:`${c4.count}+`,  label:'D2C brands on Adnexusone' },
            ].map(({ refData, val, label }, i) => (
              <div key={label} ref={refData.ref}
                className={`p-7 md:py-14 text-center border-white/[0.05]
                  ${i % 2 === 0 ? 'border-r' : ''}
                  ${i < 2 ? 'border-b md:border-b-0' : ''}
                  ${i < 3 ? 'md:border-r' : ''}
                `}>
                <div className="text-4xl md:text-5xl font-black text-white mb-1.5 tabular-nums num-glow">{val}</div>
                <p className="text-[11px] md:text-sm text-gray-500 leading-snug">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── One Platform ───────────────────────────── */}
      <section id="platform" className="py-20 sm:py-28 px-5 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div ref={s1} className="reveal">
            <div className="text-center mb-14 sm:mb-20 stagger-child">
              <p className="text-[11px] font-bold text-blue-500 uppercase tracking-widest mb-3">One platform</p>
              <h2 className="text-[1.55rem] sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">Every ad channel.<br className="sm:hidden" /> Infinite clarity.</h2>
              <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">The most complete diagnostics platform for Meta, Google, and Amazon. Your entire ad health in one dashboard, updated every day.</p>
            </div>

            {/* Desktop grid */}
            <div className="hidden md:grid md:grid-cols-3 gap-5">
              {PLATFORM_CARDS.map(({ name, letter, gradient, glow, desc, checks }) => (
                <div key={name} className="stagger-child glow-card p-7 rounded-2xl border border-white/[0.07]" style={{ background:`radial-gradient(ellipse 80% 50% at 50% 0%, ${glow}, transparent), rgba(255,255,255,0.02)` }}>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-black text-xl shadow-xl mb-5`}>{letter}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-5">{desc}</p>
                  <ul className="space-y-2">
                    {checks.map((c) => <li key={c} className="flex items-center gap-2.5 text-sm text-gray-400"><CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />{c}</li>)}
                  </ul>
                </div>
              ))}
            </div>

            {/* Mobile carousel */}
            <div className="md:hidden">
              <Carousel
                items={PLATFORM_CARDS}
                renderItem={(item) => {
                  const { name, letter, gradient, glow, desc, checks } = item as typeof PLATFORM_CARDS[0]
                  return (
                    <div className="p-6 rounded-2xl border border-white/[0.07] mx-2" style={{ background:`radial-gradient(ellipse 80% 40% at 50% 0%, ${glow}, transparent), rgba(255,255,255,0.02)` }}>
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-black text-lg shadow-xl mb-4`}>{letter}</div>
                      <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed mb-4">{desc}</p>
                      <ul className="space-y-2">
                        {checks.map((c) => <li key={c} className="flex items-center gap-2 text-sm text-gray-400"><CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />{c}</li>)}
                      </ul>
                    </div>
                  )
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Meet Adnexusone AI ─────────────────────────── */}
      <section className="py-20 sm:py-28 px-5 sm:px-6" style={{ background:'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(124,58,237,0.08) 0%, transparent 70%)' }}>
        <div className="max-w-6xl mx-auto">
          <div ref={s2} className="reveal">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
              <div className="stagger-child order-2 lg:order-1">
                <p className="text-[11px] font-bold text-purple-400 uppercase tracking-widest mb-3">Meet Adnexusone AI</p>
                <h2 className="text-[1.55rem] sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-5">The intelligence behind every diagnosis</h2>
                <p className="text-gray-400 text-base sm:text-lg leading-relaxed mb-8">Drive faster action across all three platforms with autonomous AI trained on performance marketing data.</p>
                <div className="space-y-5">
                  {[
                    { icon:Cpu,        color:'text-purple-400', bg:'bg-purple-500/10 border-purple-500/20', title:'Autonomous diagnostics for superior performance', desc:'Adnexusone scans accounts daily, surfaces problems instantly, and ranks them by rupee cost.' },
                    { icon:Activity,   color:'text-blue-400',   bg:'bg-blue-500/10 border-blue-500/20',     title:'Ad monitoring on autopilot',                   desc:'Connect once. 30 checks run every day. No manual audits. No missed issues.' },
                    { icon:TrendingUp, color:'text-green-400',  bg:'bg-green-500/10 border-green-500/20',   title:'AI fixes trained on your data',                desc:'Every recommendation is powered by Claude AI, cross-referenced with your campaign history.' },
                  ].map(({ icon:Icon, color, bg, title, desc }) => (
                    <div key={title} className="flex gap-4">
                      <div className={`w-10 h-10 rounded-xl ${bg} border flex items-center justify-center shrink-0 mt-0.5`}><Icon className={`w-5 h-5 ${color}`} /></div>
                      <div>
                        <p className="text-sm font-semibold text-white mb-1">{title}</p>
                        <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="stagger-child order-1 lg:order-2 rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl" style={{ background:'#0d0f16' }}>
                <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-purple-500/20 flex items-center justify-center"><Cpu className="w-3.5 h-3.5 text-purple-400" /></div>
                    <p className="text-sm font-bold text-white">AI-Generated Fix</p>
                  </div>
                  <span className="px-2 py-0.5 bg-red-500/15 text-red-400 border border-red-500/20 text-xs font-bold rounded">Critical</span>
                </div>
                <div className="p-5">
                  <p className="text-sm font-semibold text-white mb-1">Creative fatigue on Meta Ad Set #4</p>
                  <p className="text-xs text-gray-500 mb-4">Estimated impact: ₹42,000 per month</p>
                  <p className="text-sm text-gray-300 leading-relaxed mb-5">Your top-performing ad set has reached creative fatigue. CTR dropped from 3.2% to 1.1% over 7 days while frequency climbed to 4.8.</p>
                  <div className="border border-white/[0.06] rounded-xl p-4 bg-white/[0.02] mb-4">
                    <p className="text-xs font-bold text-white mb-3">What to do right now</p>
                    <ol className="space-y-2">
                      {['Pause the 3 ads with frequency above 4.5 immediately','Upload at least 2 fresh creatives with a different visual angle','Reduce audience size or add exclusions to limit repeat exposure','Set a frequency cap of 3 per 7 days going forward'].map((step, i) => (
                        <li key={step} className="flex gap-2.5 text-sm text-gray-400">
                          <span className="text-gray-600 shrink-0 font-mono text-xs mt-0.5">{i+1}.</span><span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <button className="w-full py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors">Mark as resolved</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── What brands achieve — photo-card style ── */}
      <section id="results" className="py-20 sm:py-28 px-5 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div ref={s3} className="reveal">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-14 stagger-child">
              <div>
                <p className="text-[11px] font-bold text-blue-500 uppercase tracking-widest mb-2">What brands achieve</p>
                <h2 className="text-[1.55rem] sm:text-4xl font-extrabold tracking-tight">Results in the numbers</h2>
              </div>
              <Link href="/customers" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors shrink-0">
                All case studies <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Desktop grid */}
            <div className="hidden md:grid md:grid-cols-3 gap-5">
              {CASE_STUDIES.map(({ metric, label, brand, platform, quote, gradientFrom, gradientTo, glowColor, initial }) => (
                <div key={brand} className="stagger-child relative overflow-hidden rounded-2xl border border-white/[0.07] flex flex-col min-h-[380px] p-7 group cursor-pointer"
                  style={{ background:`linear-gradient(145deg, ${gradientFrom} 0%, ${gradientTo} 100%)` }}>
                  <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-40 pointer-events-none" style={{ background:`radial-gradient(circle, ${glowColor} 0%, transparent 70%)`, filter:'blur(24px)' }} />
                  <div className="absolute -bottom-6 -right-6 text-[10rem] font-black leading-none select-none pointer-events-none" style={{ color:'rgba(255,255,255,0.04)', lineHeight:0.8 }}>{initial}</div>
                  <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage:'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize:'28px 28px' }} />
                  <div className="relative flex flex-col h-full">
                    <span className="self-start text-[10px] font-bold text-white/60 bg-white/10 px-2.5 py-1 rounded-full uppercase tracking-wide mb-auto">{platform}</span>
                    <div className="mt-8">
                      <div className="text-6xl font-black text-white mb-1 tabular-nums">{metric}</div>
                      <div className="text-base text-white/80 font-semibold mb-1">{label}</div>
                      <div className="text-xs text-white/40 uppercase tracking-widest mb-5">{brand}</div>
                      <p className="text-sm text-white/60 leading-relaxed mb-5 italic">"{quote}"</p>
                      <div className="flex mb-3">{[...Array(5)].map((_,i) => <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />)}</div>
                      <Link href="/customers" className="inline-flex items-center gap-1.5 text-sm font-bold text-white/80 hover:text-white transition-colors group-hover:gap-2.5 duration-200">
                        Read story <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile carousel — photo-card style */}
            <div className="md:hidden">
              <Carousel
                items={CASE_STUDIES}
                renderItem={(item) => {
                  const { metric, label, brand, platform, quote, gradientFrom, gradientTo, glowColor, initial } = item as typeof CASE_STUDIES[0]
                  return (
                    <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] mx-2 flex flex-col p-6"
                      style={{ background:`linear-gradient(145deg, ${gradientFrom} 0%, ${gradientTo} 100%)`, minHeight:'360px' }}>
                      <div className="absolute top-0 right-0 w-44 h-44 rounded-full opacity-50 pointer-events-none" style={{ background:`radial-gradient(circle, ${glowColor} 0%, transparent 70%)`, filter:'blur(20px)' }} />
                      <div className="absolute -bottom-4 -right-4 text-[9rem] font-black leading-none select-none pointer-events-none" style={{ color:'rgba(255,255,255,0.05)', lineHeight:0.8 }}>{initial}</div>
                      <div className="absolute inset-0 opacity-25 pointer-events-none" style={{ backgroundImage:'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize:'24px 24px' }} />
                      <div className="relative">
                        <span className="text-[10px] font-bold text-white/60 bg-white/10 px-2.5 py-1 rounded-full uppercase tracking-wide">{platform}</span>
                        <div className="mt-6 mb-1 text-6xl font-black text-white tabular-nums">{metric}</div>
                        <div className="text-base text-white/80 font-semibold mb-0.5">{label}</div>
                        <div className="text-xs text-white/40 uppercase tracking-widest mb-5">{brand}</div>
                        <p className="text-sm text-white/60 leading-relaxed mb-5 italic">"{quote}"</p>
                        <div className="flex mb-3">{[...Array(5)].map((_,i) => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}</div>
                        <Link href="/customers" className="inline-flex items-center gap-1.5 text-sm font-bold text-white/80">
                          Read story <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  )
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────── */}
      <section id="features" className="py-20 sm:py-28 px-5 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div ref={s4} className="reveal">
            <div className="text-center mb-14 sm:mb-20 stagger-child">
              <p className="text-[11px] font-bold text-blue-500 uppercase tracking-widest mb-3">Diagnostic breadth</p>
              <h2 className="text-[1.55rem] sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">For unstoppable ad performance</h2>
              <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">From 5L to 5Cr monthly spend, Adnexusone covers every failure mode that costs brands money.</p>
            </div>
            <div className="hidden md:grid md:grid-cols-3 gap-5">
              {FEATURE_CARDS.map(({ icon:Icon, color, bg, title, desc }) => (
                <div key={title} className="stagger-child glow-card p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
                  <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center mb-4 border`}><Icon className={`w-5 h-5 ${color}`} /></div>
                  <h3 className="font-bold text-white mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
            <div className="md:hidden">
              <Carousel
                items={FEATURE_CARDS}
                renderItem={(item) => {
                  const { icon:Icon, color, bg, title, desc } = item as typeof FEATURE_CARDS[0]
                  return (
                    <div className="p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] mx-2">
                      <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center mb-4 border`}><Icon className={`w-5 h-5 ${color}`} /></div>
                      <h3 className="font-bold text-white mb-2">{title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                    </div>
                  )
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────── */}
      <section className="py-20 sm:py-28 overflow-hidden" style={{ background:'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(37,99,235,0.05) 0%, transparent 70%)' }}>
        <div ref={s5} className="reveal">
          <div className="text-center mb-14 sm:mb-20 px-5 sm:px-6 stagger-child">
            <p className="text-[11px] font-bold text-blue-500 uppercase tracking-widest mb-3">Loved by brands</p>
            <h2 className="text-[1.55rem] sm:text-4xl font-extrabold tracking-tight mb-4">Built for people running ads</h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto">From solo performance marketers to agencies managing 25 brand accounts.</p>
          </div>

          {/* Desktop: dual-row infinite marquee */}
          <div className="stagger-child hidden md:block space-y-4 marquee-fade">
            {/* Row 1 — scroll left */}
            <div className="flex gap-4 animate-marquee">
              {[...TESTIMONIALS, ...TESTIMONIALS].map(({ role, company, quote, avatar, color }, i) => (
                <div key={i} className="w-[340px] flex-shrink-0 p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.14] transition-colors">
                  <div className="flex mb-3">{[...Array(5)].map((_,j) => <Star key={j} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />)}</div>
                  <p className="text-sm text-gray-300 leading-relaxed mb-5">"{quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-sm font-bold text-white shrink-0`}>{avatar}</div>
                    <div><p className="text-sm font-semibold text-white">{role}</p><p className="text-xs text-gray-500">{company}</p></div>
                  </div>
                </div>
              ))}
            </div>
            {/* Row 2 — scroll right (offset by 4) */}
            <div className="flex gap-4 animate-marquee-reverse">
              {[...TESTIMONIALS.slice(4), ...TESTIMONIALS.slice(0,4), ...TESTIMONIALS.slice(4), ...TESTIMONIALS.slice(0,4)].map(({ role, company, quote, avatar, color }, i) => (
                <div key={i} className="w-[340px] flex-shrink-0 p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.14] transition-colors">
                  <div className="flex mb-3">{[...Array(5)].map((_,j) => <Star key={j} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />)}</div>
                  <p className="text-sm text-gray-300 leading-relaxed mb-5">"{quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-sm font-bold text-white shrink-0`}>{avatar}</div>
                    <div><p className="text-sm font-semibold text-white">{role}</p><p className="text-xs text-gray-500">{company}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: carousel */}
          <div className="md:hidden px-5">
            <Carousel
              items={TESTIMONIALS}
              renderItem={(item) => {
                const { role, company, quote, avatar, color } = item as typeof TESTIMONIALS[0]
                return (
                  <div className="p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] mx-2">
                    <div className="flex mb-4">{[...Array(5)].map((_,i) => <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />)}</div>
                    <p className="text-sm text-gray-300 leading-relaxed mb-6">"{quote}"</p>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-sm font-bold text-white shrink-0`}>{avatar}</div>
                      <div><p className="text-sm font-semibold text-white">{role}</p><p className="text-xs text-gray-500">{company}</p></div>
                    </div>
                  </div>
                )
              }}
            />
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────── */}
      <section className="py-20 sm:py-28 px-5 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div ref={s6} className="reveal">
            <div className="text-center mb-14 sm:mb-20 stagger-child">
              <p className="text-[11px] font-bold text-blue-500 uppercase tracking-widest mb-3">How it works</p>
              <h2 className="text-[1.55rem] sm:text-4xl font-extrabold tracking-tight mb-4">From connect to fix in 10 minutes</h2>
              <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto">No onboarding call. No setup fee. Connect, diagnose, and fix today.</p>
            </div>
            {/* Step circle track — desktop only, above the cards */}
            <div className="stagger-child hidden sm:grid sm:grid-cols-3 gap-6 mb-8">
              {[
                { num:'1', ring:'ring-blue-500/30',   bg:'bg-blue-500',   lineGrad:'from-blue-500/50 to-purple-500/50',  showLine:true  },
                { num:'2', ring:'ring-purple-500/30', bg:'bg-purple-500', lineGrad:'from-purple-500/50 to-green-500/50', showLine:true  },
                { num:'3', ring:'ring-green-500/30',  bg:'bg-green-500',  lineGrad:'',                                   showLine:false },
              ].map(({ num, ring, bg, lineGrad, showLine }) => (
                <div key={num} className="relative flex justify-center items-center">
                  <div className={`w-9 h-9 rounded-full ${bg} ring-4 ${ring} ring-offset-1 ring-offset-[#080808] flex items-center justify-center text-white text-sm font-black relative z-10 shadow-lg shrink-0`}>{num}</div>
                  {showLine && (
                    <div className={`absolute top-1/2 -translate-y-1/2 h-px bg-gradient-to-r ${lineGrad} opacity-60`}
                      style={{ left:'calc(50% + 18px)', right:'calc(-50% - 24px)' }} />
                  )}
                </div>
              ))}
            </div>
            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {[
                { step:'01', title:'Connect your accounts',      desc:'One-click OAuth for Meta, Google, and Amazon. No credentials stored.',           accent:'border-blue-500/30',   dot:'bg-blue-500'   },
                { step:'02', title:'Get your diagnostic report', desc:'30 checks run immediately. Every issue ranked by rupee cost.',                   accent:'border-purple-500/30', dot:'bg-purple-500' },
                { step:'03', title:'Apply the AI-written fix',   desc:'Context-aware fixes from Claude AI. One click to resolve. Results in days.',    accent:'border-green-500/30',  dot:'bg-green-500'  },
              ].map(({ step, title, desc, accent, dot }) => (
                <div key={step} className={`stagger-child relative p-6 sm:p-7 rounded-2xl border ${accent}`}
                  style={{ background:'rgba(10,12,18,0.9)' }}>
                  {/* Dot — mobile only (desktop uses the track above) */}
                  <div className={`sm:hidden w-3 h-3 rounded-full ${dot} mb-5 shadow-lg`} />
                  <div className="text-5xl sm:text-6xl font-black text-white/[0.05] absolute top-5 right-5 leading-none select-none">{step}</div>
                  <h3 className="font-bold text-white mb-3 pr-8 text-base">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────── */}
      <section id="pricing" className="py-20 sm:py-28 px-5 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div ref={s7} className="reveal">
            <div className="text-center mb-14 sm:mb-20 stagger-child">
              <p className="text-[11px] font-bold text-blue-500 uppercase tracking-widest mb-3">Simple pricing</p>
              <h2 className="text-[1.55rem] sm:text-4xl font-extrabold tracking-tight mb-4">Start free. Scale when you grow.</h2>
              <p className="text-gray-400 text-base max-w-xl mx-auto">No long-term contracts. No per-seat fees. Cancel anytime.</p>
            </div>
            {/* Desktop — 4 columns */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {PRICING_PLANS.map(({ name, price, per, desc, features, allFeatures, cta, href, highlight, custom }) => (
                <div key={name} className={`stagger-child relative p-6 rounded-2xl border flex flex-col ${highlight ? 'border-blue-500/40 bg-blue-600/[0.07]' : custom ? 'border-amber-500/25 bg-amber-500/[0.04] glow-card' : 'border-white/[0.07] bg-white/[0.02] glow-card'}`}>
                  {highlight && <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-bold rounded-full shadow-lg shadow-blue-500/25 whitespace-nowrap">Most popular</span>}
                  <p className="text-sm font-semibold text-gray-400 mb-2">{name}</p>
                  {custom ? (
                    <div className="text-3xl font-black text-white mb-0.5">Custom</div>
                  ) : (
                    <div className="flex items-baseline gap-0.5"><span className="text-sm text-gray-500">₹</span><span className="text-3xl font-black text-white tabular-nums">{price}</span></div>
                  )}
                  <p className="text-xs text-gray-500 mt-1 mb-3">{per}</p>
                  <p className="text-sm text-gray-400 mb-5 leading-relaxed">{desc}</p>
                  <ul className="space-y-2 flex-1 mb-4">
                    {features.map((f) => <li key={f} className="flex items-center gap-2 text-sm text-gray-400"><CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />{f}</li>)}
                  </ul>
                  {/* Expandable allFeatures */}
                  <button
                    onClick={() => setExpandedPlan(expandedPlan === name ? null : name)}
                    className="flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors py-2 border-t border-white/[0.06] mb-4"
                  >
                    {expandedPlan === name ? 'Show less' : 'See all features'}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedPlan === name ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${expandedPlan === name ? 'max-h-64 mb-4' : 'max-h-0'}`}>
                    <ul className="space-y-2">
                      {allFeatures.map((f) => <li key={f} className="flex items-center gap-2 text-sm text-gray-500"><CheckCircle2 className="w-3 h-3 text-blue-500/50 shrink-0" />{f}</li>)}
                    </ul>
                  </div>
                  <Link href={href} className={`btn-blue w-full py-3 text-sm font-bold rounded-xl text-center transition-colors mt-auto ${highlight ? 'bg-blue-600 hover:bg-blue-500 text-white' : custom ? 'bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-300' : 'border border-white/[0.12] hover:bg-white/[0.06] text-white'}`}>{cta}</Link>
                </div>
              ))}
            </div>
            {/* Mobile carousel */}
            <div className="md:hidden">
              <Carousel
                items={PRICING_PLANS}
                initialIndex={1}
                renderItem={(item) => {
                  const { name, price, per, desc, features, allFeatures, cta, href, highlight, custom } = item as typeof PRICING_PLANS[0]
                  return (
                    <div className={`p-6 rounded-2xl border flex flex-col mx-2 ${highlight ? 'border-blue-500/40 bg-blue-600/[0.07]' : custom ? 'border-amber-500/25 bg-amber-500/[0.04]' : 'border-white/[0.07] bg-white/[0.02]'}`}>
                      {highlight && (
                        <div className="flex justify-center mb-3">
                          <span className="px-3 py-0.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-bold rounded-full">Most popular</span>
                        </div>
                      )}
                      <p className="text-sm font-semibold text-gray-400 mb-2">{name}</p>
                      {custom ? (
                        <div className="text-4xl font-black text-white mb-0.5">Custom</div>
                      ) : (
                        <div className="flex items-baseline gap-0.5 mb-1"><span className="text-sm text-gray-500">₹</span><span className="text-4xl font-black text-white">{price}</span></div>
                      )}
                      <p className="text-xs text-gray-500 mb-3">{per}</p>
                      <p className="text-sm text-gray-400 mb-4 leading-relaxed">{desc}</p>
                      <ul className="space-y-2 mb-4">
                        {features.map((f) => <li key={f} className="flex items-center gap-2 text-sm text-gray-400"><CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />{f}</li>)}
                      </ul>
                      <button
                        onClick={() => setExpandedPlan(expandedPlan === name ? null : name)}
                        className="flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-400 py-2 border-t border-white/[0.06] mb-4"
                      >
                        {expandedPlan === name ? 'Show less' : 'See all features'}
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedPlan === name ? 'rotate-180' : ''}`} />
                      </button>
                      <div className={`overflow-hidden transition-all duration-300 ${expandedPlan === name ? 'max-h-64 mb-4' : 'max-h-0'}`}>
                        <ul className="space-y-2">
                          {allFeatures.map((f) => <li key={f} className="flex items-center gap-2 text-sm text-gray-500"><CheckCircle2 className="w-3 h-3 text-blue-500/50 shrink-0" />{f}</li>)}
                        </ul>
                      </div>
                      <Link href={href} className={`btn-blue w-full py-3 text-sm font-bold rounded-xl text-center mt-auto ${highlight ? 'bg-blue-600 text-white' : custom ? 'bg-amber-600/20 border border-amber-500/30 text-amber-300' : 'border border-white/[0.12] text-white'}`}>{cta}</Link>
                    </div>
                  )
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Integrate ───────────────────────────────── */}
      <section className="py-20 sm:py-28 px-5 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div ref={s8} className="reveal">
            <div className="text-center mb-14 sm:mb-20 stagger-child">
              <p className="text-[11px] font-bold text-blue-500 uppercase tracking-widest mb-3">Integrate seamlessly</p>
              <h2 className="text-[1.55rem] sm:text-4xl font-extrabold tracking-tight mb-4">All your ad data in one place</h2>
              <p className="text-gray-400 text-base max-w-xl mx-auto">OAuth only. No credentials stored. Data stays fresh. Team stays informed.</p>
            </div>
            <div className="stagger-child grid grid-cols-2 md:grid-cols-6 gap-3 mb-8">
              {[
                {name:'Meta Ads',letter:'M',color:'from-blue-600 to-blue-700',desc:'Facebook & Instagram'},
                {name:'Google Ads',letter:'G',color:'from-green-600 to-green-700',desc:'Search & Shopping'},
                {name:'Amazon Ads',letter:'A',color:'from-orange-500 to-orange-600',desc:'Sponsored Products'},
                {name:'Supabase',letter:'S',color:'from-emerald-600 to-teal-700',desc:'Auth & Database'},
                {name:'Razorpay',letter:'R',color:'from-indigo-600 to-indigo-700',desc:'Payments'},
                {name:'Email Alerts',letter:'E',color:'from-slate-600 to-slate-700',desc:'Instant notifications'},
              ].map(({ name, letter, color, desc }) => (
                <div key={name} className="glow-card flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.07] bg-white/[0.02]">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-sm shadow-lg shrink-0`}>{letter}</div>
                  <div>
                    <p className="text-sm font-medium text-gray-200 leading-none mb-0.5">{name}</p>
                    <p className="text-xs text-gray-600">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="stagger-child grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {[{value:'2 min',label:'to connect your first account'},{value:'Daily',label:'automated sync and diagnostics'},{value:'100%',label:'OAuth only — no credentials stored'}].map(({ value, label }) => (
                <div key={label} className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-center">
                  <p className="text-2xl font-black text-white mb-1">{value}</p>
                  <p className="text-sm text-gray-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Adnexusone AI Engine ─────────────────────── */}
      <section id="ai-engine" className="py-20 sm:py-28 px-5 sm:px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-[0.07] pointer-events-none" style={{ background:'radial-gradient(circle, rgba(139,92,246,1) 0%, transparent 70%)', filter:'blur(120px)' }} />

        <div className="max-w-6xl mx-auto">
          <div ref={sAI} className="reveal">

            {/* Header */}
            <div className="text-center mb-14 sm:mb-16 stagger-child">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/[0.08] text-xs font-bold text-purple-300 mb-5">
                <Cpu className="w-3 h-3" />
                AI Engine
              </div>
              <h2 className="text-[1.55rem] sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
                Intelligence that<br className="sm:hidden" /> never sleeps
              </h2>
              <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">Adnexusone AI watches every campaign 24/7, surfaces what costs you money, and tells your team exactly how to fix it.</p>
            </div>

            {/* Desktop bento grid */}
            <div className="hidden lg:grid gap-3 stagger-child" style={{ gridTemplateColumns:'1fr 1.9fr 1fr', gridTemplateRows:'280px 280px' }}>

              {/* Card 1: Live Scanner — col 1, row 1–2 */}
              <div className="glow-card rounded-2xl border border-white/[0.07] overflow-hidden flex flex-col" style={{ gridColumn:'1', gridRow:'1 / 3', background:'rgba(6,8,18,0.98)' }}>
                {/* Header */}
                <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60"/>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"/>
                    </span>
                    <p className="text-[11px] font-bold tracking-wide text-white uppercase">Live Scanner</p>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 bg-green-500/10 text-green-400 rounded-full border border-green-500/20 tracking-widest uppercase">Running</span>
                </div>
                {/* Scan rows — border always present to prevent layout shift */}
                <div className="p-3 space-y-1 shrink-0">
                  {SCAN_CHECKS.map((item, i) => (
                    <div key={i} className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-700 relative overflow-hidden border ${
                      i === scanStep
                        ? 'bg-white/[0.06] border-white/[0.08]'
                        : i < scanStep
                        ? 'border-transparent opacity-70'
                        : 'border-transparent opacity-30'
                    }`}>
                      {/* left accent */}
                      {i === scanStep && <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-purple-400 to-blue-400 rounded-l-lg"/>}
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-500 ${
                        i < scanStep ? 'bg-green-400' : i === scanStep ? 'bg-amber-400 animate-pulse' : 'bg-white/15'
                      }`}/>
                      <p className="text-[11px] text-gray-300 flex-1 truncate font-medium">{item.text}</p>
                      {/* badge: always rendered, opacity toggled — prevents layout shift */}
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0 font-mono transition-all duration-300 border ${item.c} border-current/20 ${
                        i <= scanStep ? 'opacity-100' : 'opacity-0'
                      }`}>{item.val}</span>
                    </div>
                  ))}
                </div>
                {/* Spacer pushes progress to bottom */}
                <div className="flex-1"/>
                {/* Footer progress */}
                <div className="px-3 pb-4 pt-2 border-t border-white/[0.04] shrink-0">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[9px] text-gray-600 font-mono uppercase tracking-widest">Scan progress</span>
                    <span className="text-[9px] text-purple-400 font-mono">{Math.round(((scanStep + 1) / SCAN_CHECKS.length) * 100)}%</span>
                  </div>
                  <div className="h-[2px] w-full bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-purple-500 to-blue-400"
                      style={{ width:`${((scanStep + 1) / SCAN_CHECKS.length) * 100}%` }}/>
                  </div>
                </div>
              </div>

              {/* Card 2: Central AI Orb — col 2, row 1–2 */}
              <div className="glow-card rounded-2xl border border-purple-500/20 relative overflow-hidden flex flex-col items-center justify-center py-10 gap-8" style={{ gridColumn:'2', gridRow:'1 / 3', background:'radial-gradient(ellipse 80% 50% at 50% 30%, rgba(124,58,237,0.11) 0%, rgba(6,8,18,0.99) 70%)' }}>
                {/* Grid overlay */}
                <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage:'linear-gradient(rgba(139,92,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.06) 1px, transparent 1px)', backgroundSize:'40px 40px' }}/>
                {/* Scan line sweep */}
                <div className="absolute left-0 right-0 h-px pointer-events-none" style={{ background:'linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.5) 50%, transparent 100%)', animation:'scanLine 3s ease-in-out infinite', top:'40%' }}/>

                {/* Orb — outer wrapper includes ring overflow so pills below have breathing room */}
                <div className="relative" style={{ width:'240px', height:'240px' }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative" style={{ width:'152px', height:'152px' }}>
                      <div className="absolute inset-[-44px] rounded-full border border-dashed border-purple-500/15 ai-ring-ccw"/>
                      <div className="absolute inset-[-22px] rounded-full border border-blue-400/18 ai-ring-cw"/>
                      <div className="absolute inset-[-8px] rounded-full border border-purple-400/10"/>
                      <div className="absolute inset-0 ai-orb rounded-full" style={{ background:'radial-gradient(circle, rgba(139,92,246,0.16) 0%, rgba(59,130,246,0.05) 65%, transparent 100%)' }}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-[68px] h-[68px] rounded-full flex items-center justify-center" style={{ background:'linear-gradient(135deg, rgba(139,92,246,0.28) 0%, rgba(59,130,246,0.18) 100%)', boxShadow:'0 0 60px rgba(139,92,246,0.4), 0 0 120px rgba(59,130,246,0.12)' }}>
                            <Cpu className="w-8 h-8 text-purple-200"/>
                          </div>
                        </div>
                      </div>
                      {/* Orbital data nodes */}
                      {[
                        { angle:0,   color:'#3b82f6' },
                        { angle:120, color:'#22c55e' },
                        { angle:240, color:'#f97316' },
                      ].map(({ angle, color }) => {
                        const r = 88
                        const rad = (angle - 90) * Math.PI / 180
                        return (
                          <div key={angle} className="absolute w-2.5 h-2.5 rounded-full border-2 border-zinc-900"
                            style={{ background: color, left:`calc(50% + ${Math.cos(rad) * r}px - 5px)`, top:`calc(50% + ${Math.sin(rad) * r}px - 5px)`, boxShadow:`0 0 10px ${color}88` }}/>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Platform pills */}
                <div className="flex gap-2 flex-wrap justify-center">
                  {[
                    { label:'Meta Ads',   dot:'#3b82f6' },
                    { label:'Google Ads', dot:'#22c55e' },
                    { label:'Amazon Ads', dot:'#f97316' },
                    { label:'Reports',    dot:'#8b5cf6' },
                  ].map(({ label, dot }) => (
                    <div key={label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/[0.09] bg-white/[0.03] text-[11px] font-medium text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: dot }}/>
                      {label}
                    </div>
                  ))}
                </div>

                {/* Stats row */}
                <div className="flex gap-0 divide-x divide-white/[0.08]">
                  {[{val:'30',sub:'Checks/day'},{val:'3',sub:'Platforms'},{val:'24/7',sub:'Uptime'}].map(({ val, sub }) => (
                    <div key={sub} className="text-center px-6">
                      <p className="text-2xl font-black text-white font-mono tabular-nums">{val}</p>
                      <p className="text-[9px] text-gray-600 uppercase tracking-[0.15em] mt-0.5 font-medium">{sub}</p>
                    </div>
                  ))}
                </div>

                <p className="absolute bottom-3 text-[9px] text-white/[0.12] font-bold uppercase tracking-[0.25em]">Adnexusone AI Engine</p>
              </div>

              {/* Card 3: AI Fix Generator — col 3, row 1 */}
              <div className="glow-card rounded-2xl border border-purple-500/20 overflow-hidden" style={{ gridColumn:'3', gridRow:'1', background:'rgba(6,8,18,0.98)' }}>
                <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
                  <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-purple-500/30 to-blue-500/20 flex items-center justify-center">
                    <Cpu className="w-3 h-3 text-purple-300"/>
                  </div>
                  <p className="text-[11px] font-bold tracking-wide text-white uppercase">AI Fix Generator</p>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-red-500/12 text-red-400 rounded-full border border-red-500/20 uppercase tracking-wide">Critical</span>
                    <span className="text-[9px] text-gray-500 font-mono">₹42K month at risk</span>
                  </div>
                  <p className="text-[11px] font-semibold text-white mb-3 leading-snug">Creative Fatigue<br/><span className="text-gray-400 font-normal">Meta Ad Set #4</span></p>
                  <div className="text-[10px] text-gray-300 leading-relaxed font-mono bg-white/[0.025] rounded-xl p-3 min-h-[88px] border border-white/[0.05] relative">
                    <span className="text-purple-400/60 select-none mr-1">›</span>
                    {AI_FIX_TEXT.slice(0, aiTypedIdx)}
                    <span className="type-cursor"/>
                  </div>
                </div>
              </div>

              {/* Card 4: Platform Health — col 3, row 2 */}
              <div className="glow-card rounded-2xl border border-white/[0.07] overflow-hidden" style={{ gridColumn:'3', gridRow:'2', background:'rgba(6,8,18,0.98)' }}>
                <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                  <p className="text-[11px] font-bold tracking-wide text-white uppercase">Platform Health</p>
                  <span className="text-[9px] text-gray-600 font-mono">/100</span>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { name:'Meta',   score:64, color:'#f59e0b', status:'At Risk'  },
                    { name:'Google', score:58, color:'#ef4444', status:'Critical' },
                    { name:'Amazon', score:71, color:'#22c55e', status:'Moderate' },
                  ].map(({ name, score, color, status }) => (
                    <div key={name}>
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-gray-300 font-medium">{name}</span>
                          <span className="text-[9px] text-gray-600">{status}</span>
                        </div>
                        <span className="text-[13px] font-black tabular-nums font-mono" style={{ color }}>{score}</span>
                      </div>
                      <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width:`${score}%`, background:`linear-gradient(90deg, ${color}99, ${color})` }}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Revenue at Risk — full-width strip below grid */}
            <div className="hidden lg:block stagger-child mt-4">
              <div className="glow-card rounded-2xl border border-white/[0.07] overflow-hidden" style={{ background:'rgba(6,8,18,0.97)' }}>
                <div className="px-6 py-4 flex items-center gap-8">
                  <div className="shrink-0">
                    <p className="text-[9px] text-gray-600 uppercase tracking-widest font-bold mb-0.5">Revenue at Risk</p>
                    <p className="text-3xl font-black text-white tabular-nums font-mono leading-none">₹2.53L</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">estimated monthly loss</p>
                  </div>
                  <div className="flex-1 h-px bg-white/[0.05]"/>
                  {[
                    { label:'Meta issues',   val:'₹1.01L', dot:'bg-blue-500',   pct: 40 },
                    { label:'Google issues', val:'₹84K',   dot:'bg-green-500',  pct: 33 },
                    { label:'Amazon issues', val:'₹52K',   dot:'bg-orange-500', pct: 21 },
                  ].map(({ label, val, dot, pct }) => (
                    <div key={label} className="shrink-0 min-w-[110px]">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`}/>
                        <span className="text-[10px] text-gray-400">{label}</span>
                      </div>
                      <div className="flex items-end justify-between">
                        <span className="text-[13px] font-bold text-white font-mono">{val}</span>
                        <span className="text-[9px] text-gray-600 font-mono">{pct}%</span>
                      </div>
                      <div className="mt-1.5 h-[2px] w-full bg-white/[0.06] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${dot}`} style={{ width:`${pct}%` }}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile: stacked layout */}
            <div className="lg:hidden stagger-child space-y-4">

              {/* Central AI orb */}
              <div className="rounded-2xl border border-purple-500/25 relative overflow-hidden px-8 pt-10 pb-8 flex flex-col items-center" style={{ background:'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(124,58,237,0.13) 0%, rgba(8,10,20,0.99) 100%)' }}>
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage:'linear-gradient(rgba(139,92,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,1) 1px, transparent 1px)', backgroundSize:'32px 32px' }} />
                <div className="relative" style={{ width:'184px', height:'184px', marginBottom:'24px' }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative" style={{ width:'120px', height:'120px' }}>
                      <div className="absolute inset-[-32px] rounded-full border border-dashed border-purple-500/20 ai-ring-ccw" />
                      <div className="absolute inset-[-16px] rounded-full border border-blue-500/25 ai-ring-cw" />
                      <div className="absolute inset-0 ai-orb rounded-full" style={{ background:'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 100%)' }}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background:'rgba(139,92,246,0.22)', boxShadow:'0 0 40px rgba(139,92,246,0.3)' }}>
                            <Cpu className="w-7 h-7 text-purple-200" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap justify-center mb-6">
                  {[{label:'Meta',dot:'#2563eb'},{label:'Google',dot:'#16a34a'},{label:'Amazon',dot:'#f97316'}].map(({ label, dot }) => (
                    <div key={label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/[0.10] bg-white/[0.04] text-xs font-semibold text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />{label}
                    </div>
                  ))}
                </div>
                <div className="flex gap-10 justify-center mt-2">
                  {[{val:'30',label:'Checks'},{val:'3',label:'Platforms'},{val:'24/7',label:'Uptime'}].map(({ val, label }) => (
                    <div key={label} className="text-center">
                      <p className="text-2xl font-black text-purple-200">{val}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Scanner */}
              <div className="rounded-2xl border border-white/[0.08] overflow-hidden" style={{ background:'rgba(8,10,20,0.97)' }}>
                <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <p className="text-xs font-bold text-white">Live Scanner</p>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-green-500/10 text-green-400 rounded-md">Running</span>
                </div>
                <div className="p-3 space-y-1.5">
                  {SCAN_CHECKS.slice(0, 4).map((item, i) => (
                    <div key={i} className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-500 border ${i === scanStep % 4 ? 'bg-white/[0.08] border-white/[0.08]' : 'border-transparent opacity-50'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${i <= scanStep % 4 ? 'bg-green-400' : 'bg-white/20'}`} />
                      <p className="text-[11px] text-gray-300 flex-1 truncate">{item.text}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${item.c} transition-opacity duration-300 ${i <= scanStep % 4 ? 'opacity-100' : 'opacity-0'}`}>{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Health + Revenue */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/[0.08] overflow-hidden" style={{ background:'rgba(8,10,20,0.97)' }}>
                  <div className="px-4 py-3 border-b border-white/[0.06]">
                    <p className="text-xs font-bold text-white">Health</p>
                  </div>
                  <div className="p-3 space-y-2.5">
                    {[{name:'Meta',score:64,color:'#f59e0b'},{name:'Google',score:58,color:'#ef4444'},{name:'Amazon',score:71,color:'#22c55e'}].map(({ name, score, color }) => (
                      <div key={name}>
                        <div className="flex justify-between mb-0.5"><span className="text-[11px] text-gray-400">{name}</span><span className="text-[11px] font-black" style={{ color }}>{score}</span></div>
                        <div className="h-1.5 rounded-full bg-white/[0.07]"><div className="h-full rounded-full" style={{ width:`${score}%`, background:color }} /></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-green-500/20 overflow-hidden" style={{ background:'rgba(8,10,20,0.97)' }}>
                  <div className="px-4 py-3 border-b border-white/[0.06]">
                    <p className="text-xs font-bold text-white">At Risk</p>
                  </div>
                  <div className="p-3">
                    <p className="text-2xl font-black text-white mb-0.5">₹2.53L</p>
                    <p className="text-[10px] text-gray-500 mb-3">per month</p>
                    {[{label:'Meta',val:'₹1.01L',c:'bg-blue-500'},{label:'Google',val:'₹84K',c:'bg-green-500'},{label:'Amazon',val:'₹52K',c:'bg-orange-500'}].map(({ label, val, c }) => (
                      <div key={label} className="flex items-center gap-1.5 mb-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${c}`} />
                        <span className="text-[10px] text-gray-500 flex-1">{label}</span>
                        <span className="text-[10px] font-bold text-white">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────── */}
      <section className="relative pt-28 sm:pt-36 pb-0 px-5 sm:px-6"
        style={{ backgroundColor:'#03040a', backgroundImage:`url('https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80')`, backgroundSize:'cover', backgroundPosition:'center center', backgroundAttachment:'fixed' }}>

        {/* Dark overlay — top bridges from page bg, bottom matches footer top */}
        <div className="absolute inset-0 pointer-events-none" style={{ background:'linear-gradient(180deg, #080808 0%, rgba(8,8,8,0.94) 6%, rgba(2,3,12,0.48) 22%, rgba(2,3,12,0.18) 45%, rgba(2,3,12,0.22) 60%, rgba(1,2,12,0.72) 82%, rgba(1,2,12,0.97) 100%)' }} />

        {/* CSS shooting stars */}
        {[
          { top:'12%', left:'18%', dur:'9s',  delay:'0s' },
          { top:'28%', left:'55%', dur:'13s', delay:'4.5s' },
          { top:'8%',  left:'72%', dur:'11s', delay:'7s' },
        ].map((s, i) => (
          <div key={i} className="shooting-star" style={{ top:s.top, left:s.left, animationDuration:s.dur, animationDelay:s.delay }} />
        ))}

        {/* Night stars — in the sky portion of the photo */}
        {CTA_STARS.map((s, i) => (
          <div key={i} className="star-twinkle absolute pointer-events-none" style={{
            left: `${s.x}%`, top: `${s.y}%`,
            width: `${s.r * 2}px`, height: `${s.r * 2}px`, borderRadius: '50%',
            background: '#fff',
            ['--star-op' as string]: s.op, ['--star-dur' as string]: s.dur, ['--star-delay' as string]: s.del,
            opacity: s.op,
          }} />
        ))}


        <div ref={s9} className="reveal relative max-w-3xl mx-auto text-center pb-32 sm:pb-40">
          <p className="text-[11px] font-bold text-orange-400/80 uppercase tracking-widest mb-4">Get started today</p>
          <h2 className="text-[1.7rem] sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            Be unstoppable<br />
            <span className="text-gradient animate-gradient">with Adnexusone</span>
          </h2>
          <p className="text-gray-400 text-lg sm:text-xl mb-10 max-w-lg mx-auto leading-relaxed">The only platform built to keep Indian D2C ad accounts healthy and performing at their peak.</p>
          <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3 mb-5">
            <div className="flex items-stretch bg-white/[0.06] border border-white/10 rounded-xl overflow-hidden w-full sm:max-w-md">
              <input type="email" placeholder="Enter your work email" className="flex-1 px-5 py-3.5 bg-transparent text-sm text-white placeholder-gray-600 outline-none min-w-0" />
              <Link href="/signup" className="btn-blue flex items-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold whitespace-nowrap transition-colors">
                Get started <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
          <p className="text-xs text-gray-600">Free plan available. No credit card. Cancel anytime.</p>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
