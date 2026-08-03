import { COMPRAS_MOCK } from '../../lib/mockData'
import { formatarReais } from '../../lib/format'
import type { StatusCompra } from '../../lib/types'

const STATUS_LABEL: Record<StatusCompra, string> = {
  pendente: 'Pendente',
  parcial: 'Parcial',
  recebido: 'Recebido',
}
const STATUS_CLASSE: Record<StatusCompra, string> = {
  pendente: 'text-warning border-warning/30 bg-warning/10',
  parcial: 'text-accent border-accent/30 bg-accent/10',
  recebido: 'text-success border-success/30 bg-success/10',
}

// Compras (Capítulo 7.5 do PRD) — pedido de compra vinculado a fornecedor,
// com status (RF-COM-01/03). O recebimento de mercadoria (RF-COM-02) gera
// entrada automática em Estoque — ver lib/mockData.ts (MOVIMENTOS_ESTOQUE_MOCK).
export default function Compras() {
  return (
    <div className="max-w-3xl space-y-3">
      <h2 className="font-semibold text-lg mb-1">Compras</h2>
      {COMPRAS_MOCK.map((compra) => {
        const total = compra.itens.reduce((soma, i) => soma + i.quantidade * i.precoUnitario, 0)
        return (
          <div key={compra.id} className="rounded-xl border border-black/10 dark:border-white/10 p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
              <div>
                <p className="text-sm font-medium">{compra.fornecedor.nome}</p>
                <p className="text-xs text-black/40 dark:text-white/40">
                  Pedido em {new Date(compra.dataPedido).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <span className={`text-xs rounded-full border px-2.5 py-1 font-medium shrink-0 ${STATUS_CLASSE[compra.status]}`}>
                {STATUS_LABEL[compra.status]}
              </span>
            </div>
            <div className="space-y-1 mb-2">
              {compra.itens.map((item) => (
                <div key={item.produto.id} className="flex justify-between text-xs text-black/60 dark:text-white/60">
                  <span>
                    {item.quantidade}× {item.produto.nome}
                  </span>
                  <span className="font-[var(--font-mono-fin)]">{formatarReais(item.quantidade * item.precoUnitario)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between border-t border-black/10 dark:border-white/10 pt-2 text-sm font-medium">
              <span>Total do pedido</span>
              <span className="font-[var(--font-mono-fin)]">{formatarReais(total)}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
