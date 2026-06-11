'use client'
import React from 'react'
import Link from 'next/link'
import { ArrowRight, Clock, Tag } from 'lucide-react'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingFooter } from '@/components/landing/LandingFooter'

const FEATURED = {
  category: 'Performance',
  categoryColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  title: 'Why your Meta ROAS is lying to you: attribution windows explained for D2C brands',
  excerpt: 'A 7-day click, 1-day view window looks impressive. But when you cross-reference against Shopify orders, the gap is often 30–40%. Here\'s exactly how to read Meta attribution honestly, and which settings actually match D2C purchase behavior.',
  readTime: '8 min read',
  date: 'Jun 8, 2026',
}

const ARTICLES = [
  { category: 'Amazon', categoryColor: 'text-orange-400 bg-orange-500/10 border-orange-500/20', title: 'ACOS above 30%? Start with these 5 diagnostic checks', excerpt: 'Before adjusting bids, run these checks. Most ACOS problems trace back to one of five root causes — match type waste, zero-sale ASINs, cannibalization, broad search term bleed, or wrong campaign type for the goal.', readTime: '6 min read', date: 'Jun 5, 2026' },
  { category: 'Google', categoryColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', title: 'Google Shopping ROAS: brand vs. non-brand segmentation is not optional', excerpt: 'Blended Shopping ROAS hides the truth. Brand-name searches inflate the number. Here\'s the segmentation setup that shows you what Generic Shopping is actually returning.', readTime: '5 min read', date: 'Jun 1, 2026' },
  { category: 'Creative', categoryColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20', title: 'Creative fatigue timeline: when does a Meta ad actually stop working?', excerpt: 'It depends on frequency, audience size, and vertical. We analyzed 200+ D2C accounts. The fatigue curve starts earlier than most creative teams expect — and the leading indicator isn\'t CTR.', readTime: '7 min read', date: 'May 28, 2026' },
  { category: 'Tracking', categoryColor: 'text-pink-400 bg-pink-500/10 border-pink-500/20', title: 'Broken pixel, broken quarter: the cost of delayed attribution detection', excerpt: 'If your Facebook Pixel stops firing purchase events, you won\'t know immediately. Your ROAS will look stable for 48–72 hours. By day 5 you\'re scaling spend against fictional performance data.', readTime: '5 min read', date: 'May 22, 2026' },
  { category: 'Strategy', categoryColor: 'text-teal-400 bg-teal-500/10 border-teal-500/20', title: 'The D2C ad account audit framework we use before scaling', excerpt: 'Before recommending any budget increase, run this 12-point framework. It takes 30 minutes manually — or 30 seconds with AdNexus. Here\'s the full checklist with what to look for at each step.', readTime: '9 min read', date: 'May 15, 2026' },
  { category: 'Amazon', categoryColor: 'text-orange-400 bg-orange-500/10 border-orange-500/20', title: 'Auto vs. manual Amazon campaigns: how to structure the right split', excerpt: 'Auto campaigns are a discovery engine, not a scaling engine. Most brands run them at too high a budget for too long. Here\'s the structure that captures intent data and moves it to profitable manual campaigns.', readTime: '6 min read', date: 'May 10, 2026' },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen text-white" style={{ background: '#070810' }}>
      <LandingNav />

      {/* Header */}
      <section className="pt-36 pb-16 px-5 sm:px-6 border-b border-white/[0.05]">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">AdNexus Blog</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Performance marketing intelligence</h1>
          <p className="text-gray-400 text-base mt-3 max-w-xl">Deep-dives on Meta, Google, and Amazon advertising — written for performance marketers who manage real money.</p>
        </div>
      </section>

      {/* Featured article */}
      <section className="py-14 px-5 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-5">Featured</p>
          <div className="bg-zinc-950/60 border border-white/[0.09] rounded-2xl p-6 sm:p-8 group hover:border-white/[0.15] transition-all cursor-pointer">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              <div className="flex-1">
                <span className={`inline-flex text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border mb-4 ${FEATURED.categoryColor}`}>{FEATURED.category}</span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-4 leading-tight group-hover:text-blue-300 transition-colors">{FEATURED.title}</h2>
                <p className="text-sm text-gray-400 leading-relaxed mb-5">{FEATURED.excerpt}</p>
                <div className="flex items-center gap-4 text-[11px] text-gray-500">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{FEATURED.readTime}</span>
                  <span>{FEATURED.date}</span>
                </div>
              </div>
              <div className="shrink-0">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-400 group-hover:gap-2.5 transition-all">Read article <ArrowRight className="w-3.5 h-3.5" /></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article grid */}
      <section className="pb-24 px-5 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-8">Recent articles</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ARTICLES.map((a, i) => (
              <div key={i} className="bg-zinc-950/50 border border-white/[0.07] rounded-2xl p-5 flex flex-col group hover:border-white/[0.12] transition-all cursor-pointer">
                <span className={`inline-flex text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border mb-4 self-start ${a.categoryColor}`}>{a.category}</span>
                <h3 className="text-sm font-bold text-white mb-3 leading-snug flex-1 group-hover:text-blue-300 transition-colors">{a.title}</h3>
                <p className="text-[11px] text-gray-500 leading-relaxed mb-5 line-clamp-3">{a.excerpt}</p>
                <div className="flex items-center gap-3 text-[10px] text-gray-600 mt-auto pt-4 border-t border-white/[0.05]">
                  <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{a.readTime}</span>
                  <span>{a.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
