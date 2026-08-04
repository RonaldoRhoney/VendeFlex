import { supabase } from './supabaseClient'
import { useTenantRows, notificarMudanca } from './supabaseStore'
import { obterTenantAtual } from './tenant'
import type { Compra, Fornecedor, ItemCompra, Produto, StatusCompra } from './types'

interface LinhaProdutoEmbed {
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
interface LinhaFornecedorEmbed {
  id: string
  nome: string
  contato: string | null
  condicoes_pagamento: string | null
}
interface LinhaItemCompra {
  produto_id: string
  quantidade: number
  preco_unitario: number
  produto: LinhaProdutoEmbed
}
interface LinhaCompra {
  id: string
  status: StatusCompra
  data_pedido: string
  fornecedor: LinhaFornecedorEmbed
  compra_itens: LinhaItemCompra[]
}

function paraProduto(l: LinhaProdutoEmbed): Produto {
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
function paraFornecedor(l: LinhaFornecedorEmbed): Fornecedor {
  return { id: l.id, nome: l.nome, contato: l.contato ?? '', condicoesPagamento: l.condicoes_pagamento ?? '' }
}
function paraCompra(l: LinhaCompra): Compra {
  return {
    id: l.id,
    status: l.status,
    dataPedido: l.data_pedido,
    fornecedor: paraFornecedor(l.fornecedor),
    itens: l.compra_itens.map((i) => ({
      produto: paraProduto(i.produto),
      quantidade: i.quantidade,
      precoUnitario: i.preco_unitario,
    })),
  }
}

const SELECT = `
  id, status, data_pedido,
  fornecedor:fornecedores(id, nome, contato, condicoes_pagamento),
  compra_itens(produto_id, quantidade, preco_unitario, produto:produtos(id, nome, sku, categoria_id, preco_custo, preco_venda, estoque_atual, estoque_minimo, ativo))
`

export function useCompras(): Compra[] {
  return useTenantRows<LinhaCompra>('compras', SELECT, { coluna: 'data_pedido', ascendente: false }).map(paraCompra)
}

export async function criarCompra(fornecedor: Fornecedor, itens: ItemCompra[]): Promise<void> {
  const tenant = obterTenantAtual()
  if (!supabase || !tenant) throw new Error('Sem sessão ativa.')

  const { data: compra, error: erroCompra } = await supabase
    .from('compras')
    .insert({ tenant_id: tenant.tenantId, fornecedor_id: fornecedor.id, status: 'pendente' })
    .select('id')
    .single()
  if (erroCompra) throw erroCompra

  const { error: erroItens } = await supabase.from('compra_itens').insert(
    itens.map((item) => ({
      compra_id: compra.id,
      produto_id: item.produto.id,
      quantidade: item.quantidade,
      preco_unitario: item.precoUnitario,
    })),
  )
  if (erroItens) {
    // Best-effort: sem itens, o pedido de compra não faz sentido nenhum —
    // desfaz a compra órfã em vez de deixar lixo no histórico.
    await supabase.from('compras').delete().eq('id', compra.id)
    throw erroItens
  }
  notificarMudanca()
}

// Avança o pedido pro próximo status (RF-COM-03); ao chegar em "recebido",
// a própria RPC gera a entrada de estoque de verdade pra cada item
// (RF-COM-02) — o frontend não orquestra mais nada disso.
export async function avancarStatusCompra(id: string) {
  if (!supabase) throw new Error('Sem sessão ativa.')
  const { error } = await supabase.rpc('avancar_status_compra', { p_compra_id: id })
  if (error) throw error
  notificarMudanca()
}
