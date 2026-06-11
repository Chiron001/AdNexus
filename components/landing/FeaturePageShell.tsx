'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingCTA, LandingFooter } from '@/components/landing/LandingFooter'

export interface FeatItem {
  icon: React.ReactNode
  title: string
  desc: string
  tag?: string
  tagColor?: string
}

export interface FeaturePageConfig {
  badge: string
  badgeColor: string
  glowColor: string
  title: string
  subtitle: string
  stats: [string, string][]
  featuresLabel: string
  features: FeatItem[]
  steps?: { num: string; title: string; desc: string }[]
}

export function FeaturePageShell({
  cfg,
  children,
}: {
  cfg: FeaturePageConfig
  children?: React.ReactNode
}) {
  return (
    <div className="min-h-screen text-white" style={{ background: '#070810' }}>
      <LandingNav />

      {/* Hero */}
      <section className="relative pt-36 pb-20 px-5 sm:px-6 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 70% 50% at 50% 0%, ${cfg.glowColor} 0%, transparent 60%)` }}
        />
        <div className="max-w-3xl mx-auto text-center relative">
          <span className={`inline-flex text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border mb-6 ${cfg.badgeColor}`}>
            {cfg.badge}
          </span>
          <h1 className="text-[2rem] sm:text-5xl font-extrabold tracking-tight leading-[1.1] mb-6">
            {cfg.title}
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            {cfg.subtitle}
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-500/20 transition-all"
          >
            Start free scan <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Stats strip */}
      <div
        className="py-8 px-5 sm:px-6 border-y border-white/[0.05]"
        style={{ background: 'rgba(4,5,14,0.8)' }}
      >
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-0 divide-x divide-white/[0.06]">
          {cfg.stats.map(([num, label], i) => (
            <div key={i} className="px-6 text-center">
              <p className="text-2xl sm:text-3xl font-black text-white mb-1">{num}</p>
              <p className="text-[11px] text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features grid */}
      <section className="py-20 px-5 sm:px-6" style={{ background: 'rgba(4,5,14,0.5)' }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-7">
            {cfg.featuresLabel}
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {cfg.features.map((f, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 bg-zinc-950/60 border border-white/[0.07] rounded-2xl"
              >
                <div className="shrink-0 mt-0.5">{f.icon}</div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="text-sm font-semibold text-white">{f.title}</p>
                    {f.tag && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${f.tagColor ?? 'text-gray-500 bg-white/[0.06]'}`}>
                        {f.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works steps */}
      {cfg.steps && (
        <section className="py-20 px-5 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-10 text-center">
              How it works
            </p>
            <div className="grid sm:grid-cols-3 gap-8">
              {cfg.steps.map((s, i) => (
                <div key={i}>
                  <div className="text-5xl font-black text-white/[0.06] mb-3 font-mono leading-none">{s.num}</div>
                  <p className="text-base font-bold text-white mb-2">{s.title}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Custom slot */}
      {children}

      <LandingCTA />
      <LandingFooter />
    </div>
  )
}
