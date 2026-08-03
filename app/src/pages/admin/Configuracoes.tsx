import { useState } from 'react'
import Toast, { type ToastData } from '../../components/admin/Toast'
import { findSegmentTheme } from '../../lib/segmentThemes'
import type { useSegmentTheme } from '../../lib/useSegmentTheme'

interface ConfiguracoesProps {
  temaSegmento: ReturnType<typeof useSegmentTheme>
}

const CHAVE_NEGOCIO = 'vendeflex.negocio'

interface DadosNegocio {
  nome: string
  cnpjCpf: string
}

function lerDadosNegocio(): DadosNegocio {
  try {
    const raw = localStorage.getItem(CHAVE_NEGOCIO)
    return raw ? (JSON.parse(raw) as DadosNegocio) : { nome: '', cnpjCpf: '' }
  } catch {
    return { nome: '', cnpjCpf: '' }
  }
}

// Configurações (Capítulo 7.14 do PRD) — dados do tenant (RF-CFG-01) e
// gestão de usuários e papéis (RF-CFG-02). Dados do negócio persistidos em
// localStorage nesta fase (sem backend); usuários/papéis são só ilustrativos
// (convite real depende de autenticação de verdade).
export default function Configuracoes({ temaSegmento }: ConfiguracoesProps) {
  const [dados, setDados] = useState<DadosNegocio>(lerDadosNegocio)
  const [toast, setToast] = useState<ToastData | null>(null)

  const segmentoAtual = findSegmentTheme(temaSegmento.segmentId)

  function salvar(e: React.FormEvent) {
    e.preventDefault()
    localStorage.setItem(CHAVE_NEGOCIO, JSON.stringify(dados))
    setToast({ mensagem: 'Dados salvos.', tipo: 'sucesso' })
  }

  return (
    <div className="max-w-lg space-y-8">
      <div>
        <h2 className="font-semibold text-lg mb-3">Dados do negócio</h2>
        <form onSubmit={salvar} className="rounded-xl border border-black/10 dark:border-white/10 p-4 space-y-3">
          <div>
            <label className="text-sm font-medium block mb-1.5">Nome do negócio</label>
            <input
              value={dados.nome}
              onChange={(e) => setDados((d) => ({ ...d, nome: e.target.value }))}
              placeholder="Ex: Loja da Marcela"
              className="w-full border border-black/15 dark:border-white/15 rounded-lg px-3 py-2 text-sm bg-transparent placeholder:text-black/30 dark:placeholder:text-white/30"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">CNPJ/CPF</label>
            <input
              value={dados.cnpjCpf}
              onChange={(e) => setDados((d) => ({ ...d, cnpjCpf: e.target.value }))}
              placeholder="000.000.000-00"
              className="w-full border border-black/15 dark:border-white/15 rounded-lg px-3 py-2 text-sm bg-transparent placeholder:text-black/30 dark:placeholder:text-white/30"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-seg-primary text-white px-4 py-2 text-sm font-medium transition-transform active:scale-95"
          >
            Salvar
          </button>
        </form>
      </div>

      <div>
        <h2 className="font-semibold text-lg mb-3">Segmento do negócio</h2>
        <div className="rounded-xl border border-black/10 dark:border-white/10 p-4 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm font-medium">{segmentoAtual?.label ?? 'Nenhum segmento escolhido'}</p>
            <p className="text-xs text-black/40 dark:text-white/40">Define o tema visual (cor + fonte) do painel</p>
          </div>
          <button
            onClick={temaSegmento.restaurarTemaPadrao}
            className="text-xs rounded-lg border border-black/15 dark:border-white/15 px-3 py-2 font-medium"
          >
            Trocar segmento
          </button>
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-lg mb-3">Usuários e papéis</h2>
        <div className="rounded-xl border border-black/10 dark:border-white/10 p-4 flex items-center justify-between mb-2">
          <div>
            <p className="text-sm font-medium">Você</p>
            <p className="text-xs text-black/40 dark:text-white/40">Dono</p>
          </div>
        </div>
        <button
          onClick={() => setToast({ mensagem: 'Convite de usuário ainda não implementado — depende de autenticação real.', tipo: 'neutro' })}
          className="text-xs rounded-lg border border-black/15 dark:border-white/15 px-3 py-2 font-medium"
        >
          + Convidar usuário
        </button>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
