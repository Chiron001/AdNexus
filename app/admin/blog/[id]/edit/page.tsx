import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PostForm } from '../../PostForm'

export default async function EditPostPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const admin = createAdminClient()
  const { data, error } = await admin.from('blog_posts').select('*').eq('id', id).single()
  if (error || !data) notFound()
  return <PostForm initial={data} />
}
