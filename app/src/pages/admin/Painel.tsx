import { useState } from 'react'
import { useSegmentTheme } from '../../lib/useSegmentTheme'
import { CHAVE_SESSAO, MODULOS_NAV } from '../../lib/constants'
import Login from './Login'
import Onboarding from './Onboarding'
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

// Decide Login vs Onboarding vs shell autenticado — sem Supabase Auth real
// ainda (ver nota em Login.tsx). "Sessão" e "segmento confirmado" são só
// localStorage nesta fase.
export default function Painel() {
  const [logado, setLogado] = useState(() => localStorage.getItem(CHAVE_SESSAO) === '1')
  const [moduloAtivo, setModuloAtivo] = useState('dashboard')
  const temaSegmento = useSegmentTheme()

  function entrar() {
    localStorage.setItem(CHAVE_SESSAO, '1')
    setLogado(true)
  }

  if (!logado) {
    return <Login onEntrar={entrar} />
  }

  if (!temaSegmento.segmentId) {
    return <Onboarding temaSegmento={temaSegmento} />
  }

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
    if (moduloAtivo === 'configuracoes') return <Configuracoes temaSegmento={temaSegmento} />
    const modulo = MODULOS_NAV.find((m) => m.id === moduloAtivo)
    return <EmComConstrucao modulo={modulo?.label ?? moduloAtivo} />
  }

  return (
    <AdminShell moduloAtivo={moduloAtivo} onSelectModulo={setModuloAtivo}>
      {renderModulo()}
    </AdminShell>
  )
}
