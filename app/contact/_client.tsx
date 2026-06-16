'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, Phone, Mail, Loader2 } from 'lucide-react'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingFooter } from '@/components/landing/LandingFooter'

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  )
}

const SPEND_OPTIONS = [
  'Under ₹1L / month',
  '₹1L – ₹5L / month',
  '₹5L – ₹20L / month',
  '₹20L – ₹1Cr / month',
  'Above ₹1Cr / month',
]

const WHY_US = [
  { title: 'AI-powered diagnostics', desc: 'We run 30+ checks across Meta, Google, and Amazon every sync — automatically.' },
  { title: 'Real-time alerts', desc: 'Critical issues trigger instant notifications on WhatsApp and Email, not just dashboards.' },
  { title: 'Revenue impact scoring', desc: "Every issue is ranked by how much it's costing you in rupees, not just severity." },
  { title: 'Enterprise custom plans', desc: 'Unlimited accounts, dedicated support, custom integrations, and SLA guarantees.' },
]

const CONTACT_POINTS = [
  { icon: Mail,          label: 'Email us',  value: 'info@nutrisapiens.in',  href: 'mailto:info@nutrisapiens.in' },
  { icon: WhatsAppIcon,  label: 'WhatsApp',  value: '+91 93194 14318',       href: 'https://wa.me/919319414318'  },
  { icon: Phone,         label: 'Call us',   value: '+91 84484 53766',       href: 'tel:+918448453766'           },
]

export default function ContactPage() {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    monthly_spend: '', company: '', message: '',
  })
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [error,    setError]    = useState('')

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const required = ['first_name', 'last_name', 'email', 'phone', 'monthly_spend', 'company'] as const
    for (const f of required) {
      if (!form[f].trim()) { setError('Please fill in all required fields.'); return }
    }
    setLoading(true)
    try {
      const res  = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json() as { ok?: boolean; error?: string }
      if (res.ok && data.ok) {
        setSuccess(true)
      } else {
        setError(data.error ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <LandingNav />

      {/* Hero strip */}
      <section className="relative pt-28 pb-16 px-5 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #09050f 0%, #060816 60%, #040b14 100%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[400px] opacity-30"
            style={{ background: 'radial-gradient(ellipse at top right, rgba(139,92,246,0.25) 0%, transparent 65%)' }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[300px] opacity-20"
            style={{ background: 'radial-gradient(ellipse at bottom left, rgba(59,130,246,0.2) 0%, transparent 65%)' }} />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <p className="text-[11px] font-bold text-purple-400 uppercase tracking-widest mb-4">Get in touch</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-5 leading-tight">
            Reach Out To{' '}
            <span className="text-gradient animate-gradient">Turn Ideas Into Action</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
            Whether you're exploring Adnexusone for your brand or need a custom enterprise setup — we're here to help.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="py-16 px-5 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* ── Left: why contact ── */}
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight mb-3">
                Help Us Help You —{' '}
                <span className="text-gradient animate-gradient">Let's Get Started!</span>
              </h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Tell us about your ad accounts and goals. We'll reach out within one business day to show you exactly what Adnexusone can do for your brand.
              </p>

              {/* Why us bullets */}
              <div className="space-y-5 mb-10">
                {WHY_US.map(item => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{item.title}</p>
                      <p className="text-gray-400 text-sm mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-white/[0.08] pt-8">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-5">Or reach us directly</p>
                <div className="space-y-3">
                  {CONTACT_POINTS.map(({ icon: Icon, label, value, href }) => (
                    <a key={label} href={href}
                      className="flex items-center gap-3 group w-fit">
                      <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.10] flex items-center justify-center group-hover:bg-purple-500/20 group-hover:border-purple-500/30 transition-all">
                        <Icon className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-500">{label}</p>
                        <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{value}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right: form ── */}
            <div className="bg-zinc-900/70 backdrop-blur-sm border border-white/[0.08] rounded-2xl p-7 sm:p-8">
              {success ? (
                <div className="flex flex-col items-center text-center py-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-green-500/20">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Message Received!</h3>
                  <p className="text-gray-400 text-sm mb-6 max-w-xs leading-relaxed">
                    Thanks for reaching out. We'll get back to you within one business day.
                  </p>
                  <Link href="/" className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium">
                    Back to home <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">First Name <span className="text-red-400">*</span></label>
                      <input
                        value={form.first_name}
                        onChange={e => set('first_name', e.target.value)}
                        placeholder="Rahul"
                        className="w-full bg-zinc-800/60 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Last Name <span className="text-red-400">*</span></label>
                      <input
                        value={form.last_name}
                        onChange={e => set('last_name', e.target.value)}
                        placeholder="Sharma"
                        className="w-full bg-zinc-800/60 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Email Address <span className="text-red-400">*</span></label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => set('email', e.target.value)}
                      placeholder="rahul@yourbrand.com"
                      className="w-full bg-zinc-800/60 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      Phone Number <span className="text-red-400">*</span>
                      <span className="ml-1 text-green-400 font-normal">(WhatsApp enabled)</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1.5 bg-zinc-800/60 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white shrink-0">
                        <span>🇮🇳</span>
                        <span className="text-gray-400">+91</span>
                      </div>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={e => set('phone', e.target.value)}
                        placeholder="98765 43210"
                        className="flex-1 bg-zinc-800/60 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Monthly Ad Spend <span className="text-red-400">*</span></label>
                    <select
                      value={form.monthly_spend}
                      onChange={e => set('monthly_spend', e.target.value)}
                      className="w-full bg-zinc-800/60 border border-zinc-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/50 transition-colors"
                    >
                      <option value="" className="text-zinc-500">— Select your monthly spend —</option>
                      {SPEND_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Brand / Company Name <span className="text-red-400">*</span></label>
                    <input
                      value={form.company}
                      onChange={e => set('company', e.target.value)}
                      placeholder="Your Brand Pvt. Ltd."
                      className="w-full bg-zinc-800/60 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      Describe your problem or goal
                      <span className="ml-1 text-gray-600 font-normal">(optional — helps us prepare)</span>
                    </label>
                    <textarea
                      value={form.message}
                      onChange={e => set('message', e.target.value)}
                      placeholder="e.g. Our Meta ROAS dropped from 3x to 1.8x and we don't know why. We're spending ₹8L/month and need help diagnosing the issue fast."
                      rows={4}
                      className="w-full bg-zinc-800/60 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/50 transition-colors resize-none"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm py-3 rounded-xl transition-all shadow-lg shadow-purple-500/20"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    {loading ? 'Sending…' : "Submit — We'll Reply Within 1 Business Day"}
                  </button>

                  <p className="text-[11px] text-gray-600 text-center">
                    No spam. Your details are only used to respond to your enquiry.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
