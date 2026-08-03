import { createLocalStore } from './localStore'
import { COMPRAS_MOCK } from './mockData'
import { registrarMovimentoEstoque } from './estoqueStore'
import type { Compra, Fornecedor, ItemCompra, StatusCompra } from './types'

const store = createLocalStore<Compra>('vendeflex.compras', COMPRAS_MOCK)

export const useCompras = store.useStore

export function criarCompra(fornecedor: Fornecedor, itens: ItemCompra[]): Compra {
  const nova: Compra = {
    id: `compra-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    fornecedor,
    status: 'pendente',
    dataPedido: new Date().toISOString().slice(0, 10),
    itens,
  }
  store.salvar([nova, ...store.ler()])
  return nova
}

const PROXIMO_STATUS: Record<StatusCompra, StatusCompra> = {
  pendente: 'parcial',
  parcial: 'recebido',
  recebido: 'recebido',
}

// Avança o pedido pro próximo status (RF-COM-03); ao chegar em "recebido",
// gera entrada de estoque de verdade pra cada item (RF-COM-02) — é assim
// que Compras se liga em Estoque na cadeia de dependência do Cap. 4.4.
export function avancarStatusCompra(id: string) {
  const compras = store.ler()
  const compra = compras.find((c) => c.id === id)
  if (!compra || compra.status === 'recebido') return

  const novoStatus = PROXIMO_STATUS[compra.status]
  store.salvar(compras.map((c) => (c.id === id ? { ...c, status: novoStatus } : c)))

  if (novoStatus === 'recebido') {
    for (const item of compra.itens) {
      registrarMovimentoEstoque(item.produto.id, 'entrada', item.quantidade, `Recebimento — ${compra.fornecedor.nome}`)
    }
  }
}
