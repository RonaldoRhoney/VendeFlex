import { useState } from 'react'
import { dreSimplificado } from '../../lib/mockData'
import { formatarReais } from '../../lib/format'
import type { PeriodoDashboard } from '../../lib/types'

const PERIODOS: { value: PeriodoDashboard; label: string }[] = [
  { value: 'hoje', label: 'Hoje' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mês' },
  { value: 'ano', label: 'Ano' },
]

// Financeiro (Capítulo 7.9 do PRD) — lucro bruto por venda e consolidação de
// lucro/perda/margem por período (RF-FIN-01/02) via um DRE simplificado.
// Contas a pagar/receber e fluxo projetado são V2, fora desta leva.
export default function Financeiro() {
  const [periodo, setPeriodo] = useState<PeriodoDashboard>('mes')
  const linhas = dreSimplificado(periodo)

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
        DRE simplificado — despesas operacionais estimadas nesta fase (dados mockados).
      </p>
    </div>
  )
}
