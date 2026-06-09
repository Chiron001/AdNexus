import { type LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-zinc-800 bg-zinc-900/30 backdrop-blur-sm rounded-2xl">
      <div className="w-16 h-16 bg-zinc-800 ring-1 ring-zinc-700/40 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-zinc-600" />
      </div>
      <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
      <p className="text-zinc-500 text-sm max-w-sm mb-6 leading-relaxed">{description}</p>
      {action}
    </div>
  )
}
