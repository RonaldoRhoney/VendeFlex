import { useTenantRows } from './supabaseStore'
import type { MovimentoEstoque, Produto, TipoMovimentoEstoque } from './types'

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
interface LinhaMovimento {
  id: string
  tipo: TipoMovimentoEstoque
  quantidade: number
  motivo: string | null
  criado_em: string
  produto: LinhaProdutoEmbed
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

function paraMovimento(l: LinhaMovimento): MovimentoEstoque {
  return {
    id: l.id,
    produto: paraProduto(l.produto),
    tipo: l.tipo,
    quantidade: l.quantidade,
    motivo: l.motivo ?? '',
    data: l.criado_em,
  }
}

const SELECT = `
  id, tipo, quantidade, motivo, criado_em,
  produto:produtos(id, nome, sku, categoria_id, preco_custo, preco_venda, estoque_atual, estoque_minimo, ativo)
`

// Só leitura agora — o log de estoque_movimentos é escrito exclusivamente
// pelas RPCs (registrar_venda, avancar_status_compra, cancelar_venda) no
// servidor. Não existe hoje tela de ajuste manual em Estoque.tsx (só lista
// estoque baixo + histórico), então a RPC ajustar_estoque_manual fica sem
// chamador no frontend por enquanto — pendência documentada, não bug.
export function useMovimentosEstoque(): MovimentoEstoque[] {
  return useTenantRows<LinhaMovimento>('estoque_movimentos', SELECT, { coluna: 'criado_em', ascendente: false }).map(paraMovimento)
}
