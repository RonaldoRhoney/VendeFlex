import { useVendas } from '../../lib/vendasStore'
import { formatarReais } from '../../lib/format'
import EmptyState from '../../components/EmptyState'
import type { FormaPagamento } from '../../lib/types'

const FORMA_LABEL: Record<FormaPagamento, string> = {
  dinheiro: 'Dinheiro',
  cartao: 'Cartão',
  pix: 'PIX',
}

// Histórico de Vendas (Capítulo 7.7 do PRD) — lê o que o PDV.tsx registrou
// via lib/vendasStore.ts (localStorage nesta fase, sem backend). É o
// próximo elo do fluxo de dados do Cap. 4.5: Venda no PDV → aparece aqui.
export default function Vendas() {
  const vendas = useVendas()

  if (vendas.length === 0) {
    return (
      <EmptyState
        icon={<span className="text-3xl">💳</span>}
        title="Nenhuma venda registrada ainda"
        description="Finalize uma venda no PDV pra ela aparecer aqui."
      />
    )
  }

  return (
    <div className="max-w-3xl space-y-2">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-semibold text-lg">Vendas</h2>
        <p className="text-xs text-black/40 dark:text-white/40">{vendas.length} venda{vendas.length > 1 ? 's' : ''}</p>
      </div>
      {vendas.map((venda) => (
        <div key={venda.id} className="rounded-xl border border-black/10 dark:border-white/10 p-4">
          <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
            <div>
              <p className="text-sm font-medium">
                {venda.itens.reduce((s, i) => s + i.quantidade, 0)} item(ns) · {venda.vendedor}
              </p>
              <p className="text-xs text-black/40 dark:text-white/40">
                {new Date(venda.criadoEm).toLocaleString('pt-BR')}
              </p>
            </div>
            <span className="text-xs rounded-full border border-black/10 dark:border-white/10 px-2.5 py-1 text-black/60 dark:text-white/60 shrink-0">
              {FORMA_LABEL[venda.formaPagamento]}
            </span>
          </div>
          <div className="space-y-1 mb-2">
            {venda.itens.map((item) => (
              <div key={item.produto.id} className="flex justify-between text-xs text-black/60 dark:text-white/60">
                <span>
                  {item.quantidade}× {item.produto.nome}
                </span>
                <span className="font-[var(--font-mono-fin)]">{formatarReais(item.produto.precoVenda * item.quantidade)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between border-t border-black/10 dark:border-white/10 pt-2 text-sm font-medium">
            <span>Total</span>
            <span className="font-[var(--font-mono-fin)]">{formatarReais(venda.total)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
