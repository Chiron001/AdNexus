import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL  || 'https://adnexusone.com'
const USER_URL  = process.env.NEXT_PUBLIC_USER_URL  || 'https://user.adnexusone.com'
const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL || 'https://admin.adnexusone.com'

// Refresh Supabase session and forward updated cookies
async function withSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.getUser()
  return response
}

// Paths that belong only on the main marketing site
const LANDING_ONLY = [
  '/ai-engine', '/platform', '/customers', '/contact',
  '/privacy', '/terms', '/refund', '/cookies',
  '/industries', '/tools', '/case-studies', '/platform-tour',
]
// Paths that belong on user.adnexusone.com
const USER_PATHS = [
  '/dashboard', '/billing', '/settings', '/reports',
  '/onboarding', '/login', '/signup', '/auth',
]
// Paths that belong on admin.adnexusone.com
const ADMIN_PATHS = ['/admin']

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const hostname = request.headers.get('host') || ''
  const { pathname } = request.nextUrl

  // Local dev & Vercel preview deployments — skip subdomain routing
  if (hostname.includes('localhost') || hostname.endsWith('.vercel.app')) {
    return withSession(request)
  }

  const parts     = hostname.split('.')
  const subdomain = parts.length >= 3 ? parts[0] : null  // null for apex/www

  // ── user.adnexusone.com ───────────────────────────────────────────────
  if (subdomain === 'user') {
    // Root → marketing homepage
    if (pathname === '/') {
      return NextResponse.redirect(SITE_URL)
    }
    // Landing-only pages → redirect back to main site
    if (LANDING_ONLY.some(p => pathname === p || pathname.startsWith(p + '/'))) {
      return NextResponse.redirect(`${SITE_URL}${pathname}`)
    }
    return withSession(request)
  }

  // ── admin.adnexusone.com ──────────────────────────────────────────────
  if (subdomain === 'admin') {
    // Rewrite root and non-prefixed paths → /admin/*
    if (!pathname.startsWith('/admin')) {
      const url = request.nextUrl.clone()
      url.pathname = `/admin${pathname === '/' ? '' : pathname}`
      return NextResponse.rewrite(url)
    }
    return withSession(request)
  }

  // ── adnexusone.com or www.adnexusone.com ─────────────────────────────
  // Redirect user-side paths to user subdomain
  if (USER_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.redirect(`${USER_URL}${pathname}${request.nextUrl.search}`)
  }
  // Redirect admin paths to admin subdomain
  if (ADMIN_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.redirect(`${ADMIN_URL}${pathname}`)
  }

  return withSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
