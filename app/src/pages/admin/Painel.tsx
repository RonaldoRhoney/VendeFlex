import { useState } from 'react'
import { useSegmentTheme } from '../../lib/useSegmentTheme'
import { MODULOS_NAV } from '../../lib/constants'
import Login from './Login'
import Onboarding from './Onboarding'
import AdminShell from './AdminShell'
import Dashboard from './Dashboard'
import PDV from './PDV'
import Produtos from './Produtos'
import EmComConstrucao from './EmComConstrucao'

const CHAVE_SESSAO = 'vendeflex.sessao'

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
    const modulo = MODULOS_NAV.find((m) => m.id === moduloAtivo)
    return <EmComConstrucao modulo={modulo?.label ?? moduloAtivo} />
  }

  return (
    <AdminShell moduloAtivo={moduloAtivo} onSelectModulo={setModuloAtivo}>
      {renderModulo()}
    </AdminShell>
  )
}
