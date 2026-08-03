import { useState, type ReactNode } from 'react'

interface TooltipProps {
  label: string
  children: ReactNode
}

// Tooltip mínimo, sem lib nova — mesmo padrão do MenuFlex.
export default function Tooltip({ label, children }: TooltipProps) {
  const [show, setShow] = useState(false)

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && (
        <span
          role="tooltip"
          className="animate-pop-in pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded-md bg-bg-dark text-text-dark border border-white/10 px-2 py-1 text-[11px] z-20"
        >
          {label}
        </span>
      )}
    </span>
  )
}
