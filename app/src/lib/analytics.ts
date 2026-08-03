// Indicadores calculados a partir de vendas REAIS (lib/vendasStore.ts), não
// mais fórmulas fixas — Dashboard/Financeiro/Relatórios liam antes números
// estáticos que ignoravam o que o PDV já registra de verdade (achado da
// auditoria de regras de negócio). Continua sem backend: os dados-fonte são
// só o que existe em localStorage nesta fase, por isso início "zerado" é o
// resultado correto (e esperado) enquanto não houver venda nenhuma.
import type { IndicadorPeriodo, LinhaDRE, PeriodoDashboard, Produto, RankingProduto, VendaRegistrada } from './types'

function inicioPeriodo(periodo: PeriodoDashboard, agora: Date): Date {
  const inicio = new Date(agora)
  if (periodo === 'hoje') {
    inicio.setHours(0, 0, 0, 0)
    return inicio
  }
  if (periodo === 'ontem') {
    inicio.setDate(inicio.getDate() - 1)
    inicio.setHours(0, 0, 0, 0)
    return inicio
  }
  if (periodo === 'semana') {
    inicio.setDate(inicio.getDate() - 7)
    return inicio
  }
  if (periodo === 'mes') {
    inicio.setDate(inicio.getDate() - 30)
    return inicio
  }
  inicio.setFullYear(inicio.getFullYear() - 1)
  return inicio
}

function fimPeriodo(periodo: PeriodoDashboard, agora: Date): Date {
  if (periodo === 'ontem') {
    const fim = new Date(agora)
    fim.setDate(fim.getDate() - 1)
    fim.setHours(23, 59, 59, 999)
    return fim
  }
  return agora
}

function deslocarParaPeriodoAnterior(periodo: PeriodoDashboard, agora: Date): Date {
  const anterior = new Date(agora)
  if (periodo === 'hoje' || periodo === 'ontem') anterior.setDate(anterior.getDate() - 1)
  else if (periodo === 'semana') anterior.setDate(anterior.getDate() - 7)
  else if (periodo === 'mes') anterior.setDate(anterior.getDate() - 30)
  else anterior.setFullYear(anterior.getFullYear() - 1)
  return anterior
}

export function vendasNoPeriodo(vendas: VendaRegistrada[], periodo: PeriodoDashboard, agora: Date = new Date()): VendaRegistrada[] {
  const inicio = inicioPeriodo(periodo, agora)
  const fim = fimPeriodo(periodo, agora)
  return vendas.filter((v) => {
    const data = new Date(v.criadoEm)
    return data >= inicio && data <= fim
  })
}

function custoDaVenda(venda: VendaRegistrada): number {
  return venda.itens.reduce((soma, item) => soma + item.produto.precoCusto * item.quantidade, 0)
}

function resumo(vendas: VendaRegistrada[], periodo: PeriodoDashboard, agora: Date) {
  const doPeriodo = vendasNoPeriodo(vendas, periodo, agora)
  const faturamento = doPeriodo.reduce((s, v) => s + v.total, 0)
  const custo = doPeriodo.reduce((s, v) => s + custoDaVenda(v), 0)
  const lucro = faturamento - custo
  const margem = faturamento > 0 ? (lucro / faturamento) * 100 : 0
  const ticketMedio = doPeriodo.length > 0 ? faturamento / doPeriodo.length : 0
  return { faturamento, lucro, margem, ticketMedio }
}

export function calcularIndicadores(vendas: VendaRegistrada[], periodo: PeriodoDashboard, agora = new Date()): IndicadorPeriodo {
  const atual = resumo(vendas, periodo, agora)
  const anterior = resumo(vendas, periodo, deslocarParaPeriodoAnterior(periodo, agora))
  const variacaoFaturamentoPercent = anterior.faturamento > 0 ? ((atual.faturamento - anterior.faturamento) / anterior.faturamento) * 100 : 0
  const variacaoLucroPercent = anterior.lucro > 0 ? ((atual.lucro - anterior.lucro) / anterior.lucro) * 100 : 0
  return { ...atual, variacaoFaturamentoPercent, variacaoLucroPercent }
}

export function calcularRanking(vendas: VendaRegistrada[]): RankingProduto[] {
  const mapa = new Map<string, RankingProduto>()
  for (const venda of vendas) {
    for (const item of venda.itens) {
      const lucroItem = (item.produto.precoVenda - item.produto.precoCusto) * item.quantidade
      const atual = mapa.get(item.produto.id)
      if (atual) {
        atual.quantidadeVendida += item.quantidade
        atual.lucroGerado += lucroItem
      } else {
        mapa.set(item.produto.id, { produto: item.produto, quantidadeVendida: item.quantidade, lucroGerado: lucroItem })
      }
    }
  }
  return Array.from(mapa.values())
    .sort((a, b) => b.quantidadeVendida - a.quantidadeVendida)
    .slice(0, 5)
}

// RF-DSH-02 (Cap. 8 do PRD): "produtos mais vendidos, mais lucrativos, sem
// venda e com estoque baixo" — calcularRanking só cobria o primeiro
// recorte (ordenado por quantidade); este cobre o segundo, ordenado por
// lucro gerado no período (achado da auditoria de regras de negócio).
export function calcularRankingLucratividade(vendas: VendaRegistrada[]): RankingProduto[] {
  const mapa = new Map<string, RankingProduto>()
  for (const venda of vendas) {
    for (const item of venda.itens) {
      const lucroItem = (item.produto.precoVenda - item.produto.precoCusto) * item.quantidade
      const atual = mapa.get(item.produto.id)
      if (atual) {
        atual.quantidadeVendida += item.quantidade
        atual.lucroGerado += lucroItem
      } else {
        mapa.set(item.produto.id, { produto: item.produto, quantidadeVendida: item.quantidade, lucroGerado: lucroItem })
      }
    }
  }
  return Array.from(mapa.values())
    .sort((a, b) => b.lucroGerado - a.lucroGerado)
    .slice(0, 5)
}

// Terceiro recorte do RF-DSH-02: produtos ativos que não tiveram nenhuma
// venda no período selecionado — ajuda o dono a identificar encalhe.
export function produtosSemVenda(produtos: Produto[], vendas: VendaRegistrada[]): Produto[] {
  const vendidos = new Set(vendas.flatMap((v) => v.itens.map((i) => i.produto.id)))
  return produtos.filter((p) => p.ativo && !vendidos.has(p.id))
}

export function calcularDRE(vendas: VendaRegistrada[], periodo: PeriodoDashboard): LinhaDRE[] {
  const ind = calcularIndicadores(vendas, periodo)
  const custoProdutos = ind.faturamento - ind.lucro
  const despesasOperacionais = ind.faturamento * 0.08
  const lucroLiquido = ind.lucro - despesasOperacionais
  return [
    { label: 'Faturamento bruto', valor: ind.faturamento },
    { label: 'Custo dos produtos vendidos', valor: -custoProdutos },
    { label: 'Lucro bruto', valor: ind.lucro, destaque: true },
    { label: 'Despesas operacionais (estimado)', valor: -despesasOperacionais },
    { label: 'Lucro líquido', valor: lucroLiquido, destaque: true },
  ]
}
