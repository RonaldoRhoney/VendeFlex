import { useState } from 'react'
import { PRODUTOS_MOCK } from '../../lib/mockData'
import { formatarReais } from '../../lib/format'

const POR_PAGINA = 20

// Listagem de Produtos (Capítulo 7.2 do PRD) — tabela com cabeçalho sticky e
// paginação obrigatória acima de 50 linhas (Cap. 12.7), valores em
// font-mono-fin (Cap. 12.3). Dados mockados nesta fase.
export default function Produtos() {
  const [pagina, setPagina] = useState(1)

  const totalPaginas = Math.max(Math.ceil(PRODUTOS_MOCK.length / POR_PAGINA), 1)
  const inicio = (pagina - 1) * POR_PAGINA
  const visiveis = PRODUTOS_MOCK.slice(inicio, inicio + POR_PAGINA)

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">Produtos</h2>
        <p className="text-xs text-black/40 dark:text-white/40">{PRODUTOS_MOCK.length} produtos cadastrados</p>
      </div>

      <div className="border border-black/10 dark:border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-bg-light dark:bg-bg-dark border-b border-black/10 dark:border-white/10">
              <tr className="text-left text-xs text-black/40 dark:text-white/40">
                <th className="px-3 py-2.5 font-medium">Produto</th>
                <th className="px-3 py-2.5 font-medium">SKU</th>
                <th className="px-3 py-2.5 font-medium">Categoria</th>
                <th className="px-3 py-2.5 font-medium text-right">Custo</th>
                <th className="px-3 py-2.5 font-medium text-right">Venda</th>
                <th className="px-3 py-2.5 font-medium text-right">Estoque</th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map((p) => (
                <tr key={p.id} className="border-b border-black/5 dark:border-white/5 last:border-0">
                  <td className="px-3 py-2.5 font-medium">{p.nome}</td>
                  <td className="px-3 py-2.5 text-black/50 dark:text-white/50">{p.sku}</td>
                  <td className="px-3 py-2.5 text-black/50 dark:text-white/50">{p.categoria}</td>
                  <td className="px-3 py-2.5 text-right font-[var(--font-mono-fin)]">{formatarReais(p.precoCusto)}</td>
                  <td className="px-3 py-2.5 text-right font-[var(--font-mono-fin)]">{formatarReais(p.precoVenda)}</td>
                  <td
                    className={`px-3 py-2.5 text-right font-[var(--font-mono-fin)] ${
                      p.estoqueAtual <= p.estoqueMinimo ? 'text-danger' : ''
                    }`}
                  >
                    {p.estoqueAtual}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPaginas > 1 && (
          <div className="flex items-center justify-between px-3 py-2.5 border-t border-black/10 dark:border-white/10 text-xs">
            <button
              onClick={() => setPagina((p) => Math.max(p - 1, 1))}
              disabled={pagina === 1}
              className="px-2.5 py-1.5 rounded-lg border border-black/10 dark:border-white/10 disabled:opacity-30 min-h-[44px]"
            >
              Anterior
            </button>
            <span className="text-black/50 dark:text-white/50">
              Página {pagina} de {totalPaginas}
            </span>
            <button
              onClick={() => setPagina((p) => Math.min(p + 1, totalPaginas))}
              disabled={pagina === totalPaginas}
              className="px-2.5 py-1.5 rounded-lg border border-black/10 dark:border-white/10 disabled:opacity-30 min-h-[44px]"
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
