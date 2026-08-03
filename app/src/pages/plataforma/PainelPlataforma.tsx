import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LoginPlataforma from './LoginPlataforma'
import Empresas from './Empresas'
import EmConstrucaoPlataforma from './EmConstrucaoPlataforma'

const CHAVE_SESSAO = 'vendeflex.plataforma.sessao'

// Áreas do Cap. 19.2 do PRD — só "empresas" é MVP (RF-ADM-01), o resto é
// V2/V3 (aparece na nav pra deixar a estrutura completa visível, mas cai
// em EmConstrucaoPlataforma).
const AREAS = [
  { id: 'empresas', label: 'Empresas', icone: '🏢' },
  { id: 'faturamento', label: 'Faturamento', icone: '💰' },
  { id: 'planos', label: 'Planos', icone: '📦' },
  { id: 'usuarios', label: 'Usuários', icone: '👥' },
  { id: 'uso-ia', label: 'Uso de IA', icone: '🤖' },
  { id: 'consumo', label: 'Consumo/Armazenamento', icone: '💾' },
  { id: 'tickets', label: 'Tickets de Suporte', icone: '🎫' },
  { id: 'erros', label: 'Erros', icone: '⚠️' },
  { id: 'deploys', label: 'Deploys', icone: '🚀' },
]

// Painel Administrativo RhoneyInc (Capítulo 19 do PRD) — ferramenta interna
// da equipe RhoneyInc pra operar/dar suporte a TODOS os tenants do
// VendeFlex, nunca acessível a um lojista comum. Rota separada
// (/rhoneyinc-admin), sessão própria (não reaproveita vendeflex.sessao do
// painel do lojista).
export default function PainelPlataforma() {
  const navigate = useNavigate()
  const [logado, setLogado] = useState(() => localStorage.getItem(CHAVE_SESSAO) === '1')
  const [areaAtiva, setAreaAtiva] = useState('empresas')

  function entrar() {
    localStorage.setItem(CHAVE_SESSAO, '1')
    setLogado(true)
  }

  function sair() {
    localStorage.removeItem(CHAVE_SESSAO)
    window.location.href = '/rhoneyinc-admin'
  }

  if (!logado) {
    return <LoginPlataforma onEntrar={entrar} />
  }

  const area = AREAS.find((a) => a.id === areaAtiva)

  return (
    <div className="min-h-dvh flex bg-bg-dark text-text-dark">
      <aside className="w-64 shrink-0 border-r border-white/10 flex flex-col">
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center text-white font-bold text-sm shrink-0">
              R
            </span>
            <span className="font-semibold text-sm">RhoneyInc</span>
          </div>
          <p className="text-xs text-white/40">Painel Administrativo</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {AREAS.map((a) => {
            const ativo = a.id === areaAtiva
            return (
              <button
                key={a.id}
                onClick={() => setAreaAtiva(a.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  ativo ? 'bg-gradient-to-r from-brand to-brand-dark text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>{a.icone}</span>
                {a.label}
              </button>
            )
          })}
        </nav>
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <button onClick={() => navigate('/')} className="w-full text-left px-3 py-2 rounded-xl text-sm text-white/50 hover:bg-white/5">
            ← Voltar ao site
          </button>
          <button onClick={sair} className="w-full text-left px-3 py-2 rounded-xl text-sm text-white/50 hover:bg-white/5">
            Sair
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">
        <div key={areaAtiva} className="animate-fade-in">
          {areaAtiva === 'empresas' ? <Empresas /> : <EmConstrucaoPlataforma area={area?.label ?? areaAtiva} />}
        </div>
      </main>
    </div>
  )
}
