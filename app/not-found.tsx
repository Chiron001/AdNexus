import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Zap } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
        <Zap className="w-7 h-7 text-white" />
      </div>
      <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
      <h2 className="text-xl font-semibold text-gray-700 mb-3">Page not found</h2>
      <p className="text-gray-500 max-w-sm mb-8">
        This page doesn&apos;t exist. Let&apos;s get you back on track.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  )
}
