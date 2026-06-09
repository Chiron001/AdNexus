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
import { ChevronDown, LogOut, Settings, Menu, X } from 'lucide-react'
import { Sidebar } from './Sidebar'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':       'Dashboard',
  '/accounts':        'Connected Accounts',
  '/diagnostics':     'Diagnostics',
  '/recommendations': 'Recommendations',
  '/reports':         'Audit Reports',
  '/settings':        'Settings',
}

interface TopbarProps {
  userName: string
  plan: 'free' | 'growth' | 'agency'
}

export function Topbar({ userName, plan }: TopbarProps) {
  const router   = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const title = Object.entries(PAGE_TITLES).find(([route]) =>
    pathname.startsWith(route)
  )?.[1] ?? 'AdNexus'

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
          <h1 className="text-lg font-semibold text-white tracking-tight">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800/60 transition-colors outline-none">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-purple-500/20">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block text-sm text-zinc-300 max-w-[140px] truncate">{userName}</span>
              <ChevronDown className="w-4 h-4 text-zinc-500" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-zinc-900 border border-zinc-800 text-zinc-300 shadow-2xl shadow-black/50"
            >
              <DropdownMenuItem
                onClick={() => router.push('/settings')}
                className="flex items-center gap-2 cursor-pointer text-zinc-300 focus:bg-zinc-800 focus:text-white"
              >
                <Settings className="w-4 h-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-400 focus:text-red-400 focus:bg-zinc-800/80 flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  )
}
