'use client'

import Link from 'next/link'
import { Zap, ArrowRight } from 'lucide-react'

const FOOTER_STARS = Array.from({ length: 28 }, (_, i) => ({
  x: (i * 37 + 11) % 100, y: (i * 23 + 7) % 100,
  r: i % 3 === 0 ? 1 : 0.6,
  op: 0.1 + (i % 5) * 0.08,
  dur: `${2.5 + (i % 5) * 0.8}s`,
  del: `${(i % 7) * 0.4}s`,
}))

const SOCIAL = [
  { label:'LinkedIn', svg:<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><path d="M2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg> },
  { label:'X',        svg:<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L2.25 2.25h6.813l4.261 5.636L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg> },
  { label:'YouTube',  svg:<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.52V8.48L15.5 12l-5.75 3.52z"/></svg> },
  { label:'Instagram', svg:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg> },
]

export function LandingCTA() {
  return (
    <section className="relative pt-28 sm:pt-36 pb-0 px-5 sm:px-6"
      style={{ backgroundColor:'#03040a', backgroundImage:`url('https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80')`, backgroundSize:'cover', backgroundPosition:'center center', backgroundAttachment:'fixed' }}>
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
        <p className="text-gray-400 text-lg sm:text-xl mb-10 max-w-lg mx-auto leading-relaxed">The only platform built to keep Indian D2C ad accounts healthy and performing at their peak.</p>
        <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3 mb-5">
          <div className="flex items-stretch bg-white/[0.06] border border-white/10 rounded-xl overflow-hidden w-full sm:max-w-md">
            <input type="email" placeholder="Enter your work email" className="flex-1 px-5 py-3.5 bg-transparent text-sm text-white placeholder-gray-600 outline-none min-w-0"/>
            <Link href="/signup" className="btn-blue flex items-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold whitespace-nowrap transition-colors">
              Get started <ArrowRight className="w-3.5 h-3.5"/>
            </Link>
          </div>
        </div>
        <p className="text-xs text-gray-600">Free plan available. No credit card. Cancel anytime.</p>
      </div>
    </section>
  )
}

export function LandingFooter() {
  return (
    <footer className="pt-20 pb-14 px-5 sm:px-6 relative overflow-hidden"
      style={{ backgroundImage:`url('https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80')`, backgroundSize:'cover', backgroundPosition:'center center', backgroundAttachment:'fixed', backgroundColor:'#020308', marginTop:'-4px' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background:'linear-gradient(180deg, rgba(1,2,12,0.97) 0%, rgba(1,2,14,0.94) 18%, rgba(2,3,16,0.80) 42%, rgba(2,4,16,0.72) 62%, rgba(2,4,16,0.86) 82%, rgba(1,3,14,0.97) 100%)', zIndex:0 }}/>
      <div className="absolute pointer-events-none" style={{ bottom:'20%', left:'28%', width:'280px', height:'280px', borderRadius:'50%', background:'radial-gradient(circle, rgba(60,100,180,0.12) 0%, transparent 70%)', filter:'blur(50px)' }}/>
      <div className="absolute pointer-events-none" style={{ bottom:'20%', right:'28%', width:'280px', height:'280px', borderRadius:'50%', background:'radial-gradient(circle, rgba(60,100,180,0.10) 0%, transparent 70%)', filter:'blur(50px)' }}/>
      <div className="absolute pointer-events-none" style={{ bottom:0, left:'20%', right:'20%', height:'140px', background:'radial-gradient(ellipse, rgba(40,80,140,0.18) 0%, transparent 70%)', filter:'blur(35px)' }}/>

      <div className="max-w-6xl mx-auto relative" style={{ zIndex:1 }}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
          {/* F2 — Brand block: 1/3 */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25"><Zap className="w-4 h-4 text-white"/></div>
              <span className="text-sm font-bold text-white">Adnexusone</span>
            </Link>
            <p className="text-xs text-gray-300 leading-relaxed mb-4">AI-powered ad diagnostics for Indian D2C brands and performance agencies.</p>
            <div className="flex gap-2">
              {SOCIAL.map(({ label, svg }) => (
                <a key={label} href="#" aria-label={label} className="w-8 h-8 rounded-lg bg-white/[0.08] border border-white/[0.12] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.16] transition-all">{svg}</a>
              ))}
            </div>
          </div>

          {/* F1 — Nav columns: 2/3 */}
          <div className="col-span-1 sm:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { title:'Platform', links:[{l:'Platform Overview',h:'/platform'},{l:'Meta Ads',h:'/platform#meta'},{l:'Google Ads',h:'/platform#google'},{l:'Amazon Ads',h:'/platform#amazon'},{l:'AI Diagnostics',h:'/platform#ai'}] },
              { title:'Company',  links:[{l:'Features',h:'/#features'},{l:'Customers',h:'/customers'},{l:'Pricing',h:'/#pricing'},{l:'Contact us',h:'/contact'},{l:'Resources',h:'/#resources'}] },
              { title:'Resources',links:[{l:'Case Studies',h:'/customers'},{l:'Blog',h:'#'},{l:'Guides',h:'#'},{l:'Help Center',h:'#'}] },
              { title:'Account',  links:[{l:'Sign up free',h:'/signup'},{l:'Sign in',h:'/login'},{l:'Growth plan',h:'/signup?plan=growth'},{l:'Agency plan',h:'/signup?plan=agency'}] },
            ].map(({ title, links }) => (
              <div key={title}>
                <p className="text-[11px] font-bold text-gray-200 uppercase tracking-widest mb-4">{title}</p>
                <ul className="space-y-2.5">{links.map(({ l, h }) => <li key={l}><Link href={h} className="text-sm text-gray-400 hover:text-white transition-colors">{l}</Link></li>)}</ul>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-white/[0.12] pt-6 flex flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">© 2026 Adnexusone. All rights reserved.</p>
          <div className="flex gap-5">{['Privacy','Terms','Cookies'].map(l => <a key={l} href="#" className="text-xs text-gray-400 hover:text-gray-200 transition-colors">{l}</a>)}</div>
        </div>
      </div>

      <div className="overflow-hidden mt-6 relative" style={{ zIndex:1 }}>
        <p className="text-center font-black select-none pointer-events-none leading-none tracking-tight"
          style={{ fontSize:'clamp(4rem, 14vw, 11rem)', letterSpacing:'-0.03em', marginBottom:'-0.15em',
            background:'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(148,130,255,0.28) 40%, rgba(96,165,250,0.24) 70%, rgba(255,255,255,0.20) 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
          ADNEXUSONE
        </p>
      </div>
    </footer>
  )
}
