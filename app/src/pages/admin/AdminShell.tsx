import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Breadcrumb from '../../components/Breadcrumb'
import ThemeToggle from '../../components/ThemeToggle'
import { MODULOS_NAV, MODULOS_TAB_BAR_MOBILE } from '../../lib/constants'

interface AdminShellProps {
  moduloAtivo: string
  onSelectModulo: (id: string) => void
  children: ReactNode
}

// Casca do painel admin: sidebar fixa no desktop (todos os módulos) +
// bottom-tab-bar mobile com 4 slots fixos (PDV, Estoque, Vendas, Mais) —
// diferente do padrão do MenuFlex, que rola horizontalmente TODAS as abas
// sem hierarquia. O Cap. 12.8 do PRD pede essa priorização explícita porque
// PDV é o fluxo mais frequente no balcão de venda.
export default function AdminShell({ moduloAtivo, onSelectModulo, children }: AdminShellProps) {
  const navigate = useNavigate()
  const [maisAberto, setMaisAberto] = useState(false)

  function sair() {
    localStorage.removeItem('vendeflex.sessao')
    navigate('/admin')
  }

  const moduloAtual = MODULOS_NAV.find((m) => m.id === moduloAtivo)
  const modulosTabBar = MODULOS_TAB_BAR_MOBILE.map((id) => MODULOS_NAV.find((m) => m.id === id)!)
  const modulosRestantes = MODULOS_NAV.filter((m) => !(MODULOS_TAB_BAR_MOBILE as readonly string[]).includes(m.id))

  const navLinkClass = (ativo: boolean) =>
    `relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 ${
      ativo
        ? 'bg-gradient-to-r from-brand to-brand-dark text-white shadow-lg shadow-brand/25 -translate-y-0.5'
        : 'text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
    }`

  return (
    <div className="min-h-dvh flex flex-col sm:flex-row bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark">
      {/* Sidebar — desktop */}
      <aside className="hidden sm:flex w-60 shrink-0 flex-col border-r border-black/10 dark:border-white/10">
        <div className="px-5 py-5 border-b border-black/10 dark:border-white/10">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <span className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center text-white font-bold text-sm shrink-0">
              V
            </span>
            <span className="font-semibold text-sm">VendeFlex</span>
          </Link>
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-sm">Painel</p>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button onClick={sair} className="text-xs text-black/50 dark:text-white/50 hover:underline">
                Sair
              </button>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {MODULOS_NAV.map((m) => {
            const ativo = m.id === moduloAtivo
            return (
              <button key={m.id} onClick={() => onSelectModulo(m.id)} className={`w-full ${navLinkClass(ativo)}`}>
                <span>{m.icone}</span>
                {m.label}
              </button>
            )
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 pb-16 sm:pb-0">
        {/* Header — mobile */}
        <header className="sm:hidden border-b border-black/10 dark:border-white/10 px-4 py-3 flex items-center justify-between">
          <span className="font-semibold text-sm">VendeFlex</span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={sair} className="text-xs text-black/50 dark:text-white/50">
              Sair
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {moduloAtual && <Breadcrumb trail={['VendeFlex', moduloAtual.label]} />}
          <div key={moduloAtivo} className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom tab bar — mobile, 4 slots fixos (Cap. 12.8) */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 border-t border-black/10 dark:border-white/10 bg-bg-light dark:bg-bg-dark flex z-40">
        {modulosTabBar.map((m) => (
          <button
            key={m.id}
            onClick={() => onSelectModulo(m.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[11px] transition-colors ${
              moduloAtivo === m.id ? 'text-brand font-medium' : 'text-black/50 dark:text-white/50'
            }`}
          >
            <span className="text-base leading-none">{m.icone}</span>
            {m.label}
          </button>
        ))}
        <button
          onClick={() => setMaisAberto(true)}
          className="flex-1 flex flex-col items-center gap-0.5 py-2 text-[11px] text-black/50 dark:text-white/50"
        >
          <span className="text-base leading-none">⋯</span>
          Mais
        </button>
      </nav>

      {maisAberto && (
        <div className="sm:hidden fixed inset-0 z-50 flex items-end" onClick={() => setMaisAberto(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative w-full bg-bg-light dark:bg-bg-dark rounded-t-2xl p-4 pb-8 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-medium mb-3">Mais módulos</p>
            <div className="grid grid-cols-3 gap-2.5">
              {modulosRestantes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    onSelectModulo(m.id)
                    setMaisAberto(false)
                  }}
                  className="rounded-xl border border-black/10 dark:border-white/10 p-3 text-xs text-center flex flex-col items-center gap-1.5 active:scale-95 transition-transform min-h-[44px]"
                >
                  <span className="text-lg leading-none">{m.icone}</span>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
