import { createLocalStore } from './localStore'
import { PRODUTOS_MOCK } from './mockData'
import type { Produto } from './types'

const store = createLocalStore<Produto>('vendeflex.produtos', PRODUTOS_MOCK)

// A partir de agora, PRODUTOS_MOCK é só a semente inicial — toda leitura e
// escrita de verdade (Produtos.tsx, PDV.tsx, Estoque.tsx, Compras.tsx) passa
// por este store, nunca direto pelo array estático (senão a baixa de
// estoque na venda, por exemplo, nunca refletiria em nenhuma tela).
export const useProdutos = store.useStore

export function listarProdutos(): Produto[] {
  return store.ler()
}

export function buscarProdutoPorId(id: string): Produto | undefined {
  return store.ler().find((p) => p.id === id)
}

export function criarProduto(dados: Omit<Produto, 'id'>): Produto {
  const novo: Produto = { ...dados, id: `prod-${Date.now()}` }
  store.salvar([novo, ...store.ler()])
  return novo
}

export function editarProduto(id: string, patch: Partial<Produto>) {
  store.salvar(store.ler().map((p) => (p.id === id ? { ...p, ...patch } : p)))
}

export function excluirProduto(id: string) {
  store.salvar(store.ler().filter((p) => p.id !== id))
}

export function buscarProdutoPorCodigo(codigo: string): Produto | null {
  const termo = codigo.trim().toLowerCase()
  if (!termo) return null
  const produtos = store.ler()
  return produtos.find((p) => p.sku.toLowerCase() === termo || p.nome.toLowerCase().includes(termo)) ?? null
}

export function produtosEstoqueBaixo(): Produto[] {
  return store.ler().filter((p) => p.estoqueAtual <= p.estoqueMinimo)
}
