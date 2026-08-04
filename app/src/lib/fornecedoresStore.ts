import { supabase } from './supabaseClient'
import { useTenantRows, notificarMudanca } from './supabaseStore'
import { obterTenantAtual } from './tenant'
import type { Fornecedor } from './types'

interface LinhaFornecedor {
  id: string
  nome: string
  contato: string | null
  condicoes_pagamento: string | null
}

function paraFornecedor(l: LinhaFornecedor): Fornecedor {
  return { id: l.id, nome: l.nome, contato: l.contato ?? '', condicoesPagamento: l.condicoes_pagamento ?? '' }
}

export function useFornecedores(): Fornecedor[] {
  return useTenantRows<LinhaFornecedor>('fornecedores', 'id, nome, contato, condicoes_pagamento', { coluna: 'nome' }).map(paraFornecedor)
}

export async function criarFornecedor(dados: Omit<Fornecedor, 'id'>): Promise<Fornecedor> {
  const tenant = obterTenantAtual()
  if (!supabase || !tenant) throw new Error('Sem sessão ativa.')
  const { data, error } = await supabase
    .from('fornecedores')
    .insert({
      tenant_id: tenant.tenantId,
      nome: dados.nome,
      contato: dados.contato,
      condicoes_pagamento: dados.condicoesPagamento,
    })
    .select('id, nome, contato, condicoes_pagamento')
    .single()
  if (error) throw error
  notificarMudanca()
  return paraFornecedor(data as LinhaFornecedor)
}

export async function excluirFornecedor(id: string) {
  if (!supabase) throw new Error('Sem sessão ativa.')
  const { error } = await supabase.from('fornecedores').delete().eq('id', id)
  if (error) throw error
  notificarMudanca()
}
