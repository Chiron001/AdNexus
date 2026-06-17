'use client'

import { Star } from 'lucide-react'
import { useReveal, Carousel } from './_home-shared'

const TESTIMONIALS = [
  { role:'Performance Marketer', company:'D2C Brand',           quote:'I used to spend 2 hours every Monday on manual audits. Adnexusone does the same in 2 minutes and catches things I missed.',                                       avatar:'P', color:'from-blue-600 to-indigo-600'   },
  { role:'Head of Growth',       company:'E-commerce Brand',    quote:'The revenue impact ranking is what sold me. I know exactly which problem to fix first and what it costs every day it sits unfixed.',                            avatar:'H', color:'from-purple-600 to-pink-600'   },
  { role:'Agency Founder',       company:'Performance Agency',  quote:'We manage 18 client accounts. Adnexusone lets us catch issues before clients notice. That has been huge for retention.',                                            avatar:'F', color:'from-emerald-600 to-teal-600'  },
  { role:'Growth Lead',          company:'Fashion D2C',         quote:'Our Meta spend was bleeding $480/month on a fatigued creative. Adnexusone caught it on day one. The tool paid for itself in the first week.',                      avatar:'G', color:'from-rose-600 to-orange-600'  },
  { role:'Co-founder & CMO',     company:'Health Brand',        quote:'Keyword cannibalization on Google was something we never had time to audit. Now Adnexusone checks it every single day while we sleep.',                            avatar:'C', color:'from-cyan-600 to-blue-600'    },
  { role:'Media Buyer',          company:'D2C Accessories',     quote:'I recommended Adnexusone to every founder I know. Three months in, our ROAS is up 2.8x. The AI fixes are specific and they actually work.',                        avatar:'M', color:'from-violet-600 to-purple-600' },
  { role:'Digital Marketing Head',company:'Lifestyle Brand',   quote:'Amazon ACOS was 68% on our auto campaigns. Adnexusone flagged it in the first sync. Now we are at 32% — the margin difference is insane.',                         avatar:'D', color:'from-green-600 to-emerald-600' },
  { role:'Founder',              company:'Skincare Brand',      quote:'As a solo founder without a dedicated performance team, Adnexusone is like having a senior media buyer watching my accounts 24/7. Worth every dollar.',             avatar:'N', color:'from-amber-600 to-yellow-600'  },
]

export default function TestimonialsSection() {
  const s5 = useReveal()

  return (
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
  )
}
