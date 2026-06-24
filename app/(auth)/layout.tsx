import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: 'noindex, follow',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
