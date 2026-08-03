import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

// Estado vazio padronizado (Cap. 12.9 do PRD: "nunca uma tela em branco sem
// explicação") — mesmo padrão do MenuFlex, adaptado pra light/dark mode.
export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="animate-fade-in flex flex-col items-center justify-center text-center py-10 px-4 gap-2">
      {icon && <div className="text-black/20 dark:text-white/20 mb-1">{icon}</div>}
      <p className="text-sm font-medium text-black/50 dark:text-white/50">{title}</p>
      {description && <p className="text-xs text-black/30 dark:text-white/30 max-w-xs">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
