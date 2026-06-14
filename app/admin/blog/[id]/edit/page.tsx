import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PostForm } from '../../PostForm'

export default async function EditPostPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const admin = createAdminClient()
  const { data, error } = await admin.from('blog_posts').select('*').eq('id', id).single()
  if (error || !data) notFound()

  // Convert null → '' so form inputs receive strings, not null
  return (
    <PostForm
      initial={{
        id:                   data.id,
        title:                data.title,
        slug:                 data.slug,
        excerpt:              data.excerpt              ?? '',
        content:              data.content              ?? '',
        cover_image_url:      data.cover_image_url      ?? '',
        author_name:          data.author_name,
        category:             data.category             ?? '',
        tags:                 data.tags                 ?? [],
        status:               data.status,
        published_at:         data.published_at         ?? null,
        featured:             data.featured,
        reading_time_minutes: data.reading_time_minutes,
        seo_title:            data.seo_title            ?? '',
        seo_description:      data.seo_description      ?? '',
        focus_keyword:        data.focus_keyword        ?? '',
        seo_keywords:         data.seo_keywords         ?? '',
        og_title:             data.og_title             ?? '',
        og_description:       data.og_description       ?? '',
        og_image_url:         data.og_image_url         ?? '',
        canonical_url:        data.canonical_url        ?? '',
        robots_directive:     data.robots_directive,
        schema_type:          data.schema_type,
      }}
    />
  )
}
