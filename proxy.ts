import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PATHS = [
  '/dashboard', '/accounts', '/diagnostics',
  '/recommendations', '/reports', '/settings',
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Admin password gate ────────────────────────────────────────────────
  // All /admin/* routes require the admin_session cookie except /admin/login
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

  // Unauthenticated access to protected user routes → /login
  if (isDashboardRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect logged-in users away from auth pages
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
