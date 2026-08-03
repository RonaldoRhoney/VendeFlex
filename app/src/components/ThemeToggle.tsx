import { useEffect, useState } from 'react'

type Modo = 'light' | 'dark'

function lerPreferenciaInicial(): Modo {
  const salvo = localStorage.getItem('vendeflex.theme')
  if (salvo === 'light' || salvo === 'dark') return salvo
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Alternância manual de tema (Cap. 12.10 do PRD: "ambos os modos são
// suportados desde o MVP, com preferência inicial detectada automaticamente
// ... e ajustável manualmente"). O MenuFlex não tem esse componente por ser
// dark-only.
export default function ThemeToggle() {
  const [modo, setModo] = useState<Modo>(lerPreferenciaInicial)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', modo === 'dark')
    localStorage.setItem('vendeflex.theme', modo)
  }, [modo])

  return (
    <button
      onClick={() => setModo((m) => (m === 'dark' ? 'light' : 'dark'))}
      aria-label={modo === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      className="w-9 h-9 rounded-lg border border-black/10 dark:border-white/15 flex items-center justify-center text-base transition-transform active:scale-90 shrink-0"
    >
      {modo === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
