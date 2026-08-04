import { supabase } from './supabaseClient'
import { useTenantRows, notificarMudanca } from './supabaseStore'
import { obterTenantAtual } from './tenant'
import type { Produto } from './types'

interface LinhaProduto {
  id: string
  nome: string
  sku: string
  categoria_id: string | null
  preco_custo: number
  preco_venda: number
  estoque_atual: number
  estoque_minimo: number
  ativo: boolean
}

function paraProduto(l: LinhaProduto): Produto {
  return {
    id: l.id,
    nome: l.nome,
    sku: l.sku,
    categoriaId: l.categoria_id,
    precoCusto: l.preco_custo,
    precoVenda: l.preco_venda,
    estoqueAtual: l.estoque_atual,
    estoqueMinimo: l.estoque_minimo,
    ativo: l.ativo,
  }
}

const SELECT = 'id, nome, sku, categoria_id, preco_custo, preco_venda, estoque_atual, estoque_minimo, ativo'

// A partir de agora, produtos vive de verdade no Supabase (tabela
// `produtos`, RLS por tenant) — toda leitura e escrita de verdade
// (Produtos.tsx, PDV.tsx, Estoque.tsx, Compras.tsx) passa por este store.
export function useProdutos(): Produto[] {
  const linhas = useTenantRows<LinhaProduto>('produtos', SELECT, { coluna: 'nome' })
  return linhas.map(paraProduto)
}

export async function criarProduto(dados: Omit<Produto, 'id'>): Promise<Produto> {
  const tenant = obterTenantAtual()
  if (!supabase || !tenant) throw new Error('Sem sessão ativa.')
  const { data, error } = await supabase
    .from('produtos')
    .insert({
      tenant_id: tenant.tenantId,
      nome: dados.nome,
      sku: dados.sku,
      categoria_id: dados.categoriaId,
      preco_custo: dados.precoCusto,
      preco_venda: dados.precoVenda,
      estoque_atual: dados.estoqueAtual,
      estoque_minimo: dados.estoqueMinimo,
      ativo: dados.ativo,
    })
    .select(SELECT)
    .single()
  if (error) throw error
  notificarMudanca()
  return paraProduto(data as LinhaProduto)
}

export async function editarProduto(id: string, patch: Partial<Produto>) {
  if (!supabase) throw new Error('Sem sessão ativa.')
  const payload: Record<string, unknown> = {}
  if (patch.nome !== undefined) payload.nome = patch.nome
  if (patch.sku !== undefined) payload.sku = patch.sku
  if (patch.categoriaId !== undefined) payload.categoria_id = patch.categoriaId
  if (patch.precoCusto !== undefined) payload.preco_custo = patch.precoCusto
  if (patch.precoVenda !== undefined) payload.preco_venda = patch.precoVenda
  if (patch.estoqueAtual !== undefined) payload.estoque_atual = patch.estoqueAtual
  if (patch.estoqueMinimo !== undefined) payload.estoque_minimo = patch.estoqueMinimo
  if (patch.ativo !== undefined) payload.ativo = patch.ativo

  const { error } = await supabase.from('produtos').update(payload).eq('id', id)
  if (error) throw error
  notificarMudanca()
}

// RF-PRD-05 (Cap. 7.2 do PRD): "editar e inativar produto sem excluir
// histórico de vendas associado" — inativar (não apagar) é o caminho
// correto; a policy de produtos no banco não tem delete de propósito.
export async function alternarAtivoProduto(id: string, ativo: boolean) {
  await editarProduto(id, { ativo })
}
