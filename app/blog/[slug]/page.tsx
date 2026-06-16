import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingBottom } from '@/components/landing/LandingFooter'
import { Calendar, Clock, Tag, ArrowLeft, Share2 } from 'lucide-react'

export const revalidate = 60

export async function generateStaticParams() {
  const admin = createAdminClient()
  const { data } = await admin.from('blog_posts').select('slug').eq('status', 'published')
  return (data ?? []).map(p => ({ slug: p.slug }))
}

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params
  const admin = createAdminClient()
  const { data: post } = await admin.from('blog_posts').select('*').eq('slug', slug).eq('status', 'published').single()
  if (!post) return { title: 'Post not found' }

  const title       = post.seo_title       || post.title
  const description = post.seo_description || post.excerpt || ''
  const ogImage     = post.og_image_url    || post.cover_image_url
  const canonical   = post.canonical_url   || `https://adnexusone.com/blog/${slug}`

  return {
    title,
    description,
    robots:     post.robots_directive ?? 'index,follow',
    keywords:   post.seo_keywords    ?? undefined,
    alternates: { canonical },
    authors:    [{ name: post.author_name }],
    openGraph: {
      title:       post.og_title       || title,
      description: post.og_description || description,
      url:         canonical,
      siteName:    'AdNexus',
      type:        'article',
      publishedTime: post.published_at  ?? undefined,
      modifiedTime:  post.updated_at   ?? undefined,
      authors:     [post.author_name],
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630, alt: title }] } : {}),
    },
    twitter: {
      card:        'summary_large_image',
      title:       post.og_title       || title,
      description: post.og_description || description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  }
}

function fmtDate(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

function schema(post: Record<string, string | number | boolean | null | string[]>) {
  return {
    '@context': 'https://schema.org',
    '@type':    post.schema_type ?? 'BlogPosting',
    headline:   post.seo_title   ?? post.title,
    description: post.seo_description ?? post.excerpt ?? '',
    image:      post.og_image_url ?? post.cover_image_url ?? undefined,
    datePublished: post.published_at,
    dateModified:  post.updated_at,
    author: {
      '@type': 'Person',
      name:    post.author_name,
    },
    publisher: {
      '@type': 'Organization',
      name:    'AdNexus',
      url:     'https://adnexusone.com',
    },
    mainEntityOfPage: {
      '@type': '@id',
      '@id':   post.canonical_url ?? `https://adnexusone.com/blog/${post.slug}`,
    },
    keywords: post.seo_keywords ?? undefined,
  }
}

export default async function BlogPostPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const admin = createAdminClient()

  const { data: post } = await admin
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!post) notFound()

  // Increment view count (fire-and-forget)
  admin.from('blog_posts').update({ view_count: (post.view_count ?? 0) + 1 }).eq('id', post.id)

  // Related posts
  const { data: related } = await admin
    .from('blog_posts')
    .select('title,slug,cover_image_url,category,reading_time_minutes')
    .eq('status', 'published')
    .eq('category', post.category ?? '')
    .neq('id', post.id)
    .limit(3)

  return (
    <>
      <LandingNav />

      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema(post)) }}
      />

      <main className="bg-white">
        {/* Cover image */}
        {post.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <div className="w-full h-72 sm:h-96 overflow-hidden mt-14">
            <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="max-w-3xl mx-auto px-5 sm:px-6 py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-zinc-400 mb-8">
            <Link href="/blog" className="hover:text-zinc-600 flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-3 h-3" /> Blog
            </Link>
            {post.category && (
              <>
                <span>/</span>
                <span className="text-zinc-500">{post.category}</span>
              </>
            )}
          </nav>

          {/* Category badge */}
          {post.category && (
            <span className="inline-block text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full mb-4">
              {post.category}
            </span>
          )}

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight mb-4 leading-tight">
            {post.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400 mb-8 pb-8 border-b border-zinc-100">
            <span className="font-medium text-zinc-600">{post.author_name}</span>
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{post.published_at ? fmtDate(post.published_at) : ''}</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{post.reading_time_minutes} min read</span>
            <button
              type="button"
              onClick={() => { if (typeof window !== 'undefined') navigator.clipboard?.writeText(window.location.href) }}
              className="ml-auto flex items-center gap-1.5 text-xs border border-zinc-200 rounded-lg px-3 py-1.5 hover:bg-zinc-50 transition-colors"
            >
              <Share2 className="w-3 h-3" /> Share
            </button>
          </div>

          {/* Article content */}
          <article
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: post.content ?? '' }}
          />

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-zinc-100">
              {post.tags.map((tag: string) => (
                <span key={tag} className="flex items-center gap-1 text-xs text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full">
                  <Tag className="w-3 h-3" />{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Related posts */}
        {(related ?? []).length > 0 && (
          <section className="max-w-6xl mx-auto px-5 sm:px-6 py-12 border-t border-zinc-100">
            <h2 className="text-lg font-bold text-zinc-900 mb-6">Related Posts</h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {(related ?? []).map(p => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="group flex flex-col border border-zinc-200 rounded-xl overflow-hidden hover:border-zinc-300 hover:shadow-md transition-all">
                  {p.cover_image_url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={p.cover_image_url} alt={p.title} className="w-full h-36 object-cover" />
                    : <div className="w-full h-36 bg-gradient-to-br from-blue-50 to-indigo-100" />}
                  <div className="p-4">
                    {p.category && <p className="text-[11px] font-bold text-blue-600 mb-1">{p.category}</p>}
                    <p className="text-sm font-semibold text-zinc-800 group-hover:text-blue-600 transition-colors line-clamp-2">{p.title}</p>
                    <p className="text-xs text-zinc-400 mt-2 flex items-center gap-1"><Clock className="w-3 h-3" />{p.reading_time_minutes} min</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <LandingBottom />
    </>
  )
}
