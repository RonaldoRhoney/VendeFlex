import { supabase } from './supabaseClient'
import { useTenantRows, notificarMudanca } from './supabaseStore'
import { obterTenantAtual } from './tenant'
import type { Categoria, Marca } from './types'

interface LinhaCategoria {
  id: string
  nome: string
  categoria_pai_id: string | null
}
interface LinhaMarca {
  id: string
  nome: string
}

function paraCategoria(l: LinhaCategoria): Categoria {
  return { id: l.id, nome: l.nome, categoriaPaiId: l.categoria_pai_id }
}
function paraMarca(l: LinhaMarca): Marca {
  return { id: l.id, nome: l.nome }
}

export function useCategorias(): Categoria[] {
  return useTenantRows<LinhaCategoria>('categorias', 'id, nome, categoria_pai_id', { coluna: 'nome' }).map(paraCategoria)
}
export function useMarcas(): Marca[] {
  return useTenantRows<LinhaMarca>('marcas', 'id, nome', { coluna: 'nome' }).map(paraMarca)
}

export async function criarCategoria(nome: string, categoriaPaiId: string | null): Promise<Categoria> {
  const tenant = obterTenantAtual()
  if (!supabase || !tenant) throw new Error('Sem sessão ativa.')
  const { data, error } = await supabase
    .from('categorias')
    .insert({ tenant_id: tenant.tenantId, nome, categoria_pai_id: categoriaPaiId })
    .select('id, nome, categoria_pai_id')
    .single()
  if (error) throw error
  notificarMudanca()
  return paraCategoria(data as LinhaCategoria)
}

// produtos.categoria_id tem "on delete set null" (migration 0002) — o
// próprio Postgres desfaz a referência em qualquer produto que usava essa
// categoria, sem precisar de propagação manual no frontend.
export async function excluirCategoria(id: string) {
  if (!supabase) throw new Error('Sem sessão ativa.')
  const { error } = await supabase.from('categorias').delete().eq('id', id)
  if (error) throw error
  notificarMudanca()
}

export async function criarMarca(nome: string): Promise<Marca> {
  const tenant = obterTenantAtual()
  if (!supabase || !tenant) throw new Error('Sem sessão ativa.')
  const { data, error } = await supabase
    .from('marcas')
    .insert({ tenant_id: tenant.tenantId, nome })
    .select('id, nome')
    .single()
  if (error) throw error
  notificarMudanca()
  return paraMarca(data as LinhaMarca)
}

export async function excluirMarca(id: string) {
  if (!supabase) throw new Error('Sem sessão ativa.')
  const { error } = await supabase.from('marcas').delete().eq('id', id)
  if (error) throw error
  notificarMudanca()
}
