import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL  || 'https://adnexusone.com'
const USER_URL  = process.env.NEXT_PUBLIC_USER_URL  || 'https://user.adnexusone.com'
const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL || 'https://admin.adnexusone.com'

const PROTECTED_PATHS = [
  '/dashboard', '/accounts', '/diagnostics',
  '/recommendations', '/reports', '/settings', '/billing',
]

// Paths that live on user.adnexusone.com only
const USER_PATHS = [
  '/dashboard', '/accounts', '/diagnostics', '/recommendations',
  '/reports', '/settings', '/billing', '/onboarding',
  '/login', '/signup', '/auth',
]

// Paths that live on adnexusone.com only
const LANDING_ONLY = [
  '/ai-engine', '/platform', '/customers', '/contact',
  '/privacy', '/terms', '/refund', '/cookies',
  '/industries', '/tools', '/case-studies', '/platform-tour',
]

export async function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const { pathname } = request.nextUrl

  // ── Subdomain routing (production only) ───────────────────────────────
  if (!hostname.includes('localhost') && !hostname.endsWith('.vercel.app')) {
    const parts     = hostname.split('.')
    const subdomain = parts.length >= 3 ? parts[0] : null

    // user.adnexusone.com — only serves dashboard + auth
    if (subdomain === 'user') {
      if (pathname === '/') {
        return NextResponse.redirect(SITE_URL)
      }
      if (LANDING_ONLY.some(p => pathname === p || pathname.startsWith(p + '/'))) {
        return NextResponse.redirect(`${SITE_URL}${pathname}`)
      }
    }

    // admin.adnexusone.com — rewrite root/non-prefixed paths to /admin/*
    else if (subdomain === 'admin') {
      if (!pathname.startsWith('/admin')) {
        const url = request.nextUrl.clone()
        url.pathname = `/admin${pathname === '/' ? '' : pathname}`
        return NextResponse.rewrite(url)
      }
    }

    // adnexusone.com / www — redirect user/admin paths to their subdomains
    else {
      if (USER_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
        return NextResponse.redirect(`${USER_URL}${pathname}${request.nextUrl.search}`)
      }
      if (pathname === '/admin' || pathname.startsWith('/admin/')) {
        return NextResponse.redirect(`${ADMIN_URL}${pathname}`)
      }
    }
  }
  // ──────────────────────────────────────────────────────────────────────

  // ── Admin password gate ────────────────────────────────────────────────
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const session = request.cookies.get('admin_session')?.value
    const secret  = process.env.ADMIN_PASSWORD
    if (!secret || session !== secret) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }
  // ──────────────────────────────────────────────────────────────────────

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isDashboardRoute = PROTECTED_PATHS.some(p => pathname.startsWith(p))

  // Unauthenticated access to protected routes → /login
  if (isDashboardRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Logged-in users on auth pages → /dashboard
  if ((pathname === '/login' || pathname === '/signup') && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Plan expiry check — delegates actual downgrade to /api/billing/expire
  if (user && isDashboardRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, plan_expires_at')
      .eq('id', user.id)
      .single()

    if (
      profile &&
      profile.plan !== 'free' &&
      profile.plan_expires_at &&
      new Date(profile.plan_expires_at) < new Date()
    ) {
      const expireUrl = new URL('/api/billing/expire', request.url)
      expireUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(expireUrl)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
