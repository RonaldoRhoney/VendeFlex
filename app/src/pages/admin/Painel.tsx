import { useEffect, useState } from 'react'
import { useSession } from '../../lib/auth'
import { supabase } from '../../lib/supabaseClient'
import { definirTenantAtual } from '../../lib/tenant'
import { useSegmentTheme } from '../../lib/useSegmentTheme'
import { MODULOS_NAV } from '../../lib/constants'
import { SkeletonScreen } from '../../components/Skeleton'
import Login from './Login'
import Onboarding, { type TenantExistente } from './Onboarding'
import AdminShell from './AdminShell'
import Dashboard from './Dashboard'
import PDV from './PDV'
import Produtos from './Produtos'
import Categorias from './Categorias'
import Fornecedores from './Fornecedores'
import Compras from './Compras'
import Estoque from './Estoque'
import Caixa from './Caixa'
import Financeiro from './Financeiro'
import Relatorios from './Relatorios'
import Vendas from './Vendas'
import Configuracoes from './Configuracoes'
import EmComConstrucao from './EmComConstrucao'

interface TenantResolvido {
  id: string
  papel: string
  nomeNegocio: string
  segmento: string | null
}

// Decide Login vs Onboarding vs shell autenticado, agora com sessão e
// tenant reais (Supabase Auth + tabela usuarios_tenant/tenants). Só monta
// os módulos filhos depois que o tenant é conhecido — todo *Store.ts lê o
// tenant atual via lib/tenant.ts, definido aqui embaixo.
export default function Painel() {
  const { session, loading: sessionLoading } = useSession()
  const [tenant, setTenant] = useState<TenantResolvido | null>(null)
  const [tenantLoading, setTenantLoading] = useState(true)
  const [trocandoSegmento, setTrocandoSegmento] = useState(false)
  const [moduloAtivo, setModuloAtivo] = useState('dashboard')
  const temaSegmento = useSegmentTheme()

  async function carregarTenant(userId: string) {
    if (!supabase) return
    setTenantLoading(true)
    const { data } = await supabase
      .from('usuarios_tenant')
      .select('papel, tenants(id, nome_negocio, segmento)')
      .eq('user_id', userId)
      .eq('ativo', true)
      .limit(1)
      .maybeSingle()
    const linha = data as { papel: string; tenants: { id: string; nome_negocio: string; segmento: string | null } | null } | null
    if (linha?.tenants) {
      setTenant({ id: linha.tenants.id, papel: linha.papel, nomeNegocio: linha.tenants.nome_negocio, segmento: linha.tenants.segmento })
    } else {
      setTenant(null)
    }
    setTenantLoading(false)
  }

  useEffect(() => {
    if (session) carregarTenant(session.user.id)
    else {
      setTenant(null)
      setTenantLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  useEffect(() => {
    if (tenant) {
      definirTenantAtual(tenant.id, tenant.papel, session!.user.id)
      if (tenant.segmento && tenant.segmento !== temaSegmento.segmentId) temaSegmento.selecionarSegmento(tenant.segmento)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant])

  if (sessionLoading || (session && tenantLoading)) return <SkeletonScreen />
  if (!session) return <Login />
  if (!tenant) return <Onboarding ownerId={session.user.id} temaSegmento={temaSegmento} onConcluido={() => carregarTenant(session.user.id)} />

  if (trocandoSegmento) {
    const tenantExistente: TenantExistente = { id: tenant.id, nomeNegocio: tenant.nomeNegocio, segmento: tenant.segmento }
    return (
      <Onboarding
        ownerId={session.user.id}
        temaSegmento={temaSegmento}
        tenantExistente={tenantExistente}
        onConcluido={() => {
          setTrocandoSegmento(false)
          carregarTenant(session.user.id)
        }}
      />
    )
  }

  const tenantAtivo = tenant

  function renderModulo() {
    if (moduloAtivo === 'dashboard') return <Dashboard />
    if (moduloAtivo === 'pdv') return <PDV />
    if (moduloAtivo === 'produtos') return <Produtos />
    if (moduloAtivo === 'categorias') return <Categorias />
    if (moduloAtivo === 'fornecedores') return <Fornecedores />
    if (moduloAtivo === 'compras') return <Compras />
    if (moduloAtivo === 'estoque') return <Estoque />
    if (moduloAtivo === 'caixa') return <Caixa />
    if (moduloAtivo === 'financeiro') return <Financeiro />
    if (moduloAtivo === 'relatorios') return <Relatorios />
    if (moduloAtivo === 'vendas') return <Vendas />
    if (moduloAtivo === 'configuracoes')
      return <Configuracoes nomeNegocio={tenantAtivo.nomeNegocio} onTrocarSegmento={() => setTrocandoSegmento(true)} />
    const modulo = MODULOS_NAV.find((m) => m.id === moduloAtivo)
    return <EmComConstrucao modulo={modulo?.label ?? moduloAtivo} />
  }

  return (
    <AdminShell moduloAtivo={moduloAtivo} onSelectModulo={setModuloAtivo}>
      {renderModulo()}
    </AdminShell>
  )
}
