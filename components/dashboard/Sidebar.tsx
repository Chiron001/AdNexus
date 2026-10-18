'use client'

import { useSyncExternalStore } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Link2, AlertTriangle, Lightbulb,
  FileText, Zap, BarChart3, Palette,
  Wallet, Brain, TrendingDown, Target, Bell, Users, Plug,
  PanelLeftClose, PanelLeftOpen, Lock, Sparkles, ArrowRight,
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
  free:         'bg-white/[0.08] text-white/60',
  basic:        'bg-cyan-400/15 text-cyan-300',
  growth:       'bg-blue-500/15 text-blue-300',
  professional: 'bg-violet-500/15 text-violet-300',
  agency:       'bg-violet-500/15 text-violet-300',
  custom:       'bg-emerald-500/15 text-emerald-300',
}

/* Collapsed state lives in localStorage; this store lets every Sidebar instance
   (desktop + mobile drawer) read it without a hydration mismatch */
const COLLAPSE_KEY = 'sidebar-collapsed'
const listeners = new Set<() => void>()
function subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn) } }
function readCollapsed() { try { return localStorage.getItem(COLLAPSE_KEY) === 'true' } catch { return false } }
function writeCollapsed(v: boolean) {
  try { localStorage.setItem(COLLAPSE_KEY, String(v)) } catch {}
  listeners.forEach(fn => fn())
}

interface SidebarProps {
  plan: 'free' | 'basic' | 'growth' | 'professional' | 'agency' | 'custom'
  userName: string
  onNavigate?: () => void
}

export function Sidebar({ plan, userName, onNavigate }: SidebarProps) {
  const pathname  = usePathname()
  const stored    = useSyncExternalStore(subscribe, readCollapsed, () => false)
  // The mobile drawer (onNavigate set) is always expanded
  const collapsed = !onNavigate && stored
  const userLevel = PLAN_LEVEL[plan] ?? 0
  const canUpgrade = userLevel < (PLAN_LEVEL.professional ?? 0)

  return (
    <aside
      className={`${collapsed ? 'w-[68px]' : 'w-64'} h-full flex flex-col flex-shrink-0 border-r border-white/[0.07] transition-[width] duration-200 ease-in-out overflow-hidden`}
      style={{ background: 'linear-gradient(180deg, #0B0A14 0%, #100D24 100%)' }}
    >
      {/* Logo + toggle */}
      <div className="h-16 border-b border-white/[0.07] flex items-center justify-between px-4 flex-shrink-0">
        <Link href="/dashboard" className={`flex items-center gap-2.5 ${collapsed ? 'w-full justify-center' : ''}`}>
          <span className="w-8 h-8 rounded-[10px] flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--io-accent), var(--io-accent-2))' }}>
            <Zap className="w-4 h-4 text-white" />
          </span>
          {!collapsed && (
            <span className="io-display text-[17px] font-bold text-white tracking-tight whitespace-nowrap">
              Adnexus<span className="font-medium opacity-70">one</span>
            </span>
          )}
        </Link>
        {!collapsed && !onNavigate && (
          <button onClick={() => writeCollapsed(true)} title="Collapse sidebar"
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors flex-shrink-0">
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <div className="flex justify-center pt-3 pb-1">
          <button onClick={() => writeCollapsed(false)} title="Expand sidebar"
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors">
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className={`flex-1 py-3 overflow-y-auto overflow-x-hidden space-y-4 ${collapsed ? 'px-2.5' : 'px-3'}`} style={{ scrollbarWidth: 'none' }}>
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed ? (
              <p className="px-3 mb-1.5 text-[10px] font-semibold text-white/30 uppercase tracking-[0.14em]">{group.label}</p>
            ) : (
              <div className="h-px bg-white/[0.07] mx-1 mb-2" />
            )}
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon, minPlan }) => {
                const isActive =
                  pathname === href ||
                  (href !== '/analytics' && href !== '/settings' && pathname.startsWith(href + '/'))
                const isLocked = (PLAN_LEVEL[minPlan ?? 'free'] ?? 0) > userLevel

                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onNavigate}
                    title={collapsed ? (isLocked ? `${label} — upgrade to unlock` : label) : undefined}
                    className={`relative flex items-center py-2 rounded-xl text-[13px] font-medium transition-colors ${
                      collapsed ? 'justify-center px-2' : 'gap-3 px-3'
                    } ${
                      isActive
                        ? 'bg-white/[0.08] text-white'
                        : isLocked
                        ? 'text-white/30 hover:bg-white/[0.03] hover:text-white/50'
                        : 'text-white/60 hover:bg-white/[0.04] hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r"
                        style={{ background: 'linear-gradient(180deg, var(--io-accent), var(--io-accent-2))' }} />
                    )}
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-violet-300' : ''}`} />
                    {!collapsed && (
                      <>
                        <span className="truncate flex-1">{label}</span>
                        {isLocked && <Lock className="w-3 h-3 flex-shrink-0" />}
                      </>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Upgrade nudge */}
      {canUpgrade && !collapsed && (
        <div className="mx-3 mb-3 rounded-2xl border border-white/[0.1] p-4"
          style={{ background: 'radial-gradient(120% 120% at 100% 0%, rgba(124,58,237,.35), transparent 60%), rgba(255,255,255,.03)' }}>
          <p className="flex items-center gap-1.5 text-[13px] font-semibold text-white"><Sparkles className="w-3.5 h-3.5 text-violet-300" /> Unlock AI Insights</p>
          <p className="text-[11px] text-white/50 mt-1 leading-relaxed">AI recommendations and insights come with Professional.</p>
          <Link href="/billing" onClick={onNavigate} className="mt-3 flex items-center gap-1 text-xs font-semibold text-violet-200 hover:text-white transition-colors">
            See plans <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* User + Plan */}
      <div className={`py-4 border-t border-white/[0.07] ${collapsed ? 'px-2' : 'px-4'}`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`} title={collapsed ? userName : undefined}>
          <span className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white uppercase shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--io-accent), var(--io-accent-2))' }}>
            {userName.charAt(0)}
          </span>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white truncate capitalize">{userName}</p>
              <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize mt-0.5 ${PLAN_BADGE[plan]}`}>
                {plan === 'agency' ? 'professional' : plan} plan
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
