'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronRight, Shield, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingFooter } from '@/components/landing/LandingFooter'

type Option = { label: string; points: number }
type Question = { id: string; section: string; text: string; options: Option[] }

const QUESTIONS: Question[] = [
  { id: 'q1', section: 'Tracking', text: 'When did you last verify that your Facebook Pixel purchase event is firing correctly?', options: [{ label: 'Within the last 7 days', points: 10 }, { label: '1–4 weeks ago', points: 6 }, { label: '1–3 months ago', points: 2 }, { label: 'I\'m not sure / never', points: 0 }] },
  { id: 'q2', section: 'Tracking', text: 'Do you have Google Ads conversion tracking set up and verified?', options: [{ label: 'Yes, and I check it regularly', points: 10 }, { label: 'Yes, but I haven\'t verified recently', points: 5 }, { label: 'Set up but issues flagged before', points: 2 }, { label: 'No or not sure', points: 0 }] },
  { id: 'q3', section: 'Creative', text: 'How often do you refresh creatives on your top Meta ad sets?', options: [{ label: 'Every 2–3 weeks based on frequency data', points: 10 }, { label: 'Monthly or when performance drops', points: 6 }, { label: 'Every few months', points: 2 }, { label: 'Rarely or ad hoc', points: 0 }] },
  { id: 'q4', section: 'Creative', text: 'Do you monitor ad frequency per ad set on Meta?', options: [{ label: 'Yes, with alerts or weekly checks', points: 10 }, { label: 'Occasionally during reviews', points: 5 }, { label: 'Rarely', points: 1 }, { label: 'No', points: 0 }] },
  { id: 'q5', section: 'Google', text: 'Do you have negative keyword lists applied to your Search and Shopping campaigns?', options: [{ label: 'Yes, maintained and updated regularly', points: 10 }, { label: 'Yes, but set it up once and haven\'t updated', points: 5 }, { label: 'Partial — some campaigns have them', points: 2 }, { label: 'No negative keywords', points: 0 }] },
  { id: 'q6', section: 'Google', text: 'Have you checked for keyword cannibalization (same keyword in multiple ad groups/campaigns)?', options: [{ label: 'Yes, in the last 30 days', points: 10 }, { label: 'Yes, several months ago', points: 5 }, { label: 'I\'m not sure how to check this', points: 1 }, { label: 'No', points: 0 }] },
  { id: 'q7', section: 'Amazon', text: 'Do you review your Amazon search term reports and add negatives regularly?', options: [{ label: 'Yes, weekly or bi-weekly', points: 10 }, { label: 'Monthly', points: 6 }, { label: 'A few times a year', points: 2 }, { label: 'Never / don\'t run Amazon Ads', points: 0 }] },
  { id: 'q8', section: 'Budget', text: 'Do you get alerts when your daily ad budget is about to run out mid-day?', options: [{ label: 'Yes, real-time or same-day alerts', points: 10 }, { label: 'I check manually each morning', points: 4 }, { label: 'I find out after campaigns pause', points: 1 }, { label: 'I don\'t monitor this', points: 0 }] },
  { id: 'q9', section: 'Reporting', text: 'How quickly do you typically identify and fix a significant performance issue?', options: [{ label: 'Same day — I have continuous monitoring', points: 10 }, { label: 'Within 2–3 days during weekly review', points: 6 }, { label: 'Within a week', points: 3 }, { label: 'I find out when the client or manager flags it', points: 0 }] },
  { id: 'q10', section: 'Reporting', text: 'Do you have a documented baseline for ROAS, CPA, and CTR per account?', options: [{ label: 'Yes, per platform and campaign type', points: 10 }, { label: 'General baselines — not per campaign', points: 5 }, { label: 'No formal baseline', points: 1 }, { label: 'No', points: 0 }] },
]

function getResult(score: number) {
  if (score >= 85) return { label: 'Excellent', color: 'text-emerald-400', borderColor: 'border-emerald-500/30', bg: 'bg-emerald-500/[0.06]', icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />, summary: 'Your ad account health practices are strong. You have the monitoring habits that prevent most costly issues. Use Adnexusone to automate what you\'re doing manually and catch the edge cases you miss.' }
  if (score >= 65) return { label: 'Good', color: 'text-blue-400', borderColor: 'border-blue-500/30', bg: 'bg-blue-500/[0.06]', icon: <CheckCircle2 className="w-6 h-6 text-blue-400" />, summary: 'You have solid foundations but some gaps that are likely costing you 10–20% of your ad ROAS. Common issues at this score: infrequent creative reviews, inconsistent negative keyword maintenance, and lack of real-time budget alerts.' }
  if (score >= 40) return { label: 'Needs Attention', color: 'text-amber-400', borderColor: 'border-amber-500/30', bg: 'bg-amber-500/[0.06]', icon: <AlertTriangle className="w-6 h-6 text-amber-400" />, summary: 'Significant gaps in your ad account health processes. At this score, it\'s likely you\'re losing 20–35% of your potential ROAS to preventable issues — pixel gaps, audience fatigue, keyword waste, or budget exhaustion.' }
  return { label: 'Critical', color: 'text-red-400', borderColor: 'border-red-500/30', bg: 'bg-red-500/[0.06]', icon: <XCircle className="w-6 h-6 text-red-400" />, summary: 'Your ad account health processes have critical gaps. Without systematic monitoring and diagnostics, spend is almost certainly being wasted on broken configurations. Run a full Adnexusone diagnostic immediately.' }
}

