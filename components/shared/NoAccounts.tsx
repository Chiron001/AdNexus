import Link from 'next/link'
import { Link2, RefreshCw } from 'lucide-react'

export function NoAccounts({ section = 'this section' }: { section?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="w-14 h-14 bg-zinc-800 border border-zinc-700 rounded-2xl flex items-center justify-center mb-5">
        <Link2 className="w-6 h-6 text-zinc-500" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">No accounts connected</h3>
      <p className="text-sm text-zinc-400 max-w-sm mb-6">
        Connect your Meta, Google, or Amazon Ads account to see real data in {section}.
      </p>
      <Link
        href="/accounts"
        className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
      >
        Connect an account
      </Link>
    </div>
  )
}

export function NoData({ message = 'No data yet for the selected period.' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="w-14 h-14 bg-zinc-800 border border-zinc-700 rounded-2xl flex items-center justify-center mb-5">
        <RefreshCw className="w-6 h-6 text-zinc-500" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">No data yet</h3>
      <p className="text-sm text-zinc-400 max-w-sm mb-6">{message}</p>
      <Link
        href="/accounts"
        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Go to Accounts &amp; Sync
      </Link>
    </div>
  )
}
