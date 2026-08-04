import { useState } from 'react'
import Toast, { type ToastData } from '../../components/admin/Toast'
import { supabase } from '../../lib/supabaseClient'
import { obterTenantAtual } from '../../lib/tenant'

interface ConfiguracoesProps {
  nomeNegocio: string
  onTrocarSegmento: () => void
}

// Configurações (Capítulo 7.14 do PRD) — dados do tenant (RF-CFG-01) e
// gestão de usuários e papéis (RF-CFG-02), agora contra o Supabase real.
// Só nome_negocio/cnpj_cpf/segmento são editáveis pelo dono (grant de
// coluna da migration 0001 bloqueia plano/criado_por/id).
export default function Configuracoes({ nomeNegocio, onTrocarSegmento }: ConfiguracoesProps) {
  const [nome, setNome] = useState(nomeNegocio)
  const [cnpjCpf, setCnpjCpf] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [toast, setToast] = useState<ToastData | null>(null)

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    const tenant = obterTenantAtual()
    if (!supabase || !tenant) return
    setSalvando(true)
    try {
      const { error } = await supabase.from('tenants').update({ nome_negocio: nome, cnpj_cpf: cnpjCpf }).eq('id', tenant.tenantId)
      if (error) throw error
      setToast({ mensagem: 'Dados salvos.', tipo: 'sucesso' })
    } catch (err) {
      setToast({ mensagem: err instanceof Error ? err.message : 'Erro ao salvar.', tipo: 'erro' })
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="max-w-lg space-y-8">
      <div>
        <h2 className="font-semibold text-lg mb-3">Dados do negócio</h2>
        <form onSubmit={salvar} className="rounded-xl border border-black/10 dark:border-white/10 p-4 space-y-3">
          <div>
            <label className="text-sm font-medium block mb-1.5">Nome do negócio</label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Loja da Marcela"
              className="w-full border border-black/15 dark:border-white/15 rounded-lg px-3 py-2 text-sm bg-transparent placeholder:text-black/30 dark:placeholder:text-white/30"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">CNPJ/CPF</label>
            <input
              value={cnpjCpf}
              onChange={(e) => setCnpjCpf(e.target.value)}
              placeholder="000.000.000-00"
              className="w-full border border-black/15 dark:border-white/15 rounded-lg px-3 py-2 text-sm bg-transparent placeholder:text-black/30 dark:placeholder:text-white/30"
            />
          </div>
          <button
            type="submit"
            disabled={salvando}
            className="rounded-lg bg-seg-primary text-white px-4 py-2 text-sm font-medium transition-transform active:scale-95 disabled:opacity-50"
          >
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      </div>

      <div>
        <h2 className="font-semibold text-lg mb-3">Segmento do negócio</h2>
        <div className="rounded-xl border border-black/10 dark:border-white/10 p-4 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-black/40 dark:text-white/40">Define o tema visual (cor + fonte) do painel</p>
          <button onClick={onTrocarSegmento} className="text-xs rounded-lg border border-black/15 dark:border-white/15 px-3 py-2 font-medium min-h-[44px]">
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
          onClick={() => setToast({ mensagem: 'Convite de usuário ainda não implementado.', tipo: 'neutro' })}
          className="text-xs rounded-lg border border-black/15 dark:border-white/15 px-3 py-2 font-medium min-h-[44px]"
        >
          + Convidar usuário
        </button>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
