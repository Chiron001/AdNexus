'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, LogOut, Settings, Menu, X, CreditCard, User, Bell } from 'lucide-react'
import { Sidebar } from './Sidebar'

// Longest prefix first so /analytics/creative wins over /analytics
const PAGE_TITLES: [string, string][] = [
  ['/analytics/creative',    'Creatives'],
  ['/analytics/budget',      'Budget & Spend'],
  ['/analytics',             'Performance'],
  ['/settings/integrations', 'Integrations'],
  ['/dashboard',             'Dashboard'],
  ['/accounts',              'Connected Accounts'],
  ['/diagnostics',           'Diagnostics'],
  ['/recommendations',       'Recommendations'],
  ['/reports',               'Reports'],
  ['/billing',               'Billing & Account'],
  ['/settings',              'Settings'],
  ['/funnel',                'Funnel'],
  ['/audiences',             'Audiences'],
  ['/alerts',                'Alerts'],
  ['/goals',                 'Goals & KPIs'],
  ['/ai',                    'AI Insights'],
]

interface TopbarProps {
  userName: string
  userEmail?: string
  plan: 'free' | 'basic' | 'growth' | 'professional' | 'agency' | 'custom'
}

const ITEM = 'flex items-center gap-2.5 cursor-pointer text-white/80 focus:bg-white/[0.08] focus:text-white rounded-lg px-3 py-2'

export function Topbar({ userName, userEmail, plan }: TopbarProps) {
  const router   = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const title = PAGE_TITLES.find(([route]) => pathname.startsWith(route))?.[1] ?? 'Adnexusone'

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full z-50 shadow-2xl shadow-black/60">
            <div className="absolute top-4 right-3 z-10">
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu"
                className="p-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] transition-colors">
                <X className="w-4 h-4 text-white/80" />
              </button>
            </div>
            <Sidebar plan={plan} userName={userName} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <header className="h-16 border-b border-white/[0.07] flex items-center justify-between px-4 sm:px-6 flex-shrink-0 sticky top-0 z-20 backdrop-blur-xl"
        style={{ background: 'rgba(11,10,20,.72)' }}>
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => setMobileOpen(true)} aria-label="Open menu"
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors">
            <Menu className="w-5 h-5 text-white/70" />
          </button>
          <h1 className="io-display text-[17px] font-semibold text-white tracking-tight truncate">{title}</h1>
        </div>

        <div className="flex items-center gap-1.5">
          <Link href="/alerts" aria-label="Alerts"
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors">
            <Bell className="w-[18px] h-[18px]" />
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-white/[0.08] hover:bg-white/[0.06] transition-colors outline-none">
              <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold uppercase"
                style={{ background: 'linear-gradient(135deg, var(--io-accent), var(--io-accent-2))' }}>
                {userName.charAt(0)}
              </span>
              <span className="hidden sm:block text-[13px] font-medium text-white/85 max-w-[130px] truncate capitalize">{userName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-white/40" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end"
              className="w-60 bg-[#141127] border border-white/[0.1] text-white/80 shadow-2xl shadow-black/60 rounded-2xl p-1.5">
              <div className="flex items-center gap-3 px-3 py-3 mb-1">
                <span className="w-10 h-10 rounded-full flex items-center justify-center text-white text-base font-bold uppercase shrink-0"
                  style={{ background: 'linear-gradient(135deg, var(--io-accent), var(--io-accent-2))' }}>
                  {userName.charAt(0)}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate capitalize">{userName}</p>
                  {userEmail && <p className="text-xs text-white/45 truncate">{userEmail}</p>}
                </div>
              </div>
              <DropdownMenuSeparator className="bg-white/[0.08] my-1" />
              <DropdownMenuItem onClick={() => router.push('/settings')} className={ITEM}>
                <User className="w-4 h-4 text-white/45" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/billing')} className={ITEM}>
                <CreditCard className="w-4 h-4 text-white/45" /> Billing
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')} className={ITEM}>
                <Settings className="w-4 h-4 text-white/45" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/[0.08] my-1" />
              <DropdownMenuItem onClick={handleLogout}
                className="text-red-300 focus:text-red-200 focus:bg-red-500/10 flex items-center gap-2.5 cursor-pointer rounded-lg px-3 py-2">
                <LogOut className="w-4 h-4" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  )
}
