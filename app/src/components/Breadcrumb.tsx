interface BreadcrumbProps {
  trail: string[]
}

// Breadcrumb simples pro painel administrativo — mesmo padrão do MenuFlex.
export default function Breadcrumb({ trail }: BreadcrumbProps) {
  return (
    <p className="text-xs text-black/40 dark:text-white/40 flex items-center gap-1.5 mb-1">
      {trail.map((item, i) => (
        <span key={item} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-black/20 dark:text-white/20">/</span>}
          <span className={i === trail.length - 1 ? 'text-black/70 dark:text-white/70' : ''}>{item}</span>
        </span>
      ))}
    </p>
  )
}
