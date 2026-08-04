import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { obterTenantAtual } from './tenant'

const EVENTO_MUDANCA = 'vendeflex-db-mudou'

// Toda mutação (insert/update/rpc) chama isto no final; todo useTenantRows
// escuta e re-busca. Refetch geral em vez de invalidação por tabela — uma
// simplificação deliberada: o volume de dados de um negócio pequeno não
// justifica a complexidade de invalidar só a tabela afetada, e várias RPCs
// (registrar_venda, avancar_status_compra) já mexem em mais de uma tabela
// de uma vez (produtos + estoque_movimentos + vendas, por exemplo).
export function notificarMudanca() {
  window.dispatchEvent(new Event(EVENTO_MUDANCA))
}

// Hook genérico de leitura pros módulos de dados (produtos, categorias,
// fornecedores, compras...) — sempre filtrado pelo tenant atual (lib/tenant.ts).
// Retorna array vazio enquanto carrega ou se não houver tenant resolvido
// ainda (Painel.tsx só monta os módulos depois de resolver o tenant, então
// isso só acontece no instante inicial do fetch).
interface Ordenacao {
  coluna: string
  ascendente?: boolean
}

export function useTenantRows<T>(tabela: string, select: string, order?: Ordenacao): T[] {
  const [itens, setItens] = useState<T[]>([])
  const colunaOrdem = order?.coluna
  const ascendente = order?.ascendente ?? true

  useEffect(() => {
    let ativo = true

    function carregar() {
      const tenant = obterTenantAtual()
      if (!supabase || !tenant) return
      let query = supabase.from(tabela).select(select).eq('tenant_id', tenant.tenantId)
      if (colunaOrdem) query = query.order(colunaOrdem, { ascending: ascendente })
      query.then(({ data, error }) => {
        if (!ativo) return
        if (error) {
          console.error(`Erro ao carregar ${tabela}:`, error.message)
          return
        }
        setItens((data as T[]) ?? [])
      })
    }

    carregar()
    window.addEventListener(EVENTO_MUDANCA, carregar)
    return () => {
      ativo = false
      window.removeEventListener(EVENTO_MUDANCA, carregar)
    }
  }, [tabela, select, colunaOrdem, ascendente])

  return itens
}