export default function AdHealthScorecardPage() {
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)

  const totalQuestions = QUESTIONS.length
  const answeredCount = Object.keys(answers).length
  const maxScore = totalQuestions * 10
  const rawScore = Object.values(answers).reduce((sum, v) => sum + v, 0)
  const score = Math.round((rawScore / maxScore) * 100)
  const result = getResult(score)

  const sections = Array.from(new Set(QUESTIONS.map(q => q.section)))

  return (
    <div className="min-h-screen text-white" style={{ background: '#070810' }}>
      <LandingNav />

      <section className="relative pt-36 pb-16 px-5 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% -5%, rgba(99,102,241,0.11) 0%, transparent 55%)' }} />
        <div className="max-w-2xl mx-auto text-center relative">
          <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border mb-6 text-indigo-400 bg-indigo-500/10 border-indigo-500/20">
            <Shield className="w-3 h-3" /> Tools · Ad Health Scorecard
          </span>
          <h1 className="text-[2.2rem] sm:text-4xl font-extrabold text-white mb-4">How healthy are your ad accounts?</h1>
          <p className="text-gray-400 text-base max-w-xl mx-auto leading-relaxed">Answer 10 questions about your ad management practices. Get your health score and a specific breakdown of where you're leaving ROAS on the table.</p>
        </div>
      </section>

      <section className="pb-24 px-5 sm:px-6">
        <div className="max-w-2xl mx-auto">

          {/* Progress bar */}
          {!submitted && (
            <div className="mb-8">
              <div className="flex items-center justify-between text-[10px] text-gray-500 mb-2">
                <span>{answeredCount} of {totalQuestions} answered</span>
                <span>{Math.round((answeredCount / totalQuestions) * 100)}% complete</span>
              </div>
              <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${(answeredCount / totalQuestions) * 100}%` }} />
              </div>
            </div>
          )}

          {!submitted ? (
            <>
              <div className="space-y-5">
                {sections.map(section => (
                  <div key={section}>
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">{section}</p>
                    {QUESTIONS.filter(q => q.section === section).map(q => (
                      <div key={q.id} className="bg-zinc-950/60 border border-white/[0.07] rounded-2xl p-5 mb-3">
                        <p className="text-sm font-semibold text-white mb-4">{q.text}</p>
                        <div className="space-y-2">
                          {q.options.map((opt, j) => {
                            const isSelected = answers[q.id] === opt.points
                            return (
                              <button
                                key={j}
                                onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.points }))}
                                className={`w-full text-left px-4 py-3 rounded-xl text-sm border transition-all ${isSelected ? 'border-indigo-500/60 bg-indigo-500/10 text-white' : 'border-white/[0.07] text-gray-400 hover:border-white/[0.14] hover:text-gray-200'}`}
                              >
                                {opt.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <button
                onClick={() => setSubmitted(true)}
                disabled={answeredCount < totalQuestions}
                className={`mt-8 w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${answeredCount === totalQuestions ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/[0.04] text-gray-600 cursor-not-allowed border border-white/[0.07]'}`}
              >
                {answeredCount === totalQuestions ? <><Shield className="w-4 h-4" /> Get my health score</> : `Answer all ${totalQuestions} questions to get your score`}
              </button>
            </>
          ) : (
            <div className="space-y-5">
              {/* Score card */}
              <div className={`rounded-2xl border p-8 text-center ${result.borderColor} ${result.bg}`}>
                <div className="flex justify-center mb-3">{result.icon}</div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Your ad health score</p>
                <p className={`text-7xl font-black mb-2 ${result.color}`}>{score}</p>
                <p className={`text-lg font-bold mb-4 ${result.color}`}>{result.label}</p>
                <p className="text-sm text-gray-300 leading-relaxed max-w-md mx-auto">{result.summary}</p>
              </div>

              {/* Section breakdown */}
              <div className="bg-zinc-950/60 border border-white/[0.07] rounded-2xl p-6">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-5">Score by area</p>
                {sections.map(section => {
                  const sectionQs = QUESTIONS.filter(q => q.section === section)
                  const sectionMax = sectionQs.length * 10
                  const sectionRaw = sectionQs.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0)
                  const sectionPct = Math.round((sectionRaw / sectionMax) * 100)
                  return (
                    <div key={section} className="mb-4 last:mb-0">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-gray-400 font-medium">{section}</span>
                        <span className={`font-bold ${sectionPct >= 70 ? 'text-emerald-400' : sectionPct >= 40 ? 'text-amber-400' : 'text-red-400'}`}>{sectionPct}%</span>
                      </div>
                      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${sectionPct >= 70 ? 'bg-emerald-500' : sectionPct >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${sectionPct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* CTA */}
              <div className="bg-zinc-950/60 border border-indigo-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5 justify-between">
                <div>
                  <p className="text-sm font-bold text-white mb-1">Get a real diagnostic on your actual accounts</p>
                  <p className="text-[11px] text-gray-400">Adnexusone runs 30+ checks on live data — not a questionnaire.</p>
                </div>
                <Link href="/signup" className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all">
                  Connect your account <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <button onClick={() => { setAnswers({}); setSubmitted(false) }} className="w-full text-center text-sm text-gray-500 hover:text-gray-300 transition-colors py-2">
                Retake scorecard
              </button>
            </div>
          )}
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
