import { useEffect, useState } from 'react'
import { abrirTurno, calcularSaldoEstimado, fecharTurno, registrarMovimentoCaixa, useMovimentosCaixa, useTurnoAberto } from '../../lib/caixaStore'
import { formatarReais } from '../../lib/format'
import Toast, { type ToastData } from '../../components/admin/Toast'

// Caixa (Capítulo 7.8 do PRD) — abertura com fundo de troco (RF-CAI-01,
// agora implementada de verdade — a versão mock partia de um turno já
// aberto fixo), sangria/suprimento (RF-CAI-02), fechamento com conciliação
// real feita no servidor (RF-CAI-03), mostrando a diferença/quebra
// (RF-CAI-04) persistida em caixa_turnos.diferenca.
export default function Caixa() {
  const { turno, carregando } = useTurnoAberto()
  const [toast, setToast] = useState<ToastData | null>(null)

  if (carregando) return <p className="text-sm text-black/40 dark:text-white/40">Carregando caixa...</p>
  if (!turno) return <AbrirCaixa onErro={(m) => setToast({ mensagem: m, tipo: 'erro' })} toast={toast} onFecharToast={() => setToast(null)} />

  return <CaixaAberto turno={turno} toast={toast} setToast={setToast} />
}

function AbrirCaixa({ onErro, toast, onFecharToast }: { onErro: (m: string) => void; toast: ToastData | null; onFecharToast: () => void }) {
  const [valor, setValor] = useState('')
  const [abrindo, setAbrindo] = useState(false)

  async function abrir() {
    const valorNumerico = Number(valor)
    if (Number.isNaN(valorNumerico) || valorNumerico < 0) return
    setAbrindo(true)
    try {
      await abrirTurno(valorNumerico)
    } catch (err) {
      onErro(err instanceof Error ? err.message : 'Erro ao abrir o caixa.')
    } finally {
      setAbrindo(false)
    }
  }

  return (
    <div className="max-w-md space-y-4">
      <h2 className="font-semibold text-lg">Caixa</h2>
      <div className="rounded-xl border border-black/10 dark:border-white/10 p-4 space-y-3">
        <p className="text-sm text-black/60 dark:text-white/60">Nenhum turno de caixa aberto. Informe o fundo de troco pra abrir.</p>
        <div>
          <label className="text-xs font-medium block mb-1">Valor de abertura (R$)</label>
          <input
            type="number"
            step="0.01"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="w-full border border-black/15 dark:border-white/15 rounded-lg px-3 py-2 text-sm bg-transparent"
          />
        </div>
        <button
          onClick={abrir}
          disabled={!valor || abrindo}
          className="w-full rounded-lg bg-seg-primary text-white py-2.5 text-sm font-medium transition-transform active:scale-95 disabled:opacity-40"
        >
          {abrindo ? 'Abrindo...' : 'Abrir caixa'}
        </button>
      </div>
      <Toast toast={toast} onClose={onFecharToast} />
    </div>
  )
}

