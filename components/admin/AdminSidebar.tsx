'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, CreditCard, Bell, Shield,
  Link2, Activity, Mail, FileText, Search, Zap,
  HardDrive, Bot, ArrowLeftRight, Code2, LogOut, ExternalLink,
} from 'lucide-react'

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
  exactMatch?: boolean // if true, only exact pathname match activates this item
}

const GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Main',
    items: [
      { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
    ],
  },
  {
    label: 'Users & Revenue',
    items: [
      { href: '/admin/users',     icon: Users,      label: 'Users'     },
      { href: '/admin/billing',   icon: CreditCard, label: 'Billing'   },
      { href: '/admin/inquiries', icon: Mail,       label: 'Inquiries' },
    ],
  },
  {
    label: 'Platform',
    items: [
      { href: '/admin/accounts',      icon: Link2,    label: 'Ad Accounts'   },
      { href: '/admin/activity',      icon: Activity, label: 'Sync Activity' },
      { href: '/admin/notifications', icon: Bell,     label: 'Notifications' },
    ],
  },
  {
    label: 'Content & SEO',
    items: [
      { href: '/admin/media',        icon: HardDrive,      label: 'Media'       },
      { href: '/admin/blog',         icon: FileText,       label: 'Blog Posts'  },
      // SEO Manager: exact + its own sub-route /[id] — but NOT /crawlers
      { href: '/admin/seo',          icon: Search,         label: 'SEO Manager', exactMatch: false },
      { href: '/admin/seo/crawlers', icon: Bot,            label: 'Crawlers'    },
      { href: '/admin/redirects',    icon: ArrowLeftRight, label: 'Redirects'   },
    ],
  },
  {
    label: 'Developer',
    items: [
      { href: '/admin/scripts', icon: Code2, label: 'Script Manager' },
    ],
  },
]

// All known nav hrefs — used to prevent parent items matching a child's path
const ALL_HREFS = GROUPS.flatMap(g => g.items.map(i => i.href))

function isActive(pathname: string, href: string): boolean {
  if (pathname === href) return true
  // Only match sub-paths if no sibling nav item is a more specific match
  if (!pathname.startsWith(href + '/')) return false
  // Check: is there another nav item whose href is a prefix of current path?
  const moreSpecific = ALL_HREFS.some(
    other => other !== href && pathname.startsWith(other + '/') || other === pathname
  )
  return !moreSpecific
}

export function AdminSidebar({ role }: { role: string }) {
  const pathname = usePathname()

  async function signOut() {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    window.location.assign('/admin/login')
  }

  return (
    <aside className="w-60 h-screen flex flex-col fixed left-0 top-0 z-30 border-r border-white/[0.07]"
      style={{ background: 'linear-gradient(180deg, #0B0A14 0%, #100D24 100%)' }}>

      {/* Logo */}
      <div className="h-16 px-5 flex items-center gap-2.5 shrink-0 border-b border-white/[0.07]">
        <span className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30"
          style={{ background: 'linear-gradient(135deg, var(--io-accent), var(--io-accent-2))' }}>
          <Zap className="w-4 h-4 text-white" />
        </span>
        <div className="min-w-0">
          <p className="io-display text-[15px] font-bold text-white tracking-tight leading-none">
            Adnexus<span className="font-medium opacity-70">one</span>
          </p>
          <p className="flex items-center gap-1 mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-300/80">
            <Shield className="w-2.5 h-2.5" /> {role.replace(/_/g, ' ')}
          </p>
        </div>
      </div>

      {/* Nav — scrollable so nothing gets cut off */}
      <nav className="flex-1 py-3 overflow-y-auto px-3" style={{ scrollbarWidth: 'none' }}>
        {GROUPS.map(group => (
          <div key={group.label} className="mb-2">
            <p className="px-3 pt-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/30">
              {group.label}
            </p>
            {group.items.map(({ href, icon: Icon, label }) => {
              const active = isActive(pathname, href)
              return (
                <Link key={href} href={href}
                  className={`relative flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors ${
                    active ? 'bg-white/[0.08] text-white' : 'text-white/55 hover:bg-white/[0.04] hover:text-white/90'
                  }`}>
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r"
                      style={{ background: 'linear-gradient(180deg, var(--io-accent), var(--io-accent-2))' }} />
                  )}
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-violet-300' : ''}`} />
                  <span className="flex-1 truncate">{label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 shrink-0 border-t border-white/[0.07] space-y-0.5">
        <a href="https://adnexusone.com" target="_blank" rel="noreferrer"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium text-white/45 hover:bg-white/[0.04] hover:text-white/90 transition-colors">
          <ExternalLink className="w-4 h-4" /> adnexusone.com
        </a>
        <button onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium text-white/45 hover:bg-red-500/10 hover:text-red-300 transition-colors">
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </aside>
  )
}
