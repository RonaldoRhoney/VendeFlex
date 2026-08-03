import { createLocalStore } from './localStore'
import { CATEGORIAS_MOCK, MARCAS_MOCK } from './mockData'
import { listarProdutos, editarProduto } from './produtosStore'
import type { Categoria, Marca } from './types'

const categoriasStore = createLocalStore<Categoria>('vendeflex.categorias', CATEGORIAS_MOCK)
const marcasStore = createLocalStore<Marca>('vendeflex.marcas', MARCAS_MOCK)

export const useCategorias = categoriasStore.useStore
export const useMarcas = marcasStore.useStore

export function criarCategoria(nome: string, categoriaPaiId: string | null): Categoria {
  const nova: Categoria = { id: `cat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, nome, categoriaPaiId }
  categoriasStore.salvar([...categoriasStore.ler(), nova])
  return nova
}

// Produto.categoria guarda o NOME da categoria (não o id) — ao excluir uma
// categoria, todo produto que tinha esse nome fica "órfão" no <select> de
// edição (opção não existe mais, mas o valor salvo continua lá). Sem esta
// propagação, o produto continuava mostrando um nome de categoria que não
// existe mais em lugar nenhum do cadastro (achado da auditoria de
// qualidade de código).
export function excluirCategoria(id: string) {
  const categoria = categoriasStore.ler().find((c) => c.id === id)
  categoriasStore.salvar(categoriasStore.ler().filter((c) => c.id !== id && c.categoriaPaiId !== id))
  if (!categoria) return
  for (const produto of listarProdutos()) {
    if (produto.categoria === categoria.nome) {
      editarProduto(produto.id, { categoria: '' })
    }
  }
}

export function criarMarca(nome: string): Marca {
  const nova: Marca = { id: `marca-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, nome }
  marcasStore.salvar([...marcasStore.ler(), nova])
  return nova
}

export function excluirMarca(id: string) {
  marcasStore.salvar(marcasStore.ler().filter((m) => m.id !== id))
}
