import { createLocalStore } from './localStore'
import { MOVIMENTOS_ESTOQUE_MOCK } from './mockData'
import { buscarProdutoPorId, editarProduto } from './produtosStore'
import type { MovimentoEstoque, TipoMovimentoEstoque } from './types'

const store = createLocalStore<MovimentoEstoque>('vendeflex.movimentos_estoque', MOVIMENTOS_ESTOQUE_MOCK)

export const useMovimentosEstoque = store.useStore

// Único ponto de entrada pra mudar estoque de um produto — chamado pelo PDV
// (venda), Compras (recebimento) e Vendas (estorno de cancelamento), sempre
// deixando um registro no log (RF-EST-01) e nunca deixando o saldo ir
// abaixo de zero.
export function registrarMovimentoEstoque(produtoId: string, tipo: TipoMovimentoEstoque, quantidade: number, motivo: string) {
  const produto = buscarProdutoPorId(produtoId)
  if (!produto) return

  const delta = tipo === 'entrada' ? Math.abs(quantidade) : tipo === 'saida' || tipo === 'perda' ? -Math.abs(quantidade) : quantidade
  const novoEstoque = Math.max(produto.estoqueAtual + delta, 0)
  editarProduto(produtoId, { estoqueAtual: novoEstoque })

  const movimento: MovimentoEstoque = {
    id: `mov-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    produto: { ...produto, estoqueAtual: novoEstoque },
    tipo,
    quantidade: delta,
    motivo,
    data: new Date().toISOString(),
  }
  store.salvar([movimento, ...store.ler()])
}
