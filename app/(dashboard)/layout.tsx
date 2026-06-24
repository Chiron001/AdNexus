import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'

export const metadata: Metadata = { robots: 'noindex, nofollow' }

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, plan')
    .eq('id', user.id)
    .single()

  // Gate: only block if no profile at all OR plan is explicitly 'free'
  // Any paid plan (basic/growth/professional/agency/custom) goes straight to dashboard
  if (!profile) redirect('/onboarding/subscribe')
  if (profile.plan === 'free') redirect('/onboarding/subscribe')

  const userName  = profile.full_name || user.email?.split('@')[0] || 'User'
  const userEmail = user.email ?? ''
  const plan = profile.plan as 'basic' | 'growth' | 'professional' | 'agency' | 'custom'

  return (
    <div
      className="flex h-screen overflow-hidden bg-zinc-950"
      style={{
        backgroundImage: `
          radial-gradient(ellipse at top right, rgba(139,92,246,0.07) 0%, transparent 55%),
          radial-gradient(ellipse at bottom left,  rgba(59,130,246,0.04) 0%, transparent 50%)
        `,
      }}
    >
      {/* Desktop sidebar — fixed height, scrolls internally */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar plan={plan} userName={userName} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar userName={userName} userEmail={userEmail} plan={plan} />
        <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
