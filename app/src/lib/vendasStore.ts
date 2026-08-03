import { useEffect, useState } from 'react'
import type { FormaPagamento, ItemCarrinho, VendaRegistrada } from './types'

// "Persistência" de vendas nesta fase — localStorage, não banco de dados
// (ver regra "só frontend" do plano de scaffold). Isso deixa o PDV.tsx e o
// Vendas.tsx se comunicarem de verdade (uma venda finalizada aparece no
// histórico), provando o fluxo de dados do Cap. 4.5 do PRD sem precisar de
// backend ainda.
const CHAVE = 'vendeflex.vendas'

function lerVendas(): VendaRegistrada[] {
  try {
    const raw = localStorage.getItem(CHAVE)
    return raw ? (JSON.parse(raw) as VendaRegistrada[]) : []
  } catch {
    return []
  }
}

function salvarVendas(vendas: VendaRegistrada[]) {
  localStorage.setItem(CHAVE, JSON.stringify(vendas))
  window.dispatchEvent(new Event('vendeflex-vendas-mudou'))
}

export function registrarVenda(itens: ItemCarrinho[], total: number, formaPagamento: FormaPagamento) {
  const venda: VendaRegistrada = {
    id: `venda-${Date.now()}`,
    itens,
    total,
    formaPagamento,
    vendedor: 'Você',
    criadoEm: new Date().toISOString(),
  }
  salvarVendas([venda, ...lerVendas()])
  return venda
}

// RF-PDV-06: cancelar venda com estorno automático de estoque. Quem chama
// (Vendas.tsx) já cuida do estorno via registrarMovimentoEstoque — aqui só
// marca a venda como cancelada, nunca some do histórico (rastreabilidade).
export function cancelarVenda(id: string) {
  salvarVendas(lerVendas().map((v) => (v.id === id ? { ...v, cancelada: true } : v)))
}

// Hook que reflete o histórico em tempo real — inclusive entre abas do
// painel (evento customizado) e entre janelas do navegador (evento nativo
// "storage").
export function useVendas(): VendaRegistrada[] {
  const [vendas, setVendas] = useState<VendaRegistrada[]>(lerVendas)

  useEffect(() => {
    function atualizar() {
      setVendas(lerVendas())
    }
    window.addEventListener('vendeflex-vendas-mudou', atualizar)
    window.addEventListener('storage', atualizar)
    return () => {
      window.removeEventListener('vendeflex-vendas-mudou', atualizar)
      window.removeEventListener('storage', atualizar)
    }
  }, [])

  return vendas
}
