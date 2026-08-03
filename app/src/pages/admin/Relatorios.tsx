import { calcularRanking } from '../../lib/analytics'
import { useVendas } from '../../lib/vendasStore'
import { useProdutos } from '../../lib/produtosStore'
import { formatarReais } from '../../lib/format'
import EmptyState from '../../components/EmptyState'

// Relatórios (Capítulo 7.12 do PRD) — vendas por produto (RF-REL-01) e giro
// de estoque por categoria (RF-REL-02), agora a partir de vendas reais.
export default function Relatorios() {
  const vendas = useVendas().filter((v) => !v.cancelada)
  const produtos = useProdutos()
  const ranking = calcularRanking(vendas)

  const porCategoria = Array.from(new Set(produtos.map((p) => p.categoria))).map((categoria) => {
    const itensDaCategoria = produtos.filter((p) => p.categoria === categoria)
    const valorEstoque = itensDaCategoria.reduce((s, p) => s + p.estoqueAtual * p.precoVenda, 0)
    return { categoria, quantidadeProdutos: itensDaCategoria.length, valorEstoque }
  })

  return (
    <div className="max-w-3xl space-y-8">
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
                <tr key={c.categoria} className="border-b border-black/5 dark:border-white/5 last:border-0">
                  <td className="px-3 py-2.5">{c.categoria}</td>
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
