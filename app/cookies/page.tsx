import { LandingNav } from '@/components/landing/LandingNav'
import { LandingFooter } from '@/components/landing/LandingFooter'

export const metadata = { title: 'Cookie Policy — Adnexusone' }

const LAST_UPDATED = 'June 14, 2026'

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <LandingNav />

      <main className="max-w-3xl mx-auto px-5 sm:px-6 pt-32 pb-24">
        <div className="mb-12">
          <p className="text-[11px] font-bold text-purple-400 uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">Cookie Policy</h1>
          <p className="text-zinc-500 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="space-y-10 text-zinc-300 leading-relaxed">

          <section>
            <p>
              This Cookie Policy explains how Adnexusone uses cookies and similar tracking technologies
              when you visit our website or use our platform. By using our site, you consent to our use
              of cookies as described here.
            </p>
          </section>

          <Section title="1. What Are Cookies?">
            <p>
              Cookies are small text files that websites store on your browser or device. They allow
              websites to remember your preferences, keep you logged in, and understand how you use the
              site. Cookies do not contain viruses and cannot execute code on your device.
            </p>
          </Section>

          <Section title="2. Cookies We Use">

            <div className="mt-4 space-y-6">
              {/* Essential */}
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white">Essential Cookies</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Always active</span>
                </div>
                <p className="text-sm text-zinc-400 mb-3">
                  Required for the platform to function. Without these cookies, you cannot log in or use
                  the dashboard. These cannot be disabled.
                </p>
                <table className="w-full text-xs text-zinc-500">
                  <thead><tr className="border-b border-zinc-800"><th className="text-left py-1.5 text-zinc-400">Cookie</th><th className="text-left py-1.5 text-zinc-400">Purpose</th><th className="text-left py-1.5 text-zinc-400">Duration</th></tr></thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    <tr><td className="py-2 font-mono">sb-access-token</td><td className="py-2">Supabase authentication session</td><td className="py-2">1 hour</td></tr>
                    <tr><td className="py-2 font-mono">sb-refresh-token</td><td className="py-2">Keeps you logged in between sessions</td><td className="py-2">30 days</td></tr>
                    <tr><td className="py-2 font-mono">sidebar-collapsed</td><td className="py-2">Remembers your sidebar preference</td><td className="py-2">Persistent</td></tr>
                  </tbody>
                </table>
              </div>

              {/* Functional */}
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white">Functional Cookies</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">Optional</span>
                </div>
                <p className="text-sm text-zinc-400 mb-3">
                  Enhance your experience by remembering your preferences and settings.
                </p>
                <table className="w-full text-xs text-zinc-500">
                  <thead><tr className="border-b border-zinc-800"><th className="text-left py-1.5 text-zinc-400">Cookie</th><th className="text-left py-1.5 text-zinc-400">Purpose</th><th className="text-left py-1.5 text-zinc-400">Duration</th></tr></thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    <tr><td className="py-2 font-mono">hero-tab</td><td className="py-2">Remembers selected platform tab on homepage</td><td className="py-2">Session</td></tr>
                    <tr><td className="py-2 font-mono">theme-pref</td><td className="py-2">UI theme preferences</td><td className="py-2">1 year</td></tr>
                  </tbody>
                </table>
              </div>

              {/* Analytics */}
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white">Analytics Cookies</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-700 text-zinc-400 border border-zinc-600">Optional</span>
                </div>
                <p className="text-sm text-zinc-400">
                  We use privacy-respecting analytics to understand how visitors use our website. These
                  analytics do not track you across other sites and do not use advertising identifiers.
                  All data is aggregated and anonymised.
                </p>
              </div>

              {/* What we DON'T use */}
              <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-5">
                <h3 className="text-sm font-bold text-white mb-3">What We Do NOT Use</h3>
                <ul className="space-y-2 text-sm text-zinc-400">
                  <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✗</span> Third-party advertising cookies (Google Ads, Meta Pixel, etc.)</li>
                  <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✗</span> Cross-site tracking or fingerprinting</li>
                  <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✗</span> Cookies that share your data with ad networks</li>
                  <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✗</span> Social media tracking pixels</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section title="3. Third-Party Cookies">
            <p>
              Some functionality on our platform may set cookies from trusted third parties:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Supabase</strong> — authentication and session management</li>
              <li><strong>Paddle</strong> — payment checkout overlay (sets cookies during checkout flow only)</li>
            </ul>
            <p className="mt-3">
              These third parties have their own cookie policies, which we encourage you to review.
            </p>
          </Section>

          <Section title="4. Managing Cookies">
            <p>
              You can control cookies through your browser settings. Most browsers allow you to:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>View which cookies are set</li>
              <li>Delete cookies individually or all at once</li>
              <li>Block cookies from specific sites</li>
              <li>Block all third-party cookies</li>
            </ul>
            <p className="mt-3">
              Note: Disabling essential cookies (authentication) will prevent you from logging into the
              platform. Disabling other cookies will not affect core functionality.
            </p>
            <p className="mt-3 text-sm">
              Browser cookie settings:{' '}
              <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">Chrome</a>
              {' · '}
              <a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">Firefox</a>
              {' · '}
              <a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">Safari</a>
              {' · '}
              <a href="https://support.microsoft.com/en-us/windows/delete-and-manage-cookies" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">Edge</a>
            </p>
          </Section>

          <Section title="5. Changes to This Policy">
            <p>
              We may update this Cookie Policy as we add new features or third-party integrations. We will
              update the "Last updated" date above and, for significant changes, notify you by email.
            </p>
          </Section>

          <Section title="6. Contact">
            <p>
              Questions about our use of cookies?{' '}
              <a href="mailto:privacy@adnexusone.com" className="text-purple-400 hover:text-purple-300">privacy@adnexusone.com</a>
            </p>
          </Section>

        </div>
      </main>

      <LandingFooter />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-white mb-4 pb-2 border-b border-zinc-800">{title}</h2>
      <div className="space-y-3 text-zinc-400">{children}</div>
    </section>
  )
}
