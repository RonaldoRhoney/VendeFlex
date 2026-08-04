// Tipos do domínio VendeFlex nesta fase de scaffold — sem tabela/schema
// real ainda, só o suficiente pra tipar os dados mockados (lib/mockData.ts)
// e as telas de prova de conceito (Dashboard/PDV/Produtos).

export interface Produto {
  id: string
  nome: string
  sku: string
  categoriaId: string | null
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

// ---------- Vendas / PDV (Cap. 7.7) ----------
export type FormaPagamento = 'dinheiro' | 'cartao' | 'pix'

export interface VendaRegistrada {
  id: string
  itens: ItemCarrinho[]
  total: number
  formaPagamento: FormaPagamento
  vendedor: string
  criadoEm: string
  cancelada?: boolean
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

// ---------- Categorias e Marcas (Cap. 7.3) ----------
export interface Categoria {
  id: string
  nome: string
  categoriaPaiId: string | null
}

export interface Marca {
  id: string
  nome: string
}

// ---------- Fornecedores (Cap. 7.4) ----------
export interface Fornecedor {
  id: string
  nome: string
  contato: string
  condicoesPagamento: string
}

// ---------- Compras (Cap. 7.5) ----------
export type StatusCompra = 'pendente' | 'parcial' | 'recebido'

export interface ItemCompra {
  produto: Produto
  quantidade: number
  precoUnitario: number
}

export interface Compra {
  id: string
  fornecedor: Fornecedor
  status: StatusCompra
  dataPedido: string
  itens: ItemCompra[]
}

// ---------- Estoque — movimentos (Cap. 7.6) ----------
export type TipoMovimentoEstoque = 'entrada' | 'saida' | 'perda' | 'ajuste'

export interface MovimentoEstoque {
  id: string
  produto: Produto
  tipo: TipoMovimentoEstoque
  quantidade: number
  motivo: string
  data: string
}

// ---------- Caixa (Cap. 7.8) ----------
export type StatusCaixa = 'aberto' | 'fechado'

export interface TurnoCaixa {
  id: string
  operadorId: string
  valorAbertura: number
  valorFechamento: number | null
  diferenca: number | null
  status: StatusCaixa
  abertoEm: string
}

export interface MovimentoCaixa {
  id: string
  turnoId: string
  tipo: 'sangria' | 'suprimento'
  valor: number
  descricao: string | null
  criadoEm: string
}

// ---------- Financeiro (Cap. 7.9) ----------
export interface LinhaDRE {
  label: string
  valor: number
  destaque?: boolean
}
