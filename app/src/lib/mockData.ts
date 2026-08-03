// Dados-SEMENTE — usados só pra popular os stores locais (produtosStore.ts,
// categoriasStore.ts, fornecedoresStore.ts, comprasStore.ts, estoqueStore.ts,
// vendasStore.ts) na primeira vez que cada localStorage é lido. Depois
// disso, toda leitura/escrita de verdade passa pelos stores — nunca use os
// arrays daqui diretamente numa tela, ou a edição do usuário nunca vai
// refletir (releria sempre o array estático original).
import type { Categoria, Compra, Fornecedor, Marca, MovimentoEstoque, Produto, TurnoCaixa } from './types'

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

// ============================================================
// CATEGORIAS E MARCAS (Cap. 7.3)
// ============================================================
export const CATEGORIAS_MOCK: Categoria[] = [
  { id: 'cat-geral', nome: 'Geral', categoriaPaiId: null },
  { id: 'cat-higiene', nome: 'Higiene', categoriaPaiId: null },
  { id: 'cat-alimentos', nome: 'Alimentos', categoriaPaiId: null },
  { id: 'cat-alimentos-graos', nome: 'Grãos e cereais', categoriaPaiId: 'cat-alimentos' },
  { id: 'cat-alimentos-carnes', nome: 'Carnes e frios', categoriaPaiId: 'cat-alimentos' },
  { id: 'cat-bebidas', nome: 'Bebidas', categoriaPaiId: null },
]

export const MARCAS_MOCK: Marca[] = [
  { id: 'marca-1', nome: 'Nordway' },
  { id: 'marca-2', nome: 'Vitalis' },
  { id: 'marca-3', nome: 'Campo Bom' },
  { id: 'marca-4', nome: 'PetLar' },
]

// ============================================================
// FORNECEDORES (Cap. 7.4)
// ============================================================
export const FORNECEDORES_MOCK: Fornecedor[] = [
  { id: 'forn-1', nome: 'Distribuidora Nordeste Ltda', contato: '(85) 3222-1010', condicoesPagamento: '28 dias' },
  { id: 'forn-2', nome: 'Atacado Vitalis', contato: '(11) 4002-8922', condicoesPagamento: 'À vista' },
  { id: 'forn-3', nome: 'Campo Bom Alimentos', contato: '(48) 3025-7788', condicoesPagamento: '14 dias' },
  { id: 'forn-4', nome: 'PetLar Distribuição', contato: '(21) 3555-9090', condicoesPagamento: '30 dias' },
]

// ============================================================
// COMPRAS (Cap. 7.5)
// ============================================================
export const COMPRAS_MOCK: Compra[] = [
  {
    id: 'compra-1',
    fornecedor: FORNECEDORES_MOCK[0],
    status: 'recebido',
    dataPedido: '2026-07-18',
    itens: [
      { produto: PRODUTOS_MOCK[0], quantidade: 40, precoUnitario: PRODUTOS_MOCK[0].precoCusto },
      { produto: PRODUTOS_MOCK[1], quantidade: 30, precoUnitario: PRODUTOS_MOCK[1].precoCusto },
    ],
  },
  {
    id: 'compra-2',
    fornecedor: FORNECEDORES_MOCK[1],
    status: 'parcial',
    dataPedido: '2026-07-25',
    itens: [{ produto: PRODUTOS_MOCK[5], quantidade: 20, precoUnitario: PRODUTOS_MOCK[5].precoCusto }],
  },
  {
    id: 'compra-3',
    fornecedor: FORNECEDORES_MOCK[2],
    status: 'pendente',
    dataPedido: '2026-08-01',
    itens: [
      { produto: PRODUTOS_MOCK[13], quantidade: 50, precoUnitario: PRODUTOS_MOCK[13].precoCusto },
      { produto: PRODUTOS_MOCK[14], quantidade: 50, precoUnitario: PRODUTOS_MOCK[14].precoCusto },
    ],
  },
]

// ============================================================
// ESTOQUE — MOVIMENTOS (Cap. 7.6)
// Convenção de sinal: quantidade é sempre o delta real aplicado ao saldo
// (entrada positiva, saída/perda negativa, ajuste como o operador digitar).
// ============================================================
export const MOVIMENTOS_ESTOQUE_MOCK: MovimentoEstoque[] = [
  { id: 'mov-1', produto: PRODUTOS_MOCK[0], tipo: 'entrada', quantidade: 40, motivo: 'Recebimento — Compra #1', data: '2026-07-18T09:12:00' },
  { id: 'mov-2', produto: PRODUTOS_MOCK[4], tipo: 'saida', quantidade: -1, motivo: 'Venda PDV', data: '2026-08-01T14:32:00' },
  { id: 'mov-3', produto: PRODUTOS_MOCK[7], tipo: 'perda', quantidade: -2, motivo: 'Produto danificado', data: '2026-07-29T11:05:00' },
  { id: 'mov-4', produto: PRODUTOS_MOCK[10], tipo: 'ajuste', quantidade: -1, motivo: 'Divergência de inventário', data: '2026-07-30T17:40:00' },
]

// ============================================================
// CAIXA (Cap. 7.8)
// ============================================================
export const TURNO_CAIXA_MOCK: TurnoCaixa = {
  id: 'turno-1',
  operador: 'Marcela Souza',
  valorAbertura: 150.0,
  valorFechamento: null,
  status: 'aberto',
  abertoEm: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
}
