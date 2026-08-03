import { createLocalStore } from './localStore'
import type { FormaPagamento, ItemCarrinho, VendaRegistrada } from './types'

// "Persistência" de vendas nesta fase — localStorage, não banco de dados
// (ver regra "só frontend" do plano de scaffold). Isso deixa o PDV.tsx e o
// Vendas.tsx se comunicarem de verdade (uma venda finalizada aparece no
// histórico), provando o fluxo de dados do Cap. 4.5 do PRD sem precisar de
// backend ainda. Usa o mesmo factory createLocalStore dos demais domínios
// (produtos, categorias, fornecedores, compras, estoque) em vez de
// reimplementar ler/salvar/sincronizar aqui.
const store = createLocalStore<VendaRegistrada>('vendeflex.vendas', [])

export function registrarVenda(itens: ItemCarrinho[], total: number, formaPagamento: FormaPagamento) {
  const venda: VendaRegistrada = {
    id: `venda-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    itens,
    total,
    formaPagamento,
    vendedor: 'Você',
    criadoEm: new Date().toISOString(),
  }
  store.salvar([venda, ...store.ler()])
  return venda
}

// RF-PDV-06: cancelar venda com estorno automático de estoque. Quem chama
// (Vendas.tsx) já cuida do estorno via registrarMovimentoEstoque — aqui só
// marca a venda como cancelada, nunca some do histórico (rastreabilidade).
export function cancelarVenda(id: string) {
  store.salvar(store.ler().map((v) => (v.id === id ? { ...v, cancelada: true } : v)))
}

// Hook que reflete o histórico em tempo real — inclusive entre abas do
// painel (evento customizado) e entre janelas do navegador (evento nativo
// "storage").
export const useVendas = store.useStore
