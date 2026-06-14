import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''

  // Let the login page through with no sidebar or auth check
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // All other admin pages: verify admin session cookie
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value
  const secret  = process.env.ADMIN_PASSWORD

  if (!secret || session !== secret) {
    redirect('/admin/login')
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar role="super_admin" />
      <div className="flex-1 ml-56 bg-zinc-50 min-h-screen overflow-auto">
        {children}
      </div>
    </div>
  )
}
