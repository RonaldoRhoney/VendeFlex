// Tipos do domínio VendeFlex nesta fase de scaffold — sem tabela/schema
// real ainda, só o suficiente pra tipar os dados mockados (lib/mockData.ts)
// e as telas de prova de conceito (Dashboard/PDV/Produtos).

export interface Produto {
  id: string
  nome: string
  sku: string
  categoria: string
  precoCusto: number
  precoVenda: number
  estoqueAtual: number
  estoqueMinimo: number
  ativo: boolean
}

export interface ItemCarrinho {
  produto: Produto
  quantidade: number
}

export interface IndicadorPeriodo {
  faturamento: number
  lucro: number
  margem: number
  ticketMedio: number
  variacaoFaturamentoPercent: number
  variacaoLucroPercent: number
}

export interface RankingProduto {
  produto: Produto
  quantidadeVendida: number
  lucroGerado: number
}

export type PeriodoDashboard = 'hoje' | 'ontem' | 'semana' | 'mes' | 'ano'
