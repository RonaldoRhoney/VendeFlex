import { useState } from 'react'
import { calcularIndicadores, calcularRanking, calcularRankingLucratividade, produtosSemVenda, vendasNoPeriodo } from '../../lib/analytics'
import { useVendas } from '../../lib/vendasStore'
import { useProdutos } from '../../lib/produtosStore'
import { formatarPercentual, formatarReais } from '../../lib/format'
import EmptyState from '../../components/EmptyState'
import type { PeriodoDashboard } from '../../lib/types'

const PERIODOS: { value: PeriodoDashboard; label: string }[] = [
  { value: 'hoje', label: 'Hoje' },
  { value: 'ontem', label: 'Ontem' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mês' },
  { value: 'ano', label: 'Ano' },
]

function CardIndicador({ label, valor, variacao }: { label: string; valor: string; variacao?: number }) {
  return (
    <div className="rounded-xl border border-black/10 dark:border-white/10 p-4 relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-seg-primary" />
      <p className="text-xs text-black/40 dark:text-white/40 mb-1">{label}</p>
      <p className="text-xl font-semibold font-[var(--font-mono-fin)] tabular-nums">{valor}</p>
      {variacao !== undefined && variacao !== 0 && (
        <p className={`text-xs mt-1 ${variacao >= 0 ? 'text-success' : 'text-danger'}`}>
          {formatarPercentual(variacao)} vs. período anterior
        </p>
      )}
    </div>
  )
}

// Dashboard Executivo (Capítulo 8 do PRD) — indicadores calculados de
// verdade a partir das vendas registradas (lib/vendasStore.ts via
// lib/analytics.ts), não mais números fixos ignorando o que o PDV já grava.
export default function Dashboard() {
  const [periodo, setPeriodo] = useState<PeriodoDashboard>('hoje')
  const vendas = useVendas().filter((v) => !v.cancelada)
  const produtos = useProdutos()
  const vendasDoPeriodo = vendasNoPeriodo(vendas, periodo)
  const indicadores = calcularIndicadores(vendas, periodo)
  const ranking = calcularRanking(vendasDoPeriodo)
  const rankingLucratividade = calcularRankingLucratividade(vendasDoPeriodo)
  const semVenda = produtosSemVenda(produtos, vendasDoPeriodo)
  const estoqueBaixo = produtos.filter((p) => p.estoqueAtual <= p.estoqueMinimo)

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-semibold text-lg">Dashboard</h2>
        <div className="flex gap-1.5 flex-wrap">
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <CardIndicador label="Faturamento" valor={formatarReais(indicadores.faturamento)} variacao={indicadores.variacaoFaturamentoPercent} />
        <CardIndicador label="Lucro" valor={formatarReais(indicadores.lucro)} variacao={indicadores.variacaoLucroPercent} />
        <CardIndicador label="Margem" valor={`${indicadores.margem.toFixed(1)}%`} />
        <CardIndicador label="Ticket médio" valor={formatarReais(indicadores.ticketMedio)} />
      </div>

      {estoqueBaixo.length > 0 && (
        <div className="rounded-xl border border-warning/30 bg-warning/10 p-4">
          <p className="text-sm font-medium text-warning mb-1">⚠️ {estoqueBaixo.length} produtos com estoque baixo</p>
          <p className="text-xs text-black/50 dark:text-white/50">
            {estoqueBaixo
              .slice(0, 4)
              .map((p) => p.nome)
              .join(', ')}
            {estoqueBaixo.length > 4 && '...'}
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium mb-3">Produtos mais vendidos</h3>
          {ranking.length === 0 ? (
            <EmptyState title="Nenhuma venda ainda" description="Finalize uma venda no PDV pra ver o ranking aqui." />
          ) : (
            <div className="space-y-2">
              {ranking.map((r) => (
                <div
                  key={r.produto.id}
                  className="flex items-center justify-between rounded-lg border border-black/10 dark:border-white/10 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{r.produto.nome}</p>
                    <p className="text-xs text-black/40 dark:text-white/40">{r.quantidadeVendida} unidades vendidas</p>
                  </div>
                  <p className="text-sm font-medium font-[var(--font-mono-fin)] tabular-nums shrink-0">
                    {formatarReais(r.lucroGerado)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3">Produtos mais lucrativos</h3>
          {rankingLucratividade.length === 0 ? (
            <EmptyState title="Nenhuma venda ainda" description="Finalize uma venda no PDV pra ver o ranking aqui." />
          ) : (
            <div className="space-y-2">
              {rankingLucratividade.map((r) => (
                <div
                  key={r.produto.id}
                  className="flex items-center justify-between rounded-lg border border-black/10 dark:border-white/10 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{r.produto.nome}</p>
                    <p className="text-xs text-black/40 dark:text-white/40">{r.quantidadeVendida} unidades vendidas</p>
                  </div>
                  <p className="text-sm font-medium font-[var(--font-mono-fin)] tabular-nums shrink-0 text-success">
                    {formatarReais(r.lucroGerado)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {semVenda.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3">Sem venda no período</h3>
          <div className="rounded-xl border border-black/10 dark:border-white/10 p-4">
            <p className="text-xs text-black/50 dark:text-white/50">
              {semVenda
                .slice(0, 8)
                .map((p) => p.nome)
                .join(', ')}
              {semVenda.length > 8 && ` e mais ${semVenda.length - 8}`}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
