import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PageSeoForm } from './PageSeoForm'

export default async function EditPageSeoPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const admin = createAdminClient()
  const { data, error } = await admin.from('page_seo').select('*').eq('id', id).single()
  if (error || !data) notFound()
  return <PageSeoForm initial={data} />
}
