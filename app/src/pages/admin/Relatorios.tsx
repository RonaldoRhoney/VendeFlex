import { useState } from 'react'
import { calcularRanking, vendasNoPeriodo } from '../../lib/analytics'
import { useVendas } from '../../lib/vendasStore'
import { useProdutos } from '../../lib/produtosStore'
import { useCategorias } from '../../lib/categoriasStore'
import { formatarReais } from '../../lib/format'
import EmptyState from '../../components/EmptyState'
import type { PeriodoDashboard } from '../../lib/types'

const PERIODOS: { value: PeriodoDashboard; label: string }[] = [
  { value: 'hoje', label: 'Hoje' },
  { value: 'ontem', label: 'Ontem' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mês' },
  { value: 'ano', label: 'Ano' },
]

// Relatórios (Capítulo 7.12 do PRD) — "vendas por período, produto e
// categoria" (RF-REL-01): o seletor de período faltava aqui — o relatório
// somava o histórico inteiro sem filtro (achado da auditoria de regras de
// negócio); giro de estoque por categoria (RF-REL-02) continua a partir de
// vendas reais.
export default function Relatorios() {
  const [periodo, setPeriodo] = useState<PeriodoDashboard>('mes')
  const vendas = useVendas().filter((v) => !v.cancelada)
  const produtos = useProdutos()
  const categorias = useCategorias()
  const vendasDoPeriodo = vendasNoPeriodo(vendas, periodo)
  const ranking = calcularRanking(vendasDoPeriodo)

  const porCategoria = Array.from(new Set(produtos.map((p) => p.categoriaId))).map((categoriaId) => {
    const itensDaCategoria = produtos.filter((p) => p.categoriaId === categoriaId)
    const valorEstoque = itensDaCategoria.reduce((s, p) => s + p.estoqueAtual * p.precoVenda, 0)
    const nome = categorias.find((c) => c.id === categoriaId)?.nome ?? 'Sem categoria'
    return { categoriaId, nome, quantidadeProdutos: itensDaCategoria.length, valorEstoque }
  })

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-semibold text-lg">Relatórios</h2>
        <div className="flex gap-1.5 flex-wrap">
          {PERIODOS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriodo(p.value)}
              className={`text-xs rounded-full px-3 py-1.5 border transition-colors min-h-[44px] ${
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

      <div>
        <h2 className="font-semibold text-lg mb-3">Vendas por produto</h2>
        {ranking.length === 0 ? (
          <EmptyState title="Nenhuma venda ainda" description="Finalize uma venda no PDV pra ver o relatório aqui." />
        ) : (
          <div className="space-y-1.5">
            {ranking.map((r) => (
              <div key={r.produto.id} className="flex justify-between text-sm rounded-lg border border-black/10 dark:border-white/10 px-3 py-2.5">
                <span>{r.produto.nome}</span>
                <span className="font-[var(--font-mono-fin)] tabular-nums">{r.quantidadeVendida} un. · {formatarReais(r.lucroGerado)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-semibold text-lg mb-3">Giro de estoque por categoria</h2>
        <div className="rounded-xl border border-black/10 dark:border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-black/40 dark:text-white/40 border-b border-black/10 dark:border-white/10">
                <th className="px-3 py-2.5 font-medium">Categoria</th>
                <th className="px-3 py-2.5 font-medium text-right">Produtos</th>
                <th className="px-3 py-2.5 font-medium text-right">Valor em estoque</th>
              </tr>
            </thead>
            <tbody>
              {porCategoria.map((c) => (
                <tr key={c.categoriaId ?? 'sem-categoria'} className="border-b border-black/5 dark:border-white/5 last:border-0">
                  <td className="px-3 py-2.5">{c.nome}</td>
                  <td className="px-3 py-2.5 text-right font-[var(--font-mono-fin)] tabular-nums">{c.quantidadeProdutos}</td>
                  <td className="px-3 py-2.5 text-right font-[var(--font-mono-fin)] tabular-nums">{formatarReais(c.valorEstoque)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
