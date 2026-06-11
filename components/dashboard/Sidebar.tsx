'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Link2, AlertTriangle, Lightbulb,
  FileText, Settings, Zap, BarChart3, Palette,
  Wallet, Brain, TrendingDown, Target, Bell, Users, Plug,
} from 'lucide-react'

const navGroups = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
      { href: '/accounts',     label: 'Accounts',     icon: Link2           },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { href: '/analytics',          label: 'Performance',    icon: BarChart3    },
      { href: '/analytics/creative', label: 'Creatives',      icon: Palette      },
      { href: '/analytics/budget',   label: 'Budget & Spend', icon: Wallet       },
      { href: '/funnel',             label: 'Funnel',         icon: TrendingDown },
      { href: '/audiences',          label: 'Audiences',      icon: Users        },
    ],
  },
  {
    label: 'AI & Intelligence',
    items: [
      { href: '/ai',             label: 'AI Insights',    icon: Brain       },
      { href: '/diagnostics',    label: 'Diagnostics',    icon: AlertTriangle },
      { href: '/recommendations',label: 'Recommendations',icon: Lightbulb   },
      { href: '/alerts',         label: 'Alerts',         icon: Bell        },
      { href: '/goals',          label: 'Goals & KPIs',   icon: Target      },
    ],
  },
  {
    label: 'Account',
    items: [
      { href: '/reports',               label: 'Reports',      icon: FileText },
      { href: '/settings/integrations', label: 'Integrations', icon: Plug     },
      { href: '/settings',              label: 'Settings',     icon: Settings },
    ],
  },
]

const PLAN_BADGE: Record<string, string> = {
  free:   'bg-zinc-800 text-zinc-400 border border-zinc-700',
  growth: 'bg-blue-500/15 text-blue-300 border border-blue-500/25',
  agency: 'bg-purple-500/15 text-purple-300 border border-purple-500/25',
}

interface SidebarProps {
  plan: 'free' | 'growth' | 'agency'
  userName: string
  onNavigate?: () => void
}

export function Sidebar({ plan, userName, onNavigate }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-60 min-h-screen bg-zinc-900 border-r border-zinc-800/80 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-zinc-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">AdNexus</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || (href !== '/analytics' && href !== '/settings' && pathname.startsWith(href + '/'))
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onNavigate}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-purple-500/15 text-white'
                        : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-purple-400' : ''}`} />
                    {label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User + Plan */}
      <div className="px-4 py-4 border-t border-zinc-800/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-sm font-bold text-white shadow-md shadow-purple-500/20 shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{userName}</p>
            <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize mt-0.5 ${PLAN_BADGE[plan]}`}>
              {plan}
            </span>
          </div>
        </div>
      </div>
    </aside>
  )
}
