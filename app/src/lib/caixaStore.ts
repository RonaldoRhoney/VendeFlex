import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { notificarMudanca } from './supabaseStore'
import { obterTenantAtual } from './tenant'
import type { MovimentoCaixa, TurnoCaixa } from './types'

interface LinhaTurno {
  id: string
  operador_id: string
  valor_abertura: number
  valor_fechamento: number | null
  diferenca: number | null
  status: 'aberto' | 'fechado'
  aberto_em: string
}
interface LinhaMovimento {
  id: string
  turno_id: string
  tipo: 'sangria' | 'suprimento'
  valor: number
  descricao: string | null
  criado_em: string
}

function paraTurno(l: LinhaTurno): TurnoCaixa {
  return {
    id: l.id,
    operadorId: l.operador_id,
    valorAbertura: l.valor_abertura,
    valorFechamento: l.valor_fechamento,
    diferenca: l.diferenca,
    status: l.status,
    abertoEm: l.aberto_em,
  }
}
function paraMovimento(l: LinhaMovimento): MovimentoCaixa {
  return { id: l.id, turnoId: l.turno_id, tipo: l.tipo, valor: l.valor, descricao: l.descricao, criadoEm: l.criado_em }
}

const EVENTO = 'vendeflex-db-mudou'

// Caixa (Capítulo 7.8 do PRD) — RF-CAI-01 (abertura com fundo de troco)
// nunca tinha sido implementado de verdade (a versão mock partia de um
// turno já aberto, fixo, TURNO_CAIXA_MOCK). Aqui é a primeira vez que
// existe abrir/fechar turno de verdade.
export function useTurnoAberto(): { turno: TurnoCaixa | null; carregando: boolean } {
  const [turno, setTurno] = useState<TurnoCaixa | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let ativo = true
    function carregar() {
      const tenant = obterTenantAtual()
      if (!supabase || !tenant) return
      supabase
        .from('caixa_turnos')
        .select('id, operador_id, valor_abertura, valor_fechamento, diferenca, status, aberto_em')
        .eq('tenant_id', tenant.tenantId)
        .eq('status', 'aberto')
        .maybeSingle()
        .then(({ data, error }) => {
          if (!ativo) return
          if (error) console.error('Erro ao carregar turno de caixa:', error.message)
          setTurno(data ? paraTurno(data as LinhaTurno) : null)
          setCarregando(false)
        })
    }
    carregar()
    window.addEventListener(EVENTO, carregar)
    return () => {
      ativo = false
      window.removeEventListener(EVENTO, carregar)
    }
  }, [])

  return { turno, carregando }
}

export function useMovimentosCaixa(turnoId: string | null): MovimentoCaixa[] {
  const [movimentos, setMovimentos] = useState<MovimentoCaixa[]>([])

  useEffect(() => {
    let ativo = true
    function carregar() {
      if (!supabase || !turnoId) {
        setMovimentos([])
        return
      }
      supabase
        .from('caixa_movimentos')
        .select('id, turno_id, tipo, valor, descricao, criado_em')
        .eq('turno_id', turnoId)
        .order('criado_em', { ascending: false })
        .then(({ data, error }) => {
          if (!ativo) return
          if (error) console.error('Erro ao carregar movimentos de caixa:', error.message)
          setMovimentos(((data as LinhaMovimento[]) ?? []).map(paraMovimento))
        })
    }
    carregar()
    window.addEventListener(EVENTO, carregar)
    return () => {
      ativo = false
      window.removeEventListener(EVENTO, carregar)
    }
  }, [turnoId])

  return movimentos
}

export async function abrirTurno(valorAbertura: number) {
  const tenant = obterTenantAtual()
  if (!supabase || !tenant) throw new Error('Sem sessão ativa.')
  const { error } = await supabase
    .from('caixa_turnos')
    .insert({ tenant_id: tenant.tenantId, operador_id: tenant.userId, valor_abertura: valorAbertura })
  if (error) throw error
  notificarMudanca()
}

export async function registrarMovimentoCaixa(turnoId: string, tipo: 'sangria' | 'suprimento', valor: number) {
  if (!supabase) throw new Error('Sem sessão ativa.')
  const { error } = await supabase.from('caixa_movimentos').insert({ turno_id: turnoId, tipo, valor })
  if (error) throw error
  notificarMudanca()
}

// RF-CAI-03/04: conciliação real e diferença calculada/persistida dentro da
// RPC (fechar_turno_caixa, migration 0005) — o servidor é a fonte de
// verdade, não o cálculo local.
export async function fecharTurno(turnoId: string, valorInformado: number): Promise<number> {
  if (!supabase) throw new Error('Sem sessão ativa.')
  const { data, error } = await supabase.rpc('fechar_turno_caixa', { p_turno_id: turnoId, p_valor_informado: valorInformado })
  if (error) throw error
  notificarMudanca()
  return data as number
}

// Cálculo ao vivo (antes de fechar) só pra exibição — a RPC acima recalcula
// tudo de novo no servidor no momento do fechamento, então este valor nunca
// é a fonte de verdade, só uma prévia pro operador.
export async function calcularSaldoEstimado(turno: TurnoCaixa): Promise<{ totalVendasDinheiro: number; totalVendasGeral: number }> {
  const tenant = obterTenantAtual()
  if (!supabase || !tenant) return { totalVendasDinheiro: 0, totalVendasGeral: 0 }
  const { data } = await supabase
    .from('vendas')
    .select('total, forma_pagamento')
    .eq('tenant_id', tenant.tenantId)
    .eq('status', 'confirmada')
    .gte('criado_em', turno.abertoEm)
  const linhas = (data as { total: number; forma_pagamento: string }[]) ?? []
  return {
    totalVendasDinheiro: linhas.filter((v) => v.forma_pagamento === 'dinheiro').reduce((s, v) => s + v.total, 0),
    totalVendasGeral: linhas.reduce((s, v) => s + v.total, 0),
  }
}
