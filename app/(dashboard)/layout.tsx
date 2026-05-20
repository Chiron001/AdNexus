import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'

// Map route paths to page titles
function getPageTitle(path: string): string {
  const titles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/accounts': 'Connected Accounts',
    '/diagnostics': 'Diagnostics',
    '/recommendations': 'Recommendations',
    '/reports': 'Reports',
    '/settings': 'Settings',
  }
  for (const [route, title] of Object.entries(titles)) {
    if (path.startsWith(route)) return title
  }
  return 'AdNexus'
}

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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar plan={plan} userName={userName} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="Dashboard" userName={userName} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
