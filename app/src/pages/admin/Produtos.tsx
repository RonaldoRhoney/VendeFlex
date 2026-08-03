import { useState } from 'react'
import { alternarAtivoProduto, criarProduto, editarProduto, useProdutos } from '../../lib/produtosStore'
import { formatarReais } from '../../lib/format'
import { useCategorias } from '../../lib/categoriasStore'
import EmptyState from '../../components/EmptyState'
import Toast, { type ToastData } from '../../components/admin/Toast'
import type { Produto } from '../../lib/types'

const POR_PAGINA = 20

interface FormState {
  nome: string
  sku: string
  categoria: string
  precoCusto: string
  precoVenda: string
  estoqueAtual: string
  estoqueMinimo: string
}

const FORM_VAZIO: FormState = { nome: '', sku: '', categoria: '', precoCusto: '', precoVenda: '', estoqueAtual: '', estoqueMinimo: '' }

// Produtos (Capítulo 7.2 do PRD) — RF-PRD-01 (cadastrar) e RF-PRD-05
// (editar/inativar) agora com formulário de verdade, seguindo os
// princípios do Cap. 12.6 (rótulo sempre visível, nunca só placeholder).
export default function Produtos() {
  const produtos = useProdutos()
  const categorias = useCategorias()
  const [pagina, setPagina] = useState(1)
  const [formAberto, setFormAberto] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(FORM_VAZIO)
  const [toast, setToast] = useState<ToastData | null>(null)

  const totalPaginas = Math.max(Math.ceil(produtos.length / POR_PAGINA), 1)
  const inicio = (pagina - 1) * POR_PAGINA
  const visiveis = produtos.slice(inicio, inicio + POR_PAGINA)

  function abrirNovo() {
    setEditandoId(null)
    setForm(FORM_VAZIO)
    setFormAberto(true)
  }

  function abrirEdicao(p: Produto) {
    setEditandoId(p.id)
    setForm({
      nome: p.nome,
      sku: p.sku,
      categoria: p.categoria,
      precoCusto: String(p.precoCusto),
      precoVenda: String(p.precoVenda),
      estoqueAtual: String(p.estoqueAtual),
      estoqueMinimo: String(p.estoqueMinimo),
    })
    setFormAberto(true)
  }

  function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome.trim() || !form.sku.trim()) return
    const dados = {
      nome: form.nome.trim(),
      sku: form.sku.trim(),
      categoria: form.categoria.trim() || 'Geral',
      precoCusto: Number(form.precoCusto) || 0,
      precoVenda: Number(form.precoVenda) || 0,
      estoqueAtual: Math.max(Number(form.estoqueAtual) || 0, 0),
      estoqueMinimo: Math.max(Number(form.estoqueMinimo) || 0, 0),
      ativo: true,
    }
    if (editandoId) {
      editarProduto(editandoId, dados)
      setToast({ mensagem: 'Produto atualizado.', tipo: 'sucesso' })
    } else {
      criarProduto(dados)
      setToast({ mensagem: 'Produto cadastrado.', tipo: 'sucesso' })
    }
    setFormAberto(false)
    setForm(FORM_VAZIO)
  }

  function alternarAtivo(p: Produto) {
    const novoAtivo = !p.ativo
    if (!confirm(novoAtivo ? 'Reativar este produto?' : 'Inativar este produto? Ele some das telas de venda, mas o histórico é preservado.')) return
    alternarAtivoProduto(p.id, novoAtivo)
    setToast({ mensagem: novoAtivo ? 'Produto reativado.' : 'Produto inativado.', tipo: 'neutro' })
  }

  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Produtos</h2>
        <div className="flex items-center gap-3">
          <p className="text-xs text-black/40 dark:text-white/40">{produtos.length} produtos cadastrados</p>
          <button
            onClick={abrirNovo}
            className="text-xs rounded-lg bg-seg-primary text-white px-3 py-2 font-medium transition-transform active:scale-95"
          >
            + Novo produto
          </button>
        </div>
      </div>

      {formAberto && (
        <form onSubmit={salvar} className="rounded-xl border border-black/10 dark:border-white/10 p-4 space-y-3">
          <p className="text-sm font-medium">{editandoId ? 'Editar produto' : 'Novo produto'}</p>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="col-span-2">
              <label className="text-xs font-medium block mb-1">Nome</label>
              <input
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                required
                className="w-full border border-black/15 dark:border-white/15 rounded-lg px-3 py-2 text-sm bg-transparent"
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">SKU</label>
              <input
                value={form.sku}
                onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                required
                className="w-full border border-black/15 dark:border-white/15 rounded-lg px-3 py-2 text-sm bg-transparent"
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Categoria</label>
              <select
                value={form.categoria}
                onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
                className="w-full border border-black/15 dark:border-white/15 rounded-lg px-3 py-2 text-sm bg-transparent"
              >
                <option value="">Selecione</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.nome}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Preço de custo (R$)</label>
              <input
                type="number"
                step="0.01"
                value={form.precoCusto}
                onChange={(e) => setForm((f) => ({ ...f, precoCusto: e.target.value }))}
                className="w-full border border-black/15 dark:border-white/15 rounded-lg px-3 py-2 text-sm bg-transparent"
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Preço de venda (R$)</label>
              <input
                type="number"
                step="0.01"
                value={form.precoVenda}
                onChange={(e) => setForm((f) => ({ ...f, precoVenda: e.target.value }))}
                className="w-full border border-black/15 dark:border-white/15 rounded-lg px-3 py-2 text-sm bg-transparent"
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Estoque atual</label>
              <input
                type="number"
                value={form.estoqueAtual}
                onChange={(e) => setForm((f) => ({ ...f, estoqueAtual: e.target.value }))}
                className="w-full border border-black/15 dark:border-white/15 rounded-lg px-3 py-2 text-sm bg-transparent"
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Estoque mínimo</label>
              <input
                type="number"
                value={form.estoqueMinimo}
                onChange={(e) => setForm((f) => ({ ...f, estoqueMinimo: e.target.value }))}
                className="w-full border border-black/15 dark:border-white/15 rounded-lg px-3 py-2 text-sm bg-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="rounded-lg bg-seg-primary text-white px-4 py-2 text-sm font-medium">
              Salvar
            </button>
            <button
              type="button"
              onClick={() => setFormAberto(false)}
              className="rounded-lg border border-black/15 dark:border-white/15 px-4 py-2 text-sm font-medium"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {produtos.length === 0 ? (
        <EmptyState title="Nenhum produto cadastrado" description="Clique em “+ Novo produto” pra cadastrar o primeiro." />
      ) : (
        <div className="border border-black/10 dark:border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-bg-light dark:bg-bg-dark border-b border-black/10 dark:border-white/10">
                <tr className="text-left text-xs text-black/40 dark:text-white/40">
                  <th className="px-3 py-2.5 font-medium">Produto</th>
                  <th className="px-3 py-2.5 font-medium">SKU</th>
                  <th className="px-3 py-2.5 font-medium">Categoria</th>
                  <th className="px-3 py-2.5 font-medium text-right">Custo</th>
                  <th className="px-3 py-2.5 font-medium text-right">Venda</th>
                  <th className="px-3 py-2.5 font-medium text-right">Estoque</th>
                  <th className="px-3 py-2.5 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {visiveis.map((p) => (
                  <tr key={p.id} className={`border-b border-black/5 dark:border-white/5 last:border-0 ${p.ativo ? '' : 'opacity-40'}`}>
                    <td className="px-3 py-2.5 font-medium">
                      {p.nome}
                      {!p.ativo && <span className="ml-2 text-[10px] uppercase tracking-wide text-black/40 dark:text-white/40">Inativo</span>}
                    </td>
                    <td className="px-3 py-2.5 text-black/50 dark:text-white/50">{p.sku}</td>
                    <td className="px-3 py-2.5 text-black/50 dark:text-white/50">{p.categoria}</td>
                    <td className="px-3 py-2.5 text-right font-[var(--font-mono-fin)]">{formatarReais(p.precoCusto)}</td>
                    <td className="px-3 py-2.5 text-right font-[var(--font-mono-fin)]">{formatarReais(p.precoVenda)}</td>
                    <td
                      className={`px-3 py-2.5 text-right font-[var(--font-mono-fin)] ${
                        p.estoqueAtual <= p.estoqueMinimo ? 'text-danger' : ''
                      }`}
                    >
                      {p.estoqueAtual}
                    </td>
                    <td className="px-3 py-2.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => abrirEdicao(p)}
                        className="text-xs text-black/50 dark:text-white/50 hover:underline mr-3 min-h-[44px] inline-flex items-center"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => alternarAtivo(p)}
                        className={`text-xs hover:underline min-h-[44px] inline-flex items-center ${p.ativo ? 'text-danger' : 'text-success'}`}
                      >
                        {p.ativo ? 'Inativar' : 'Reativar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPaginas > 1 && (
            <div className="flex items-center justify-between px-3 py-2.5 border-t border-black/10 dark:border-white/10 text-xs">
              <button
                onClick={() => setPagina((p) => Math.max(p - 1, 1))}
                disabled={pagina === 1}
                className="px-2.5 py-1.5 rounded-lg border border-black/10 dark:border-white/10 disabled:opacity-30 min-h-[44px]"
              >
                Anterior
              </button>
              <span className="text-black/50 dark:text-white/50">
                Página {pagina} de {totalPaginas}
              </span>
              <button
                onClick={() => setPagina((p) => Math.min(p + 1, totalPaginas))}
                disabled={pagina === totalPaginas}
                className="px-2.5 py-1.5 rounded-lg border border-black/10 dark:border-white/10 disabled:opacity-30 min-h-[44px]"
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      )}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
