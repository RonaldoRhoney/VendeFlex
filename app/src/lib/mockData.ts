// Dados fake — só pra provar o design system nesta fase (Dashboard/PDV/
// Produtos). Nenhum valor aqui vem de banco; será substituído quando o
// backend for desenhado numa fase futura.
import type { IndicadorPeriodo, PeriodoDashboard, Produto, RankingProduto } from './types'

const NOMES = [
  'Camiseta Básica P',
  'Camiseta Básica M',
  'Camiseta Básica G',
  'Caderno Universitário 96fl',
  'Caneta Esferográfica Azul',
  'Dipirona 500mg (10 comp.)',
  'Protetor Solar FPS 50',
  'Ração Premium Cães 15kg',
  'Areia Sanitária Gato 4kg',
  'Óleo de Motor 5W30',
  'Filtro de Óleo Universal',
  'Shampoo Hidratante 300ml',
  'Batom Matte Vermelho',
  'Arroz Tipo 1 5kg',
  'Feijão Carioca 1kg',
  'Contra Filé (kg)',
  'Linguiça Toscana (kg)',
]

function gerarProdutos(): Produto[] {
  return Array.from({ length: 62 }, (_, i) => {
    const custo = 8 + ((i * 7) % 80)
    const margem = 1.35 + ((i % 5) * 0.15)
    return {
      id: `prod-${i + 1}`,
      nome: NOMES[i % NOMES.length] + (i >= NOMES.length ? ` #${Math.floor(i / NOMES.length) + 1}` : ''),
      sku: `SKU-${String(1000 + i)}`,
      categoria: ['Geral', 'Higiene', 'Alimentos', 'Bebidas'][i % 4],
      precoCusto: Number(custo.toFixed(2)),
      precoVenda: Number((custo * margem).toFixed(2)),
      estoqueAtual: (i * 3) % 40,
      estoqueMinimo: 5,
      ativo: true,
    }
  })
}

export const PRODUTOS_MOCK: Produto[] = gerarProdutos()

export function buscarProdutoPorCodigo(codigo: string): Produto | null {
  const termo = codigo.trim().toLowerCase()
  if (!termo) return null
  return (
    PRODUTOS_MOCK.find((p) => p.sku.toLowerCase() === termo || p.nome.toLowerCase().includes(termo)) ?? null
  )
}

const INDICADORES_POR_PERIODO: Record<PeriodoDashboard, IndicadorPeriodo> = {
  hoje: { faturamento: 1842.5, lucro: 612.3, margem: 33.2, ticketMedio: 61.4, variacaoFaturamentoPercent: 8.4, variacaoLucroPercent: 5.1 },
  ontem: { faturamento: 1701.2, lucro: 589.1, margem: 34.6, ticketMedio: 58.9, variacaoFaturamentoPercent: -2.1, variacaoLucroPercent: -1.4 },
  semana: { faturamento: 11890.4, lucro: 3921.6, margem: 33.0, ticketMedio: 63.2, variacaoFaturamentoPercent: 12.7, variacaoLucroPercent: 10.2 },
  mes: { faturamento: 48210.9, lucro: 15980.3, margem: 33.1, ticketMedio: 60.8, variacaoFaturamentoPercent: 6.3, variacaoLucroPercent: 4.8 },
  ano: { faturamento: 512300.0, lucro: 168900.0, margem: 33.0, ticketMedio: 59.7, variacaoFaturamentoPercent: 18.9, variacaoLucroPercent: 15.4 },
}

export function indicadoresDoPeriodo(periodo: PeriodoDashboard): IndicadorPeriodo {
  return INDICADORES_POR_PERIODO[periodo]
}

export function rankingMaisVendidos(): RankingProduto[] {
  return PRODUTOS_MOCK.slice(0, 5).map((produto, i) => ({
    produto,
    quantidadeVendida: 40 - i * 6,
    lucroGerado: (produto.precoVenda - produto.precoCusto) * (40 - i * 6),
  }))
}

export function produtosEstoqueBaixo(): Produto[] {
  return PRODUTOS_MOCK.filter((p) => p.estoqueAtual <= p.estoqueMinimo)
}
