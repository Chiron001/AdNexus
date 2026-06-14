'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, CreditCard, Bell, Shield,
  Link2, Activity, Mail, FileText, Search, Zap,
  ChevronRight,
} from 'lucide-react'

const GROUPS = [
  {
    label: 'Main',
    items: [
      { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
    ],
  },
  {
    label: 'Users & Revenue',
    items: [
      { href: '/admin/users',   icon: Users,      label: 'Users'   },
      { href: '/admin/billing', icon: CreditCard,  label: 'Billing' },
      { href: '/admin/inquiries', icon: Mail,      label: 'Inquiries' },
    ],
  },
  {
    label: 'Platform',
    items: [
      { href: '/admin/accounts',      icon: Link2,     label: 'Ad Accounts'   },
      { href: '/admin/activity',      icon: Activity,  label: 'Sync Activity' },
      { href: '/admin/notifications', icon: Bell,      label: 'Notifications' },
    ],
  },
  {
    label: 'Content & SEO',
    items: [
      { href: '/admin/blog', icon: FileText, label: 'Blog Posts'  },
      { href: '/admin/seo',  icon: Search,   label: 'SEO Manager' },
    ],
  },
]

export function AdminSidebar({ role }: { role: string }) {
  const pathname = usePathname()

  return (
    <aside
      className="w-60 min-h-screen flex flex-col fixed left-0 top-0 z-30"
      style={{
        background: 'rgba(7, 8, 16, 0.96)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Purple glow top-left */}
      <div
        className="pointer-events-none absolute -top-10 -left-10 w-48 h-48 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)' }}
      />

      {/* Logo */}
      <div
        className="h-14 px-4 flex items-center gap-3 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', boxShadow: '0 0 16px rgba(124,58,237,0.4)' }}
        >
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-white tracking-tight truncate">AdNexus</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Shield className="w-2.5 h-2.5 text-purple-400" />
            <p className="text-[10px] text-purple-400 font-semibold uppercase tracking-widest truncate">
              {role.replace(/_/g, ' ')}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto space-y-0.5 px-2">
        {GROUPS.map(group => (
          <div key={group.label} className="mb-1">
            <p
              className="px-3 pt-3 pb-1.5 text-[9px] font-bold uppercase tracking-[0.14em]"
              style={{ color: 'rgba(255,255,255,0.25)' }}
            >
              {group.label}
            </p>
            {group.items.map(({ href, icon: Icon, label }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative"
                  style={{
                    color:      active ? '#ffffff' : 'rgba(255,255,255,0.45)',
                    background: active ? 'rgba(124,58,237,0.18)' : 'transparent',
                    border:     active ? '1px solid rgba(124,58,237,0.25)' : '1px solid transparent',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.05)'
                      ;(e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.8)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'
                      ;(e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.45)'
                    }
                  }}
                >
                  {active && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r"
                      style={{ background: 'linear-gradient(to bottom,#7c3aed,#2563eb)' }}
                    />
                  )}
                  <Icon className="w-4 h-4 shrink-0" style={{ color: active ? '#a78bfa' : 'inherit' }} />
                  <span className="flex-1 truncate">{label}</span>
                  {active && <ChevronRight className="w-3 h-3 opacity-40 shrink-0" />}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div
        className="px-4 py-3 shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Link
          href="https://adnexusone.com"
          target="_blank"
          className="flex items-center gap-2 text-[11px] font-medium transition-colors"
          style={{ color: 'rgba(255,255,255,0.3)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.6)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.3)' }}
        >
          <div
            className="w-5 h-5 rounded-md flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <Zap className="w-3 h-3" />
          </div>
          adnexusone.com
        </Link>
      </div>
    </aside>
  )
}
