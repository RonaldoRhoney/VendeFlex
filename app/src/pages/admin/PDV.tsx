import { useState } from 'react'
import { PRODUTOS_MOCK } from '../../lib/mockData'
import { formatarReais } from '../../lib/format'
import type { ItemCarrinho, Produto } from '../../lib/types'

// PDV / Vendas (Capítulo 7.7 do PRD) — mobile-first, já que é o fluxo mais
// usado no balcão de venda (Cap. 12.11). Busca por texto nesta fase; o
// leitor de código de barras via câmera (RF-PDV-01) ainda não existe — ao
// implementar, vai exigir consentimento em destaque antes do primeiro uso
// (skill google-play-policies: permissão sensível de câmera).
export default function PDV() {
  const [busca, setBusca] = useState('')
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([])

  const resultados = busca.trim()
    ? PRODUTOS_MOCK.filter(
        (p) => p.nome.toLowerCase().includes(busca.toLowerCase()) || p.sku.toLowerCase().includes(busca.toLowerCase()),
      ).slice(0, 12)
    : PRODUTOS_MOCK.slice(0, 12)

  function adicionar(produto: Produto) {
    setCarrinho((prev) => {
      const existente = prev.find((i) => i.produto.id === produto.id)
      if (existente) {
        return prev.map((i) => (i.produto.id === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i))
      }
      return [...prev, { produto, quantidade: 1 }]
    })
  }

  function alterarQuantidade(produtoId: string, delta: number) {
    setCarrinho((prev) =>
      prev
        .map((i) => (i.produto.id === produtoId ? { ...i, quantidade: Math.max(i.quantidade + delta, 0) } : i))
        .filter((i) => i.quantidade > 0),
    )
  }

  const total = carrinho.reduce((soma, i) => soma + i.produto.precoVenda * i.quantidade, 0)

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 max-w-5xl">
      <div className="flex-1 min-w-0">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar produto por nome ou código (SKU)"
          autoFocus
          className="w-full border border-black/15 dark:border-white/15 rounded-xl px-4 py-3 text-sm mb-4 bg-transparent placeholder:text-black/30 dark:placeholder:text-white/30"
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {resultados.map((produto) => (
            <button
              key={produto.id}
              onClick={() => adicionar(produto)}
              className="rounded-xl border border-black/10 dark:border-white/10 p-3 text-left transition-all duration-200 active:scale-95 hover:-translate-y-0.5 hover:border-seg-primary/40 min-h-[44px]"
            >
              <p className="text-sm font-medium leading-snug line-clamp-2">{produto.nome}</p>
              <p className="text-xs text-black/40 dark:text-white/40 mt-0.5">{produto.sku}</p>
              <p className="text-sm font-medium font-[var(--font-mono-fin)] mt-1.5">{formatarReais(produto.precoVenda)}</p>
            </button>
          ))}
          {resultados.length === 0 && (
            <p className="col-span-full text-sm text-black/40 dark:text-white/40 py-8 text-center">
              Nenhum produto encontrado.
            </p>
          )}
        </div>
      </div>

      {/* Carrinho — sidebar no desktop, fica embaixo no mobile */}
      <div className="lg:w-72 shrink-0">
        <div className="rounded-xl border border-black/10 dark:border-white/10 p-4 lg:sticky lg:top-4">
          <p className="text-sm font-medium mb-3">Carrinho</p>
          {carrinho.length === 0 ? (
            <p className="text-xs text-black/40 dark:text-white/40">Nenhum item ainda — clique num produto pra adicionar.</p>
          ) : (
            <div className="space-y-2 mb-4">
              {carrinho.map((item) => (
                <div key={item.produto.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{item.produto.nome}</p>
                    <p className="text-[11px] text-black/40 dark:text-white/40">
                      {formatarReais(item.produto.precoVenda)} × {item.quantidade}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => alterarQuantidade(item.produto.id, -1)}
                      className="w-7 h-7 rounded-lg border border-black/15 dark:border-white/15 text-sm active:scale-90 transition-transform"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-xs">{item.quantidade}</span>
                    <button
                      onClick={() => alterarQuantidade(item.produto.id, 1)}
                      className="w-7 h-7 rounded-lg border border-black/15 dark:border-white/15 text-sm active:scale-90 transition-transform"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between border-t border-black/10 dark:border-white/10 pt-3 mb-3">
            <span className="text-sm text-black/50 dark:text-white/50">Total</span>
            <span className="font-semibold font-[var(--font-mono-fin)]">{formatarReais(total)}</span>
          </div>
          <button
            disabled={carrinho.length === 0}
            onClick={() => setCarrinho([])}
            className="w-full rounded-lg bg-seg-primary text-white py-3 text-sm font-medium transition-transform active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
          >
            Finalizar Venda
          </button>
        </div>
      </div>
    </div>
  )
}
