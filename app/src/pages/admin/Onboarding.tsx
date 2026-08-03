import { useState } from 'react'
import { MVP_SEGMENTS } from '../../lib/segmentThemes'
import type { useSegmentTheme } from '../../lib/useSegmentTheme'

interface OnboardingProps {
  temaSegmento: ReturnType<typeof useSegmentTheme>
}

// Coração do "Design Inteligente por Segmento" (prompt em anexo + Cap. 5 do
// PRD): ao clicar num segmento, o tema (cor + fonte) muda ao vivo na tela
// inteira antes mesmo de confirmar — só ao clicar "Confirmar" é que persiste
// (localStorage nesta fase, sem backend ainda).
export default function Onboarding({ temaSegmento }: OnboardingProps) {
  const [selecionado, setSelecionado] = useState<string | null>(null)

  function selecionar(id: string) {
    setSelecionado(id)
    temaSegmento.selecionarSegmento(id)
  }

  function confirmar() {
    if (!selecionado) return
    temaSegmento.confirmarSegmento(selecionado)
  }

  return (
    <div className="min-h-dvh px-4 py-10 sm:py-16 bg-bg-light dark:bg-bg-dark animate-fade-in">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold mb-2" style={{ fontFamily: 'var(--font-seg-display)' }}>
          Qual é o segmento do seu negócio?
        </h1>
        <p className="text-sm text-black/60 dark:text-white/60 mb-8">
          Escolha um segmento pra ver o VendeFlex se adaptar ao seu negócio, com cor e tipografia próprias. Você pode
          trocar isso depois a qualquer momento.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {MVP_SEGMENTS.map((seg) => {
            const ativo = selecionado === seg.id
            return (
              <button
                key={seg.id}
                onClick={() => selecionar(seg.id)}
                className={`rounded-xl border p-3 text-left transition-all duration-200 active:scale-95 min-h-[44px] ${
                  ativo
                    ? 'border-seg-primary ring-2 ring-seg-primary/40 -translate-y-0.5 shadow-lg'
                    : 'border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20'
                }`}
              >
                <div className="flex gap-1 mb-2">
                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: seg.colors.primary }} />
                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: seg.colors.secondary }} />
                  <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: seg.colors.tertiary }} />
                </div>
                <p className="text-sm font-medium">{seg.label}</p>
                <p className="text-[11px] text-black/40 dark:text-white/40">{seg.fontDisplay}</p>
              </button>
            )
          })}
        </div>

        <button
          onClick={confirmar}
          disabled={!selecionado}
          className="rounded-xl bg-seg-primary text-white px-6 py-3 text-sm font-medium transition-transform active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
        >
          Confirmar e entrar no painel
        </button>
      </div>
    </div>
  )
}
