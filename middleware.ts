import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PATHS = [
  '/dashboard', '/accounts', '/diagnostics',
  '/recommendations', '/reports', '/settings',
]

const ADMIN_PATHS = ['/admin']

export async function middleware(request: NextRequest) {
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
  const { pathname } = request.nextUrl

  const isDashboardRoute = PROTECTED_PATHS.some(p => pathname.startsWith(p))
  const isAdminRoute = ADMIN_PATHS.some(p => pathname.startsWith(p))

  // ── Unauthenticated access to protected routes ──────────────
  if ((isDashboardRoute || isAdminRoute) && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // ── Redirect logged-in users away from auth pages ───────────
  if ((pathname === '/login' || pathname === '/signup') && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (user && isDashboardRoute) {
    // ── Plan expiry check ──────────────────────────────────────
    // Read profile to check if paid plan has expired.
    // If so, delegate the actual downgrade to /api/billing/expire
    // (keeps admin writes out of the Edge-compatible middleware).
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

  if (user && isAdminRoute) {
    // ── Admin access check ─────────────────────────────────────
    // Check admin_users table via service-role — done in the
    // /admin layout server component, not here, because we
    // can't use createAdminClient in Edge middleware.
    // Middleware just ensures the user is authenticated;
    // the admin layout verifies the role.
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
