import { useState } from 'react'
import { TURNO_CAIXA_MOCK } from '../../lib/mockData'
import { useVendas } from '../../lib/vendasStore'
import { formatarReais } from '../../lib/format'

interface MovimentoCaixaLocal {
  id: string
  tipo: 'sangria' | 'suprimento'
  valor: number
}

// Caixa (Capítulo 7.8 do PRD) — abertura com fundo de troco (RF-CAI-01),
// sangria/suprimento (RF-CAI-02), fechamento com conciliação REAL entre
// vendas em dinheiro do turno e o valor informado pelo operador (RF-CAI-03),
// mostrando a diferença/quebra (RF-CAI-04) em vez de só marcar "fechado".
export default function Caixa() {
  const vendas = useVendas()
  const [movimentos, setMovimentos] = useState<MovimentoCaixaLocal[]>([])
  const [fechado, setFechado] = useState(false)
  const [valorInformado, setValorInformado] = useState('')
  const [diferenca, setDiferenca] = useState<number | null>(null)

  const vendasDoTurno = vendas.filter((v) => !v.cancelada && new Date(v.criadoEm) >= new Date(TURNO_CAIXA_MOCK.abertoEm))
  const vendasEmDinheiro = vendasDoTurno.filter((v) => v.formaPagamento === 'dinheiro')
  const totalVendasDinheiro = vendasEmDinheiro.reduce((s, v) => s + v.total, 0)
  const totalVendasGeral = vendasDoTurno.reduce((s, v) => s + v.total, 0)

  const totalSangrias = movimentos.filter((m) => m.tipo === 'sangria').reduce((s, m) => s + m.valor, 0)
  const totalSuprimentos = movimentos.filter((m) => m.tipo === 'suprimento').reduce((s, m) => s + m.valor, 0)
  const saldoEstimado = TURNO_CAIXA_MOCK.valorAbertura + totalSuprimentos - totalSangrias + totalVendasDinheiro

  function registrar(tipo: 'sangria' | 'suprimento') {
    const valorTexto = prompt(tipo === 'sangria' ? 'Valor da sangria (R$)' : 'Valor do suprimento (R$)')
    const valor = Number(valorTexto)
    if (!valor || valor <= 0) return
    setMovimentos((prev) => [...prev, { id: `mov-${Date.now()}`, tipo, valor }])
  }

  function fechar() {
    const informado = Number(valorInformado)
    if (!valorInformado || Number.isNaN(informado)) return
    setDiferenca(informado - saldoEstimado)
    setFechado(true)
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
        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
          <div>
            <p className="text-xs text-black/40 dark:text-white/40">Abertura</p>
            <p className="font-medium font-[var(--font-mono-fin)]">{formatarReais(TURNO_CAIXA_MOCK.valorAbertura)}</p>
          </div>
          <div>
            <p className="text-xs text-black/40 dark:text-white/40">Saldo estimado (dinheiro)</p>
            <p className="font-medium font-[var(--font-mono-fin)]">{formatarReais(saldoEstimado)}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs text-black/50 dark:text-white/50 border-t border-black/10 dark:border-white/10 pt-3">
          <div>
            <p>Vendas em dinheiro no turno</p>
            <p className="font-[var(--font-mono-fin)]">{formatarReais(totalVendasDinheiro)}</p>
          </div>
          <div>
            <p>Total geral de vendas no turno</p>
            <p className="font-[var(--font-mono-fin)]">{formatarReais(totalVendasGeral)}</p>
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

      {!fechado ? (
        <div className="space-y-2">
          <label className="text-xs font-medium block">Valor contado na gaveta (R$)</label>
          <input
            type="number"
            step="0.01"
            value={valorInformado}
            onChange={(e) => setValorInformado(e.target.value)}
            className="w-full border border-black/15 dark:border-white/15 rounded-lg px-3 py-2 text-sm bg-transparent"
          />
          <button
            onClick={fechar}
            disabled={!valorInformado}
            className="w-full rounded-lg bg-seg-primary text-white py-2.5 text-sm font-medium transition-transform active:scale-95 disabled:opacity-40"
          >
            Fechar caixa
          </button>
        </div>
      ) : (
        <div className={`rounded-lg border p-3 text-sm ${diferenca === 0 ? 'border-success/30 bg-success/10' : 'border-warning/30 bg-warning/10'}`}>
          {diferenca === 0 ? (
            <p className="text-success font-medium">Caixa conferido — sem diferença.</p>
          ) : (
            <p className={diferenca! < 0 ? 'text-danger font-medium' : 'text-warning font-medium'}>
              {diferenca! < 0 ? 'Falta' : 'Sobra'} de {formatarReais(Math.abs(diferenca!))} em relação ao esperado.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
