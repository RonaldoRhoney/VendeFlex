import { useState } from 'react'
import { TURNO_CAIXA_MOCK } from '../../lib/mockData'
import { formatarReais } from '../../lib/format'

interface MovimentoCaixaLocal {
  id: string
  tipo: 'sangria' | 'suprimento'
  valor: number
}

// Caixa (Capítulo 7.8 do PRD) — abertura com fundo de troco (RF-CAI-01),
// sangria/suprimento (RF-CAI-02), fechamento com conciliação (RF-CAI-03).
// Sangria/suprimento aqui só existem em memória (useState), sem persistir
// entre sessões — coerente com "sem backend ainda" desta fase.
export default function Caixa() {
  const [movimentos, setMovimentos] = useState<MovimentoCaixaLocal[]>([])
  const [fechado, setFechado] = useState(false)

  const totalSangrias = movimentos.filter((m) => m.tipo === 'sangria').reduce((s, m) => s + m.valor, 0)
  const totalSuprimentos = movimentos.filter((m) => m.tipo === 'suprimento').reduce((s, m) => s + m.valor, 0)
  const saldoEstimado = TURNO_CAIXA_MOCK.valorAbertura + totalSuprimentos - totalSangrias

  function registrar(tipo: 'sangria' | 'suprimento') {
    const valorTexto = prompt(tipo === 'sangria' ? 'Valor da sangria (R$)' : 'Valor do suprimento (R$)')
    const valor = Number(valorTexto)
    if (!valor || valor <= 0) return
    setMovimentos((prev) => [...prev, { id: `mov-${Date.now()}`, tipo, valor }])
  }

  return (
    <div className="max-w-md space-y-5">
      <h2 className="font-semibold text-lg">Caixa</h2>

      <div className="rounded-xl border border-black/10 dark:border-white/10 p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium">{TURNO_CAIXA_MOCK.operador}</p>
          <span
            className={`text-xs rounded-full px-2.5 py-1 font-medium border ${
              fechado ? 'text-black/50 dark:text-white/50 border-black/10 dark:border-white/10' : 'text-success border-success/30 bg-success/10'
            }`}
          >
            {fechado ? 'Fechado' : 'Aberto'}
          </span>
        </div>
        <p className="text-xs text-black/40 dark:text-white/40 mb-3">
          Aberto em {new Date(TURNO_CAIXA_MOCK.abertoEm).toLocaleString('pt-BR')}
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-black/40 dark:text-white/40">Abertura</p>
            <p className="font-medium font-[var(--font-mono-fin)]">{formatarReais(TURNO_CAIXA_MOCK.valorAbertura)}</p>
          </div>
          <div>
            <p className="text-xs text-black/40 dark:text-white/40">Saldo estimado</p>
            <p className="font-medium font-[var(--font-mono-fin)]">{formatarReais(saldoEstimado)}</p>
          </div>
        </div>
      </div>

      {!fechado && (
        <div className="flex gap-2">
          <button
            onClick={() => registrar('sangria')}
            className="flex-1 rounded-lg border border-black/15 dark:border-white/15 py-2.5 text-sm font-medium active:scale-95 transition-transform"
          >
            Registrar sangria
          </button>
          <button
            onClick={() => registrar('suprimento')}
            className="flex-1 rounded-lg border border-black/15 dark:border-white/15 py-2.5 text-sm font-medium active:scale-95 transition-transform"
          >
            Registrar suprimento
          </button>
        </div>
      )}

      {movimentos.length > 0 && (
        <div className="space-y-1.5">
          {movimentos.map((m) => (
            <div key={m.id} className="flex justify-between text-xs text-black/60 dark:text-white/60">
              <span>{m.tipo === 'sangria' ? 'Sangria' : 'Suprimento'}</span>
              <span className="font-[var(--font-mono-fin)]">
                {m.tipo === 'sangria' ? '-' : '+'}
                {formatarReais(m.valor)}
              </span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setFechado(true)}
        disabled={fechado}
        className="w-full rounded-lg bg-seg-primary text-white py-2.5 text-sm font-medium transition-transform active:scale-95 disabled:opacity-40"
      >
        {fechado ? 'Caixa fechado' : 'Fechar caixa'}
      </button>
    </div>
  )
}
