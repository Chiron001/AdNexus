import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: adminUser } = await admin
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!adminUser) redirect('/dashboard')

  return (
    <div className="flex min-h-screen">
      <AdminSidebar role={adminUser.role} />
      <div className="flex-1 ml-56 bg-zinc-50 min-h-screen overflow-auto">
        {children}
      </div>
    </div>
  )
}
