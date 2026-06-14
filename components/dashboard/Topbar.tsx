'use client'

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
import { ChevronDown, LogOut, Settings, Menu, X, CreditCard, User } from 'lucide-react'
import { Sidebar } from './Sidebar'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':       'Dashboard',
  '/accounts':        'Connected Accounts',
  '/diagnostics':     'Diagnostics',
  '/recommendations': 'Recommendations',
  '/reports':         'Audit Reports',
  '/billing':         'Billing & Account',
  '/settings':        'Settings',
}

interface TopbarProps {
  userName: string
  userEmail?: string
  plan: 'free' | 'basic' | 'growth' | 'professional' | 'agency' | 'custom'
}

export function Topbar({ userName, userEmail, plan }: TopbarProps) {
  const router   = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const title = Object.entries(PAGE_TITLES).find(([route]) =>
    pathname.startsWith(route)
  )?.[1] ?? 'Adnexusone'

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
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full z-50 shadow-2xl shadow-black/60">
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-md bg-zinc-800/80 hover:bg-zinc-700 transition-colors"
              >
                <X className="w-4 h-4 text-zinc-300" />
              </button>
            </div>
            <Sidebar plan={plan} userName={userName} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <header className="h-14 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800/60 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-1.5 rounded-md hover:bg-zinc-800 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-zinc-400" />
          </button>
          <h1 className="lg:hidden text-lg font-semibold text-white tracking-tight">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800/60 transition-colors outline-none">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-purple-500/20 ring-2 ring-purple-500/30">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block text-sm text-zinc-300 max-w-[130px] truncate">{userName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-zinc-900 border border-zinc-800 text-zinc-300 shadow-2xl shadow-black/60 rounded-xl p-1"
            >
              {/* User info header */}
              <div className="flex items-center gap-3 px-3 py-3 mb-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-base font-bold shrink-0 ring-2 ring-purple-500/30">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{userName}</p>
                  {userEmail && <p className="text-xs text-zinc-500 truncate">{userEmail}</p>}
                </div>
              </div>
              <DropdownMenuSeparator className="bg-zinc-800 my-1" />
              <DropdownMenuItem
                onClick={() => router.push('/settings')}
                className="flex items-center gap-2.5 cursor-pointer text-zinc-300 focus:bg-zinc-800 focus:text-white rounded-lg px-3 py-2"
              >
                <User className="w-4 h-4 text-zinc-500" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push('/billing')}
                className="flex items-center gap-2.5 cursor-pointer text-zinc-300 focus:bg-zinc-800 focus:text-white rounded-lg px-3 py-2"
              >
                <CreditCard className="w-4 h-4 text-zinc-500" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push('/settings')}
                className="flex items-center gap-2.5 cursor-pointer text-zinc-300 focus:bg-zinc-800 focus:text-white rounded-lg px-3 py-2"
              >
                <Settings className="w-4 h-4 text-zinc-500" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-800 my-1" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-400 focus:text-red-400 focus:bg-zinc-800/60 flex items-center gap-2.5 cursor-pointer rounded-lg px-3 py-2"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  )
}
