import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export interface ToastData {
  mensagem: string
  tipo?: 'sucesso' | 'erro' | 'neutro'
}

interface ToastProps {
  toast: ToastData | null
  onClose: () => void
}

const CORES = {
  sucesso: 'border-success/30 bg-success/10 text-success',
  erro: 'border-danger/30 bg-danger/10 text-danger',
  neutro: 'border-black/15 dark:border-white/15 bg-bg-light dark:bg-bg-dark',
}

// Toast reutilizável — mesmo padrão do MenuFlex (Cap. 12.9 do PRD: toast pra
// ações rápidas).
export default function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [toast, onClose])

  if (!toast) return null

  return createPortal(
    <div className="fixed bottom-5 inset-x-0 z-[100] flex justify-center px-4 pointer-events-none">
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm font-medium shadow-lg animate-slide-up ${CORES[toast.tipo ?? 'neutro']}`}
      >
        {toast.mensagem}
      </div>
    </div>,
    document.body,
  )
}