function CaixaAberto({
  turno,
  toast,
  setToast,
}: {
  turno: NonNullable<ReturnType<typeof useTurnoAberto>['turno']>
  toast: ToastData | null
  setToast: (t: ToastData | null) => void
}) {
  const movimentos = useMovimentosCaixa(turno.id)
  const [resumo, setResumo] = useState({ totalVendasDinheiro: 0, totalVendasGeral: 0 })
  const [fechando, setFechando] = useState(false)
  const [valorInformado, setValorInformado] = useState('')
  const [diferenca, setDiferenca] = useState<number | null>(null)
  // Soma de vários valores em ponto flutuante pode fechar em algo como
  // 149.99999999999997 em vez de 150 mesmo quando matematicamente idêntico
  // — comparar com === 0 acusava "diferença" de fração de centavo que não
  // existe de verdade.
  const diferencaConferida = diferenca !== null && Math.abs(diferenca) < 0.01

  useEffect(() => {
    let ativo = true
    calcularSaldoEstimado(turno).then((r) => {
      if (ativo) setResumo(r)
    })
    return () => {
      ativo = false
    }
  }, [turno, movimentos])

  const totalSangrias = movimentos.filter((m) => m.tipo === 'sangria').reduce((s, m) => s + m.valor, 0)
  const totalSuprimentos = movimentos.filter((m) => m.tipo === 'suprimento').reduce((s, m) => s + m.valor, 0)
  const saldoEstimado = turno.valorAbertura + totalSuprimentos - totalSangrias + resumo.totalVendasDinheiro

  async function registrar(tipo: 'sangria' | 'suprimento') {
    const valorTexto = prompt(tipo === 'sangria' ? 'Valor da sangria (R$)' : 'Valor do suprimento (R$)')
    const valorNumerico = Number(valorTexto)
    if (!valorNumerico || valorNumerico <= 0) return
    try {
      await registrarMovimentoCaixa(turno.id, tipo, valorNumerico)
    } catch (err) {
      setToast({ mensagem: err instanceof Error ? err.message : 'Erro ao registrar movimento.', tipo: 'erro' })
    }
  }

  async function fechar() {
    const informado = Number(valorInformado)
    if (!valorInformado || Number.isNaN(informado)) return
    setFechando(true)
    try {
      const dif = await fecharTurno(turno.id, informado)
      setDiferenca(dif)
    } catch (err) {
      setToast({ mensagem: err instanceof Error ? err.message : 'Erro ao fechar o caixa.', tipo: 'erro' })
    } finally {
      setFechando(false)
    }
  }

  const fechado = diferenca !== null

  return (
    <div className="max-w-md space-y-5">
      <h2 className="font-semibold text-lg">Caixa</h2>

      <div className="rounded-xl border border-black/10 dark:border-white/10 p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium">Turno atual</p>
          <span
            className={`text-xs rounded-full px-2.5 py-1 font-medium border ${
              fechado ? 'text-black/50 dark:text-white/50 border-black/10 dark:border-white/10' : 'text-success border-success/30 bg-success/10'
            }`}
          >
            {fechado ? 'Fechado' : 'Aberto'}
          </span>
        </div>
        <p className="text-xs text-black/40 dark:text-white/40 mb-3">Aberto em {new Date(turno.abertoEm).toLocaleString('pt-BR')}</p>
        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
          <div>
            <p className="text-xs text-black/40 dark:text-white/40">Abertura</p>
            <p className="font-medium font-[var(--font-mono-fin)]">{formatarReais(turno.valorAbertura)}</p>
          </div>
          <div>
            <p className="text-xs text-black/40 dark:text-white/40">Saldo estimado (dinheiro)</p>
            <p className="font-medium font-[var(--font-mono-fin)]">{formatarReais(saldoEstimado)}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs text-black/50 dark:text-white/50 border-t border-black/10 dark:border-white/10 pt-3">
          <div>
            <p>Vendas em dinheiro no turno</p>
            <p className="font-[var(--font-mono-fin)]">{formatarReais(resumo.totalVendasDinheiro)}</p>
          </div>
          <div>
            <p>Total geral de vendas no turno</p>
            <p className="font-[var(--font-mono-fin)]">{formatarReais(resumo.totalVendasGeral)}</p>
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
            disabled={!valorInformado || fechando}
            className="w-full rounded-lg bg-seg-primary text-white py-2.5 text-sm font-medium transition-transform active:scale-95 disabled:opacity-40"
          >
            {fechando ? 'Fechando...' : 'Fechar caixa'}
          </button>
        </div>
      ) : (
        <div className={`rounded-lg border p-3 text-sm ${diferencaConferida ? 'border-success/30 bg-success/10' : 'border-warning/30 bg-warning/10'}`}>
          {diferencaConferida ? (
            <p className="text-success font-medium">Caixa conferido — sem diferença.</p>
          ) : (
            <p className={diferenca! < 0 ? 'text-danger font-medium' : 'text-warning font-medium'}>
              {diferenca! < 0 ? 'Falta' : 'Sobra'} de {formatarReais(Math.abs(diferenca!))} em relação ao esperado.
            </p>
          )}
        </div>
      )}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
