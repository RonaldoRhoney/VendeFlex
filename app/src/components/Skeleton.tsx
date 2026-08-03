// Skeleton loading reutilizável — mesmo padrão do MenuFlex, adaptado pra
// suportar light e dark mode (o VendeFlex não é dark-only).
interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse rounded-lg bg-black/8 dark:bg-white/8 ${className}`} />
}

export function SkeletonScreen() {
  return (
    <div className="min-h-dvh flex flex-col gap-3 p-6">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-64" />
      <div className="flex flex-col gap-2 mt-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="border border-black/10 dark:border-white/10 rounded-xl p-3 flex items-center gap-3">
      <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
      <div className="flex-1 flex flex-col gap-1.5">
        <Skeleton className="h-3.5 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  )
}
