import { PRODUTOS_MOCK, rankingMaisVendidos } from '../../lib/mockData'
import { formatarReais } from '../../lib/format'

// Relatórios (Capítulo 7.12 do PRD) — vendas por categoria (RF-REL-01) e
// giro de estoque (RF-REL-02). DRE completo/Curva ABC/BI são V2/V3.
export default function Relatorios() {
  const ranking = rankingMaisVendidos()

  const porCategoria = Array.from(new Set(PRODUTOS_MOCK.map((p) => p.categoria))).map((categoria) => {
    const produtos = PRODUTOS_MOCK.filter((p) => p.categoria === categoria)
    const valorEstoque = produtos.reduce((s, p) => s + p.estoqueAtual * p.precoVenda, 0)
    return { categoria, quantidadeProdutos: produtos.length, valorEstoque }
  })

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="font-semibold text-lg mb-3">Vendas por produto</h2>
        <div className="space-y-1.5">
          {ranking.map((r) => (
            <div key={r.produto.id} className="flex justify-between text-sm rounded-lg border border-black/10 dark:border-white/10 px-3 py-2.5">
              <span>{r.produto.nome}</span>
              <span className="font-[var(--font-mono-fin)] tabular-nums">{r.quantidadeVendida} un. · {formatarReais(r.lucroGerado)}</span>
            </div>
          ))}
        </div>
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
