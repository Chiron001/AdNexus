import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PATHS = [
  '/dashboard', '/accounts', '/diagnostics',
  '/recommendations', '/reports', '/settings',
]

const ADMIN_PATHS = ['/admin']

export async function proxy(request: NextRequest) {
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
  const isAdminRoute     = ADMIN_PATHS.some(p => pathname.startsWith(p))

  // Unauthenticated access to protected routes
  if ((isDashboardRoute || isAdminRoute) && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect logged-in users away from auth pages
  if ((pathname === '/login' || pathname === '/signup') && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Plan expiry check — delegates actual downgrade to /api/billing/expire
  // (keeps admin DB writes out of the Edge-compatible proxy)
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

  // Admin role check is deferred to /admin layout (can't use service-role client in Edge)
  // proxy just ensures the user is authenticated before reaching /admin

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
