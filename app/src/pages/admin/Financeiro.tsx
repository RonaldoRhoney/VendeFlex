import { useState } from 'react'
import { calcularDRE } from '../../lib/analytics'
import { useVendas } from '../../lib/vendasStore'
import { formatarReais } from '../../lib/format'
import EmptyState from '../../components/EmptyState'
import type { PeriodoDashboard } from '../../lib/types'

const PERIODOS: { value: PeriodoDashboard; label: string }[] = [
  { value: 'hoje', label: 'Hoje' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mês' },
  { value: 'ano', label: 'Ano' },
]

// Financeiro (Capítulo 7.9 do PRD) — DRE simplificado calculado a partir das
// vendas reais (lib/vendasStore.ts). Contas a pagar/receber e fluxo
// projetado são V2, fora desta leva.
export default function Financeiro() {
  const [periodo, setPeriodo] = useState<PeriodoDashboard>('mes')
  const vendas = useVendas().filter((v) => !v.cancelada)
  const linhas = calcularDRE(vendas, periodo)
  const semVendas = vendas.length === 0

  return (
    <div className="max-w-lg space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-semibold text-lg">Financeiro</h2>
        <div className="flex gap-1.5">
          {PERIODOS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriodo(p.value)}
              className={`text-xs rounded-full px-3 py-1.5 border transition-colors ${
                periodo === p.value
                  ? 'bg-seg-primary text-white border-seg-primary'
                  : 'border-black/15 dark:border-white/15 text-black/60 dark:text-white/60'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {semVendas ? (
        <EmptyState title="Nenhuma venda registrada ainda" description="O DRE é calculado a partir das vendas do PDV." />
      ) : (
        <>
          <div className="rounded-xl border border-black/10 dark:border-white/10 overflow-hidden">
            {linhas.map((linha, i) => (
              <div
                key={linha.label}
                className={`flex items-center justify-between px-4 py-3 text-sm ${
                  i < linhas.length - 1 ? 'border-b border-black/10 dark:border-white/10' : ''
                } ${linha.destaque ? 'font-semibold bg-black/[0.02] dark:bg-white/[0.03]' : 'text-black/70 dark:text-white/70'}`}
              >
                <span>{linha.label}</span>
                <span
                  className={`font-[var(--font-mono-fin)] tabular-nums ${
                    linha.valor < 0 ? 'text-danger' : linha.destaque ? 'text-success' : ''
                  }`}
                >
                  {formatarReais(linha.valor)}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-black/40 dark:text-white/40">
            DRE simplificado — despesas operacionais estimadas (8% do faturamento) nesta fase; custo dos produtos vem do
            preço de custo real de cada item vendido.
          </p>
        </>
      )}
    </div>
  )
}
