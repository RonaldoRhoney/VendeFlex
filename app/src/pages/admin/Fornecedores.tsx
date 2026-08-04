import { useState } from 'react'
import { criarFornecedor, excluirFornecedor, useFornecedores } from '../../lib/fornecedoresStore'
import { useCompras } from '../../lib/comprasStore'
import EmptyState from '../../components/EmptyState'
import Toast, { type ToastData } from '../../components/admin/Toast'

const FORM_VAZIO = { nome: '', contato: '', condicoesPagamento: '' }

// Fornecedores (Capítulo 7.4 do PRD) — RF-FOR-01 (cadastrar) agora com
// formulário de verdade; RF-FOR-02 (histórico de compras) já existia.
export default function Fornecedores() {
  const fornecedores = useFornecedores()
  const compras = useCompras()
  const [form, setForm] = useState(FORM_VAZIO)
  const [formAberto, setFormAberto] = useState(false)
  const [toast, setToast] = useState<ToastData | null>(null)

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome.trim()) return
    try {
      await criarFornecedor({
        nome: form.nome.trim(),
        contato: form.contato.trim(),
        condicoesPagamento: form.condicoesPagamento.trim() || 'A combinar',
      })
      setForm(FORM_VAZIO)
      setFormAberto(false)
      setToast({ mensagem: 'Fornecedor cadastrado.', tipo: 'sucesso' })
    } catch (err) {
      setToast({ mensagem: err instanceof Error ? err.message : 'Erro ao cadastrar fornecedor.', tipo: 'erro' })
    }
  }

  async function apagar(id: string) {
    if (!confirm('Excluir este fornecedor?')) return
    try {
      await excluirFornecedor(id)
      setToast({ mensagem: 'Fornecedor excluído.', tipo: 'neutro' })
    } catch (err) {
      setToast({ mensagem: err instanceof Error ? err.message : 'Erro ao excluir fornecedor.', tipo: 'erro' })
    }
  }

  return (
    <div className="max-w-3xl space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-semibold text-lg">Fornecedores</h2>
        <button
          onClick={() => setFormAberto((v) => !v)}
          className="text-xs rounded-lg bg-seg-primary text-white px-3 py-2 font-medium"
        >
          {formAberto ? 'Fechar' : '+ Novo fornecedor'}
        </button>
      </div>

      {formAberto && (
        <form onSubmit={salvar} className="rounded-xl border border-black/10 dark:border-white/10 p-4 space-y-3">
          <div>
            <label className="text-xs font-medium block mb-1">Nome</label>
            <input
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              required
              className="w-full border border-black/15 dark:border-white/15 rounded-lg px-3 py-2 text-sm bg-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-xs font-medium block mb-1">Contato</label>
              <input
                value={form.contato}
                onChange={(e) => setForm((f) => ({ ...f, contato: e.target.value }))}
                placeholder="(00) 0000-0000"
                className="w-full border border-black/15 dark:border-white/15 rounded-lg px-3 py-2 text-sm bg-transparent"
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Condições de pagamento</label>
              <input
                value={form.condicoesPagamento}
                onChange={(e) => setForm((f) => ({ ...f, condicoesPagamento: e.target.value }))}
                placeholder="Ex: 30 dias"
                className="w-full border border-black/15 dark:border-white/15 rounded-lg px-3 py-2 text-sm bg-transparent"
              />
            </div>
          </div>
          <button type="submit" className="rounded-lg bg-seg-primary text-white px-4 py-2 text-sm font-medium">
            Salvar
          </button>
        </form>
      )}

      {fornecedores.length === 0 ? (
        <EmptyState title="Nenhum fornecedor cadastrado" description="Clique em “+ Novo fornecedor” pra cadastrar o primeiro." />
      ) : (
        fornecedores.map((f) => {
          const historico = compras.filter((c) => c.fornecedor.id === f.id)
          return (
            <div key={f.id} className="rounded-xl border border-black/10 dark:border-white/10 p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-medium">{f.nome}</p>
                  <p className="text-xs text-black/40 dark:text-white/40 mt-0.5">{f.contato}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs rounded-full border border-black/10 dark:border-white/10 px-2.5 py-1 text-black/60 dark:text-white/60">
                    Pagamento: {f.condicoesPagamento}
                  </span>
                  <button onClick={() => apagar(f.id)} className="text-xs text-danger hover:underline min-h-[44px] inline-flex items-center">
                    Excluir
                  </button>
                </div>
              </div>
              {historico.length > 0 && (
                <p className="text-xs text-black/40 dark:text-white/40 mt-3">
                  {historico.length} pedido{historico.length > 1 ? 's' : ''} de compra registrado
                  {historico.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          )
        })
      )}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
