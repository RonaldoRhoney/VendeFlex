import { createLocalStore } from './localStore'
import { CATEGORIAS_MOCK, MARCAS_MOCK } from './mockData'
import type { Categoria, Marca } from './types'

const categoriasStore = createLocalStore<Categoria>('vendeflex.categorias', CATEGORIAS_MOCK)
const marcasStore = createLocalStore<Marca>('vendeflex.marcas', MARCAS_MOCK)

export const useCategorias = categoriasStore.useStore
export const useMarcas = marcasStore.useStore

export function criarCategoria(nome: string, categoriaPaiId: string | null): Categoria {
  const nova: Categoria = { id: `cat-${Date.now()}`, nome, categoriaPaiId }
  categoriasStore.salvar([...categoriasStore.ler(), nova])
  return nova
}

export function excluirCategoria(id: string) {
  categoriasStore.salvar(categoriasStore.ler().filter((c) => c.id !== id && c.categoriaPaiId !== id))
}

export function criarMarca(nome: string): Marca {
  const nova: Marca = { id: `marca-${Date.now()}`, nome }
  marcasStore.salvar([...marcasStore.ler(), nova])
  return nova
}

export function excluirMarca(id: string) {
  marcasStore.salvar(marcasStore.ler().filter((m) => m.id !== id))
}
