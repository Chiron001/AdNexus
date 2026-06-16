'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Link2, AlertTriangle, Lightbulb,
  FileText, Settings, Zap, BarChart3, Palette,
  Wallet, Brain, TrendingDown, Target, Bell, Users, Plug,
  PanelLeftClose, PanelLeftOpen, Lock, CreditCard,
} from 'lucide-react'
import { PLAN_LEVEL } from '@/lib/config/plans'
import type { PlanTier } from '@/lib/config/plans'

type NavItem = {
  href: string
  label: string
  icon: React.ElementType
  minPlan?: PlanTier
}

const navGroups: { label: string; items: NavItem[] }[] = [
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
      { href: '/analytics',          label: 'Performance',    icon: BarChart3,    minPlan: 'free'   },
      { href: '/analytics/creative', label: 'Creatives',      icon: Palette,      minPlan: 'growth' },
      { href: '/analytics/budget',   label: 'Budget & Spend', icon: Wallet,       minPlan: 'growth' },
      { href: '/funnel',             label: 'Funnel',         icon: TrendingDown, minPlan: 'growth' },
      { href: '/audiences',          label: 'Audiences',      icon: Users,        minPlan: 'growth' },
    ],
  },
  {
    label: 'AI & Intelligence',
    items: [
      { href: '/ai',             label: 'AI Insights',    icon: Brain,        minPlan: 'professional' },
      { href: '/diagnostics',    label: 'Diagnostics',    icon: AlertTriangle                        },
      { href: '/recommendations',label: 'Recommendations',icon: Lightbulb,    minPlan: 'professional' },
      { href: '/alerts',         label: 'Alerts',         icon: Bell,         minPlan: 'basic'        },
      { href: '/goals',          label: 'Goals & KPIs',   icon: Target,       minPlan: 'growth'       },
    ],
  },
  {
    label: 'Account',
    items: [
      { href: '/reports',               label: 'Reports',      icon: FileText, minPlan: 'growth' },
      { href: '/settings/integrations', label: 'Integrations', icon: Plug                        },
    ],
  },
]

const PLAN_BADGE: Record<string, string> = {
  free:         'bg-zinc-800 text-zinc-400 border border-zinc-700',
  basic:        'bg-teal-500/15 text-teal-300 border border-teal-500/25',
  growth:       'bg-blue-500/15 text-blue-300 border border-blue-500/25',
  professional: 'bg-purple-500/15 text-purple-300 border border-purple-500/25',
  agency:       'bg-purple-500/15 text-purple-300 border border-purple-500/25',
  custom:       'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25',
}

interface SidebarProps {
  plan: 'free' | 'basic' | 'growth' | 'professional' | 'agency' | 'custom'
  userName: string
  onNavigate?: () => void
}

export function Sidebar({ plan, userName, onNavigate }: SidebarProps) {
  const pathname  = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem('sidebar-collapsed') === 'true')
    } catch {}
  }, [])

  function toggle() {
    const next = !collapsed
    setCollapsed(next)
    try { localStorage.setItem('sidebar-collapsed', String(next)) } catch {}
  }

  return (
    <aside
      className={`${collapsed ? 'w-[60px]' : 'w-60'} h-full bg-zinc-900 border-r border-zinc-800/80 flex flex-col flex-shrink-0 transition-[width] duration-200 ease-in-out overflow-hidden`}
    >
      {/* Logo + toggle */}
      <div className="h-14 border-b border-zinc-800/60 flex items-center justify-between px-3 flex-shrink-0">
        <div className={`flex items-center gap-2.5 ${collapsed ? 'w-full justify-center' : ''}`}>
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/30 flex-shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <span className="text-xl font-bold text-white tracking-tight whitespace-nowrap">Adnexusone</span>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={toggle}
            className="p-1.5 rounded-lg hover:bg-zinc-800 transition-colors flex-shrink-0"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4 text-zinc-500 hover:text-zinc-300" />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <div className="flex justify-center pt-3 pb-1">
          <button
            onClick={toggle}
            className="p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
            title="Expand sidebar"
          >
            <PanelLeftOpen className="w-4 h-4 text-zinc-500 hover:text-zinc-300" />
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className={`flex-1 py-3 overflow-y-auto overflow-x-hidden space-y-4 ${collapsed ? 'px-2' : 'px-3'}`}>
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed ? (
              <p className="px-3 mb-1 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">
                {group.label}
              </p>
            ) : (
              <div className="h-px bg-zinc-800/60 mx-1 mb-1" />
            )}
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon, minPlan }) => {
                const isActive =
                  pathname === href ||
                  (href !== '/analytics' && href !== '/settings' && pathname.startsWith(href + '/'))
                const userLevel = PLAN_LEVEL[plan] ?? 0
                const requiredLevel = PLAN_LEVEL[minPlan ?? 'free'] ?? 0
                const isLocked = requiredLevel > userLevel

                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onNavigate}
                    title={collapsed ? (isLocked ? `${label} — Growth+` : label) : undefined}
                    className={`flex items-center py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      collapsed ? 'justify-center px-2' : 'gap-3 px-3'
                    } ${
                      isActive
                        ? 'bg-purple-500/15 text-white'
                        : isLocked
                        ? 'text-zinc-600 hover:bg-zinc-800/40 hover:text-zinc-500'
                        : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-purple-400' : isLocked ? 'text-zinc-700' : ''}`} />
                    {!collapsed && (
                      <>
                        <span className="truncate flex-1">{label}</span>
                        {isLocked && <Lock className="w-3 h-3 text-zinc-700 flex-shrink-0" />}
                      </>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User + Plan */}
      <div className={`py-4 border-t border-zinc-800/60 ${collapsed ? 'px-2' : 'px-4'}`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`} title={collapsed ? userName : undefined}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-sm font-bold text-white shadow-md shadow-purple-500/20 shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{userName}</p>
              <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize mt-0.5 ${PLAN_BADGE[plan]}`}>
                {plan}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
