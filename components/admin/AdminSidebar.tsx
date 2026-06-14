'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, CreditCard, Bell, Shield, ArrowLeft, Link2, Activity, Mail, FileText, Search } from 'lucide-react'

const NAV = [
  { href: '/admin/dashboard',     icon: LayoutDashboard, label: 'Overview'      },
  { href: '/admin/users',         icon: Users,           label: 'Users'         },
  { href: '/admin/accounts',      icon: Link2,           label: 'Accounts'      },
  { href: '/admin/activity',      icon: Activity,        label: 'Sync Activity' },
  { href: '/admin/billing',       icon: CreditCard,      label: 'Billing'       },
  { href: '/admin/inquiries',     icon: Mail,            label: 'Inquiries'     },
  { href: '/admin/notifications', icon: Bell,            label: 'Notifications' },
  { href: '/admin/blog',          icon: FileText,        label: 'Blog'          },
  { href: '/admin/seo',           icon: Search,          label: 'SEO Manager'   },
]

export function AdminSidebar({ role }: { role: string }) {
  const pathname = usePathname()

  return (
    <aside className="w-56 min-h-screen bg-zinc-900 border-r border-zinc-800 flex flex-col fixed left-0 top-0 z-30">
      <div className="h-14 px-4 flex items-center gap-2.5 border-b border-zinc-800">
        <div className="w-7 h-7 rounded-md bg-purple-600 flex items-center justify-center shrink-0">
          <Shield className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-white truncate">Admin Panel</p>
          <p className="text-[10px] text-zinc-500 capitalize truncate">{role.replace('_', ' ')}</p>
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-0.5">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                active
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-zinc-800">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to App
        </Link>
      </div>
    </aside>
  )
}
