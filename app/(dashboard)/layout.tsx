import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'

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

  const userName = profile?.full_name || user.email?.split('@')[0] || 'User'
  const plan = (profile?.plan as 'free' | 'growth' | 'agency') || 'free'

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
        <Topbar userName={userName} plan={plan} />
        <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
