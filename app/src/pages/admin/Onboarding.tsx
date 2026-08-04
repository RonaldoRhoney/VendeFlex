import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { MVP_SEGMENTS } from '../../lib/segmentThemes'
import type { useSegmentTheme } from '../../lib/useSegmentTheme'

export interface TenantExistente {
  id: string
  nomeNegocio: string
  segmento: string | null
}

interface OnboardingProps {
  ownerId: string
  temaSegmento: ReturnType<typeof useSegmentTheme>
  tenantExistente?: TenantExistente | null
  onConcluido: () => void
}

// Coração do "Design Inteligente por Segmento" (prompt em anexo + Cap. 5 do
// PRD): ao clicar num segmento, o tema (cor + fonte) muda ao vivo na tela
// inteira antes mesmo de confirmar. Também é aqui que o tenant é criado de
// verdade (RF-CFG-01) — primeira vez que o dono aparece, insere; se já tem
// tenant (fluxo "trocar segmento" a partir de Configuracoes), atualiza.
export default function Onboarding({ ownerId, temaSegmento, tenantExistente, onConcluido }: OnboardingProps) {
  const [nomeNegocio, setNomeNegocio] = useState(tenantExistente?.nomeNegocio ?? '')
  const [selecionado, setSelecionado] = useState<string | null>(tenantExistente?.segmento ?? null)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (tenantExistente?.segmento) temaSegmento.selecionarSegmento(tenantExistente.segmento)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function selecionar(id: string) {
    setSelecionado(id)
    temaSegmento.selecionarSegmento(id)
  }

  async function confirmar() {
    if (!nomeNegocio.trim() || !selecionado || !supabase) return
    setSalvando(true)
    setErro(null)
    try {
      if (tenantExistente) {
        const { error } = await supabase
          .from('tenants')
          .update({ nome_negocio: nomeNegocio.trim(), segmento: selecionado })
          .eq('id', tenantExistente.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('tenants')
          .insert({ nome_negocio: nomeNegocio.trim(), segmento: selecionado, criado_por: ownerId })
        if (error) throw error
      }
      temaSegmento.confirmarSegmento(selecionado)
      onConcluido()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível salvar. Tente de novo.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="min-h-dvh px-4 py-10 sm:py-16 bg-bg-light dark:bg-bg-dark animate-fade-in">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold mb-2" style={{ fontFamily: 'var(--font-seg-display)' }}>
          {tenantExistente ? 'Trocar o segmento do negócio' : 'Vamos configurar seu negócio'}
        </h1>
        <p className="text-sm text-black/60 dark:text-white/60 mb-8">
          {tenantExistente
            ? 'Escolha o novo segmento — o tema (cor + fonte) muda ao vivo antes de confirmar.'
            : 'Dê um nome ao seu negócio e escolha o segmento pra ver o VendeFlex se adaptar, com cor e tipografia próprias. Você pode trocar isso depois a qualquer momento.'}
        </p>

        <div className="max-w-sm mb-8">
          <label className="text-sm font-medium block mb-1.5">Nome do negócio</label>
          <input
            value={nomeNegocio}
            onChange={(e) => setNomeNegocio(e.target.value)}
            placeholder="Ex: Loja da Marcela"
            className="w-full border border-black/15 dark:border-white/15 rounded-lg px-3 py-2.5 text-sm bg-transparent placeholder:text-black/30 dark:placeholder:text-white/30"
          />
        </div>

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

        {erro && <p className="text-sm text-danger mb-4">{erro}</p>}

        <button
          onClick={confirmar}
          disabled={!selecionado || !nomeNegocio.trim() || salvando}
          className="rounded-xl bg-seg-primary text-white px-6 py-3 text-sm font-medium transition-transform active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
        >
          {salvando ? 'Salvando...' : tenantExistente ? 'Salvar' : 'Confirmar e entrar no painel'}
        </button>
      </div>
    </div>
  )
}
