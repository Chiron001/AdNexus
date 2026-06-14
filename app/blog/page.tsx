import type { Metadata } from 'next'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingCTA, LandingFooter } from '@/components/landing/LandingFooter'
import { Calendar, Clock, Tag, ArrowRight } from 'lucide-react'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const admin = createAdminClient()
  const { data: seo } = await admin.from('page_seo').select('*').eq('page_path', '/blog').single()
  const title       = seo?.meta_title       ?? 'Blog — AdNexus Ad Intelligence Insights'
  const description = seo?.meta_description ?? 'Performance marketing tips and D2C growth insights from the AdNexus team.'
  const ogImage     = seo?.og_image_url     ?? undefined

  return {
    title,
    description,
    robots:     seo?.robots_directive ?? 'index,follow',
    alternates: { canonical: seo?.canonical_url ?? 'https://adnexusone.com/blog' },
    openGraph: {
      title:       seo?.og_title       ?? title,
      description: seo?.og_description ?? description,
      url:         'https://adnexusone.com/blog',
      siteName:    'AdNexus',
      type:        'website',
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card:        'summary_large_image',
      title:       seo?.og_title       ?? title,
      description: seo?.og_description ?? description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  }
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function BlogPage() {
  const admin = createAdminClient()
  const { data: posts } = await admin
    .from('blog_posts')
    .select('id,title,slug,excerpt,cover_image_url,category,tags,author_name,published_at,reading_time_minutes,featured')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  const all      = posts ?? []
  const featured = all.find(p => p.featured)
  const rest     = all.filter(p => !p.featured)

  return (
    <>
      <LandingNav />
      <main className="min-h-screen text-white" style={{ background: '#070810' }}>
        {/* Hero */}
        <section className="pt-36 pb-16 px-5 sm:px-6 border-b border-white/[0.05]">
          <div className="max-w-5xl mx-auto">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">AdNexus Blog</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Performance marketing intelligence</h1>
            <p className="text-gray-400 text-base mt-3 max-w-xl">Deep-dives on Meta, Google, and Amazon advertising — written for performance marketers who manage real money.</p>
          </div>
        </section>

        {all.length === 0 ? (
          <div className="max-w-5xl mx-auto px-5 py-32 text-center">
            <p className="text-gray-400 text-lg font-medium">No posts yet</p>
            <p className="text-gray-600 text-sm mt-1">Check back soon — we publish every week.</p>
          </div>
        ) : (
          <>
            {/* Featured post */}
            {featured && (
              <section className="py-14 px-5 sm:px-6">
                <div className="max-w-5xl mx-auto">
                  <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-5">Featured</p>
                  <Link href={`/blog/${featured.slug}`} className="group block bg-zinc-950/60 border border-white/[0.09] rounded-2xl overflow-hidden hover:border-white/[0.18] transition-all">
                    <div className="grid md:grid-cols-2">
                      {featured.cover_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={featured.cover_image_url} alt={featured.title} className="w-full h-56 md:h-full object-cover" />
                      ) : (
                        <div className="w-full h-56 md:h-full bg-gradient-to-br from-blue-900/30 to-indigo-900/30 flex items-center justify-center">
                          <span className="text-blue-400 text-6xl font-black opacity-20">AN</span>
                        </div>
                      )}
                      <div className="p-8 flex flex-col justify-center">
                        {featured.category && (
                          <span className="inline-flex text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400 mb-4 self-start">{featured.category}</span>
                        )}
                        <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-3 leading-tight group-hover:text-blue-300 transition-colors">{featured.title}</h2>
                        {featured.excerpt && <p className="text-sm text-gray-400 leading-relaxed mb-5 line-clamp-3">{featured.excerpt}</p>}
                        <div className="flex items-center gap-4 text-[11px] text-gray-500 mb-5">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{fmtDate(featured.published_at)}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{featured.reading_time_minutes} min read</span>
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-400 group-hover:gap-3 transition-all">
                          Read article <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              </section>
            )}

            {/* Post grid */}
            {rest.length > 0 && (
              <section className="pb-24 px-5 sm:px-6">
                <div className="max-w-5xl mx-auto">
                  <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-8">
                    {featured ? 'Recent articles' : 'All articles'}
                  </p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {rest.map(post => (
                      <Link key={post.id} href={`/blog/${post.slug}`}
                        className="group flex flex-col bg-zinc-950/50 border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/[0.14] transition-all">
                        {post.cover_image_url
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={post.cover_image_url} alt={post.title} className="w-full h-44 object-cover" />
                          : <div className="w-full h-44 bg-gradient-to-br from-blue-900/20 to-indigo-900/20 flex items-center justify-center">
                              <span className="text-blue-400 text-3xl font-black opacity-20">AN</span>
                            </div>}
                        <div className="p-5 flex flex-col flex-1">
                          {post.category && (
                            <span className="text-[10px] font-bold text-blue-400 mb-2 uppercase tracking-widest">{post.category}</span>
                          )}
                          <h3 className="text-sm font-bold text-white mb-2 group-hover:text-blue-300 transition-colors leading-snug line-clamp-2 flex-1">{post.title}</h3>
                          {post.excerpt && <p className="text-[11px] text-gray-500 mb-4 line-clamp-2">{post.excerpt}</p>}
                          <div className="flex items-center gap-3 text-[10px] text-gray-600 mt-auto pt-3 border-t border-white/[0.05]">
                            <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{post.reading_time_minutes} min</span>
                            <span>{fmtDate(post.published_at)}</span>
                          </div>
                          {post.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {post.tags.slice(0, 3).map((tag: string) => (
                                <span key={tag} className="flex items-center gap-1 text-[10px] text-gray-600 bg-white/[0.05] px-2 py-0.5 rounded-full">
                                  <Tag className="w-2.5 h-2.5" />{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>
      <LandingCTA />
      <LandingFooter />
    </>
  )
}
