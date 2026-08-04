import { supabase } from './supabaseClient'
import { useTenantRows, notificarMudanca } from './supabaseStore'
import { obterTenantAtual } from './tenant'
import type { FormaPagamento, ItemCarrinho, Produto, VendaRegistrada } from './types'

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
interface LinhaItemVenda {
  produto_id: string
  quantidade: number
  preco_unitario: number
  produto: LinhaProdutoEmbed
}
interface LinhaVenda {
  id: string
  status: 'confirmada' | 'cancelada'
  forma_pagamento: FormaPagamento
  total: number
  criado_em: string
  venda_itens: LinhaItemVenda[]
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

function paraVenda(l: LinhaVenda): VendaRegistrada {
  const itens: ItemCarrinho[] = l.venda_itens.map((i) => ({ produto: paraProduto(i.produto), quantidade: i.quantidade }))
  return {
    id: l.id,
    itens,
    total: l.total,
    formaPagamento: l.forma_pagamento,
    vendedor: 'Você',
    criadoEm: l.criado_em,
    cancelada: l.status === 'cancelada',
  }
}

const SELECT = `
  id, status, forma_pagamento, total, criado_em,
  venda_itens(produto_id, quantidade, preco_unitario, produto:produtos(id, nome, sku, categoria_id, preco_custo, preco_venda, estoque_atual, estoque_minimo, ativo))
`

export function useVendas(): VendaRegistrada[] {
  return useTenantRows<LinhaVenda>('vendas', SELECT, { coluna: 'criado_em', ascendente: false }).map(paraVenda)
}

// RF-PDV-04/05, RF-EST-04 (decremento automático): o servidor valida preço,
// estoque suficiente e teto de desconto (registrar_venda, migration 0005) —
// o frontend só monta o carrinho.
export async function registrarVenda(itens: ItemCarrinho[], formaPagamento: FormaPagamento, desconto = 0) {
  const tenant = obterTenantAtual()
  if (!supabase || !tenant) throw new Error('Sem sessão ativa.')
  const { error } = await supabase.rpc('registrar_venda', {
    p_tenant_id: tenant.tenantId,
    p_itens: itens.map((i) => ({ produto_id: i.produto.id, quantidade: i.quantidade })),
    p_forma_pagamento: formaPagamento,
    p_desconto: desconto,
  })
  if (error) throw error
  notificarMudanca()
}

// RF-PDV-06: cancelar com estorno automático de estoque — tudo dentro da
// RPC (cancelar_venda, migration 0005), nunca deleta a venda.
export async function cancelarVenda(id: string) {
  if (!supabase) throw new Error('Sem sessão ativa.')
  const { error } = await supabase.rpc('cancelar_venda', { p_venda_id: id })
  if (error) throw error
  notificarMudanca()
}
