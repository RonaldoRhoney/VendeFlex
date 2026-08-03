import { createLocalStore } from './localStore'
import { FORNECEDORES_MOCK } from './mockData'
import type { Fornecedor } from './types'

const store = createLocalStore<Fornecedor>('vendeflex.fornecedores', FORNECEDORES_MOCK)

export const useFornecedores = store.useStore

export function criarFornecedor(dados: Omit<Fornecedor, 'id'>): Fornecedor {
  const novo: Fornecedor = { ...dados, id: `forn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }
  store.salvar([...store.ler(), novo])
  return novo
}

export function excluirFornecedor(id: string) {
  store.salvar(store.ler().filter((f) => f.id !== id))
}
